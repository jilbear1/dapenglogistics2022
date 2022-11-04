const router = require('express').Router();
const {User, Account, Batch, Box, Container, Item, Record} = require('../../models');
const {withAuth} = require('../../utils/auth');
const { Op } = require("sequelize");

router.post('/neworder_china', withAuth, (req, res) => {
    Record.create({
        user_id: req.session.user_id,
        ref_number: req.body.ref_number,
        status_to: req.body.status_to,
        action: req.body.action,
        date: req.body.date,
        sub_number: req.body.sub_number
    })
    .then(dbRecordData => {
        res.json(dbRecordData)
      })
    .catch(err => {
      console.log(err);
      res.status(500).json(err);

    });
});
router.post('/request_china', withAuth, (req, res) => {
  Record.create({
      user_id: req.session.user_id,
      ref_number: req.body.ref_number,
      status_from: req.body.status_from,
      status_to: req.body.status_to,
      action: req.body.action,
      date: req.body.date,
      sub_number: req.body.sub_number
  })
  .then(dbRecordData => {
      res.json(dbRecordData)
    })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);

  });
});
router.post('/record_create', withAuth, (req, res) => {
  Record.create({
    user_id: req.body.user_id,
    ref_number: req.body.ref_number,
    sub_number: req.body.sub_number,
    qty_from: req.body.qty_from,
    qty_to: req.body.qty_to,
    status_from: req.body.status_from,
    status_to: req.body.status_to,
    action: req.body.action,
    action_notes: req.body.action_notes,
    date: req.body.date,
    type: req.body.type,
    bill: req.body.bill
  })
  .then(dbRecordData => {
      res.json(dbRecordData)
    })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);

  });
});
router.post('/record_create_client', withAuth, (req, res) => {
  Record.create({
    user_id: req.session.user_id,
    ref_number: req.body.ref_number,
    sub_number: req.body.sub_number,
    qty_from: req.body.qty_from,
    qty_to: req.body.qty_to,
    status_from: req.body.status_from,
    status_to: req.body.status_to,
    action: req.body.action,
    action_notes: req.body.action_notes,
    date: req.body.date,
    type: req.body.type,
    bill: req.body.bill
  })
  .then(dbRecordData => {
      res.json(dbRecordData)
    })
  .catch(err => {
    console.log(err);
    res.status(500).json(err);

  });
});
router.get('/dashboard_admin/:number', withAuth, async (req, res) => {
  try {
    const recordData = await Record.findAll({
      limit: parseInt(req.params.number),
      order: [
        ["id", "DESC"],
      ],
      attributes: [
        'id',
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
        "bill",
      ],
      include: [
        {
          model: User,
          attributes: [
            'name'
          ]
        }
      ]
    })
    const records = recordData.map(record => record.get({ plain: true }));
    res.json(records);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
});
router.get('/skufilter/:number', withAuth, async (req, res) => {
  try {
    const recordData = await Record.findAll({
      limit: parseInt(req.params.number),
      where: {
        type: 50
      },
      order: [
        ["id", "DESC"],
      ],
      attributes: [
        "id",
        "sub_number",
        "action_notes"
      ]
    })
    const records = recordData.map(record => record.get({ plain: true }));
    res.json(records);
    } catch (err) {
      console.log(err);
      res.status(500).json(err);
    }
});



module.exports = router;
