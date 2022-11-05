const router = require('express').Router();
const {User, Account, Batch, Box, Container, Item} = require('../../models');
const {withAuth, adminAuth} = require('../../utils/auth');
const { Op } = require("sequelize");
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const { uploadFile, getFile} = require('../../utils/s3');
const fs = require('fs');
const util = require('util');
const { log } = require('console');
const unlinkFile = util.promisify(fs.unlink)

router.get('/', withAuth, async (req, res) => {
  try {
    const containerData = await Container.findAll({
      attributes: [
        'container_number',
        'user_id',
        'account_id',
        'id'
      ],
    });
    const containers = containerData.map(container => container.get({ plain: true }));
    res.json(containers);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
router.get('/fba/:key', withAuth, async (req, res) => {
  try {
    const singleContainer = await Container.findOne({
      where: {
        fba: req.params.key,
        type: 4,
        status: 4
      },
      attributes: [
        'container_number',
        'id',
        'qty_of_fee',
        'description',
        'notes'
      ],
    });
    const data = singleContainer.get({plain: true});
    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});
router.put('/xc_LabelChangeUpdate', withAuth, (req, res) => {
  Container.update(
    {
      qty_of_fee: req.body.qty_of_fee,
      description: req.body.description,
      notes: req.body.notes,
      cost: 0
    },
    {
      where: {
        fba: req.body.fba,
        status: 4
      }
    }
    )
    .then(dbContainerData => {
      if (!dbContainerData[0]) {
        res.status(404).json({ message: 'This Container does not exist!' });
        return;
      }
      res.json(dbContainerData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});
//xc_LabelChangeUpdate
router.put('/account_merge', withAuth, (req, res) => {
    Container.update({
        account_id: req.body.account_id_2
      },
      {
        where: {
            account_id: req.body.account_id
        }
      })
      .then(dbContainerData => {
        if (!dbContainerData[0]) {
          res.status(404).json({ message: 'This Container does not exist!' });
          return;
        }
        res.json(dbContainerData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
});

router.put('/reqContainer', withAuth, (req, res) => {
  Container.update({
      status: req.body.status,
      shipped_date: req.body.shipped_date
    },
    {
      where: {
          id: req.body.id
      }
    })
    .then(dbContainerData => {
      if (!dbContainerData[0]) {
        res.status(404).json({ message: 'This Container does not exist!' });
        return;
      }
      res.json(dbContainerData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.put('/number/:number', withAuth, (req, res) => {
  Container.update({
      location: req.body.location
    },
    {
      where: {
          container_number: req.params.number
      }
    })
    .then(dbContainerData => {
      if (!dbContainerData[0]) {
        res.status(404).json({ message: 'This Container does not exist!' });
        return;
      }
      res.json(dbContainerData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/amazon_container/:key', withAuth, async (req, res) => {
  try {
    const singleContainer = await Container.findOne({
      where: {
        container_number: req.params.key
      },
      attributes: [
        'id',
        'user_id',
        'account_id',
        'cost',
        'type',
        'status',
        'description',
        'height',
        'width',
        'length',
        'shipped_date'
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
    });
      const data = singleContainer.get({plain: true});
      res.json(data);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
});

router.get('/boxDataUsingNumber/:key', withAuth, async (req, res) => {
  try {
    const singleContainer = await Container.findOne({
      where: {
        container_number: req.params.key
      },
      attributes:['status'],
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
    });
      if (singleContainer) {
        const data = singleContainer.get({plain: true});
        res.json(data);
      } else {
        res.status(404);
      }
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
});

router.get('/allContainerAdmin', withAuth, async (req, res) => {
  try {
    const containerData = await Container.findAll({
      where: {
        status: [0,1,2,3,4,5,98]
      },
      attributes: [
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
          model: Item,
          attributes: [
            'id',
            'item_number',
            'qty_per_sku'
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
            'name'
          ]
        }
      ]
    });
    const containers = containerData.map(container => container.get({ plain: true }));
    res.json(containers);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

router.get('/allXCAdmin', withAuth, async (req, res) => {
  try {
    const containerData = await Container.findAll({
      where: {
        status: [4,5]
      },
      attributes: [
        'user_id',
        'account_id',
        'notes',
        'id',
        'container_number',
        'description',
        'cost',
        'requested_date',
        'received_date',
        'shipped_date',
        'type',
        'status',
        'location',
        'qty_of_fee',
        'unit_fee'
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
    });
    const containers = containerData.map(container => container.get({ plain: true }));
    res.json(containers);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});

router.get('/container/:id', withAuth, async (req, res) => {
  try {
    const containerData = await Container.findAll({
      where: {
        id: req.params.id
      },
      attributes: [
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
            'name'
          ]
        }
      ]
    });
    const containers = containerData.map(container => container.get({ plain: true }));
    res.json(containers);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
})

router.put('/updateCost/:cost&:id', withAuth, (req, res) => {
  Container.update({
      cost: req.params.cost
    },
    {
      where: {
        id: req.params.id
      }
    })
    .then(dbContainerData => {
      if (!dbContainerData[0]) {
        res.status(404).json({ message: 'This Container does not exist!' });
        return;
      }
      res.json(dbContainerData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.put('/updatePostMerge', withAuth, (req, res) => {
  Container.update({
      shipped_date: req.body.shipped_date,
      description: req.body.description
      // bill_shipped: req.body.bill_shipped
    },
    {
      where: {
        id: req.body.id
      }
    })
    .then(dbContainerData => {
      if (!dbContainerData[0]) {
        res.status(404).json({ message: 'This Container does not exist!' });
        return;
      }
      res.json(dbContainerData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.put('/admin_relocating', withAuth, (req, res) => {
  Container.update({
      location: req.body.location_b
    },
      {
      where: {
          container_number: req.body.container_number
      }
    })
    .then(dbContainerData => {
      if (!dbContainerData[0]) {
        res.status(404).json({ message: 'This container does not exist!' });
        return;
      }
      res.json(dbContainerData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post('/amazon_request', withAuth, (req, res) => {
  Container.create({
    container_number: req.body.container_number,
    account_id: req.body.account_id,
    user_id: req.session.user_id,
    cost: req.body.cost,
    requested_date: new Date().toLocaleDateString("en-US"),
    status: 2,
    type: 2,
    location: req.body.location,
    s3: req.body.s3,
    fba: req.body.fba,
    notes: req.body.notes
  }, {returning: true})
      .then(dbBoxData => res.json(dbBoxData))
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
});

router.post('/upload', upload.single('file'), async (req, res) => {
  const file = req.file;
  const info = req.body.s3
  const result = await uploadFile(file);
  await unlinkFile(file.path);
  const key = result.Key;
  Container.update({
    file: key
  }, {
   where: {
    s3: info
   }
  })
  .then(dbBoxData => {
  if (!dbBoxData[0]) {
    res.status(404).json({ message: 'This Box does not exist!' });
    return;
  }
  res.send({pdfPath: `/pdf/${key}`})
  })
.catch(err => {
  console.log(err);
  res.status(500).json(err);
});
});

router.put('/post-label', withAuth, (req, res) => {
  Container.update({
      status: req.body.status,
      shipped_date: req.body.shipped_date,
      description: req.body.description
    },
    {
      where: {
          tracking: req.body.tracking,
          type: req.body.type
      }
    })
    .then(dbContainerData => {
      if (!dbContainerData[0]) {
        res.status(404).json({ message: 'This Container does not exist!' });
        return;
      }
      res.json(dbContainerData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});
router.put('/post-label-ez', withAuth, (req, res) => {
  Container.update({
      status: req.body.status,
      shipped_date: req.body.shipped_date,
      description: req.body.description
    },
    {
      where: {
          custom_2: req.body.custom_2,
          type: req.body.type
      }
    })
    .then(dbContainerData => {
      if (!dbContainerData[0]) {
        res.status(404).json({ message: 'This Container does not exist!' });
        return;
      }
      res.json(dbContainerData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});
router.post('/seeds', withAuth, (req, res) => {
  Container.create({
      user_id: req.body.user_id,
      account_id: req.body.account_id,
      container_number: req.body.container_number,
      received_date: req.body.received_date,
      cost: req.body.cost,
      description: req.body.description,
      length: req.body.length,
      width: req.body.width,
      height: req.body.height,
      bill_received: req.body.bill_received,
      bill_storage: req.body.bill_storage,
      volume: req.body.volume
  }).then(dbContainerData => res.json(dbContainerData))
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

router.delete('/remove/:time', withAuth, (req, res) => {
  Container.destroy({
      where: {
        status: 98,
        bill_shipped: {
          [Op.lt]: req.params.time
        }
      }
    })
      .then(dbBoxData => {
        // if (!dbBoxData) {
        //   res.status(404).json({ message: 'No box found with this id' });
        //   return;
        // }
        res.json(dbBoxData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
});

router.delete('/removeEmpty/:time', withAuth, (req, res) => {
  Container.destroy({
      where: {
        status: 98,
        bill_storage: {
          [Op.lt]: req.params.time
        },
        shipped_date: {
          [Op.ne]: null
        }
      }
    })
      .then(dbBoxData => {
        // if (!dbBoxData) {
        //   res.status(404).json({ message: 'No box found with this id' });
        //   return;
        // }
        res.json(dbBoxData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
});

router.delete('/remove_xc/:time', withAuth, (req, res) => {
  Container.destroy({
      where: {
        status: 5,
        bill_shipped: {
          [Op.lt]: req.params.time
        }
      }
    })
      .then(dbBoxData => {
        // if (!dbBoxData) {
        //   res.status(404).json({ message: 'No xc found with this id' });
        //   return;
        // }
        res.json(dbBoxData);
      })
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
});

router.put('/archieve/:time', withAuth, (req, res) => {
  Container.update({
    status: 98
  },
  {
    where: {
      status: 3,
      bill_shipped: {
        [Op.lt]: req.params.time
      }
    }
  }).then(dbContainerData => {
    if (!dbContainerData) {
      res.status(404).json({ message: 'No Container found with this id' });
      return;
    }
    res.json(dbContainerData);
  }).catch(err => {
        console.log(err);
        res.status(500).json(err);
  });
});

router.put('/archieveEmpty/:time', withAuth, (req, res) => {
  Container.update({
    status: 98
  },
  {
    where: {
      status: [1,2],
      bill_storage: {
        [Op.lt]: req.params.time
      },
      shipped_date: {
        [Op.ne]: null
      }
    }
  }).then(dbContainerData => {
    if (!dbContainerData) {
      res.status(404).json({ message: 'No Container found with this id' });
      return;
    }
    res.json(dbContainerData);
  }).catch(err => {
        console.log(err);
        res.status(500).json(err);
  });
});
//upload the second file to AWS and update file_2 when requested is submitted by client
router.post('/upload_2', upload.single('file'), async (req, res) => {
  const file = req.file;
  const info = req.body.s3
  const result = await uploadFile(file);
  await unlinkFile(file.path);
  const key = result.Key;
  Container.update({
    file_2: key
  }, {
   where: {
    s3: info
   }
  })
  .then(dbBoxData => {
  if (!dbBoxData[0]) {
    res.status(404).json({ message: 'This Box does not exist!' });
    return;
  }
  res.send({pdfPath: `/pdf/${key}`})
  })
.catch(err => {
  console.log(err);
  res.status(500).json(err);
});
});

router.delete('/destroyBulk', withAuth, (req, res) => {
  Container.destroy({
    where: {
      id: req.body.id
    }
  }).then(dbContainerData => {
    if (!dbContainerData) {
      res.status(404).json({ message: 'No Container found with this id' });
      return;
    }
    res.json(dbContainerData);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

router.delete('/removebynumber/:container_number', withAuth, (req, res) => {
  Container.destroy({
    where: {
      container_number: req.params.container_number
    }
  }).then(dbContainerData => {
    if (!dbContainerData) {
      res.status(404).json({ message: 'No Container found with this id' });
      return;
    }
    res.json(dbContainerData);
  })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

router.post('/amazon_box', withAuth, (req, res) => {
  var status, description, requested_date;
  if (req.body.container_number[0] == "T") {
    status = 2;
    description = req.body.container_number,
    requested_date = new Date().toLocaleDateString("en-US")
  } else {
    status = 1;
    description = `attention: shipping labels required`;
    requested_date = null;
  };
  Container.create({
    container_number: req.body.container_number,
    account_id: req.body.account_id,
    user_id: req.body.user_id,
    description: req.body.description,
    length: req.body.length,
    width: req.body.width,
    height: req.body.height,
    volume: req.body.volume,
    weight: req.body.weight,
    tracking: req.body.tracking,
    type: req.body.type,
    status: status,
    custom_1: req.body.custom_1,
    custom_2: req.body.custom_2,
    description: description,
    received_date: new Date().toLocaleDateString("en-US"),
    requested_date: requested_date
  }, {returning: true})
      .then(dbBoxData => res.json(dbBoxData))
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
});

router.put('/amazon_label_submission', withAuth, (req, res) => {
  Container.update({
      status: req.body.status,
      requested_date: req.body.requested_date,
      notes: req.body.notes,
      s3: req.body.s3,
      fba: req.body.fba,
      custom_2: req.body.custom_2,
      description: 'Labels submitted. Await labeling'
    },
    {
      where: {
        id: req.body.id
      }
    })
    .then(dbContainerData => {
      if (!dbContainerData[0]) {
        res.status(404).json({ message: 'This Container does not exist!' });
        return;
      }
      res.json(dbContainerData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.get('/statusTWO', withAuth, async (req, res) => {
  try {
    const containerData = await Container.findAll({
      where: {
        status: [2]
      },
      attributes: [
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
      ]
    });
    const containers = containerData.map(container => container.get({ plain: true }));
    res.json(containers);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }

});
////////////billing functions here///////////////////////////
router.put('/xcharge_update', withAuth, (req, res) => {
  Container.update({
      status: 5,
      bill_shipped: req.body.bill
    },
      {
      where: {
          container_number: req.body.arr
      }
    })
    .then(dbContainerData => {
      if (!dbContainerData[0]) {
        res.status(404).json({ message: 'This Container does not exist!' });
        return;
      }
      res.json(dbContainerData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post('/additional_charge', withAuth, (req, res) => {
  Container.create({
    requested_date: new Date().toLocaleDateString("en-US"),
    container_number: req.body.container_number,
    account_id: req.body.account_id,
    user_id: req.body.user_id,
    description: req.body.description,
    fba: req.body.fba,
    qty_of_fee: req.body.qty_of_fee,
    unit_fee: req.body.unit_fee,
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    cost: req.body.cost,
    status: 4,
    type: 4
  }, {returning: true})
      .then(dbContainerData => res.json(dbContainerData))
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
});

router.put('/bill_received_update', withAuth, (req, res) => {
  Container.update({
      bill_received: req.body.bill,
      cost: 0
    },
      {
      where: {
        container_number: req.body.arr
      }
    })
    .then(dbContainerData => {
      if (!dbContainerData[0]) {
        res.status(404).json({ message: 'This Container does not exist!' });
        return;
      }
      res.json(dbContainerData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.put('/bill_shipped_update', withAuth, (req, res) => {
  Container.update({
      bill_shipped: req.body.bill
    },
      {
      where: {
        container_number: req.body.arr
      }
    })
    .then(dbContainerData => {
      if (!dbContainerData[0]) {
        res.status(404).json({ message: 'This Container does not exist!' });
        return;
      }
      res.json(dbContainerData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.put('/bill_storage_update', withAuth, (req, res) => {
  Container.update({
      bill_storage: req.body.bill
    },
      {
      where: {
        container_number: req.body.arr
      }
    })
    .then(dbContainerData => {
      if (!dbContainerData[0]) {
        res.status(404).json({ message: 'This Container does not exist!' });
        return;
      }
      res.json(dbContainerData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post('/delete_request', withAuth, (req, res) => {
  Container.create({
    requested_date: new Date().toLocaleDateString("en-US"),
    container_number: req.body.container_number,
    account_id: req.body.account_id,
    user_id: req.session.user_id,
    description: req.body.description,
    notes: req.body.notes,
    fba: `del req`,
    qty_of_fee: 0,
    unit_fee: 0,
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    cost: 0,
    status: 4,
    type: 4
  }, {returning: true})
      .then(dbBoxData => res.json(dbBoxData))
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
});

router.put(`/client_archive/:container_number`, withAuth, (req, res) => {
  Container.update({
      status: 98,
    },
      {
      where: {
        container_number: req.params.container_number
      }
    })
    .then(dbContainerData => {
      if (!dbContainerData[0]) {
        res.status(404).json({ message: 'This container does not exist!' });
        return;
      }
      res.json(dbContainerData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.put(`/reversal_archive/:container_number`, withAuth, (req, res) => {
  Container.update({
      status: 1,
    },
      {
      where: {
        container_number: req.params.container_number,
        status: 98
      }
    })
    .then(dbContainerData => {
      if (!dbContainerData[0]) {
        res.status(404).json({ message: 'This container does not exist!' });
        return;
      }
      res.json(dbContainerData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.put(`/dq_confirm/:container_number`, withAuth, (req, res) => {
  Container.update({
      status: 1,
      shipped_date: new Date().toLocaleDateString("en-US")
    },
      {
      where: {
        container_number: req.params.container_number
      }
    })
    .then(dbContainerData => {
      if (!dbContainerData[0]) {
        res.status(404).json({ message: 'This container does not exist!' });
        return;
      }
      res.json(dbContainerData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.put('/xc_addCharge/:container_number', withAuth, (req, res) => {
  Container.update({
    unit_fee: req.body.unit_fee,
    qty_of_fee: req.body.qty_of_fee,
    cost: req.body.cost,
    description: req.body.description
    },
    {
      where: {
        container_number: req.params.container_number
      }
    })
    .then(dbContainerData => {
      if (!dbContainerData[0]) {
        res.status(404).json({ message: 'This Container does not exist!' });
        return;
      }
      res.json(dbContainerData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.post('/xc_LabelChange', withAuth, (req, res) => {
  Container.create({
    requested_date: new Date().toLocaleDateString("en-US"),
    container_number: req.body.container_number,
    account_id: req.body.account_id,
    user_id: req.body.user_id,
    description: req.body.description,
    fba: req.body.fba,
    notes: req.body.notes,
    qty_of_fee: req.body.qty_of_fee,
    unit_fee: 0,
    weight: 0,
    length: 0,
    width: 0,
    height: 0,
    cost: 0,
    status: 4,
    type: 4
  }, {returning: true})
      .then(dbContainerData => res.json(dbContainerData))
      .catch(err => {
        console.log(err);
        res.status(500).json(err);
      });
});

router.put('/shipped_date_labeling', withAuth, (req, res) => {
  Container.update({
    shipped_date: req.body.shipped_date
    },
    {
      where: {
        id: req.body.id
      }
    })
    .then(dbContainerData => {
      if (!dbContainerData[0]) {
        res.status(404).json({ message: 'This Container does not exist!' });
        return;
      }
      res.json(dbContainerData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});

router.put('/shipped_date_unlabeling/:id', withAuth, (req, res) => {
  console.log(req.params.id);
  Container.update({
    shipped_date: null
    },
    {
      where: {
        id: req.params.id
      }
    })
    .then(dbContainerData => {
      if (!dbContainerData[0]) {
        res.status(404).json({ message: 'This Container does not exist!' });
        return;
      }
      res.json(dbContainerData);
    })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);
    });
});
module.exports = router;
