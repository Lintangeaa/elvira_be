var express = require('express');
const multer = require('multer');
const {
  addPengaduan,
  getAllPengaduan,
} = require('../src/controllers/pengaduan');
const { auth } = require('../src/middlewares/authorization');
var router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('photo'), auth, addPengaduan);
router.get('/', auth, getAllPengaduan);

module.exports = router;
