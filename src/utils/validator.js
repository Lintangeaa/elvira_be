const Joi = require('joi');

const { User } = require('../db/models');

const checkUsernameExist = async (v) => {
  const data = await User.findOne({
    where: {
      username: v,
    },
  });

  if (data) {
    throw new Error('Username already exists');
  }
};

const checkEmailExist = async (v) => {
  const data = await User.findOne({
    where: {
      email: v,
    },
  });

  if (data) {
    throw new Error('Email already exists');
  }
};

const registerSchema = Joi.object({
  username: Joi.string()
    .min(3)
    .max(255)
    .required()
    .external(checkUsernameExist),
  email: Joi.string().min(5).required().external(checkEmailExist),
  password: Joi.string().min(8).required(),
});

module.exports = {
  registerSchema,
};
