const {Router} = require('express')
const auth = require('../middleware/auth')
const User = require('../models/user')
const aws = require('aws-sdk')
const keys = require('../keys')
const S3_BUCKET = keys.S3_BUCKET_NAME
const S3_KEY = keys.SECRET_ACCESS_KEY
aws.config.region = 'us-east-2';
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
       if(req.file){
           toChange.avatarUrl = req.file.path
       }

       Object.assign(user, toChange)
       await user.save()

    const s3 = new aws.S3();
    console.log('S3 ВЫЗОВ',s3)
    const fileName = req.file.path;
    const fileType = req.file.mimetype;
    const s3Params = {
        Bucket: S3_BUCKET,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read'
    };
    console.log('S3PARAMS', s3Params)
    s3.getSignedUrl('putObject', s3Params, (err, data) => {
        console.log('DATA',data)
        if(err){
            console.log('ERROR!!!',err);
            return res.end();
        }
        const returnData = {
            signedRequest: data,
            url: `https://${S3_BUCKET}.s3.amazonaws.com/${fileName}`
        };
        console.log('RETURNDATA',returnData)
        res.write(JSON.stringify(returnData));
        res.end();
    });

       res.redirect('/profile')

})

module.exports = router