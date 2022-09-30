const router = require('express').Router();
const {User, Account, Batch, Box, Container, Item} = require('../../models');
const {withAuth, adminAuth} = require('../../utils/auth');
const { route } = require('./user_route');

router.put('/account_merge', withAuth, (req, res) => {
    Item.update({
        account_id: req.body.account_id_2
      },
      {
        where: {
            account_id: req.body.account_id
        }
      })
      .then(dbItemData => {
        if (!dbItemData[0]) {
          res.status(404).json({ message: 'This Item does not exist!' });
          return;
        }
        res.json(dbItemData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
});

router.put('/container_merge', withAuth, (req, res) => {
  const fromData = req.body.fromData;
  const toData = req.body.toData;
  Item.update({
      account_id: toData.account_id,
      user_id: toData.user_id,
      container_id: toData.id
    },
    {
      where: {
        container_id: fromData.id
      }
    })
    .then(dbItemData => {
      if (!dbItemData[0]) {
        res.status(404).json({ message: 'This Item does not exist!' });
        return;
      }
      res.json(dbItemData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post('/new', withAuth, (req, res) => {
  var user_id;
  if(!req.body.user_id) {
    user_id = req.session.user_id
  } else {
    user_id = req.body.user_id
  }
  Item.create({
    item_number: req.body.item_number,
    user_id: user_id,
    account_id: req.body.account_id,
    container_id: req.body.container_id,
    qty_per_sku: req.body.qty_per_sku,
    description: req.body.description
  })
    .then(dbItemData => {
        res.json(dbItemData)
      })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);

    });
});

router.post('/seeds', withAuth, (req, res) => {
  Item.create({
    item_number: req.body.item_number,
    user_id: req.body.user_id,
    account_id: req.body.account_id,
    container_id: req.body.container_id,
    qty_per_sku: req.body.qty_per_sku
  })
    .then(dbItemData => {
        res.json(dbItemData)
      })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);

    });
});

router.get('/infoPerNumber/:key', withAuth, async (req, res) => {
  try {
    const itemData = await Item.findOne({
      where: {
        item_number: req.params.key,
      },
      attributes: [
        'user_id',
        'account_id',
        'item_number',
        'container_id',
        'description'
      ],
        include: [
          {
            model: Account,
            attributes: [
            'name',
            'id'
          ]},
          {
            model: Container,
            attributes: [
            'container_number',
            'id'
          ]},
          {
            model: User,
            attributes: [
            'name',
            'id'
          ]}
        ]
      })

    const data = itemData.get({plain: true});
    res.json(data);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
});

router.get('/allItemAdmin', withAuth, async (req, res) => {
  try {
    const itemData = await Item.findAll({
      attributes: [
        'id',
        'item_number',
        'qty_per_sku',
        'description',
        'user_id',
        'account_id',
        'container_id'
      ],
      include: [
        {
          model: Container,
          attributes: [
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
          ]
        },
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
            'name'
          ]
        }
      ]
    });
    const items = itemData.map(i => i.get({ plain: true }));
    res.json(items);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

router.get('/allItem', withAuth, async (req, res) => {
  try {
    const itemData = await Item.findAll({
      where: {
        user_id: req.session.user_id
      },
      order: [
        ['item_number', 'ASC']
      ],
      attributes: [
        'id',
        'item_number',
        'qty_per_sku',
        'user_id',
        'account_id',
        'container_id'
      ],
      include: [
        {
          model: Container,
          attributes: [
            'id',
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
          ]
        },
        {
          model: Account,
          attributes: [
            'name',
            'id'
          ]
        }
      ]
    });
    const items = itemData.map(i => i.get({ plain: true }));
    res.json(items);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

router.get('/allItemPerItemNumber/:item_number', withAuth, async (req, res) => {
  try {
    const itemData = await Item.findAll({
      where: {
        user_id: req.session.user_id,
        item_number: req.params.item_number
      },
      order: [
        ['item_number', 'ASC']
      ],
      attributes: [
        'id',
        'item_number',
        'qty_per_sku',
        'user_id',
        'account_id',
        'container_id'
      ],
      include: [
        {
          model: Container,
          attributes: [
            'id',
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
          ]
        },
        {
          model: Account,
          attributes: [
            'name',
            'id'
          ]
        }
      ]
    });
    const items = itemData.map(i => i.get({ plain: true }));
    res.json(items);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

router.get('/allItemPerClient/:user_id', withAuth, async (req, res) => {
  try {
    const itemData = await Item.findAll({
      where: {
        user_id: req.params.user_id
      },
      order: [
        ['item_number', 'ASC']
      ],
      attributes: [
        'id',
        'item_number',
        'qty_per_sku',
        'user_id',
        'account_id',
        'container_id'
      ],
      include: [
        {
          model: Container,
          attributes: [
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
          ]
        },
        {
          model: Account,
          attributes: [
            'name',
            'id'
          ]
        }
      ]
    });
    const items = itemData.map(i => i.get({ plain: true }));
    res.json(items);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

router.get('/allItem/:account_id', withAuth, async (req, res) => {
  try {
    const itemData = await Item.findAll({
      where: {
        user_id: req.session.user_id,
        account_id: req.params.account_id
      },
      attributes: [
        'id',
        'item_number',
        'qty_per_sku',
        'user_id',
        'account_id',
        'container_id'
      ],
      include: [
        {
          model: Container,
          attributes: [
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
          ]
        },
        {
          model: Account,
          attributes: [
            'name',
            'id'
          ]
        }
      ]
    });
    const items = itemData.map(i => i.get({ plain: true }));
    res.json(items);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

router.get('/allItemPerNumber/:itemArry', withAuth, async (req, res) => {
  try {
    var itemArray = req.params.itemArry;
    itemArray = itemArray.split('-').filter(i => i != '');
    const itemData = await Item.findAll({
      where: {
        user_id: req.session.user_id,
        item_number: itemArray
      },
      order: [
        ['item_number', 'ASC']
      ],
      attributes: [
        'id',
        'item_number',
        'qty_per_sku',
        'user_id',
        'account_id',
        'container_id'
      ],
      include: [
        {
          model: Container,
          where: {
            status: [1,2],
            type: [1,2,3]
          },
          attributes: [
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
          ]
        },
        {
          model: Account,
          attributes: [
            'name',
            'id'
          ]
        }
      ]
    });
    const items = itemData.map(i => i.get({ plain: true }));
    res.json(items);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

router.get('/allItemPerNumberAdmin/:itemArry&:client_id', withAuth, async (req, res) => {
  try {
    var itemArray = req.params.itemArry;
    itemArray = itemArray.split('-').filter(i => i != '');
    const itemData = await Item.findAll({
      where: {
        user_id: req.params.client_id,
        item_number: itemArray
      },
      order: [
        ['item_number', 'ASC']
      ],
      attributes: [
        'id',
        'item_number',
        'qty_per_sku',
        'user_id',
        'account_id',
        'container_id'
      ],
      include: [
        {
          model: Container,
          where: {
            status: [1,2]
          },
          attributes: [
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
          ]
        },
        {
          model: Account,
          attributes: [
            'name',
            'id'
          ]
        }
      ]
    });
    const items = itemData.map(i => i.get({ plain: true }));
    res.json(items);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

router.get('/findAllPerContainer/:container_id', withAuth, async (req, res) => {
  try {
    const itemData = await Item.findAll({
      where: {
        container_id: req.params.container_id
      },
      attributes: [
        'id',
        'item_number',
        'qty_per_sku',
        'description',
        'user_id',
        'account_id',
        'container_id'
      ],
      include: [
        {
          model: Account,
          attributes: [
            'name',
          ]
        }
      ]
    });
    const items = itemData.map(i => i.get({ plain: true }));
    res.json(items);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

router.put('/updateQty_ExistedItem/:container_id&:item_number', withAuth, (req, res) => {
  Item.update({
      qty_per_sku: req.body.qty_per_sku
    },
    {
      where: {
        container_id: req.params.container_id,
        item_number: req.params.item_number
      }
    })
    .then(dbItemData => {
      if (!dbItemData[0]) {
        res.status(404).json({ message: 'This Item does not exist!' });
        return;
      }
      res.json(dbItemData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.put('/updateQty_ExistedItemId/:container_id&:item_id', withAuth, (req, res) => {
  Item.update({
      qty_per_sku: req.body.qty_per_sku
    },
    {
      where: {
        container_id: req.params.container_id,
        id: req.params.item_id
      }
    })
    .then(dbItemData => {
      if (!dbItemData[0]) {
        res.status(404).json({ message: 'This Item does not exist!' });
        return;
      }
      res.json(dbItemData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.put('/updateQtyPerItemId/:item_id', withAuth, (req, res) => {
  Item.update({
      qty_per_sku: req.body.qty_per_sku
    },
    {
      where: {
        id: req.params.item_id
      }
    })
    .then(dbItemData => {
      if (!dbItemData[0]) {
        res.status(404).json({ message: 'This Item does not exist!' });
        return;
      }
      res.json(dbItemData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.delete('/destroy/:id', withAuth, (req, res) => {
Item.destroy({
  where: {
    id: req.params.id
  }
})
  .then(dbItemData => {
    if (!dbItemData) {
      res.status(404).json({ message: 'No item found with this id' });
      return;
    }
    res.json(dbItemData);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

router.delete('/dq_confirm/:item_number', withAuth, (req, res) => {
  Item.destroy({
    where: {
      item_number: req.params.item_number
    }
  })
    .then(dbItemData => {
      if (!dbItemData) {
        res.status(404).json({ message: 'No item found with this id' });
        return;
      }
      res.json(dbItemData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.delete('/bulkDestroy/', withAuth, (req, res) => {
  Item.destroy({
    where: {
      id: req.body.id
    }
  })
    .then(dbItemData => {
      if (!dbItemData) {
        res.status(404).json({ message: 'No item found with this id' });
        return;
      }
      res.json(dbItemData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.delete('/destroyPerContainer/:container_id', withAuth, (req, res) => {
  Item.destroy({
    where: {
      container_id: req.params.container_id
    }
  })
    .then(dbItemData => {
      if (!dbItemData) {
        res.status(404).json({ message: 'No item found with this id' });
        return;
      }
      res.json(dbItemData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/amazonInventory', withAuth, async (req, res) => {
  try {
    const itemData = await Item.findAll({
      where: {
        user_id: req.session.user_id,
      },
      order: [
        ['item_number', 'ASC']
      ],
      attributes: [
        'id',
        'item_number',
        'qty_per_sku',
        'user_id',
        'account_id',
        'container_id'
      ],
      include: [
        {
          model: Container,
          where: {
            status: [1,2]
          },
          attributes: [
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
          ]
        },
        {
          model: Account,
          attributes: [
            'name',
            'id'
          ]
        }
      ]
    });
    const items = itemData.map(i => i.get({ plain: true }));
    res.json(items);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

router.get('/amazonInventory_admin/:user_id', withAuth, async (req, res) => {
  try {
    const itemData = await Item.findAll({
      where: {
        user_id: req.params.user_id,
      },
      order: [
        ['item_number', 'ASC']
      ],
      attributes: [
        'id',
        'item_number',
        'qty_per_sku',
        'user_id',
        'account_id',
        'container_id'
      ],
      include: [
        {
          model: Container,
          where: {
            status: [1,2]
          },
          attributes: [
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
          ]
        },
        {
          model: Account,
          attributes: [
            'name',
            'id'
          ]
        }
      ]
    });
    const items = itemData.map(i => i.get({ plain: true }));
    res.json(items);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

router.get('/statusTWO/:type', withAuth, async (req, res) => {
  var type;
  if (req.params.type == '2') {
    type = [0,2]
  } else {
    type = 3
  }
  try {
    const itemData = await Item.findAll({
      attributes: [
        'id',
        'item_number',
        'qty_per_sku',
        'description',
        'user_id',
        'account_id',
        'container_id'
      ],
      include: [
        {
          model: Container,
          where: {
            status: [2],
            type: type
          },
          attributes: [
            'custom_2'
          ]
        },
      ]
    });
    const items = itemData.map(i => i.get({ plain: true }));
    res.json(items);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

router.put(`/client_archive/:item_number`, withAuth, async (req, res) => {
  try {
    const itemData = await Item.findAll({
      where: {
        item_number: req.params.item_number,
      },
      attributes: [
        'id'
      ],
      include: [
        {
          model: Container,
          where: {
            status: 1,
            type: 1
          },
          attributes: [
            'id'
          ]
        }
      ]
    });
    const items = itemData.map(i => i.get({ plain: true }));
    const idArr = [];
    items.forEach(i => idArr.push(i.id));
    Item.update({
      item_number: req.body.item_number
      },
      {
      where: {
        id: idArr,
      },
    })
    .then(dbItemData => {
      if (!dbItemData[0]) {
        res.status(404).json({ message: 'This item does not exist!' });
        return;
      }
      console.log(dbItemData);
      res.json(dbItemData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.put(`/reversal_archive/:item_number`, withAuth, (req, res) => {
  const paramsNumber = req.params.item_number;
  const modifiedN = `del-${paramsNumber}`;
  Item.update({
      item_number: req.params.item_number
    },
      {
      where: {
        item_number: modifiedN
      }
    })
    .then(dbItemData => {
      if (!dbItemData[0]) {
        res.status(404).json({ message: 'This item does not exist!' });
        return;
      }
      res.json(dbItemData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/itemValidation/:item_number&:container_id', withAuth, async (req, res) => {
  try {
    const itemData = await Item.findOne({
      where: {
        item_number: req.params.item_number,
        container_id: req.params.container_id
      },
      attributes: [
        'container_id',
        'item_number',
        'id',
        'qty_per_sku'
      ],
    });
    var data;
    itemData?data=itemData.get({plain: true}):data=null;
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

router.put(`/rewireClientRequest/:item_id&:container_id&:parentAccountId`, withAuth, (req, res) => {
  Item.update({
      container_id: req.params.container_id,
      account_id: req.params.parentAccountId
    },
      {
      where: {
        id: req.params.item_id
      }
    })
    .then(dbItemData => {
      if (!dbItemData[0]) {
        res.status(404).json({ message: 'This item does not exist!' });
        return;
      }
      res.json(dbItemData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/emptyContainerSearch/:jsonArr', withAuth, async (req, res) => {
  try {
    const idArr = JSON.parse(req.params.jsonArr);
    console.log(idArr);
    const itemData = await Item.findAll({
      where: {
        container_id: idArr
      },
      attributes: [
        'id',
        'item_number',
        'user_id',
        'account_id',
        'container_id'
      ]
    });
    const items = itemData.map(i => i.get({ plain: true }));
    res.json(items);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

module.exports = router;
