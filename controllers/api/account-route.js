const router = require('express').Router();
const {User, Account, Batch, Box} = require('../../models');
const {withAuth, adminAuth} = require('../../utils/auth');

router.get('/', withAuth, async (req, res) => {
  try {
  const accountDB = await Account.findAll({
    attributes: [
      'id',
      'name',
      'prefix',
      'user_id'
    ],
    include: [
      {
        model: User,
        attributes: [
          'id',
          'name'
        ]
      }
    ]
  });
  const accounts = accountDB.map(account => account.get({plain: true}));
  res.json(accounts);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
//create new account
router.post('/', withAuth, (req, res) => {
    Account.create({
        user_id: req.session.user_id,
        name: req.body.name,
        prefix: req.body.prefix
    }).then(dbAccounttData => res.json(dbAccounttData))
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post('/seeds', withAuth, (req, res) => {
  Account.create({
      user_id: req.body.user_id,
      name: req.body.name,
      prefix: req.body.prefix
  }).then(dbAccounttData => res.json(dbAccounttData))
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

router.post('/amazon_newAccount', withAuth, (req, res) => {
  Account.create({
      user_id: req.body.user_id,
      name: req.body.name,
      prefix: req.body.prefix
  }).then(dbAccounttData => res.json(dbAccounttData))
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

router.delete('/destroy/:key', withAuth, (req, res) => {
  Account.destroy({
      where: {
        id: req.params.key
      }
    })
      .then(dbAccountData => {
        if (!dbAccountData) {
          res.status(404).json({ message: 'No Account found with this id' });
          return;
        }
        res.json(dbAccountData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
});
module.exports = router;
