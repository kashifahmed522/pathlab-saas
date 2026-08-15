const express = require('express');
const knex = require('../db');
const { requireLogin } = require('../middleware/auth');
const router = express.Router();

router.get('/billing', requireLogin, async (req, res) => {
  const labId = req.session.user.lab_id;
  const invoices = await knex('invoices as i')
    .join('orders as o', 'o.id', 'i.order_id')
    .join('patients as p', 'p.id', 'o.patient_id')
    .where('o.lab_id', labId)
    .select('i.*', 'o.order_no', 'p.name as patient_name')
    .orderBy('i.created_at', 'desc')
    .limit(200);

  const totals = invoices.reduce((acc, inv) => {
    acc.total += Number(inv.total);
    acc.paid += Number(inv.paid_amount);
    return acc;
  }, { total: 0, paid: 0 });

  res.render('billing/list', { invoices, totals });
});

module.exports = router;
