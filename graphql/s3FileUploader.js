const Aws = require('aws-sdk'); 

Aws.config.update({
  secretAccessKey:'*********************',
  accessKeyId:'***********',
  region:'******'
});
const s3 = new Aws.S3()

const cdnUrl = 'https://d24bvnb428s3x7.cloudfront.net';
module.exports = s3
