const express = require('express');
const router = express.Router();
const auth = require('../Middleware/middleware');
const requireRole = require('../Middleware/role.middleware');

// Accessible to Admin and Manager
router.get('/dashboard', auth, requireRole('Admin', 'Manager'), (req, res) => {
  res.json({ message: `Welcome, ${req.user.name}!`, role: req.user.role });
});

module.exports = router;
