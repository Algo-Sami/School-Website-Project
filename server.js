require('dotenv').config();
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const routes = require('./server/routes');
const { requireAdminPage } = require('./server/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static uploads folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount API routes
app.use('/api', routes);

// Public Admin assets (CSS, JS, images for login page)
app.use('/admin/css', express.static(path.join(__dirname, 'admin', 'css')));
app.use('/admin/js', express.static(path.join(__dirname, 'admin', 'js')));

// Public Admin Login route
app.get('/admin/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});
app.get('/admin/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'login.html'));
});

// Protect all other Admin routes and HTML pages
app.use('/admin', requireAdminPage, express.static(path.join(__dirname, 'admin')));

// Clean URLs for public pages
app.get('/gallery', (req, res) => res.sendFile(path.join(__dirname, 'gallery.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'about.html')));
app.get('/faculty', (req, res) => res.sendFile(path.join(__dirname, 'faculty.html')));
app.get('/facilities', (req, res) => res.sendFile(path.join(__dirname, 'facilities.html')));
app.get('/admissions', (req, res) => res.sendFile(path.join(__dirname, 'admissions.html')));
app.get('/contact', (req, res) => res.sendFile(path.join(__dirname, 'contact.html')));

// Public website static files (index.html, css/, js/, assets/, etc.)
app.use(express.static(path.join(__dirname)));

// 404 handler for unknown routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'Endpoint not found.' });
  }
  if (req.path.startsWith('/admin')) {
    return res.redirect('/admin/login.html');
  }
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('[Server Error]', err);
  if (req.path.startsWith('/api/')) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
  res.status(500).send('An unexpected server error occurred.');
});

// Start server
app.listen(PORT, () => {
  console.log(`==================================================`);
  console.log(`  Ashraf Islamia Model Public School Website & Admin`);
  console.log(`  Server running at: http://localhost:${PORT}`);
  console.log(`  Admin Panel:       http://localhost:${PORT}/admin/login.html`);
  console.log(`  Public Gallery:    http://localhost:${PORT}/gallery.html`);
  console.log(`==================================================`);
});
