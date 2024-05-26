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

router.post('/', upload.single('gambar'), addPengaduan);
router.get('/', getAllPengaduan);
router.get('/:pengaduanId', getPengaduanById);
router.put('/:pengaduanId', upload.single('gambar'), updatePengaduan);
router.delete('/:pengaduanId', deletePengaduan);

module.exports = router;
