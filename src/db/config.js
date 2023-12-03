require('dotenv').config();
const {
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
  DB_HOST,
  DB_PORT,
  DB_DIALECT = 'mysql',
} = process.env;

module.exports = {
  development: {
    username: DB_USER,
    password: DB_PASSWORD,
    database: DB_DATABASE,
    host: DB_HOST,
    port: DB_PORT,
    dialect: DB_DIALECT,
  },
  // stagging: {
  //   username: DB_USER_TSG,
  //   password: DB_PASSWORD_TSG,
  //   database: DB_DATABASE_TSG,
  //   host: DB_HOST_TSG,
  //   port: DB_PORT_TSG,
  //   dialect: DB_DIALECT,
  // },
  // production: {
  //   username: DB_USER_AJ,
  //   password: DB_PASSWORD_AJ,
  //   database: DB_DATABASE_AJ,
  //   host: DB_HOST_AJ,
  //   port: DB_PORT_AJ,
  //   dialect: DB_DIALECT,
  // },
};
