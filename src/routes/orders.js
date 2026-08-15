const express = require('express');
const dayjs = require('dayjs');
const knex = require('../db');
const { requireLogin } = require('../middleware/auth');
const { orderNo, barcode, invoiceNo, reportNo } = require('../utils/idgen');
const { audit, notify } = require('../utils/log');
const { reportPdf, invoicePdf } = require('../utils/pdf');
const router = express.Router();

function firstId(returningResult) {
  return typeof returningResult[0] === 'object' ? returningResult[0].id : returningResult[0];
}

// ---------------- List ----------------
router.get('/orders', requireLogin, async (req, res) => {
  const labId = req.session.user.lab_id;
  const orders = await knex('orders as o')
    .join('patients as p', 'p.id', 'o.patient_id')
    .where('o.lab_id', labId)
    .select('o.id', 'o.order_no', 'o.status', 'o.created_at', 'o.home_collection', 'p.name as patient_name')
    .orderBy('o.created_at', 'desc')
    .limit(200);
  res.render('orders/list', { orders });
});

// ---------------- New order ----------------
router.get('/orders/new', requireLogin, async (req, res) => {
  const labId = req.session.user.lab_id;
  const patientId = req.query.patient_id;
  const patients = await knex('patients').where({ lab_id: labId }).orderBy('name');
  const doctors = await knex('doctors').where({ lab_id: labId }).orderBy('name');
  const tests = await knex('test_catalog').where({ lab_id: labId, active: true }).orderBy('category');
  res.render('orders/new', { patients, doctors, tests, selectedPatientId: patientId ? Number(patientId) : null, error: null });
});

router.post('/orders/new', requireLogin, async (req, res) => {
  const labId = req.session.user.lab_id;
  const { patient_id, doctor_id, home_collection, collection_address, discount } = req.body;
  let testIds = req.body.test_ids;
  if (!testIds) testIds = [];
  if (!Array.isArray(testIds)) testIds = [testIds];

  if (testIds.length === 0) {
    const patients = await knex('patients').where({ lab_id: labId }).orderBy('name');
    const doctors = await knex('doctors').where({ lab_id: labId }).orderBy('name');
    const tests = await knex('test_catalog').where({ lab_id: labId, active: true }).orderBy('category');
    return res.render('orders/new', { patients, doctors, tests, selectedPatientId: Number(patient_id), error: 'Please select at least one test.' });
  }

  const trx = await knex.transaction();
  try {
    const orderIdResult = await trx('orders').insert({
      lab_id: labId,
      patient_id,
      doctor_id: doctor_id || null,
      order_no: orderNo(req.session.user.lab_code),
      status: 'registered',
      home_collection: !!home_collection,
      collection_address: collection_address || null,
      created_by: req.session.user.id,
    }).returning('id');
    const orderId = firstId(orderIdResult);

    const tests = await trx('test_catalog').whereIn('id', testIds).andWhere({ lab_id: labId });

    let subtotal = 0;
    const sampleTypeSet = new Set();
    for (const test of tests) {
      await trx('order_items').insert({ order_id: orderId, test_id: test.id, price: test.price });
      subtotal += Number(test.price);
      sampleTypeSet.add(test.sample_type || 'General');
    }

    for (const sType of sampleTypeSet) {
      await trx('samples').insert({ order_id: orderId, barcode: barcode(), sample_type: sType, status: 'pending' });
    }

    const disc = Number(discount || 0);
    const total = Math.max(subtotal - disc, 0);
    await trx('invoices').insert({
      order_id: orderId,
      invoice_no: invoiceNo(req.session.user.lab_code),
      subtotal, discount: disc, tax: 0, total, paid_amount: 0, status: 'unpaid',
    });

    await trx.commit();
    await audit(labId, req.session.user.id, 'create', 'order', orderId);
    res.redirect(`/orders/${orderId}`);
  } catch (e) {
    await trx.rollback();
    console.error(e);
    const patients = await knex('patients').where({ lab_id: labId }).orderBy('name');
    const doctors = await knex('doctors').where({ lab_id: labId }).orderBy('name');
    const tests = await knex('test_catalog').where({ lab_id: labId, active: true }).orderBy('category');
    res.render('orders/new', { patients, doctors, tests, selectedPatientId: Number(patient_id), error: e.message });
  }
});

