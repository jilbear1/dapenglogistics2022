require('dotenv').config();
const Sequelize = require('sequelize');
const fs = require('fs');

// Load the CA certificate
const caCert = fs.readFileSync('config/us-east-1-bundle.pem');

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
      pool: { max: 500, min: 0, idle: 10000, acquire: 100 * 1000 },
      dialectOptions: {
        ssl: {
          ca: caCert
        }
      }
    })
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PW, {
      host: 'localhost',
      dialect: 'mysql',
      port: 3306,
      dialectOptions: {
        decimalNumbers: true,
        ssl: {
          ca: caCert
        }
      }
    });

module.exports = sequelize;
