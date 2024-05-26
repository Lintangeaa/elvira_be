require('dotenv').config();
const swaggerAutogen = require('swagger-autogen')();
const { PORT, NODE_ENV } = process.env;

// Tentukan URL server berdasarkan lingkungan

const serverUrl = `https://localhost:${PORT}`;

const doc = {
  info: {
    title: 'Elvira API',
    description: 'Elvira API Documentation',
  },
  servers: [
    {
      url: serverUrl,
      description: 'documentation',
    },
  ],
  host: '',
};

const outputFile = './swagger-output.json';
const routes = ['./app.js'];

swaggerAutogen(outputFile, routes, doc);