// ---------------- Order detail ----------------
router.get('/orders/:id', requireLogin, async (req, res) => {
  const labId = req.session.user.lab_id;
  const order = await knex('orders').where({ id: req.params.id, lab_id: labId }).first();
  if (!order) return res.status(404).render('error', { message: 'Order not found.' });

  const patient = await knex('patients').where({ id: order.patient_id }).first();
  const doctor = order.doctor_id ? await knex('doctors').where({ id: order.doctor_id }).first() : null;
  const samples = await knex('samples').where({ order_id: order.id });
  const items = await knex('order_items as oi')
    .join('test_catalog as t', 't.id', 'oi.test_id')
    .where('oi.order_id', order.id)
    .select('oi.id', 'oi.status', 'oi.price', 't.name as test_name', 't.unit', 't.reference_range', 't.category', 't.sample_type', 't.id as test_id');
  const results = await knex('results').whereIn('order_item_id', items.map(i => i.id));
  const invoice = await knex('invoices').where({ order_id: order.id }).first();
  const payments = invoice ? await knex('payments').where({ invoice_id: invoice.id }) : [];

  const itemsWithResults = items.map(it => ({
    ...it,
    result: results.find(r => r.order_item_id === it.id) || null,
  }));

  res.render('orders/detail', { order, patient, doctor, samples, itemsWithResults, invoice, payments });
});

// ---------------- Sample status updates ----------------
router.post('/orders/:id/samples/:sampleId/:action', requireLogin, async (req, res) => {
  const { id, sampleId, action } = req.params;
  const labId = req.session.user.lab_id;
  const order = await knex('orders').where({ id, lab_id: labId }).first();
  if (!order) return res.status(404).render('error', { message: 'Order not found.' });

  if (action === 'collect') {
    await knex('samples').where({ id: sampleId }).update({ status: 'collected', collected_at: new Date() });
    await knex('orders').where({ id }).update({ status: 'sample_collected' });
  } else if (action === 'receive') {
    await knex('samples').where({ id: sampleId }).update({ status: 'received', received_at: new Date() });
    await knex('orders').where({ id }).update({ status: 'in_process' });
  } else if (action === 'reject') {
    await knex('samples').where({ id: sampleId }).update({ status: 'rejected' });
  }
  res.redirect(`/orders/${id}`);
});

// ---------------- Result entry ----------------
router.post('/orders/:id/items/:itemId/result', requireLogin, async (req, res) => {
  const { id, itemId } = req.params;
  const { value, flag } = req.body;
  const existing = await knex('results').where({ order_item_id: itemId }).first();
  if (existing) {
    await knex('results').where({ id: existing.id }).update({ value, flag: flag || 'normal', entered_by: req.session.user.id, entered_at: new Date() });
  } else {
    await knex('results').insert({ order_item_id: itemId, value, flag: flag || 'normal', entered_by: req.session.user.id });
  }
  await knex('order_items').where({ id: itemId }).update({ status: 'result_entered' });
  res.redirect(`/orders/${id}`);
});

// ---------------- Verify & generate report ----------------
router.post('/orders/:id/verify', requireLogin, async (req, res) => {
  const labId = req.session.user.lab_id;
  const order = await knex('orders').where({ id: req.params.id, lab_id: labId }).first();
  if (!order) return res.status(404).render('error', { message: 'Order not found.' });

  const items = await knex('order_items').where({ order_id: order.id });
  await knex('results')
    .whereIn('order_item_id', items.map(i => i.id))
    .update({ verified_by: req.session.user.id, verified_at: new Date() });
  await knex('order_items').where({ order_id: order.id }).update({ status: 'verified' });

  let report = await knex('reports').where({ order_id: order.id }).first();
  if (!report) {
    const rId = firstId(await knex('reports').insert({
      order_id: order.id, report_no: reportNo(req.session.user.lab_code), status: 'verified',
    }).returning('id'));
    report = await knex('reports').where({ id: rId }).first();
  } else {
    await knex('reports').where({ id: report.id }).update({ status: 'verified' });
  }

  await knex('orders').where({ id: order.id }).update({ status: 'completed' });
  await audit(labId, req.session.user.id, 'verify', 'order', order.id);
  res.redirect(`/orders/${order.id}`);
});

