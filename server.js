require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const { runSchema } = require('./src/schema');

const authRoutes = require('./src/routes/auth');
const dashboardRoutes = require('./src/routes/dashboard');
const patientRoutes = require('./src/routes/patients');
const testRoutes = require('./src/routes/tests');
const orderRoutes = require('./src/routes/orders');
const billingRoutes = require('./src/routes/billing');

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 * 8 }, // 8 hours
}));

// make current user + lab name available in all views
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  next();
});

app.get('/', (req, res) => res.redirect(req.session.user ? '/dashboard' : '/login'));

app.use(authRoutes);
app.use(dashboardRoutes);
app.use(patientRoutes);
app.use(testRoutes);
app.use(orderRoutes);
app.use(billingRoutes);

app.use((req, res) => res.status(404).render('error', { message: 'Page not found.' }));

const PORT = process.env.PORT || 3000;

runSchema()
  .then(() => {
    app.listen(PORT, () => console.log(`PathLab SaaS running on http://localhost:${PORT}`));
  })
  .catch((e) => {
    console.error('Failed to initialize database schema:', e);
    process.exit(1);
  });
