var express = require('express');
const { register, login } = require('../src/controllers/user');
var router = express.Router();

router.post('/tambah-admin', register);
router.post('/login-admin', login);

module.exports = router;