// ---------------- Dispatch report (notify patient) ----------------
router.post('/orders/:id/dispatch', requireLogin, async (req, res) => {
  const labId = req.session.user.lab_id;
  const order = await knex('orders').where({ id: req.params.id, lab_id: labId }).first();
  const patient = await knex('patients').where({ id: order.patient_id }).first();
  await knex('orders').where({ id: order.id }).update({ status: 'report_dispatched' });
  await knex('reports').where({ order_id: order.id }).update({ status: 'dispatched' });
  await notify(labId, order.id, 'whatsapp', `Hi ${patient.name}, your report for order ${order.order_no} is ready.`);
  await notify(labId, order.id, 'email', `Report ready for order ${order.order_no}.`);
  res.redirect(`/orders/${order.id}`);
});

// ---------------- Report PDF ----------------
router.get('/orders/:id/report.pdf', requireLogin, async (req, res) => {
  const labId = req.session.user.lab_id;
  const order = await knex('orders').where({ id: req.params.id, lab_id: labId }).first();
  if (!order) return res.status(404).send('Not found');
  const lab = await knex('labs').where({ id: labId }).first();
  const patient = await knex('patients').where({ id: order.patient_id }).first();
  const doctor = order.doctor_id ? await knex('doctors').where({ id: order.doctor_id }).first() : null;
  const report = await knex('reports').where({ order_id: order.id }).first();
  if (!report) return res.status(400).send('Report not yet verified/generated.');

  const items = await knex('order_items as oi')
    .join('test_catalog as t', 't.id', 'oi.test_id')
    .where('oi.order_id', order.id)
    .select('oi.id', 't.name as test_name', 't.unit', 't.reference_range', 't.category');
  const results = await knex('results').whereIn('order_item_id', items.map(i => i.id));
  const itemsWithResults = items.map(it => {
    const r = results.find(x => x.order_item_id === it.id);
    return { ...it, value: r ? r.value : '', flag: r ? r.flag : 'normal' };
  });

  reportPdf(res, { lab, patient, doctor, order, report, itemsWithResults });
});

// ---------------- Invoice PDF ----------------
router.get('/orders/:id/invoice.pdf', requireLogin, async (req, res) => {
  const labId = req.session.user.lab_id;
  const order = await knex('orders').where({ id: req.params.id, lab_id: labId }).first();
  if (!order) return res.status(404).send('Not found');
  const lab = await knex('labs').where({ id: labId }).first();
  const patient = await knex('patients').where({ id: order.patient_id }).first();
  const invoice = await knex('invoices').where({ order_id: order.id }).first();
  const items = await knex('order_items as oi')
    .join('test_catalog as t', 't.id', 'oi.test_id')
    .where('oi.order_id', order.id)
    .select('t.name', 'oi.price');

  invoicePdf(res, { lab, patient, order, invoice, items });
});

// ---------------- Payments ----------------
router.post('/orders/:id/payments', requireLogin, async (req, res) => {
  const { amount, mode, txn_ref } = req.body;
  const order = await knex('orders').where({ id: req.params.id, lab_id: req.session.user.lab_id }).first();
  const invoice = await knex('invoices').where({ order_id: order.id }).first();
  await knex('payments').insert({ invoice_id: invoice.id, amount, mode, txn_ref });
  const newPaid = Number(invoice.paid_amount) + Number(amount);
  const status = newPaid >= Number(invoice.total) ? 'paid' : (newPaid > 0 ? 'partial' : 'unpaid');
  await knex('invoices').where({ id: invoice.id }).update({ paid_amount: newPaid, status });
  res.redirect(`/orders/${order.id}`);
});

module.exports = router;
