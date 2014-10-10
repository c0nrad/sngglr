'use strict';

var aws = require('aws-sdk');

var express = require('express');
var router = express.Router();

var secrets = {
  AWS_ACCESS_KEY: process.env.AWS_ACCESS_KEY,
  AWS_SECRET_KEY: process.env.AWS_SECRET_KEY,
  S3_BUCKET: process.env.S3_BUCKET
};


router.get('/sign_s3', function(req, res){
    aws.config.update({accessKeyId: secrets.AWS_ACCESS_KEY, secretAccessKey: secrets.AWS_SECRET_KEY});
    var s3 = new aws.S3();
    var s3_params = {
        Bucket: secrets.S3_BUCKET,
        Key: req.query.s3_object_name,
        Expires: 60,
        ContentType: req.query.s3_object_type,
        ACL: 'public-read'
    };
    s3.getSignedUrl('putObject', s3_params, function(err, data){
        if(err){
            console.log(err);
        }
        else{
            var return_data = {
                signed_request: data,
                url: 'https://'+secrets.S3_BUCKET+'.s3.amazonaws.com/'+req.query.s3_object_name
            };
            res.write(JSON.stringify(return_data));
            res.end();
        }
    });
});

module.exports = router;
