const router = require('express').Router();
const api = require('./api');
const home = require('./home_route');
const admin = require('./admin_route');


router.use('/', home);
router.use('/api', api);
router.use('/admin', admin);

module.exports = router;
