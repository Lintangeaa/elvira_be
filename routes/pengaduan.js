var express = require('express');
const multer = require('multer');
const {
  addPengaduan,
  getAllPengaduan,
  getPengaduanById,
  updatePengaduan,
  deletePengaduan,
} = require('../src/controllers/pengaduan');
const { auth } = require('../src/middlewares/authorization');
var router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('gambar'), auth, addPengaduan);
router.get('/', auth, getAllPengaduan);
router.get('/:pengaduanId', auth, getPengaduanById);
router.put('/:pengaduanId', upload.single('gambar'), auth, updatePengaduan);
router.delete('/:pengaduanId', auth, deletePengaduan);

module.exports = router;
