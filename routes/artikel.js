var express = require('express');
const multer = require('multer');
const { auth } = require('../src/middlewares/authorization');
const {
  addArtikel,
  getAllArtikel,
  getArtikelById,
  updateArtikel,
  deleteArtikel,
} = require('../src/controllers/artikel');
var router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post('/', upload.single('gambar'), auth, addArtikel);
router.get('/', auth, getAllArtikel);
router.get('/:artikelId', auth, getArtikelById);
router.put('/:artikelId', upload.single('gambar'), auth, updateArtikel);
router.delete('/:artikelId', auth, deleteArtikel);

module.exports = router;
