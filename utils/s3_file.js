const S3 = require('aws-sdk/clients/s3')
require("dotenv").config();
const fs = require('fs');
const accessKeyId = process.env.FILE_ACCESS_KEY;
const secretAccessKey = process.env.FILE_SECRET_ACCESS_KEY;
const bucket = process.env.FILE_BUCKET_NAME;
const region = process.env.FILE_BUCKET_REGION;
const config_aws = {
  accessKeyId,
  secretAccessKey,
  region
};
const s3 = new S3(config_aws);
function uploadFile_admin (file) {
  const fileStream = fs.createReadStream(file.path)
  const uploadParams = {
    Bucket: bucket,
    Body: fileStream,
    Key: file.filename
  }
  return s3.upload(uploadParams).promise()
};

function getFile_admin (fileKey) {
  const downloadParams = {
    Key: fileKey,
    Bucket: bucket,
  }
  return s3.getObject(downloadParams).createReadStream()
};
module.exports = {uploadFile_admin, getFile_admin};
