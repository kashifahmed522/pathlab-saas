# PathLab SaaS — Multi-Tenant Pathology Lab Management System

A working starter platform for running a pathology lab / diagnostic chain — built in the spirit of
CrelioHealth, Dr Lal PathLabs, and MedPlus — where **one deployment can serve many labs**, each fully
isolated, with its own staff, patients, test catalog, and billing.

---

## 1. What's included (working today)

- **Multi-tenant architecture** — any number of labs ("tenants") on one deployment, each with its own
  data, staff, and test catalog. New labs self-register in under a minute.
- **Role-based staff accounts** — lab admin, receptionist, phlebotomist, technician, pathologist, accountant.
- **Patient registration** with auto-generated UHID.
- **Configurable test catalog** — code, category, sample type, price, TAT, unit, reference range.
  Every new lab is auto-seeded with a **standard catalog of ~98 common tests** across 13 departments
  (Hematology, Biochemistry, Kidney/Liver Function, Lipid Profile, Electrolytes, Cardiac Markers,
  Endocrinology, Vitamins, Serology/Infectious Disease, Tumor Markers, Clinical Pathology, Microbiology).
  You can then **add custom tests**, **edit any test** (price, reference range, TAT, etc.), and
  **deactivate/reactivate** tests without deleting history. Existing labs can pull in the full standard
  catalog anytime via the **"Load Standard Catalog"** button on the Test Catalog page (safe to click
  repeatedly — it only adds tests you don't already have, never overwrites your edits).
- **Referring doctor management** with commission %.
- **Order workflow**: select patient + doctor + tests → auto-generates barcoded samples (grouped by
  sample type) and an invoice.
- **Home collection** toggle with collection address.
- **Sample tracking**: pending → collected → received in lab → (rejectable).
- **Result entry** per test, with flags (normal / high / low / critical).
- **Verification workflow**: one click marks all results verified and generates the final report.
- **PDF generation** for both the **lab report** and the **invoice** (via `pdfkit`, no external service needed).
- **Billing**: subtotal/discount/tax/total, partial payments, multiple payment modes, outstanding balance tracking.
- **Report dispatch** stub (marks dispatched + logs a WhatsApp/email notification — see §4 to plug in a
  real provider).
- **Dashboard** with today's orders, total patients, pending reports, today's revenue.
- **Audit log** table capturing who did what (needed for NABL/ISO 15189-style traceability).

## 2. What's designed-for but not built yet (roadmap)

The database schema and architecture already anticipate these — they're the natural next additions:

- Analyzer/instrument interfacing (HL7/ASTM) for auto result capture
- Real WhatsApp Business API / SMS integration (Gupshup, Twilio, MSG91 — see §4)
- Patient self-service portal + doctor report sign-off portal
- ABHA/ABDM (India health stack) integration
- AI-assisted QC / critical value anomaly detection
- Whole-slide imaging for histopathology
- Inventory & reagent management
- Corporate/insurance price lists, loyalty & CRM campaigns

---

## 3. Running it locally / for free testing

**Requirements:** Node.js 18+

```bash
cd pathlab-saas
npm install
cp .env.example .env
npm start
```

Visit `http://localhost:3000` → click **Register your lab** to create your first tenant (lab + admin
user). By default it uses **SQLite** (a single file, `data/pathlab.sqlite3`) — zero configuration, perfect
for testing.

### Deploying free, for testing

Any of these work well for a Node + SQLite app with **zero cost**:

- **Render.com (free web service)** — connect your GitHub repo, build command `npm install`, start
  command `npm start`. Add a **free persistent disk** (Render's free tier disks are limited/ephemeral on
  restarts — fine for testing, but see note below on data persistence).
- **Railway.app / Fly.io free tier** — similar setup, `npm install && npm start`.
- **Replit** — paste the project in, it auto-detects Node and runs `npm start`.

> ⚠️ **Free-tier note:** most free hosts spin down idle containers and don't guarantee disk persistence.
> That's fine for demoing the product, but before real patient data goes in, move to the paid path below.

---

## 4. Moving to a paid setup (cheap, minimal changes)

This is the part designed in from day one — you don't rebuild anything, you just point at a real database:

1. Create a free/low-cost Postgres instance — **Supabase** (free tier, then ~$25/mo) or **Neon.tech**
   (generous free tier, pay-as-you-grow) are both good starting points.
2. In `.env`, switch:
   ```env
   DB_CLIENT=pg
   DATABASE_URL=postgres://user:password@host:5432/dbname
   ```
3. Deploy the same code to **Render's $7/mo web service** (or Railway's usage-based paid tier). No code
   changes required — `src/db.js` already branches on `DB_CLIENT`.
