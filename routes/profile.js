const {Router} = require('express')
const fs = require('fs');
const auth = require('../middleware/auth')
const User = require('../models/user')
const aws = require('aws-sdk')
const uuid = require('uuid').v4()
const keys = require('../keys')
aws.config.update({
    "accessKeyId": keys.AWS_ACCESS_KEY_ID,
    "secretAccessKey": keys.AWS_SECRET_ACCESS_KEY,
    "region": 'us-east-2'
});
let s3 = new aws.S3({
    apiVersion: "2006-03-01",
    params: {Bucket: keys.S3_BUCKET}
})

const router = Router()

router.get('/', auth, async (req, res) => {
    res.render('profile', {
        title: 'Профиль',
        isProfile: true,
        user: req.user.toObject()
    })
})
router.post('/', auth, async (req, res) => {
    const user = await User.findById(req.user._id)
    const toChange = {
        name: req.body.name
    }
    if (req.file) {
        toChange.avatarUrl = req.file.filename
    }
    fs.readFile(req.file.path, function (err, data) {
        if (err) {
            throw err;
        }
        console.log('DATA', data, 'TYPE', req.file)
        const params = {
            Bucket: keys.S3_BUCKET,
            Key: req.file.originalname,
            Body: data,
            ContentType: req.file.mimetype,
            ACL: 'public-read'
        };
        s3.putObject(params, function (err, data) {
            if (err) {
                console.log(err)
            } else {
                console.log("Successfully uploaded data to myBucket/myKey",data);
            }
        })
    });

    Object.assign(user, toChange)
    await user.save()


    res.redirect('/profile')
})

module.exports = router
