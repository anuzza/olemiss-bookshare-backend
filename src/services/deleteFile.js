const s3 = require("./aws");
const AmazonS3URI = require("amazon-s3-uri");

const deleteFileFromS3 = (url) => {
  const { key } = AmazonS3URI(url);

  var params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  };
  s3.deleteObject(params, function (err, data) {
    if (err) {
      throw err;
    }
  });
};

module.exports = deleteFileFromS3;
