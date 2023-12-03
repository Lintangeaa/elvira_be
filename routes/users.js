var express = require('express');
const { register, login } = require('../src/controllers/user');
var router = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;
