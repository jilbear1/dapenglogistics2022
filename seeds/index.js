const seedBoxes = require('./box-seed');
const seedUsers = require('./user-seed');
const seedAccounts = require('./account-seed');
const seedBatches = require('./batch-seed');

const sequelize = require('../config/connection');

const seedAll = async () => {
  await sequelize.sync({ force: true });
    console.log('\n----- DATABASE SYNCED -----\n');

  await seedUsers();
    console.log('\n----- USERS SEEDED -----\n');

    await seedAccounts();
    console.log('\n----- ACCOUNTS SEEDED -----\n');

    await seedBatches();
    console.log('\n----- BATCHES SEEDED -----\n');

    await seedBoxes();
    console.log('\n----- BOXES SEEDED -----\n');

  process.exit(0);
};

seedAll();
