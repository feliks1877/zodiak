const {Router} = require('express')
const auth = require('../middleware/auth')
const User = require('../models/user')
const aws = require('aws-sdk')
const uuid = require('uuid').v4()
const keys = require('../keys')
let bucketName = 'node-sdk-sample' + uuid
let keyName = 'hello world.txt'

aws.config.update({"accessKeyId": keys.AWS_ACCESS_KEY_ID, "secretAccessKey": keys.AWS_SECRET_ACCESS_KEY, "region": 'us-east-2'});




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
        console.log(req.file)
    const s3 = new aws.S3();
    const fileName = req.file.path;
    const fileType = req.file.mimetype;
    const s3Params = {
        Bucket: keys.S3_BUCKET,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read'
    };
    console.log('S3PARAMS', s3Params)
    s3.getSignedUrl('putObject', s3Params, async (err, data) => {
        console.log('DATA',data)
        if(err){
            console.log('ERROR!!!',err);
            return res.end();
        }
        const returnData = {
            signedRequest: data,
            url: `https://${keys.S3_BUCKET}.amazonaws.com/${fileName}`
        };
        console.log('RETURNDATA',returnData)
        // res.writeHead(200, {"Content-Type": "text/html"});
        // res.end();
    });

       res.redirect('/profile')

})

module.exports = router

//СЩЗДАНИЕ КОРЗИНВ В S3

// let bucketPromise = new aws.S3({apiVersion: "2006-03-01"}).createBucket({Bucket: bucketName}).promise()
// aws.config.getCredentials(function (err){
//     if(err){
//         console.log(aws.config ,err.stack)
//     }else {
//         console.log('Access key:', aws.config.credentials.accessKeyId,
//             'Region', aws.config.region)
//     }
// })
// console.log('bbbb',bucketName)
// bucketPromise.then(
//     function (data){
//         let objectParams = {Bucket: bucketName, Key: keyName, Body: 'Hello World'}
//         let uploadPromise =//     function (data){
// //         let objectParams = {Bucket: bucketName, Key: keyName, Body: 'Hello World'}
// //         let uploadPromise = new aws.S3({apiVersion: "2006-03-01"}).putObject(objectParams).promise()
// //         uploadPromise.then(
// //             function (data){
// //                 console.log("Successfully uploaded data to " + bucketName + "/" + keyName)
// //             }).catch(
// //             function (err) {
// //                 console.error(err, err.stack)
// //             }
// //         )
// //     }
//         uploadPromise.then(
//             function (data){
//                 console.log("Successfully uploaded data to " + bucketName + "/" + keyName)
//             }).catch(
//             function (err) {
//                 console.error(err, err.stack)
//             }
//         )
//     }
// )