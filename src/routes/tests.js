const express = require('express');
const knex = require('../db');
const { requireLogin, requireRole } = require('../middleware/auth');
const { STANDARD_TESTS } = require('../data/standardTests');
const router = express.Router();

// ---------------- Test Catalog ----------------
router.get('/settings/tests', requireLogin, async (req, res) => {
  const tests = await knex('test_catalog').where({ lab_id: req.session.user.lab_id }).orderBy('category');
  const categories = [...new Set(tests.map(t => t.category || 'General'))];
  res.render('tests/list', { tests, categories, q: req.query.q || '' });
});

// ---------------- One-click: load the full standard test catalog ----------------
// Adds any standard test the lab doesn't already have (matched by code).
// Safe to click multiple times - never creates duplicates.
router.post('/settings/tests/load-standard', requireLogin, requireRole('lab_admin'), async (req, res) => {
  const labId = req.session.user.lab_id;
  const existing = await knex('test_catalog').where({ lab_id: labId }).select('code');
  const existingCodes = new Set(existing.map(t => t.code));
  const toInsert = STANDARD_TESTS.filter(t => !existingCodes.has(t.code)).map(t => ({ ...t, lab_id: labId }));
  if (toInsert.length > 0) {
    await knex('test_catalog').insert(toInsert);
  }
  res.redirect('/settings/tests');
});

router.get('/settings/tests/new', requireLogin, requireRole('lab_admin'), (req, res) => {
  res.render('tests/new', { error: null });
});

router.post('/settings/tests/new', requireLogin, requireRole('lab_admin'), async (req, res) => {
  const labId = req.session.user.lab_id;
  const { code, name, category, sample_type, price, unit, reference_range, tat_hours, method } = req.body;
  try {
    await knex('test_catalog').insert({
      lab_id: labId, code, name, category, sample_type, price: price || 0, unit, reference_range,
      tat_hours: tat_hours || 24, method,
    });
    res.redirect('/settings/tests');
  } catch (e) {
    res.render('tests/new', { error: e.message });
  }
});

router.post('/settings/tests/:id/delete', requireLogin, requireRole('lab_admin'), async (req, res) => {
  await knex('test_catalog').where({ id: req.params.id, lab_id: req.session.user.lab_id }).update({ active: false });
  res.redirect('/settings/tests');
});

router.post('/settings/tests/:id/reactivate', requireLogin, requireRole('lab_admin'), async (req, res) => {
  await knex('test_catalog').where({ id: req.params.id, lab_id: req.session.user.lab_id }).update({ active: true });
  res.redirect('/settings/tests');
});

// ---------------- Edit a test ----------------
router.get('/settings/tests/:id/edit', requireLogin, requireRole('lab_admin'), async (req, res) => {
  const test = await knex('test_catalog').where({ id: req.params.id, lab_id: req.session.user.lab_id }).first();
  if (!test) return res.status(404).render('error', { message: 'Test not found.' });
  res.render('tests/edit', { test, error: null });
});

router.post('/settings/tests/:id/edit', requireLogin, requireRole('lab_admin'), async (req, res) => {
  const labId = req.session.user.lab_id;
  const { code, name, category, sample_type, price, unit, reference_range, tat_hours, method } = req.body;
  try {
    await knex('test_catalog').where({ id: req.params.id, lab_id: labId }).update({
      code, name, category, sample_type, price: price || 0, unit, reference_range,
      tat_hours: tat_hours || 24, method,
    });
    res.redirect('/settings/tests');
  } catch (e) {
    const test = await knex('test_catalog').where({ id: req.params.id, lab_id: labId }).first();
    res.render('tests/edit', { test, error: e.message });
  }
});

// ---------------- Referring Doctors ----------------
router.get('/settings/doctors', requireLogin, async (req, res) => {
  const doctors = await knex('doctors').where({ lab_id: req.session.user.lab_id }).orderBy('name');
  res.render('doctors/list', { doctors });
});

router.post('/settings/doctors/new', requireLogin, async (req, res) => {
  const labId = req.session.user.lab_id;
  const { name, phone, email, clinic, commission_percent } = req.body;
  await knex('doctors').insert({ lab_id: labId, name, phone, email, clinic, commission_percent: commission_percent || 0 });
  res.redirect('/settings/doctors');
});

// ---------------- Users / staff ----------------
const bcrypt = require('bcryptjs');
router.get('/settings/users', requireLogin, requireRole('lab_admin'), async (req, res) => {
  const users = await knex('users').where({ lab_id: req.session.user.lab_id }).orderBy('name');
  res.render('users/list', { users, error: null });
});

router.post('/settings/users/new', requireLogin, requireRole('lab_admin'), async (req, res) => {
  const labId = req.session.user.lab_id;
  const { name, email, password, role, phone } = req.body;
  try {
    const password_hash = await bcrypt.hash(password, 10);
    await knex('users').insert({ lab_id: labId, name, email, password_hash, role, phone });
    res.redirect('/settings/users');
  } catch (e) {
    const users = await knex('users').where({ lab_id: labId }).orderBy('name');
    res.render('users/list', { users, error: 'Could not add user: ' + e.message });
  }
});

module.exports = router;
