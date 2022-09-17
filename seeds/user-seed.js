const { User } = require('../models');
const bcrypt = require('bcrypt');

// const rex_pass = bcrypt.hash('password',10);

const userData = [
    {
        name: "Rex Yu",
        email: "yu19910513@gmail.com",
        username: "yu19910513",
        password: "$2b$10$HATPVNIyN3RTOdWa3qbC/eWDt4mwINV1.h/jxbcXjKNlVXGFlfdya",
        admin: true
    },
    {
        name: "Rex #2",
        email: "rexyu@uw.edu",
        username: "rexyu",
        password: '$2b$10$hT/f3byFYnDu5c3ZdfHJiO4TdnTXyVyvnk.XjYAHeisMUFeFRQGdu',
        admin: false
    },
    {
        name: "Yiwu",
        email: "rexyu@uw.edu",
        username: "yiwu",
        password: '$2b$10$hT/f3byFYnDu5c3ZdfHJiO4TdnTXyVyvnk.XjYAHeisMUFeFRQGdu',
        admin: false
    }
]



const seedUsers = () => User.bulkCreate(userData);

module.exports = seedUsers;

// Duong0909#1
// password
