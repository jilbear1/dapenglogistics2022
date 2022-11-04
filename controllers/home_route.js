const router = require('express').Router();
const { route } = require('.');
const sequelize = require('../config/connection');
const {User, Account, Batch, Box, Container, Item, Detail, Record} = require('../models');
const {withAuth, adminAuth} = require('../utils/auth');
const { uploadFile, getFile} = require('../utils/s3');
const {getFile_admin} = require('../utils/s3_file');
const { Op } = require("sequelize");

router.get('/', withAuth, async (req, res) => {
  try {
    const accountData = await Account.findAll({
      where: {
        user_id: req.session.user_id,
      },
      attributes: [
        'id',
        'name'
      ],
      include: [
        {
          model: Box,
          where: {status: [0,1,2]},
          attributes: [
            'box_number'
          ]
        }
      ],
      order: [
        ["name", "ASC"],
      ],
    });
    const accountDataTwo = await Account.findAll({
      where: {
        user_id: req.session.user_id,
      },
      attributes: [
        'id',
        'name'
      ],
      include: [
        {
          model: Container,
          where: {status: [1,2]},
          attributes: [
            'container_number'
          ]
        }
      ],
      order: [
        ["name", "ASC"],
      ],
    });
    const detailData = await Detail.findAll({
      where: {
        user_id: req.session.user_id,
      },
        attributes: [
          'id'
        ]
    });
    var detailAuth = false;
    const details = detailData.map(detail => detail.get({ plain: true }));
    details.length>0?detailAuth=true:detailAuth=false;
    var pre_accounts = accountData.map(account => account.get({ plain: true }));
    var pre_accountsTwo = accountDataTwo.map(account => account.get({ plain: true }));
    var accounts = [];
    var account_idArr = [];
    pre_accounts.forEach(i => {
      accounts.push(i);
      account_idArr.push(i.id)
    });
    pre_accountsTwo.forEach(i => {
      if (!account_idArr.includes(i.id)) {
        account_idArr.push(i.id);
        accounts.push(i);
      } else {
        const index = account_idArr.indexOf(i.id);
        accounts[index].containers = i.containers;
      }
    });
    accounts.sort(function(a, b) {
      const nameA = a.name.toUpperCase(); // ignore upper and lowercase
      const nameB = b.name.toUpperCase(); // ignore upper and lowercase
      if (nameA < nameB) {
        return -1;
      }
      if (nameA > nameB) {
        return 1;
      }
      // names must be equal
      return 0;
    });
    res.render('home', {
      accounts,
      loggedIn: true,
      admin: req.session.admin,
      name: req.session.name,
      detailAuth
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

router.get('/master', withAuth, async (req, res) => {
  try {
    const boxData = await Box.findAll({
      where: {
        user_id: req.session.user_id,
        status: [0, 1, 2, 3]
      },
      attributes: [
        'tracking',
        'batch_id',
        'id',
        'box_number',
        'description',
        'cost',
        'received_date',
        'requested_date',
        'shipped_date',
        'order',
        'status',
        'sku',
        'file',
        'qty_per_box'
      ],
      include: [
        {
          model: Batch,
          attributes: [
            'pending_date',
            'total_box'
          ]
        },
        {
          model: Account,
          attributes: [
            'name'
          ]
        }
      ]
    });
    const boxes = boxData.map(box => box.get({ plain: true }));
    // boxes = [];
    // for (let i = 0; i < 50; i++) {
    //   boxes.push(boxe[i])
    // };
    res.render('master_home', {
      boxes,
      loggedIn: true,
      admin: req.session.admin,
      name: req.session.name
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

//client request page
router.get('/request', withAuth, async (req, res) => {
  try {
    const boxData = await Box.findAll({
      where: {
        user_id: req.session.user_id,
        status: 1
      },
      attributes: [
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
        }
      ]
    });
    const boxes = boxData.map(box => box.get({ plain: true }));
    res.render('request', { boxes, loggedIn: true, admin: req.session.admin, name: req.session.name });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/request_amazon', withAuth, async (req, res) => {
  try {
    const containerData = await Container.findAll({
      where: {
        user_id: req.session.user_id,
        status: 1,
        type: [1,2]
      },
      attributes: [
        'id',
        'user_id',
        'account_id',
        's3',
        'notes',
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
      include:
        {
          model: Account,
          attributes: [
            'name'
          ]
        }
    });
    const containers = containerData.map(container => container.get({ plain: true }));
    res.render('request_amazon', {containers, loggedIn: true, admin: req.session.admin, name: req.session.name, accountId: req.params.id});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/request_amazon_confirmation', withAuth, async (req, res) => {
  try {
    const containerData = await Container.findAll({
      where: {
        user_id: req.session.user_id,
        status: 1,
        type: 3
      },
      order: [
        ['custom_1', 'ASC']
      ],
      attributes: [
        'id',
        'user_id',
        'account_id',
        's3',
        'notes',
        'tracking',
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
        'custom_1',
        'bill_received',
        'bill_storage',
        'bill_shipped'
      ],
      include:
        {
          model: Account,
          attributes: [
            'name'
          ]
        }
    });
    const containers = containerData.map(container => container.get({ plain: true }));
    res.render('request_amazon_confirmation', {containers, loggedIn: true, admin: req.session.admin, name: req.session.name});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/amazon', withAuth, async (req, res) => {
  try {
    const containerData = await Container.findAll({
      where: {
        user_id: req.session.user_id,
        status: [0,1,2,3]
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
            }
          ]
    });
    const detailData = await Detail.findAll({
      where: {
        user_id: req.session.user_id,
      },
        attributes: [
          'id',
          'return_num',
          'dress_num',
          'tracking_num',
          'dress_sku',
          'return_sku',
          'amazon_sku',
          'user_name',
          'account_name',
          'date_added',
          'status',
          'billed',
          'search_item',
          'condition',
          'color',
          'size',
          'description',
          'first_name',
          'last_name',
          'address',
          'city',
          'state',
          'zipcode',
          'user_id',
          'account_id',
          'container_id',
          'item_id'
        ],
          include: [
            {
          model: Account,
          attributes: [
            'name'
          ]
            }
          ]
    });
    const containers = containerData.map(container => container.get({ plain: true }));
    const details = detailData.map(detail => detail.get({ plain: true }));
    res.render('master_home_amazon', {
      containers,
      details,
      loggedIn: true,
      accountId: req.params.id,
      admin: req.session.admin,
      name: req.session.name
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

//log in page
router.get('/login', (req, res) => {
  if (req.session.loggedIn) {
    res.redirect('/');
    return;
  }
  res.render('login');
});

//client new order page
router.get('/neworder/', withAuth, (req, res) => {
    res.render('neworder', { loggedIn: true })
});

//user signup page
router.get('/signup/', (req, res) => {
    if (req.session.loggedIn) {
      res.redirect('/');
      return;
    }
    res.render('signup');
});

router.get('/merger', withAuth, (req, res) => {
  try {
    res.render('merger', {loggedIn: true, admin: req.session.admin, name: req.session.name});
  } catch (error) {
    res.status(500).json(error)
  }
});

router.get('/partial_merge/:fromId&:toId', withAuth, async (req, res) => {
  try {
    const fromData = await Item.findAll({
      where: {
        container_id: req.params.fromId
      },
      attributes: [
        'id',
        'item_number',
        'qty_per_sku',
        'container_id',
        'account_id',
        'user_id',
        'description'
      ],
      include: [
        {
          model: Container,
          where: {
            status:[1,2]
          },
          attributes: [
            'id',
            'container_number',
            'description',
            'cost',
            'requested_date',
            'received_date',
            'location',
            'file',
            'file_2',
            'notes',
            's3',
            'fba'
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
          ]
        }
      ]
    });
    const toData = await Item.findAll({
      where: {
        container_id: req.params.toId
      },
      attributes: [
        'id',
        'item_number',
        'qty_per_sku',
        'container_id',
        'account_id',
        'user_id',
        'description'
      ],
      include: [
        {
          model: Container,
          where: {
            status:[1,2]
          },
          attributes: [
            'id',
            'container_number',
            'description',
            'cost',
            'requested_date',
            'received_date',
            'location',
            'file',
            'file_2',
            'notes',
            's3',
            'fba'
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
          ]
        }
      ]
    });
    var  fromBoxId, toBoxId;
    const fromitem = fromData.map(item => item.get({ plain: true }));
    if (fromitem[0]) {
      fromBoxId = fromitem[0].container_id;
    } else {
      fromBoxId = null;
    };
    const toitem = toData.map(item => item.get({ plain: true }));
    if (toitem[0]) {
      toBoxId = toitem[0].container_id;
    } else {
      toBoxId = null;
    };
    var fromRequest, toRequest;
    var newBox = false;

    if (!toitem.length) {
      newBox = true
    };

    if (fromitem.length && fromitem[0].description && fromitem[0].description.includes(':')) {
      fromitem.forEach(i => {i.reqboxfrom = true});
      const requestsBatch = fromitem.reduce(function (r, a) {
        r[a.description] = r[a.description] || [];
        r[a.description].push(a);
        return r;
      }, Object.create(null));
      fromRequest = Object.values(requestsBatch);
    } else {
      fromRequest = [fromitem]
    };

    if (toitem.length && toitem[0].description && toitem[0].description.includes(':')) {
      toitem.forEach(i => {i.reqboxto = true});
      const requestsBatch = toitem.reduce(function (r, a) {
        r[a.description] = r[a.description] || [];
        r[a.description].push(a);
        return r;
      }, Object.create(null));
      toRequest = Object.values(requestsBatch);
    } else {
      toRequest = [toitem]
    };


    res.render('partial_merge', {fromRequest, toRequest, newBox, fromBoxId, toBoxId, loggedIn: true, admin: req.session.admin, name: req.session.name});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
})

router.get('/client_service', withAuth, (req, res) => {
  try {
    res.render('client_service', {loggedIn: true, admin: req.session.admin, name: req.session.name});
  } catch (error) {
    res.status(500).json(error)
  }
})

//admin request-handling page (manual)
router.get('/admin_move', withAuth, async (req, res) => {
    try {
      const boxData = await Box.findAll({
        where: {
          status:2
        },
        attributes: [
          'tracking',
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
      res.render('move', { boxes, loggedIn: true, admin: req.session.admin, name: req.session.name });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }

});

router.get('/admin_move_amazon', withAuth, async (req, res) => {
  try {
    const itemData = await Item.findAll({
        attributes: [
          'id',
          'item_number',
          'qty_per_sku',
          'container_id',
          'account_id',
          'user_id',
          'description'
        ],
        include: [
          {
            model: Container,
            where: {
              status:2
            },
            attributes: [
              'id',
              'container_number',
              'description',
              'cost',
              'requested_date',
              'received_date',
              'location',
              'file',
              'file_2',
              'notes',
              's3',
              'fba'
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
            ]
          }
        ]
      });
      const items = itemData.map(item => item.get({ plain: true }));
      const requestsBatch = items.reduce(function (r, a) {
        r[a.description] = r[a.description] || [];
        r[a.description].push(a);
        return r;
      }, Object.create(null));
      const requests = Object.values(requestsBatch);
    res.render('move_amazon', { requests, loggedIn: true, admin: req.session.admin, name: req.session.name });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});//////////////////////// to be continued ***************************

//admin receving page
router.get('/admin_receiving', withAuth, async (req, res) => {
  try {
    const boxData = await Box.findAll({
      where: {
        status:0
      },
      attributes: [
        'tracking',
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
    res.render('receive', { boxes, loggedIn: true, admin: req.session.admin, name: req.session.name });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

//barcode generation per batch id
router.get('/batch/:id', withAuth, async (req, res) => {
  try {
    const boxData = await Box.findAll({
      where: {
        batch_id: req.params.id,
        user_id: req.session.user_id
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
  })

// admin auto receiving page
router.get('/admin_receiving_main', withAuth, async (req, res) => {
  try {
    const boxData = await Box.findAll({
      where: {
        status:0
      },
      attributes: [
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
        'notes',
        's3'
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
    res.render('receiving_main', { boxes, loggedIn: true, admin: req.session.admin, name: req.session.name });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

//admin request-handling page (in cards)
router.get('/admin_move_main', withAuth, async (req, res) => {
  try {
    const boxData = await Box.findAll({
      where: {
        status:2
      },
      attributes: [
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
        'notes',
        's3',
        'fba'
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
    const result = boxes.reduce(function (r, a) {
      r[a.s3] = r[a.s3] || [];
      r[a.s3].push(a);
      return r;
    }, Object.create(null));
    const data = Object.values(result);
    res.render('dynamic_move', { data, loggedIn: true, admin: req.session.admin, name: req.session.name});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

//admin request-handling page amazon (in cards)
router.get('/admin_move_main_amazon', withAuth, async (req, res) => {
  try {
    const itemData = await Item.findAll({
      attributes: [
        'id',
        'item_number',
        'qty_per_sku',
        'container_id',
        'account_id',
        'user_id',
        'description'
      ],
      include: [
        {
          model: Container,
          where: {
            status:2,
            type: [0,2]
          },
          attributes: [
            'id',
            'container_number',
            'description',
            'cost',
            'requested_date',
            'received_date',
            'location',
            'file',
            'file_2',
            'notes',
            's3',
            'fba'
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
          ]
        }
      ]
    });
    const items = itemData.map(item => item.get({ plain: true }));
    const requestsBatch = items.reduce(function (r, a) {
      r[a.container_id] = r[a.container_id] || [];
      r[a.container_id].push(a);
      return r;
    }, Object.create(null));
    const requests = Object.values(requestsBatch);
    res.render('dynamic_move_amazon', {requests, loggedIn: true, admin: req.session.admin, name: req.session.name, confirm: false, type_2: false});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

//admin request-handling page amazon (process skipping)
router.get('/admin_move_main_amazon_type_2', withAuth, async (req, res) => {
  try {
    const itemData = await Item.findAll({
      attributes: [
        'id',
        'item_number',
        'qty_per_sku',
        'container_id',
        'account_id',
        'user_id',
        'description'
      ],
      include: [
        {
          model: Container,
          where: {
            status:2,
            type: [0,2]
          },
          attributes: [
            'id',
            'container_number',
            'description',
            'cost',
            'requested_date',
            'received_date',
            'location',
            'file',
            'file_2',
            'notes',
            's3',
            'fba'
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
          ]
        }
      ]
    });
    const items = itemData.map(item => item.get({ plain: true }));
    const requestsBatch = items.reduce(function (r, a) {
      r[a.container_id] = r[a.container_id] || [];
      r[a.container_id].push(a);
      return r;
    }, Object.create(null));
    const requests = Object.values(requestsBatch);
    res.render('dynamic_move_amazon', {requests, loggedIn: true, admin: req.session.admin, name: req.session.name, confirm: false, type_2: true});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

router.get('/admin_confirm_amazon_pal', withAuth, async (req, res) => {
  try {
    const containerData = await Container.findAll({
      where: {
        status:2,
        type: 3,
        custom_1: {
          [Op.not]: null
        }
      },
      attributes: [
        'id',
        'tracking',
        'container_number',
        'description',
        'cost',
        'requested_date',
        'received_date',
        'location',
        'file',
        'file_2',
        'notes',
        's3',
        'fba',
        'custom_1',
        'custom_2'
      ],
      include: [
        {
          model: Account,
          attributes: [
            'name',
            'id'
          ]
        },
        {
          model: User,
          attributes: [
            'id',
            'name',
          ]
        }
      ]
    });
    const containers = containerData.map(container => container.get({ plain: true }));
    const requestsBatch = containers.reduce(function (r, a) {
      r[a.tracking] = r[a.tracking] || [];
      r[a.tracking].push(a);
      return r;
    }, Object.create(null));
    const confirms = Object.values(requestsBatch);
    res.render('dynamic_move_amazon', {confirms, loggedIn: true, admin: req.session.admin, name: req.session.name, confirm: true, pal: true});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

router.get('/admin_confirm_amazon', withAuth, async (req, res) => {
  try {
    const containerData = await Container.findAll({
      where: {
        status:2,
        type: 3
      },
      attributes: [
        'id',
        'tracking',
        'container_number',
        'description',
        'cost',
        'requested_date',
        'received_date',
        'location',
        'file',
        'file_2',
        'notes',
        's3',
        'fba',
        'custom_1',
        'custom_2'
      ],
      include: [
        {
          model: Account,
          attributes: [
            'name',
            'id'
          ]
        },
        {
          model: User,
          attributes: [
            'id',
            'name',
          ]
        }
      ]
    });
    const containers = containerData.map(container => container.get({ plain: true }));
    const requestsBatch = containers.reduce(function (r, a) {
      r[a.custom_2] = r[a.custom_2] || [];
      r[a.custom_2].push(a);
      return r;
    }, Object.create(null));
    const confirms = Object.values(requestsBatch);
    res.render('dynamic_move_amazon', {confirms, loggedIn: true, admin: req.session.admin, name: req.session.name, confirm: true, pal: false});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

//render single pre-ship scanning page
router.get('/admin_pre_ship', withAuth, (req, res) => {
  try {
    res.render('pre_ship', {loggedIn: true, admin: req.session.admin, name: req.session.name });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/admin_pre_ship_amazon/:id', withAuth, async (req, res) => {
    try {
      const itemData = await Item.findAll({
        where: {
          container_id: req.params.id
        },
        attributes: [
          'id',
          'item_number',
          'qty_per_sku',
          'container_id',
          'account_id',
          'user_id',
          'description'
        ],
        include: [
          {
            model: Container,
            where: {
              status:2
            },
            attributes: [
              'id',
              'container_number',
              'description',
              'cost',
              'requested_date',
              'received_date',
              'location',
              'file',
              'file_2',
              'notes',
              's3',
              'fba'
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
            ]
          }
        ]
      });
      const items = itemData.map(item => item.get({ plain: true }));
      const requestsBatch = items.reduce(function (r, a) {
        r[a.description] = r[a.description] || [];
        r[a.description].push(a);
        return r;
      }, Object.create(null));
      const requests = Object.values(requestsBatch);
      res.render('pre_ship_amazon', {requests, loggedIn: true, admin: req.session.admin, name: req.session.name});
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }

  });

//billing page
router.get('/billing', withAuth, async (req, res) => {
  try {
    res.render('billing', {
      loggedIn: true,
      admin: req.session.admin,
      name: req.session.name
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/billing_amazon', withAuth, async (req, res) => {
  try {
    res.render('billing_amazon', {
      loggedIn: true,
      admin: req.session.admin,
      name: req.session.name
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
})

//client pending order page (in cards)
router.get('/client_label', withAuth, async (req, res) => {
  try {
    const boxData = await Box.findAll({
      where: {
        status:0,
        user_id: req.session.user_id,
      },
      attributes: [
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
        'notes',
        's3'
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
    const result = boxes.reduce(function (r, a) {
      r[a.batch_id] = r[a.batch_id] || [];
      r[a.batch_id].push(a);
      return r;
    }, Object.create(null));
    const data = Object.values(result);
    res.render('client_label', { data, loggedIn: true, admin: req.session.admin, name: req.session.name });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

//redner box-allocation page
router.get('/box_location', withAuth, async (req, res) => {
  try {
    res.render('box_location', {loggedIn: true, admin: req.session.admin, name: req.session.name });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

//file url (public) --> may need to add withAuth
router.get('/pdf/:key', (req, res) => {
  const key = req.params.key;
  const readStream = getFile(key);
  readStream.pipe(res)
});

router.get('/image/:key', (req, res) => {
  const key = req.params.key;
  const readStream = getFile_admin(key);
  readStream.pipe(res)
});

//client single barcode page
router.get('/box/:id', withAuth, async (req, res) => {
  try {
    const boxData = await Box.findAll({
      where: {
        box_number: req.params.id,
        user_id: req.session.user_id
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

router.get('/account/:id', withAuth, async (req, res) => {
    try {
      const boxData = await Box.findAll({
        where: {
          account_id: req.params.id,
          user_id: req.session.user_id,
          status: [0,1,2,3]
        },
          attributes: [
        'account_id',
        'batch_id',
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
            'total_box',
            'id'
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
      var accountInfo, dateInfo;
      if(!boxes[0]) {
        accountInfo = null;
        dateInfo = null;
      } else {
        accountInfo = boxes[0].account.name;
        dateInfo = boxes[0].batch.pending_date;
      }
      res.render('master_home', {
        boxes,
        loggedIn: true,
        accountId: req.params.id,
        admin: req.session.admin,
        name: req.session.name,
        account: accountInfo,
        date: dateInfo
      });
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
});

router.get('/amazon/:id', withAuth, async (req, res) => {
  try {
    const containerData = await Container.findAll({
      where: {
        account_id: req.params.id,
        user_id: req.session.user_id,
        status: [0,1,2,3]
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
            }
          ]
    })
    const detailData = await Detail.findAll({
        where: {
          user_id: req.session.user_id,
          account_id: req.params.id
        },
          attributes: [
            'id',
            'return_num',
            'dress_num',
            'tracking_num',
            'dress_sku',
            'return_sku',
            'amazon_sku',
            'user_name',
            'account_name',
            'date_added',
            'status',
            'billed',
            'search_item',
            'condition',
            'color',
            'size',
            'description',
            'first_name',
            'last_name',
            'address',
            'city',
            'state',
            'zipcode',
            'user_id',
            'account_id',
            'container_id',
            'item_id'
          ],
            include: [
              {
            model: Account,
            attributes: [
              'name'
            ]
              }
            ]
    });
    const containers = containerData.map(container => container.get({ plain: true }));
    const details = detailData.map(detail => detail.get({ plain: true }));
    res.render('master_home_amazon', {
      containers,
      details,
      loggedIn: true,
      accountId: req.params.id,
      admin: req.session.admin,
      name: req.session.name
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/request/:id', withAuth, async (req, res) => {
  try {
    const boxData = await Box.findAll({
      where: {
        user_id: req.session.user_id,
        account_id: req.params.id,
        status: 1,
      },
      attributes: [
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
        }
      ]
    });
    const boxes = boxData.map(box => box.get({ plain: true }));
    res.render('request', { boxes, loggedIn: true, admin: req.session.admin, name: req.session.name, accountId: req.params.id});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/request_amazon/:id', withAuth, async (req, res) => {
  try {
    const containerData = await Container.findAll({
      where: {
        user_id: req.session.user_id,
        account_id: req.params.id,
        status: 1,
        type: [1,2]
      },
      attributes: [
        'id',
        'user_id',
        'account_id',
        's3',
        'notes',
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
      include:
        {
          model: Account,
          attributes: [
            'name'
          ]
        }
    });
    const containers = containerData.map(container => container.get({ plain: true }));
    res.render('request_amazon', {containers, loggedIn: true, admin: req.session.admin, name: req.session.name, accountId: req.params.id});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/request_amazon_confirmation/:id', withAuth, async (req, res) => {
  try {
    const containerData = await Container.findAll({
      where: {
        user_id: req.session.user_id,
        account_id: req.params.id,
        status: 1,
        type: 3
      },
      order: [
        ['custom_1', 'ASC']
      ],
      attributes: [
        'id',
        'user_id',
        'account_id',
        'tracking',
        's3',
        'notes',
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
        'custom_1',
        'bill_received',
        'bill_storage',
        'bill_shipped'
      ],
      include:
        {
          model: Account,
          attributes: [
            'name'
          ]
        }
    });
    const containers = containerData.map(container => container.get({ plain: true }));
    res.render('request_amazon_confirmation', {containers, loggedIn: true, admin: req.session.admin, name: req.session.name, accountId: req.params.id});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/amazon_receiving', withAuth, async(req, res) => {
  try {
    res.render('amazon_receiving', {loggedIn: true, admin: req.session.admin, name: req.session.name});
  } catch (error) {
    res.status(500).json(error)
  }
});

router.get('/amazon_overview', withAuth, async (req, res) => {
  try {
    const containerData = await Container.findAll({
      where: {
        user_id: req.session.user_id,
        status: [1,2]
      },
      order: [
        ['container_number', 'ASC']
      ],
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
            }
          ]
      })
    const containers = containerData.map(container => container.get({ plain: true }));
    res.render('amazon_overview', {
      containers,
      loggedIn: true,
      accountId: req.params.id,
      admin: req.session.admin,
      name: req.session.name
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/amazon_overview_admin/:user_id', withAuth, async (req, res) => {
  try {
    const containerData = await Container.findAll({
      where: {
        user_id: req.params.user_id,
        status: [1,2]
      },
      order: [
        ['container_number', 'ASC']
      ],
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
            }
          ]
      })
    const containers = containerData.map(container => container.get({ plain: true }));
    if (req.session.admin) {
      res.render('amazon_overview', {
      containers,
      loggedIn: true,
      admin: req.session.admin,
      name: req.session.name
    })
    } else {
      res.render('admin', {
        loggedIn: true,
        admin: req.session.admin,
        name: req.session.name
      })
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/amazon_overview/:id', withAuth, async (req, res) => {
  try {
    const containerData = await Container.findAll({
      where: {
        user_id: req.session.user_id,
        account_id: req.params.id,
        status: [1,2]
      },
      order: [
        ['container_number', 'ASC']
      ],
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
            }
          ]
      })
    const containers = containerData.map(container => container.get({ plain: true }));
    var account_name;
    if (containers.length) {
      account_name = containers[0].account.name
    } else {
      account_name = 'N/A'
    }
    res.render('amazon_overview', {
      containers,
      accountName: account_name,
      loggedIn: true,
      accountId: req.params.id,
      admin: req.session.admin,
      name: req.session.name
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});


/////////delete Get pages: main = [china box, container page, sku page]////////////
router.get('/dq_chinabox', withAuth, async (req, res) => {
  try {
    const boxData = await Box.findAll({
      where: {
        user_id: req.session.user_id,
        status: 1
      },
      order: [
        ['box_number', 'ASC']
      ],
      attributes: [
        'id',
        'user_id',
        'account_id',
        'box_number',
        'sku',
        'description',
        'order',
        'qty_per_box'
      ],
      include:[
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
    });
    const boxes = boxData.map(box => box.get({ plain: true }));
    res.render('delete_queue', {boxes, china: true, amazon: false, loggedIn: true, admin: req.session.admin, name: req.session.name});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
router.get('/dq_container', withAuth, async (req, res) => {
  try {
    const containerData = await Item.findAll({
      where: {
        user_id: req.session.user_id,
      },
      order: [
        ['item_number', 'ASC']
      ],
      attributes: [
        'id',
        'user_id',
        'account_id',
        'container_id',
        'item_number',
        'qty_per_sku'
      ],
      include:[
        {
          model: Container,
          where: {
            status: 1,
            type: 1
          },
          attributes: [
            'container_number'
          ]
        },
        {
          model: User,
          attributes: [
            'name'
          ]
        },
        {
          model: Account,
          attributes: [
            'name'
          ]
        }
      ]
    });
    const pre_containers = containerData.map(container => container.get({ plain: true }));
    const requestsBatch = pre_containers.reduce(function (r, a) {
      r[a.container_id] = r[a.container_id] || [];
      r[a.container_id].push(a);
      return r;
    }, Object.create(null));
    const containers = Object.values(requestsBatch);
    res.render('delete_queue', {containers, loggedIn: true, china: false, amazon: true, admin: req.session.admin, name: req.session.name, accountId: req.params.id});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
router.get('/dq_sku', withAuth, async (req, res) => {
  try {
    const itemData = await Item.findAll({
      where: {
        user_id: req.session.user_id,
      },
      order: [
        ['account_id', 'ASC']
      ],
      attributes: [
        'id',
        'user_id',
        'account_id',
        'container_id',
        'item_number',
        'qty_per_sku'
      ],
      include:[
        {
          model: Container,
          where: {
            status: 1,
            type: 1
          },
          attributes: [
            'container_number'
          ]
        },
        {
          model: User,
          attributes: [
            'name'
          ]
        },
        {
          model: Account,
          attributes: [
            'name'
          ]
        }
      ]
    });
    const pre_items = itemData.map(item => item.get({ plain: true }));
    const requestsBatch = pre_items.reduce(function (r, a) {
      r[a.item_number] = r[a.item_number] || [];
      r[a.item_number].push(a);
      return r;
    }, Object.create(null));
    const items = Object.values(requestsBatch);
    res.render('delete_queue', {items, loggedIn: true, china: false, amazon: false, admin: req.session.admin, name: req.session.name, accountId: req.params.id});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
///////////////////////////////
// router.get('/rawData', withAuth, (req, res) => {
//     res.render('rawData');
// });
router.get('/delete_queue_admin', withAuth, async(req, res) => {
  try {
    const boxData = await Box.findAll({
      where: {
        status: 4,
        cost: '0.00'
      },
      order: [
        ['id', 'ASC']
      ],
      attributes: [
        'id',
        'user_id',
        'account_id',
        'box_number',
        'notes',
        'description',
        'order',
        'qty_per_box'
      ],
      include:[
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
    });
    const containerData = await Container.findAll({
      where: {
        status: 4,
        cost: '0.00'
      },
      order: [
        ['id', 'ASC']
      ],
      attributes: [
        'id',
        'user_id',
        'account_id',
        'container_number',
        'notes',
        'description',
        'unit_fee',
        'qty_of_fee'
      ],
      include:[
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
    });
    const xc_boxes = boxData.map(box => box.get({ plain: true }));
    const xc_containers = containerData.map(container => container.get({ plain: true }));
    res.render('delete_queue_admin', {xc_boxes, xc_containers, loggedIn: true, admin: req.session.admin, name: req.session.name});
  } catch (error) {
    res.status(500).json(error)
  }
});

router.get('/dq_handle_admin/:code&:xc_box&:detailarr', withAuth, async (req, res) => {
  try {
    const xc_box = req.params.xc_box;
    const detailarr = req.params.detailarr;
    const itemArr = detailarr.split('-x-');
    console.log(itemArr, detailarr);
    const code = req.params.code;
    if (code == 'chinabox') {
      const boxData = await Box.findAll({
        where: {
          box_number: itemArr,
          status: 98
        },
        order: [
          ['id', 'ASC']
        ],
        attributes: [
          'id',
          'user_id',
          'account_id',
          'box_number',
          'location',
          'description'
        ],
        include:[
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
      });
      const xcData = await Box.findOne({
        where: {
          box_number: xc_box
        },
        attributes: [
          'id',
          'user_id',
          'account_id',
          'box_number',
          'notes',
          'description'
        ],
      });
      const boxes = boxData.map(box => box.get({ plain: true }));
      const xc = xcData.get({plain: true});
      res.render('dq_handle_admin', {boxes, xc_number: xc.box_number, xc_notes: xc.notes, description: xc.description, china: true, amazon: false, loggedIn: true, admin: req.session.admin, name: req.session.name});
    } else if (code == 'container') {
      const containerData = await Item.findAll({
        order: [
          ['item_number', 'ASC']
        ],
        attributes: [
          'id',
          'user_id',
          'account_id',
          'container_id',
          'item_number',
          'qty_per_sku'
        ],
        include:[
          {
            model: Container,
            where: {
              container_number: itemArr,
              status: 98
            },
            attributes: [
              'container_number',
              'location'
            ]
          },
          {
            model: User,
            attributes: [
              'name'
            ]
          },
          {
            model: Account,
            attributes: [
              'name'
            ]
          }
        ]
      });
      const xcData = await Container.findOne({
        where: {
          container_number: xc_box
        },
        attributes: [
          'id',
          'user_id',
          'account_id',
          'container_number',
          'notes',
          'description'
        ],
      });
      const pre_containers = containerData.map(container => container.get({ plain: true }));
      const requestsBatch = pre_containers.reduce(function (r, a) {
        r[a.container_id] = r[a.container_id] || [];
        r[a.container_id].push(a);
        return r;
      }, Object.create(null));
      const containers = Object.values(requestsBatch);
      const xc = xcData.get({plain: true});
      res.render('dq_handle_admin', {containers, xc_number: xc.container_number, xc_notes: xc.notes, description: xc.description, china: false, amazon: true, loggedIn: true, admin: req.session.admin, name: req.session.name});
    } else if (code == 'sku') {
      var modifiedArr = [];
      itemArr.forEach(item => {modifiedArr.push(`del-${item}`)});
      console.log(modifiedArr);
      const itemData = await Item.findAll({
        where: {
          item_number: modifiedArr
        },
        order: [
          [{model: Container, as: 'Container'}, 'location', 'ASC'],
        ],
        attributes: [
          'id',
          'user_id',
          'account_id',
          'container_id',
          'item_number',
          'qty_per_sku'
        ],
        include:[
          {
            model: Container,
            attributes: [
              'container_number',
              'location'
            ]
          },
          {
            model: User,
            attributes: [
              'name'
            ]
          },
          {
            model: Account,
            attributes: [
              'name'
            ]
          }
        ]
      });
      const xcData = await Container.findOne({
        where: {
          container_number: xc_box
        },
        attributes: [
          'id',
          'user_id',
          'account_id',
          'container_number',
          'notes',
          'description'
        ],
      });
      const pre_items = itemData.map(item => item.get({ plain: true }));
      const requestsBatch = pre_items.reduce(function (r, a) {
        r[a.item_number] = r[a.item_number] || [];
        r[a.item_number].push(a);
        return r;
      }, Object.create(null));
      const items = Object.values(requestsBatch);
      const xc = xcData.get({plain: true});
      res.render('dq_handle_admin', {items, xc_number: xc.container_number, xc_notes: xc.notes, description: xc.description, china: false, amazon: false, loggedIn: true, admin: req.session.admin, name: req.session.name});
    }
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

/////new request_amazon
router.get('/master_request_amazon', withAuth, async (req, res) => {
  try {
    const containerData = await Item.findAll({
      where: {
        user_id: req.session.user_id
      },
      order: [
        ['item_number', 'ASC']
      ],
      attributes: [
        'id',
        'user_id',
        'account_id',
        'container_id',
        'item_number',
        'qty_per_sku'
      ],
      include:[
        {
          model: Container,
          where: {
            status: 1,
            type: 1
          },
          attributes: [
            'container_number',
            'location'
          ]
        },
        {
          model: User,
          attributes: [
            'name'
          ]
        },
        {
          model: Account,
          attributes: [
            'name'
          ]
        }
      ]
    });
    const detailData = await Detail.findAll({
      where: {
        user_id: req.session.user_id
      },
        attributes: [
          'id',
          'return_num',
          'dress_num',
          'tracking_num',
          'dress_sku',
          'return_sku',
          'amazon_sku',
          'user_name',
          'account_name',
          'date_added',
          'status',
          'billed',
          'search_item',
          'condition',
          'color',
          'size',
          'description',
          'first_name',
          'last_name',
          'address',
          'city',
          'state',
          'zipcode',
          'user_id',
          'account_id',
          'container_id',
          'item_id'
        ],
          include: [
            {
          model: Account,
          attributes: [
            'name'
          ]
            }
          ]
    });
    const details = detailData.map(detail => detail.get({ plain: true }));
    const pre_containers = containerData.map(container => container.get({ plain: true }));
    const requestsBatch = pre_containers.reduce(function (r, a) {
      r[a.container_id] = r[a.container_id] || [];
      r[a.container_id].push(a);
      return r;
    }, Object.create(null));
    const containers = Object.values(requestsBatch);
    res.render('master_request_amazon', {containers, details, loggedIn: true, admin: req.session.admin, name: req.session.name});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
router.get('/master_request_amazon/:account_id', withAuth, async (req, res) => {
  try {
    const containerData = await Item.findAll({
      where: {
        user_id: req.session.user_id,
        account_id: req.params.account_id
      },
      order: [
        ['item_number', 'ASC']
      ],
      attributes: [
        'id',
        'user_id',
        'account_id',
        'container_id',
        'item_number',
        'qty_per_sku'
      ],
      include:[
        {
          model: Container,
          where: {
            status: 1,
            type: 1
          },
          attributes: [
            'container_number',
            'location'
          ]
        },
        {
          model: User,
          attributes: [
            'name'
          ]
        },
        {
          model: Account,
          attributes: [
            'name'
          ]
        }
      ]
    });
    const detailData = await Detail.findAll({
      where: {
        user_id: req.session.user_id,
        account_id: req.params.account_id
      },
        attributes: [
          'id',
          'return_num',
          'dress_num',
          'tracking_num',
          'dress_sku',
          'return_sku',
          'amazon_sku',
          'user_name',
          'account_name',
          'date_added',
          'status',
          'billed',
          'search_item',
          'condition',
          'color',
          'size',
          'description',
          'first_name',
          'last_name',
          'address',
          'city',
          'state',
          'zipcode',
          'user_id',
          'account_id',
          'container_id',
          'item_id'
        ],
          include: [
            {
          model: Account,
          attributes: [
            'name'
          ]
            }
          ]
    });
    const pre_containers = containerData.map(container => container.get({ plain: true }));
    const details = detailData.map(detail => detail.get({ plain: true }));
    const requestsBatch = pre_containers.reduce(function (r, a) {
      r[a.container_id] = r[a.container_id] || [];
      r[a.container_id].push(a);
      return r;
    }, Object.create(null));
    const containers = Object.values(requestsBatch);
    res.render('master_request_amazon', {containers, details, loggedIn: true, admin: req.session.admin, name: req.session.name, accountId: req.params.account_id});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
router.get('/master_request_amazon_sku/:account_id', withAuth, async (req, res) => {
  try {
    const itemData = await Item.findAll({
      where: {
        user_id: req.session.user_id,
        account_id: req.params.account_id
      },
      order: [
        ['qty_per_sku', 'DESC']
      ],
      attributes: [
        'id',
        'user_id',
        'account_id',
        'container_id',
        'item_number',
        'qty_per_sku'
      ],
      include:[
        {
          model: Container,
          where: {
            status: 1,
            type: 1
          },
          attributes: [
            'container_number'
          ]
        },
        {
          model: User,
          attributes: [
            'name'
          ]
        },
        {
          model: Account,
          attributes: [
            'name'
          ]
        }
      ]
    });
    const detailData = await Detail.findAll({
      where: {
        user_id: req.session.user_id,
        account_id: req.params.account_id
      },
        attributes: [
          'id',
          'return_num',
          'dress_num',
          'tracking_num',
          'dress_sku',
          'return_sku',
          'amazon_sku',
          'user_name',
          'account_name',
          'date_added',
          'status',
          'billed',
          'search_item',
          'condition',
          'color',
          'size',
          'description',
          'first_name',
          'last_name',
          'address',
          'city',
          'state',
          'zipcode',
          'user_id',
          'account_id',
          'container_id',
          'item_id'
        ],
          include: [
            {
          model: Account,
          attributes: [
            'name'
          ]
            }
          ]
    });
    const details = detailData.map(detail => detail.get({ plain: true }));
    const pre_items = itemData.map(item => item.get({ plain: true }));
    const requestsBatch = pre_items.reduce(function (r, a) {
      r[a.item_number] = r[a.item_number] || [];
      r[a.item_number].push(a);
      return r;
    }, Object.create(null));
    const items = Object.values(requestsBatch);
    res.render('master_request_amazon_sku', {items, details, loggedIn: true, china: false, amazon: false, admin: req.session.admin, name: req.session.name, accountId: req.params.account_id});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
router.get('/master_request_amazon_sku/', withAuth, async (req, res) => {
  try {
    const itemData = await Item.findAll({
      where: {
        user_id: req.session.user_id
      },
      order: [
        ['qty_per_sku', 'DESC']
      ],
      attributes: [
        'id',
        'user_id',
        'account_id',
        'container_id',
        'item_number',
        'qty_per_sku'
      ],
      include:[
        {
          model: Container,
          where: {
            status: 1,
            type: 1
          },
          attributes: [
            'container_number'
          ]
        },
        {
          model: User,
          attributes: [
            'name'
          ]
        },
        {
          model: Account,
          attributes: [
            'name'
          ]
        }
      ]
    });
    const detailData = await Detail.findAll({
      where: {
        user_id: req.session.user_id
      },
        attributes: [
          'id',
          'return_num',
          'dress_num',
          'tracking_num',
          'dress_sku',
          'return_sku',
          'amazon_sku',
          'user_name',
          'account_name',
          'date_added',
          'status',
          'billed',
          'search_item',
          'condition',
          'color',
          'size',
          'description',
          'first_name',
          'last_name',
          'address',
          'city',
          'state',
          'zipcode',
          'user_id',
          'account_id',
          'container_id',
          'item_id'
        ],
          include: [
            {
          model: Account,
          attributes: [
            'name'
          ]
            }
          ]
    });
    const details = detailData.map(detail => detail.get({ plain: true }));
    const pre_items = itemData.map(item => item.get({ plain: true }));
    const requestsBatch = pre_items.reduce(function (r, a) {
      r[a.item_number] = r[a.item_number] || [];
      r[a.item_number].push(a);
      return r;
    }, Object.create(null));
    const items = Object.values(requestsBatch);
    res.render('master_request_amazon_sku', {items, details, loggedIn: true, china: false, amazon: false, admin: req.session.admin, name: req.session.name});
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/detail_dress', withAuth, async (req, res) => {
  try {
    var detailData;
    if (req.session.admin) {
      detailData = await Detail.findAll({
        where: {
          dress_sku: {
            [Op.ne]: null
          }
        },
        attributes: [
          'id',
          'return_num',
          'dress_num',
          'tracking_num',
          'dress_sku',
          'return_sku',
          'amazon_sku',
          'user_name',
          'account_name',
          'date_added',
          'status',
          'billed',
          'search_item',
          'condition',
          'color',
          'size',
          'description',
          'first_name',
          'last_name',
          'address',
          'city',
          'state',
          'zipcode',
          'user_id',
          'account_id',
          'container_id',
          'item_id'
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
                'username',
                'name'
              ]
            }
          ]
      })
    } else {
      detailData = await Detail.findAll({
        where: {
          user_id: req.session.user_id,
          dress_sku: {
            [Op.ne]: null
          }
        },
          attributes: [
            'id',
            'return_num',
            'dress_num',
            'tracking_num',
            'dress_sku',
            'return_sku',
            'amazon_sku',
            'user_name',
            'account_name',
            'date_added',
            'status',
            'billed',
            'search_item',
            'condition',
            'color',
            'size',
            'description',
            'first_name',
            'last_name',
            'address',
            'city',
            'state',
            'zipcode',
            'user_id',
            'account_id',
            'container_id',
            'item_id'
          ],
            include: [
              {
            model: Account,
            attributes: [
              'name'
            ]
              }
            ]
        })
    }

    const details = detailData.map(detail => detail.get({ plain: true }));
    res.render('detail', {
      details,
      loggedIn: true,
      accountId: req.params.id,
      admin: req.session.admin,
      name: req.session.name,
      dress: true,
      return: false
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
router.get('/detail_return', withAuth, async (req, res) => {
  try {
    var detailData;
    if (req.session.admin) {
      detailData = await Detail.findAll({
        where: {
          return_sku: {
            [Op.ne]: null
          }
        },
        attributes: [
          'id',
          'return_num',
          'dress_num',
          'tracking_num',
          'dress_sku',
          'return_sku',
          'amazon_sku',
          'user_name',
          'account_name',
          'date_added',
          'status',
          'billed',
          'search_item',
          'condition',
          'color',
          'size',
          'description',
          'first_name',
          'last_name',
          'address',
          'city',
          'state',
          'zipcode',
          'user_id',
          'account_id',
          'container_id',
          'item_id'
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
                'username',
                'name'
              ]
            }
          ]
      })
    } else {
      detailData = await Detail.findAll({
        where: {
          user_id: req.session.user_id,
          return_sku: {
            [Op.ne]: null
          }
        },
          attributes: [
            'id',
            'return_num',
            'dress_num',
            'tracking_num',
            'dress_sku',
            'return_sku',
            'amazon_sku',
            'user_name',
            'account_name',
            'date_added',
            'status',
            'billed',
            'search_item',
            'condition',
            'color',
            'size',
            'description',
            'first_name',
            'last_name',
            'address',
            'city',
            'state',
            'zipcode',
            'user_id',
            'account_id',
            'container_id',
            'item_id'
          ],
            include: [
              {
            model: Account,
            attributes: [
              'name'
            ]
              }
            ]
        })
    }

    const details = detailData.map(detail => detail.get({ plain: true }));
    res.render('detail', {
      details,
      loggedIn: true,
      accountId: req.params.id,
      admin: req.session.admin,
      name: req.session.name,
      dress: false,
      return: true
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
//test page
router.get('/records', withAuth, async (req, res) => {
  try {
    res.render('record_ContentPage', {
      loggedIn: true,
      admin: req.session.admin
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});
router.get('/records/:sp', withAuth, async (req, res) => {
  try {
    var spSegment = req.params.sp;
    var credential = {
      [Op.ne]: null
    };
    if (req.params.sp.toUpperCase().substring(0,2) == "SP" && req.params.sp.length > 5) {
      const spNumberOnly = req.params.sp.toUpperCase().split('SP')[1];
      spSegment = spNumberOnly.substring(0,4);
    } else if (req.params.sp.toUpperCase().substring(0,4) == "TEMP" && req.params.sp.length > 4) {
      const spNumberOnly = req.params.sp.toUpperCase().split('TEMP')[1];
      spSegment = spNumberOnly;
    } else if (req.params.sp.toUpperCase().substring(0,3) == "REQ" && req.params.sp.includes("#")) {
      const spNumberOnly = req.params.sp.toUpperCase().split('(#')[1].split(")")[0];
      spSegment = spNumberOnly;
    }
    if (!req.session.admin){
      credential = req.session.user_id
    }
      const recordData = await Record.findAll({
        where: {
          user_id: credential,
          [Op.or]: [{ref_number: req.params.sp},{sub_number: req.params.sp}],
          [Op.or]:[
            {ref_number:{[Op.like]: '%' + spSegment + '%'}},
            {sub_number:{[Op.like]: '%' + spSegment + '%'}},
            {action_notes:{[Op.like]: '%' + spSegment + '%'}}
          ]
        },
        attributes: [
          "user_id",
          "ref_number",
          "sub_number",
          "qty_from",
          "qty_to",
          "status_from",
          "status_to",
          "action",
          "action_notes",
          "date",
          "type",
          "id",
          "created_at",
          "date"
        ],
        include:[
          {
            model: User,
            attributes: [
              'name'
            ]
          }
        ],
        order: [
          ["ref_number", "ASC"],
        ]
      })
      const records = recordData.map(record => record.get({ plain: true }));
      const handleRecords = records.filter(i => i.type == 121 || i.type == 122 || i.type == 131);
      const requestRecords = records.filter(i => i.type == 11);
      const inventoryRecords = records.filter(i => i.type == 1 || i.type == 0);
      const initialConfirmRecords = records.filter(i => i.type == 12);
      const finalConfirmRecords = records.filter(i => i.type == 129 || i.type == -100);
      const xcRecords = records.filter(i => i.type == 401 || i.type == 402);
      const initialConfirmRecords_groomed = initialConfirmRecords.map(i=>{
        return Object.assign({}, i, {
          ...i,
          action_notes: () => {
            let tempArr = i.action_notes.split(",");
            tempArr.pop();
            return tempArr.join(",").split(": ")[1];
          }
       })
      });
      const unprocessedhandleRecords = records.filter(i =>  i.ref_number.substring(0,2) == "SP" && (i.type == 121 || i.type == 122 || i.type == 131));
      const handleRecords_groomed = unprocessedhandleRecords.map(i=> {
        return Object.assign({}, i, {
          ...i,
          action_notes: () => {
            return i.action_notes.split("File")[0].split(": ")[1];
          }
       })
      });
      const unprocessedRequestRecords = records.filter(i => i.type == 11 && i.ref_number.substring(0,3) == "REQ");
      const requestRecords_groomed = unprocessedRequestRecords.map(i => {
          return Object.assign({}, i, {
            ...i,
            action_notes: () => {
              let tempArr = i.action_notes.split(",");
              tempArr.pop();
              return tempArr.join(",").split(": ")[1];
            },
            ref_number: () => {
              return i.ref_number.split("(")[0];
            }
         })
        });
      const unprocessedAMRecords = records.filter(i => i.type == 11 && !i.ref_number.includes("-"));
      unprocessedAMRecords.map(i => {
        if (i.action_notes != null){
          i.action_notes =  i.action_notes.split(": ")[1];
        }
        i.sub_number = i.sub_number.split("(")[0]
        return i
      });
      const processedAMInventoryRecords = unprocessedAMRecords.reduce(
        function(r, a) {
          r[a.action_notes] = r[a.action_notes] || [];
          r[a.action_notes].push(a);
          return r
        },
        Object.create(null)
      );
      const invenotoryRecord_groomed = Object.values(processedAMInventoryRecords);
        res.render('record_ContentPage', {
          initialConfirmRecords_groomed,
          handleRecords,
          requestRecords,
          inventoryRecords,
          initialConfirmRecords,
          finalConfirmRecords,
          xcRecords,
          handleRecords_groomed,
          requestRecords_groomed,
          invenotoryRecord_groomed,
          loggedIn: true,
          admin: req.session.admin
        });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});


module.exports = router