4. For session storage at scale (multiple server instances), swap the default in-memory session store in
   `server.js` for `connect-pg-simple` (a couple of lines) so logins survive restarts/scaling.
5. **Real report delivery**: replace the body of `notify()` in `src/utils/log.js` with a real call to
   Twilio/Gupshup (WhatsApp) and an email provider (Resend/SendGrid). The rest of the app already calls
   `notify()` at the right points (report dispatch).
6. **File/report storage at scale**: PDFs are currently generated on-the-fly (not stored) — fine for low
   volume. At higher volume, save the buffer to S3-compatible storage (Cloudflare R2 has a free tier) and
   store the URL in `reports.pdf_url` (column already exists in the schema).

Typical realistic cost to go from "free test" to "small live lab chain": **$0 → ~$12–30/month**
(Postgres + a small web dyno), before you need to scale further.

---

## 5. Project structure

```
pathlab-saas/
├── server.js                 # app entry point
├── src/
│   ├── db.js                 # knex connection (sqlite free-tier / pg paid-tier)
│   ├── schema.js              # idempotent table creation (multi-tenant schema)
│   ├── middleware/auth.js     # login + role-based access
│   ├── routes/                # auth, dashboard, patients, tests, orders, billing
│   └── utils/                 # id/barcode generation, audit log, notify stub, PDF generation
├── views/                     # EJS templates (Bootstrap-based UI)
└── public/css/style.css
```

## 6. Multi-tenancy model

Every table that holds lab-specific data carries a `lab_id`. Every query in the routes filters by the
logged-in user's `lab_id` (from the session), so **Lab A can never see Lab B's patients, orders, or
staff** — this is the same isolation model used by CrelioHealth-style multi-center SaaS platforms.
To onboard a new lab/franchise, they simply visit `/register` — no manual setup needed.

## 7. Security notes before going live

- Set a strong, random `SESSION_SECRET` in production.
- Serve over HTTPS (Render/Railway do this automatically).
- Add rate-limiting on `/login` (e.g. `express-rate-limit`) to prevent brute-force attempts.
- Review India's DPDP Act / HIPAA-equivalent requirements for storing patient health data before
  onboarding real patients — this starter is a functional base, not a compliance certification.

## 8. Changelog

**v1.2**
- **Mobile responsiveness**: all tables wrap in scrollable containers instead of breaking layout,
  stat cards go 2-per-row on phones, the result-entry screen switched from a cramped table to
  stacked cards that work on small screens, buttons go full-width on mobile.
- **Tax / GST**: each lab has a default tax rate (Settings → Lab Profile & Billing), editable per
  order at creation time. Invoices and the invoice PDF now show subtotal → discount → tax → total →
  paid → balance correctly.
- **Doctor commissions**: each order referred by a doctor auto-calculates commission (doctor's % ×
  order subtotal), tracked as pending/paid per order, with a dedicated **Doctor Commissions** report
  (Settings → Doctor Commissions) grouped by doctor, showing totals owed/paid and a "Mark Paid" action.
- **Lab Profile settings page** to edit address, phone, email, NABL/GST numbers, and default tax rate
  — these now flow through to the PDF report/invoice header.
- New order form shows a **live running total** (subtotal/discount/tax/total) as you check tests.

**Upgrading an existing install:** just replace the code and restart — `src/schema.js` auto-adds the
new columns (`labs.default_tax_percent`, `orders.tax_percent`, `orders.commission_amount`,
`orders.commission_status`, `orders.commission_paid_at`) to your existing database on startup. No data
is lost; existing orders simply show 0 tax/commission since they predate this feature.
