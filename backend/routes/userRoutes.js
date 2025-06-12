/* eslint-disable eol-last */
/* eslint-disable import/newline-after-import */
/* eslint-disable linebreak-style */
const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;