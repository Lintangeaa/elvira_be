const catchAsync = require('../utils/catchAsync');
const cloudinary = require('cloudinary').v2;
const { Op } = require('sequelize');

const { Pengaduan, User, sequelize } = require('../db/models');

const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

exports.addPengaduan = catchAsync(async (req, res) => {
  const { nama, email, telepon, lokasi, keluhan } = req.body;
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

    const newPengaduan = await Pengaduan.create(
      {
        nama,
        telepon,
        lokasi,
        email,
        keluhan,
        gambar: photoUrl,
      },
      { transaction },
    );

    await transaction.commit();

    return res.status(201).json({
      status: true,
      message: 'Pengaduan Berhasil Dikirimkan',
      data: newPengaduan,
    });
  } catch (error) {
    await transaction.rollback();

    return res
      .status(500)
      .json({ status: false, message: 'Upload Gambar Gagal' });
  }
});

exports.getAllPengaduan = catchAsync(async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const offset = (page - 1) * limit;

  const whereCondition = {};
  if (search && search != '') {
    whereCondition[Op.or] = [
      { nama: { [Op.like]: `%${search}%` } },
      { email: { [Op.like]: `%${search}%` } },
      { telepon: { [Op.like]: `%${search}%` } },
      { lokasi: { [Op.like]: `%${search}%` } },
      { keluhan: { [Op.like]: `%${search}%` } },
    ];
  }
  const pengaduan = await Pengaduan.findAndCountAll({
    limit: parseInt(limit),
    offset: offset,
    where: whereCondition,
  });

  if (pengaduan.count == 0) {
    return res.status(200).json({
      status: true,
      message: 'Tidak ada pengaduan',
      data: [],
    });
  }

  return res.status(200).json({
    status: true,
    message: 'Berhasil Mendapatkan pengaduan',
    currentPage: page,
    totalItems: pengaduan.count,
    totalPages: Math.ceil(pengaduan.count / limit),
    data: pengaduan.rows,
  });
});

exports.getPengaduanById = catchAsync(async (req, res) => {
  const id = req.params.pengaduanId;

  const data = await Pengaduan.findByPk(id);

  if (!data) {
    return res.status(404).json({
      status: false,
      message: 'Pengaduan tidak ada!',
      data: null,
    });
  }

  return res.status(200).json({
    status: true,
    message: 'Success',
    data,
  });
});

exports.updatePengaduan = catchAsync(async (req, res) => {
  const id = req.params.pengaduanId;
  const { nama, email, telepon, lokasi, keluhan } = req.body;

  const data = await Pengaduan.findByPk(id);

  if (!data) {
    return res.status(404).json({
      status: false,
      message: 'Pengaduan tidak ada!',
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

    const newPengaduan = await data.update(
      {
        nama: nama || data.nama,
        telepon: telepon || data.telepon,
        lokasi: lokasi || data.lokasi,
        keluhan: keluhan || data.keluhan,
        email: email || data.email,
        gambar: photoUrl || data.gambar,
      },
      { transaction },
    );

    await transaction.commit();

    return res.status(201).json({
      status: true,
      message: 'Pengaduan Berhasil Diedit',
      data: newPengaduan,
    });
  } catch (error) {
    await transaction.rollback();

    return res
      .status(500)
      .json({ status: false, message: 'Upload Gambar Gagal' });
  }
});

exports.deletePengaduan = catchAsync(async (req, res) => {
  const id = req.params.pengaduanId;

  const data = await Pengaduan.findByPk(id);

  if (!data) {
    return res.status(404).json({
      status: false,
      message: 'Pengaduan tidak ada!',
      data: null,
    });
  }

  await data.destroy();

  return res.status(200).json({
    status: true,
    message: 'Pengaduan berhasil dihapus',
  });
});
