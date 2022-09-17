const router = require('express').Router();
const sequelize = require('../config/connection');
const {User, Account, Batch, Box, Container, Item, Document} = require('../models');
const {withAuth, adminAuth} = require('../utils/auth');
//admin page
//admin home page
router.get('/', withAuth, async (req, res) => {
  try {
    res.render('admin', {loggedIn: true, admin: req.session.admin, name: req.session.name});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
router.get('/master_page', withAuth, async (req, res) => {
  try {
    const boxData = await Box.findAll({
      where:{
        status: [0, 1, 2, 3]
      },
      attributes: [
        'tracking',
        'batch_id',
        'id',
        'box_number',
        'description',
        'cost',
        'requested_date',
        'received_date',
        'shipped_date',
        'order',
        'qty_per_box',
        'length',
        'width',
        'height',
        'weight',
        'volume',
        'status',
        'location',
        'sku',
        'file',
        'file_2',
        'notes'
      ],
      include: [
        {
          model: Batch,
          attributes: [
            'asn',
            'pending_date',
            'total_box'
          ]
        },
        {
          model: Account,
          attributes: [
            'name'
          ]
        },
        {
          model: User,
          attributes: [
            'id',
            'name',
            'email'
          ]
        }
      ]
    });
    const boxes = boxData.map(box => box.get({ plain: true }));
    res.render('master_admin', {
      boxes,
      loggedIn: true,
      admin: req.session.admin,
      name: req.session.name,
      shipped_date: req.body.shipped_date,
      received_date: req.body.received_date,
      requested_date: req.body.requested_date
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});
router.get('/master_page_amazon', withAuth, async (req, res) => {
  try {
    const containerDB = await Container.findAll({
      where:{
        status: [1, 2, 3, 4]
      },
      attributes: [
        'id',
        'user_id',
        'account_id',
        's3',
        'notes',
        'id',
        'container_number',
        'description',
        'cost',
        'requested_date',
        'received_date',
        'shipped_date',
        'type',
        'length',
        'width',
        'height',
        'weight',
        'volume',
        'status',
        'location',
        'file',
        'file_2',
        'fba',
        'bill_received',
        'bill_storage',
        'bill_shipped'
      ],
      include: [
        {
          model: Account,
          attributes: [
            'name'
          ]
        },
        {
          model: User,
          attributes: [
            'id',
            'name'
          ]
        }
      ]
    });
    const containers = containerDB.map(container => container.get({ plain: true }));
    res.render('master_admin_amazon', {
      containers,
      loggedIn: true,
      admin: req.session.admin,
      name: req.session.name,
      shipped_date: req.body.shipped_date,
      received_date: req.body.received_date,
      requested_date: req.body.requested_date
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});
//admin bulk barcode for china shipment
router.get('/batch/:id', withAuth, async (req, res) => {
  try {
    const boxData = await Box.findAll({
      where: {
        batch_id: req.params.id
      },
      order: [
        ["box_number", "ASC"]
      ],
        attributes: [
      'id',
      'box_number',
      'description',
      'cost',
      'received_date',
      'requested_date',
      'shipped_date',
      'order',
      'qty_per_box',
      'length',
      'width',
      'height',
      'weight',
      'volume',
      'status',
      'location',
      'sku',
      'file',
      'file_2',
        ],
          include: [
        {
        model: Batch,
        attributes:
        [
          'asn',
          'pending_date',
          'total_box'
          ]},
        {
          model: Account,
          attributes: [
            'name'
          ]
        }
          ]
    })
    const boxes = boxData.map(box => box.get({ plain: true }));
    res.render('shipping_label', {
      boxes,
      loggedIn: true,
      admin: req.session.admin,
      name: req.session.name,
      account: boxes[0].account.name,
      date: boxes[0].batch.pending_date
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
//admin single barcode for china shipment
router.get('/box/:id', withAuth, async (req, res) => {
    try {
      const boxData = await Box.findAll({
        where: {
          box_number: req.params.id
        },
          attributes: [
        'id',
        'box_number',
        'description',
        'cost',
        'received_date',
        'requested_date',
        'shipped_date',
        'order',
        'qty_per_box',
        'length',
        'width',
        'height',
        'weight',
        'volume',
        'status',
        'location',
        'sku',
        'file',
        'file_2',
          ],
            include: [
          {
          model: Batch,
          attributes:
          [
            'asn',
            'pending_date',
            'total_box'
            ]},
          {
            model: Account,
            attributes: [
              'name'
            ]
          }
            ]
      })
      const boxes = boxData.map(box => box.get({ plain: true }));
      res.render('shipping_label', {
        boxes,
        loggedIn: true,
        admin: req.session.admin,
        name: req.session.name,
        account: boxes[0].account.name,
        date: boxes[0].batch.pending_date
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
});
router.get('/container/:id', withAuth, async (req, res) => {
  try {
    const containerData = await Container.findAll({
      where: {
        container_number: req.params.id
      },
        attributes: [
      'id',
      'container_number',
      'description',
      'cost',
      'received_date',
      'length',
      'width',
      'height',
      'weight',
      'file',
      'file_2',
        ],
          include: [
        {
          model: Account,
          attributes: [
            'name'
          ]
        },
        {
          model: User,
          attributes: [
            'name'
          ]
        }
          ]
    })
    const containers = containerData.map(container => container.get({ plain: true }));
    res.render('shipping_label_amazon', {
      containers,
      loggedIn: true,
      account: containers[0].account.name,
      user: containers[0].user.name,
      admin: req.session.admin,
      name: req.session.name,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
router.get(`/sku_modification`, withAuth, async (req, res) => {
  try {
    const userData = await User.findAll({
      where: {
        admin: false
      },
      attributes: [
        'id',
        'name',
      ],
    });
    const dData = await Document.findAll({
      limit: 30,
      order: [
        ["id", "DESC"],
      ],
      where: {
        type: 1,
        status: 0
      },
      attributes: [
        'id',
        'references',
        'date',
        'file'
      ],
      include:
      {
        model: User,
        attributes: [
          'name'
        ]
      }
    })
    const users = userData.map(user => user.get({ plain: true }));
    const documents = dData.map(d => d.get({ plain: true }));
    res.render('sku_modification', {
      documents,
      users,
      loggedIn: true,
      admin: req.session.admin,
      name: req.session.name,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
})


module.exports = router
