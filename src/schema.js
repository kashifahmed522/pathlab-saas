const knex = require('./db');

async function ensureTable(name, builderFn) {
  const exists = await knex.schema.hasTable(name);
  if (!exists) {
    await knex.schema.createTable(name, builderFn);
    console.log(`[schema] created table: ${name}`);
  }
}

async function runSchema() {
  // ---------------- LABS (tenants) ----------------
  await ensureTable('labs', (t) => {
    t.increments('id').primary();
    t.string('name').notNullable();
    t.string('code').notNullable().unique(); // short lab code, e.g. used in order numbers
    t.string('address');
    t.string('phone');
    t.string('email');
    t.string('logo_url');
    t.string('nabl_no');
    t.string('gst_no');
    t.string('subscription_plan').defaultTo('free_trial'); // free_trial, basic, pro, enterprise
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // ---------------- USERS ----------------
  await ensureTable('users', (t) => {
    t.increments('id').primary();
    t.integer('lab_id').notNullable().references('id').inTable('labs').onDelete('CASCADE');
    t.string('name').notNullable();
    t.string('email').notNullable();
    t.string('password_hash').notNullable();
    t.string('role').notNullable(); // lab_admin, receptionist, phlebotomist, technician, pathologist, doctor, accountant
    t.string('phone');
    t.boolean('active').defaultTo(true);
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.unique(['lab_id', 'email']);
  });

  // ---------------- REFERRING DOCTORS ----------------
  await ensureTable('doctors', (t) => {
    t.increments('id').primary();
    t.integer('lab_id').notNullable().references('id').inTable('labs').onDelete('CASCADE');
    t.string('name').notNullable();
    t.string('phone');
    t.string('email');
    t.string('clinic');
    t.decimal('commission_percent', 5, 2).defaultTo(0);
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // ---------------- PATIENTS ----------------
  await ensureTable('patients', (t) => {
    t.increments('id').primary();
    t.integer('lab_id').notNullable().references('id').inTable('labs').onDelete('CASCADE');
    t.string('uhid').notNullable(); // unique health id per lab
    t.string('name').notNullable();
    t.integer('age');
    t.string('age_unit').defaultTo('years'); // years, months, days (for infants)
    t.string('gender');
    t.string('phone');
    t.string('email');
    t.string('address');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.unique(['lab_id', 'uhid']);
  });

  // ---------------- TEST CATALOG ----------------
  await ensureTable('test_catalog', (t) => {
    t.increments('id').primary();
    t.integer('lab_id').notNullable().references('id').inTable('labs').onDelete('CASCADE');
    t.string('code').notNullable();
    t.string('name').notNullable();
    t.string('category'); // e.g. Biochemistry, Hematology, Microbiology
    t.string('sample_type'); // e.g. Blood, Urine, Serum
    t.decimal('price', 10, 2).defaultTo(0);
    t.integer('tat_hours').defaultTo(24); // turnaround time
    t.string('unit');
    t.string('reference_range');
    t.string('method');
    t.boolean('active').defaultTo(true);
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // ---------------- ORDERS ----------------
  await ensureTable('orders', (t) => {
    t.increments('id').primary();
    t.integer('lab_id').notNullable().references('id').inTable('labs').onDelete('CASCADE');
    t.integer('patient_id').notNullable().references('id').inTable('patients');
    t.integer('doctor_id').references('id').inTable('doctors');
    t.string('order_no').notNullable();
    t.string('status').defaultTo('registered'); // registered, sample_collected, in_process, completed, report_dispatched, cancelled
    t.boolean('home_collection').defaultTo(false);
    t.string('collection_address');
    t.integer('created_by').references('id').inTable('users');
    t.timestamp('created_at').defaultTo(knex.fn.now());
    t.unique(['lab_id', 'order_no']);
  });

  // ---------------- ORDER ITEMS (tests within an order) ----------------
  await ensureTable('order_items', (t) => {
    t.increments('id').primary();
    t.integer('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
    t.integer('test_id').notNullable().references('id').inTable('test_catalog');
    t.decimal('price', 10, 2).defaultTo(0);
    t.string('status').defaultTo('pending'); // pending, result_entered, verified
  });

  // ---------------- SAMPLES ----------------
  await ensureTable('samples', (t) => {
    t.increments('id').primary();
    t.integer('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
    t.string('barcode').notNullable().unique();
    t.string('sample_type');
    t.string('status').defaultTo('pending'); // pending, collected, received, rejected
    t.timestamp('collected_at');
    t.timestamp('received_at');
  });

  // ---------------- RESULTS ----------------
  await ensureTable('results', (t) => {
    t.increments('id').primary();
    t.integer('order_item_id').notNullable().references('id').inTable('order_items').onDelete('CASCADE');
    t.string('value');
    t.string('flag').defaultTo('normal'); // normal, high, low, critical
    t.integer('entered_by').references('id').inTable('users');
    t.integer('verified_by').references('id').inTable('users');
    t.timestamp('entered_at').defaultTo(knex.fn.now());
    t.timestamp('verified_at');
  });

  // ---------------- REPORTS ----------------
  await ensureTable('reports', (t) => {
    t.increments('id').primary();
    t.integer('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
    t.string('report_no').notNullable();
    t.string('status').defaultTo('draft'); // draft, verified, dispatched
    t.timestamp('generated_at').defaultTo(knex.fn.now());
  });

  // ---------------- INVOICES ----------------
  await ensureTable('invoices', (t) => {
    t.increments('id').primary();
    t.integer('order_id').notNullable().references('id').inTable('orders').onDelete('CASCADE');
    t.string('invoice_no').notNullable();
    t.decimal('subtotal', 10, 2).defaultTo(0);
    t.decimal('discount', 10, 2).defaultTo(0);
    t.decimal('tax', 10, 2).defaultTo(0);
    t.decimal('total', 10, 2).defaultTo(0);
    t.decimal('paid_amount', 10, 2).defaultTo(0);
    t.string('status').defaultTo('unpaid'); // unpaid, partial, paid
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // ---------------- PAYMENTS ----------------
  await ensureTable('payments', (t) => {
    t.increments('id').primary();
    t.integer('invoice_id').notNullable().references('id').inTable('invoices').onDelete('CASCADE');
    t.decimal('amount', 10, 2).notNullable();
    t.string('mode').defaultTo('cash'); // cash, card, upi, netbanking, insurance
    t.string('txn_ref');
    t.timestamp('paid_at').defaultTo(knex.fn.now());
  });

  // ---------------- AUDIT LOGS ----------------
  await ensureTable('audit_logs', (t) => {
    t.increments('id').primary();
    t.integer('lab_id').notNullable();
    t.integer('user_id');
    t.string('action');
    t.string('entity');
    t.integer('entity_id');
    t.timestamp('created_at').defaultTo(knex.fn.now());
  });

  // ---------------- NOTIFICATIONS LOG ----------------
  await ensureTable('notifications_log', (t) => {
    t.increments('id').primary();
    t.integer('lab_id').notNullable();
    t.integer('order_id');
    t.string('channel'); // sms, whatsapp, email
    t.string('status');
    t.timestamp('sent_at').defaultTo(knex.fn.now());
  });

  console.log('[schema] ready.');
}

module.exports = { runSchema };
