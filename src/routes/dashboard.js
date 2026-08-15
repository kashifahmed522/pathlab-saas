const express = require('express');
const dayjs = require('dayjs');
const knex = require('../db');
const { requireLogin } = require('../middleware/auth');
const router = express.Router();

router.get('/dashboard', requireLogin, async (req, res) => {
  const labId = req.session.user.lab_id;
  const todayStart = dayjs().startOf('day').toISOString();

  const [todaysOrders] = await knex('orders').where({ lab_id: labId }).where('created_at', '>=', todayStart).count('id as c');
  const [totalPatients] = await knex('patients').where({ lab_id: labId }).count('id as c');
  const [pendingReports] = await knex('orders').where({ lab_id: labId }).whereNotIn('status', ['report_dispatched', 'cancelled']).count('id as c');

  const revenueRows = await knex('invoices as i')
    .join('orders as o', 'o.id', 'i.order_id')
    .where('o.lab_id', labId)
    .where('i.created_at', '>=', todayStart)
    .sum('i.total as total');
  const todaysRevenue = revenueRows[0].total || 0;

  const recentOrders = await knex('orders as o')
    .join('patients as p', 'p.id', 'o.patient_id')
    .where('o.lab_id', labId)
    .select('o.id', 'o.order_no', 'o.status', 'o.created_at', 'p.name as patient_name')
    .orderBy('o.created_at', 'desc')
    .limit(10);

  res.render('dashboard', {
    stats: {
      todaysOrders: todaysOrders.c,
      totalPatients: totalPatients.c,
      pendingReports: pendingReports.c,
      todaysRevenue,
    },
    recentOrders,
  });
});

module.exports = router;
