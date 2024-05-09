const catchAsync = require('../utils/catchAsync');
const cloudinary = require('cloudinary').v2;
const mimetype = require('mime-type');

const { Pengaduan, User, sequelize } = require('../db/models');

const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

exports.addPengaduan = catchAsync(async (req, res) => {
  const { nama, telepon, lokasi, keluhan } = req.body;
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
        name: nama,
        phone: telepon,
        address: lokasi,
        complaint: keluhan,
        userId: req.user.id,
        photo: photoUrl,
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
  const { page = 1, limit = 10, name = '' } = req.query;
  const { username } = req.params;
  const offset = (page - 1) * limit;

  const whereCondition = {};
  if (username) {
    whereCondition['$name$'] = { [Op.iLike]: `%${name}%` };
  }

  const pengaduan = await Pengaduan.findAndCountAll({
    limit: parseInt(limit),
    offset: offset,
    include: [
      {
        model: User,
        attributes: ['username', 'email'],
      },
    ],
    where: whereCondition,
  });

  if (pengaduan.count == 0) {
    return res.status(200).json({
      status: true,
      message: 'Tidak ada pengaduan',
      data: [],
    });
  } else {
    const data = pengaduan.rows.map((e) => {
      return {
        id: e.id,
        email: e.User?.email ?? '',
        nama: e.name,
        telepon: e.phone,
        lokasi: e.address,
        keluhan: e.complaint,
        photo: e.photo,
        username: e.User?.username ?? '',
      };
    });

    return res.status(200).json({
      status: true,
      message: 'Sukse mendapatkan pengaduans',
      currentPage: page,
      totalItems: pengaduan.count,
      totalPages: Math.ceil(pengaduan.count / limit),
      data,
    });
  }
});

exports.getPengaduanById = catchAsync(async (req, res) => {
  const id = req.params.pengaduanId;

  const data = await Pengaduan.findOne({
    where: {
      id: id,
    },
    include: [{ model: User, attributes: ['username', 'email'] }],
  });

  if (!data) {
    return res.status(404).json({
      status: false,
      message: 'Pengaduan tidak ada!',
      data: null,
    });
  }

  console.log(data);

  const jsonData = {
    id: data.id,
    email: data.User?.email ?? '',
    nama: data.name,
    telepon: data.phone,
    lokasi: data.address,
    keluhan: data.complaint,
    photo: data.photo,
    username: data.User?.username ?? '',
  };

  return res.status(200).json({
    status: true,
    message: 'Success',
    data: jsonData,
  });
});

exports.updatePengaduan = catchAsync(async (req, res) => {
  const id = req.params.pengaduanId;
  const { nama, telepon, lokasi, keluhan } = req.body;

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
        name: nama || data.name,
        phone: telepon || data.phone,
        address: lokasi || data.address,
        complaint: keluhan || data.complaint,
        email: data.email,
        photo: photoUrl || data.photo,
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
