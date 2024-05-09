const catchAsync = require('../utils/catchAsync');
const { User } = require('../db/models');
const { registerSchema } = require('../utils/validator');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const { JWT_SECRET_KEY } = process.env;

exports.register = catchAsync(async (req, res) => {
  const { username, email, password, role } = req.body;

  try {
    await registerSchema.validateAsync(
      { username, email, password },
      { abortEarly: false },
    );

    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      id: userId,
      username,
      email,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      status: true,
      message: 'Register Berhasil',
      data: user,
    });
  } catch (error) {
    res.status(200).json({
      status: false,
      message: error.message,
    });
  }
});

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const data = await User.findOne({
    where: {
      email: email,
    },
  });

  if (!data) {
    res.status(200).json({
      status: false,
      message: 'Pengguna tidak ditemukan',
    });
  } else {
    const isPassCorrect = await bcrypt.compare(password, data.password);

    if (!isPassCorrect) {
      return res.status(200).json({
        status: false,
        message: 'Password incorrect',
      });
    } else {
      const payload = {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
      };

      const token = jwt.sign(payload, JWT_SECRET_KEY, {
        expiresIn: '2d',
      });
      res.status(200).json({
        status: true,
        message: 'Login Berhasil',
        data: {
          token,
          user: payload,
        },
      });
    }
  }
});

exports.forgotPass = catchAsync(async (req, res) => {
  const { email } = req.body;
});
