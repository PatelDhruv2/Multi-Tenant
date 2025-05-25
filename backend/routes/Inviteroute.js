const express = require('express');
const router = express.Router();
const auth = require('../Middleware/middleware');
const requireRole = require('../Middleware/role.middleware');
const { createPasskey } = require('../utils/Token');

router.post('/create', auth, requireRole('Admin', 'Manager'), (req, res) => {
  const { role } = req.body;

  if (!['Manager', 'Member'].includes(role)) {
    return res.status(400).json({ message: 'Invalid role' });
  }

  const passkey = createPasskey(req.user.organization.toString(), role);
  const inviteLink = `${process.env.FRONTEND_URL}/invite/${passkey}`;
console.log('auth:', typeof auth);
console.log('requireRole:', typeof requireRole);
console.log('requireRole("Admin", "Manager"):', typeof requireRole('Admin', 'Manager'));

  res.json({ inviteLink, passkey });
});

module.exports = router;
