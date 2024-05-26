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

router.post('/', upload.single('gambar'), addArtikel);
router.get('/', getAllArtikel);
router.get('/:artikelId', getArtikelById);
router.put('/:artikelId', upload.single('gambar'), updateArtikel);
router.delete('/:artikelId', deleteArtikel);

module.exports = router;
