const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { dbHelpers } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'aimps_school_gallery_secret_key_2026_secure';
const COOKIE_NAME = 'aimps_admin_session';

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Middleware for API routes: returns 401 JSON if unauthorized
async function requireAdminApi(req, res, next) {
  try {
    const token = req.cookies[COOKIE_NAME] || req.headers.authorization?.replace(/^Bearer\s+/i, '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized. Please log in as admin.' });
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return res.status(401).json({ error: 'Invalid or expired session. Please log in again.' });
    }

    const user = await dbHelpers.findUserById(payload.id);
    if (!user) {
      return res.status(401).json({ error: 'User account not found or access revoked.' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(500).json({ error: 'Authentication error: ' + (err.message || 'Internal error') });
  }
}

// Middleware for Admin HTML routes: redirects unauthenticated users to /admin/login.html
async function requireAdminPage(req, res, next) {
  try {
    const token = req.cookies[COOKIE_NAME];
    if (!token) {
      return res.redirect('/admin/login.html');
    }

    const payload = verifyToken(token);
    if (!payload || !payload.id) {
      return res.redirect('/admin/login.html');
    }

    const user = await dbHelpers.findUserById(payload.id);
    if (!user) {
      return res.redirect('/admin/login.html');
    }

    req.user = user;
    next();
  } catch (err) {
    return res.redirect('/admin/login.html');
  }
}

module.exports = {
  COOKIE_NAME,
  generateToken,
  verifyToken,
  requireAdminApi,
  requireAdminPage,
  comparePassword: (plain, hashed) => bcrypt.compareSync(plain, hashed),
};
