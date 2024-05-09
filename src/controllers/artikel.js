const catchAsync = require('../utils/catchAsync');
const cloudinary = require('cloudinary').v2;
const mimetype = require('mime-type');
const { Op } = require('sequelize');

const { Artikel, sequelize } = require('../db/models');

const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

exports.addArtikel = catchAsync(async (req, res) => {
  const { judul, deskripsi } = req.body;

  if (!req.file || !req.file.mimetype.startsWith('image')) {
    return res
      .status(400)
      .json({ status: false, message: 'Please upload an image' });
  }

  const transaction = await sequelize.transaction();

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'uploads' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      stream.end(req.file.buffer);
    });

    const photoUrl = result.url;

    const newArtikel = await Artikel.create(
      {
        judul,
        deskripsi,
        gambar: photoUrl,
      },
      { transaction },
    );

    await transaction.commit();

    return res.status(201).json({
      status: true,
      message: 'Berhasil Menambahkan Artikel',
      data: newArtikel,
    });
  } catch (error) {
    await transaction.rollback();

    return res
      .status(500)
      .json({ status: false, message: 'Upload Gambar Gagal' });
  }
});

exports.getAllArtikel = catchAsync(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const { search } = req.query;
  const offset = (page - 1) * limit;

  const whereCondition = {};

  if (search) {
    whereCondition[Op.or] = [
      { judul: { [Op.like]: `%${search}%` } },
      { deskripsi: { [Op.like]: `%${search}%` } },
    ];
  }

  console.log(whereCondition);

  const data = await Artikel.findAndCountAll({
    limit: parseInt(limit),
    offset: offset,
    where: whereCondition,
  });

  if (data.count == 0) {
    return res.status(200).json({
      status: true,
      message: 'Tidak ada Artikel',
      data: [],
    });
  }

  return res.status(200).json({
    status: true,
    message: 'Berhasil Mendapatkan Artikel',
    currentPage: page,
    totalItems: data.count,
    totalPages: Math.ceil(data.count / limit),
    data: data.rows,
  });
});

exports.getArtikelById = catchAsync(async (req, res) => {
  const id = req.params.artikelId;

  const data = await Artikel.findByPk(id);

  if (!data) {
    return res.status(404).json({
      status: false,
      message: 'Artikel tidak ada!',
      data: null,
    });
  }

  return res.status(200).json({
    status: true,
    message: 'Success',
    data,
  });
});

exports.updateArtikel = catchAsync(async (req, res) => {
  const id = req.params.artikelId;
  const { judul, deskripsi } = req.body;

  const data = await Artikel.findByPk(id);

  if (!data) {
    return res.status(404).json({
      status: false,
      message: 'Artikel tidak ada!',
      data: null,
    });
  }

  if (!req.file || !req.file.mimetype.startsWith('image')) {
    return res
      .status(400)
      .json({ status: false, message: 'Please upload an image' });
  }

  const transaction = await sequelize.transaction();

  try {
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'uploads' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        },
      );

      stream.end(req.file.buffer);
    });

    const photoUrl = result.url;

    const newArtikel = await data.update(
      {
        judul: judul || data.judul,
        deskripsi: deskripsi || data.deskripsi,
        gambar: photoUrl || data.gambar,
      },
      { transaction },
    );

    await transaction.commit();

    return res.status(201).json({
      status: true,
      message: 'Artikel Berhasil Diedit',
      data: newArtikel,
    });
  } catch (error) {
    await transaction.rollback();

    return res
      .status(500)
      .json({ status: false, message: 'Upload Gambar Gagal' });
  }
});

exports.deleteArtikel = catchAsync(async (req, res) => {
  const id = req.params.artikelId;

  const data = await Artikel.findByPk(id);

  if (!data) {
    return res.status(404).json({
      status: false,
      message: 'Artikel tidak ada!',
      data: null,
    });
  }

  await data.destroy();

  return res.status(200).json({
    status: true,
    message: 'Pengaduan berhasil dihapus',
  });
});
