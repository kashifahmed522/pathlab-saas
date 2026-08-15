const express = require('express');
const bcrypt = require('bcryptjs');
const knex = require('../db');
const { STANDARD_TESTS } = require('../data/standardTests');
const router = express.Router();

router.get('/login', (req, res) => {
  res.render('login', { error: null });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await knex('users').where({ email }).first();
  if (!user || !user.active) {
    return res.render('login', { error: 'Invalid email or password.' });
  }
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.render('login', { error: 'Invalid email or password.' });
  }
  const lab = await knex('labs').where({ id: user.lab_id }).first();
  req.session.user = {
    id: user.id,
    lab_id: user.lab_id,
    name: user.name,
    role: user.role,
    lab_name: lab.name,
    lab_code: lab.code,
  };
  res.redirect('/dashboard');
});

router.get('/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/login'));
});

// ---- New Lab Signup (tenant onboarding) ----
router.get('/register', (req, res) => {
  res.render('register', { error: null });
});

router.post('/register', async (req, res) => {
  const { lab_name, lab_code, admin_name, email, password, phone } = req.body;
  try {
    const existing = await knex('labs').where({ code: lab_code }).first();
    if (existing) {
      return res.render('register', { error: 'Lab code already taken. Choose another.' });
    }
    const [labId] = await knex('labs').insert({
      name: lab_name,
      code: lab_code.toUpperCase(),
      phone,
    }).returning('id').then(r => (typeof r[0] === 'object' ? [r[0].id] : r));

    const password_hash = await bcrypt.hash(password, 10);
    await knex('users').insert({
      lab_id: labId,
      name: admin_name,
      email,
      password_hash,
      role: 'lab_admin',
      phone,
    });

    // seed the full standard test catalog (~130 common tests) so the lab
    // has a ready-to-use, fully configurable menu from day one
    await knex('test_catalog').insert(
      STANDARD_TESTS.map(t => ({ ...t, lab_id: labId }))
    );

    req.session.user = { id: null, lab_id: labId, name: admin_name, role: 'lab_admin', lab_name, lab_code: lab_code.toUpperCase() };
    // fetch the actual created user id
    const created = await knex('users').where({ lab_id: labId, email }).first();
    req.session.user.id = created.id;

    res.redirect('/dashboard');
  } catch (e) {
    console.error(e);
    res.render('register', { error: 'Something went wrong: ' + e.message });
  }
});

module.exports = router;
