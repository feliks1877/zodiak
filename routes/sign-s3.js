const {Router} = require('express')
const auth = require('../middleware/auth')
const User = require('../models/user')
const aws = require('aws-sdk')
const keys = require('../keys')
const router = Router()


router.get('/', async (req, res) => {
    console.log('S3')
    res.render('sign', {
        title: 'SIGN',
        isSIGN: true,
    })
    const S3_BUCKET_NAME = keys.S3_BUCKET_NAME;
    aws.config.region = 'us-east-2';
    console.log('S3BUCKET ROUT', S3_BUCKET_NAME)
    const s3 = new aws.S3();
    console.log(s3)
    const fileName = req.query['file-name'];
    const fileType = req.query['file-type'];
    const s3Params = {
        Bucket: S3_BUCKET_NAME,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read'
    };
    console.log('s3PRAMS',s3Params)
    s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if(err){
            console.log(err);
            return res.end();
        }
        const returnData = {
            signedRequest: data,
            url: `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`
        };
        console.log('RETURNDATA',returnData)
        res.write(JSON.stringify(returnData));
        res.end();
    });

});

module.exports = router