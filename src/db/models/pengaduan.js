'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Pengaduan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {}
  }
  Pengaduan.init(
    {
      nama: DataTypes.STRING,
      email: DataTypes.STRING,
      telepon: DataTypes.STRING,
      lokasi: DataTypes.STRING,
      keluhan: DataTypes.STRING,
      gambar: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Pengaduan',
    },
  );
  return Pengaduan;
};
