const express = require('express')
const aws = require('aws-sdk')

const keys = require('../keys')
const S3_BUCKET = keys.S3_BUCKET_NAME
const S3_KEY = keys.SECRET_ACCESS_KEY


module.exports = function signS3(fName,fType) {
    const s3 = new aws.S3();
    console.log(s3)
    const fileName = fName;
    const fileType = fType;
    const s3Params = {
        Bucket: S3_BUCKET,
        Key: fileName,
        Expires: 60,
        ContentType: fileType,
        ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', s3Params, (err, data) => {
        if(err){
            console.log(err);
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
}

