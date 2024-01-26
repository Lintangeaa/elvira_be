const catchAsync = require('../utils/catchAsync');
const cloudinary = require('cloudinary').v2;
const { Pengaduan, User } = require('../db/models');

const { CLOUD_NAME, API_KEY, API_SECRET } = process.env;

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key: API_KEY,
  api_secret: API_SECRET,
});

exports.addPengaduan = catchAsync(async (req, res) => {
  const { name, phone, address, complaint } = req.body;

  let photoUrl;
  if (req.file) {
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

      photoUrl = result.url;
    } catch (error) {
      return res
        .status(200)
        .json({ status: false, message: 'Failed to upload photo' });
    }
  }

  const newPengaduan = await Pengaduan.create({
    userId: req.user.id,
    name,
    phone,
    address,
    complaint,
    photo: photoUrl,
  });

  res.status(201).json({
    status: true,
    message: 'Complaint added successfully',
    data: newPengaduan,
  });
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
    res.status(200).json({
      status: true,
      message: 'Tidak ada pengaduan',
      data: [],
    });
  } else {
    const data = pengaduan.rows.map((e) => {
      return {
        id: e.id,
        name: e.name,
        phone: e.phone,
        address: e.adddress,
        complaint: e.complaint,
        username: e.User?.username ?? null,
        email: e.User?.email ?? null,
      };
    });

    res.status(200).json({
      status: true,
      message: 'Retrieved all clients',
      currentPage: page,
      totalItems: pengaduan.count,
      totalPages: Math.ceil(pengaduan.count / limit),
      data,
    });
  }
});
