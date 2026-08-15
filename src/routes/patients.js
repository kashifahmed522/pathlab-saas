const express = require('express');
const knex = require('../db');
const { requireLogin } = require('../middleware/auth');
const { uhid } = require('../utils/idgen');
const { audit } = require('../utils/log');
const router = express.Router();

router.get('/patients', requireLogin, async (req, res) => {
  const labId = req.session.user.lab_id;
  const q = req.query.q || '';
  let query = knex('patients').where({ lab_id: labId }).orderBy('created_at', 'desc');
  if (q) {
    query = query.where((b) => {
      b.where('name', 'like', `%${q}%`).orWhere('phone', 'like', `%${q}%`).orWhere('uhid', 'like', `%${q}%`);
    });
  }
  const patients = await query.limit(100);
  res.render('patients/list', { patients, q });
});

router.get('/patients/new', requireLogin, (req, res) => {
  res.render('patients/new', { error: null });
});

router.post('/patients/new', requireLogin, async (req, res) => {
  const labId = req.session.user.lab_id;
  const { name, age, age_unit, gender, phone, email, address } = req.body;
  try {
    const patientUhid = uhid(req.session.user.lab_code);
    const [id] = await knex('patients').insert({
      lab_id: labId, uhid: patientUhid, name, age: age || null, age_unit, gender, phone, email, address,
    }).returning('id').then(r => (typeof r[0] === 'object' ? [r[0].id] : r));
    await audit(labId, req.session.user.id, 'create', 'patient', id);
    res.redirect(`/orders/new?patient_id=${id}`);
  } catch (e) {
    res.render('patients/new', { error: e.message });
  }
});

module.exports = router;
