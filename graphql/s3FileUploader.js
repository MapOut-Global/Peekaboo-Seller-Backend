const Aws = require('aws-sdk'); 

Aws.config.update({
  secretAccessKey:'yozM9l4734aDNxi4MpCVmAo4k2kbdvr9Tx8yzAud',
  accessKeyId:'AKIAUV3FFSC7JRCJM25R',
  region:'us-west-2'
});
const s3 = new Aws.S3()

const cdnUrl = 'https://d24bvnb428s3x7.cloudfront.net';
module.exports = s3