require('dotenv').config();
const Sequelize = require('sequelize');
const fs = require('fs');

let dialectOptions = { decimalNumbers: true };

// ✅ Only enable SSL if not connecting to localhost
if (process.env.DB_HOST && process.env.DB_HOST !== 'localhost') {
  try {
    const caCert = fs.readFileSync('config/us-east-1-bundle.pem');
    dialectOptions.ssl = {
      require: true,
      ca: caCert,
      rejectUnauthorized: true, // secure
    };
  } catch (err) {
    console.warn('⚠️ Could not load SSL certificate. Falling back to non-SSL mode.');
  }
} else {
  // Local MySQL often doesn’t need SSL
  dialectOptions.ssl = {
    require: false,
    rejectUnauthorized: false,
  };
}

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
    pool: { max: 500, min: 0, idle: 10000, acquire: 100 * 1000 },
    dialectOptions,
  })
  : new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PW, {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
    port: process.env.DB_PORT || 3306,
    pool: { max: 500, min: 0, idle: 10000, acquire: 100 * 1000 },
    dialectOptions,
  });

module.exports = sequelize;
