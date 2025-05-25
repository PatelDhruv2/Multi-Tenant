const express = require('express');
const router = express.Router();
const { register, login } = require('../Controller/Auth');
const {getMe} = require('../Controller/Auth');
router.post('/register', register);
router.post('/login', login);
router.get('/me',getMe)
module.exports = router;
