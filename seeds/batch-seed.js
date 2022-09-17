const { Batch } = require('../models');

const batchData = [
    {
        asn: "ASN1234567890",
        pending_date: "12/21/2021",
        total_box: 10,
        user_id: 1,
        account_id: 4,
    },
    {
        asn: "ASN1234567891",
        pending_date: "12/21/2021",
        total_box: 10,
        user_id: 2,
        account_id: 1,
    },
    {
        asn: "ASN1234567893",
        pending_date: "12/21/2021",
        total_box: 10,
        user_id: 2,
        account_id: 2,
    },
    {
        asn: "ASN1234567892",
        pending_date: "12/21/2021",
        total_box: 10,
        user_id: 2,
        account_id: 3,
    },
]



const seedBatches = () => Batch.bulkCreate(batchData);

module.exports = seedBatches;
