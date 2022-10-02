const router = require('express').Router();
const {User, Account, Batch, Box, Container, Item, Record, Document} = require('../../models');
const {withAuth} = require('../../utils/auth');
const multer = require('multer');
const upload = multer({dest: 'uploads/'});
const {uploadFile_admin} = require('../../utils/s3_file');
const fs = require('fs');
const util = require('util');
const { log } = require('console');
const unlinkFile = util.promisify(fs.unlink);

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        const file = req.file;
        const ref = req.body.ref;
        const id = req.body.user_id;
        const result = await uploadFile_admin(file);
        await unlinkFile(file.path);
        const key = result.Key;
        Document.create({
            file: key,
            date: new Date().valueOf(),
            references: ref,
            user_id:id,
            type: 1
        },
        )
        .then(() => {
            res.send({imagePath: `/image/${key}`})
        })
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
router.post('/uploadDetailImage', upload.single('file'), async (req, res) => {
    var status=0;
    req.session.admin?status=0:status=1;
    console.log(status);
    try {
        const file = req.file;
        const ref = req.body.ref;
        const id = req.body.user_id;
        const result = await uploadFile_admin(file);
        await unlinkFile(file.path);
        const key = result.Key;
        Document.create({
            file: key,
            date: new Date().valueOf(),
            references: ref,
            user_id:id,
            status: status
        },
        )
        .then(() => {
            res.send({imagePath: `/image/${key}`})
        })
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
router.get('/validation/:reference', async (req, res) => {
    try {
        const documentData = await Document.findOne({
            where: {
              references: req.params.reference,
              type: 1
            },
            attributes: [
              'id',
              'references',
              'file'
            ],
          });
          const data = documentData.get({plain: true});
          res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
router.get('/getDetailImages/:detail_id', async (req, res) => {
    try {
        const documentData = await Document.findAll({
            where: {
              references: req.params.detail_id,
            },
            attributes: [
              'id',
              'references',
              'file',
              'status'
            ],
          });
          var data = null;
          if (documentData) {
            data = documentData.map(image => image.get({ plain: true }));
          }
          res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
router.delete('/remove/:id', withAuth, async (req, res) => {
    try {
        var action;
        if(req.session.admin) {
            action = await Document.destroy({
                where: {
                    id: req.params.id
                }
            });
        } else {
            action = await Document.destroy({
                where: {
                    status: 1,
                    id: req.params.id
                }
            });
        }
        if (action) {
            res.json(action)
        } else {
            res.status(404).json({ message: 'No Document found with this id' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
router.delete('/massremove', withAuth, async (req, res) => {
    try {
        const action = await Document.destroy({
            where: {
                type: 1
            }
        });
        if (action) {
            res.json(action)
        } else {
            res.status(404).json({ message: 'No document was found' });
        }
    } catch (err) {
        console.log(err);
        res.status(500).json(err);
    }
});
module.exports = router;
