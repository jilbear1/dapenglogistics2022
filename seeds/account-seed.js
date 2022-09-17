const { Account } = require('../models');

const accountData = [
    {
        name: "Test",
        user_id: 2,
        prefix: "tst"

    },
    {
        name: "Exam",
        user_id: 2,
        prefix: "tst"

    },
    {
        name: "Rex",
        user_id: 2,
        prefix: "rex"
    },
    {
        name: "Something",
        user_id: 1,
        prefix: "som"
    },
]



const seedAccounts = () => Account.bulkCreate(accountData);
module.exports = seedAccounts;
