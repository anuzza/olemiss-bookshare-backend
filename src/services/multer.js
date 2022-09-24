const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("./aws");

const fileUpload = () => {
  let storage;

  storage = multerS3({
    s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read",

    key: function (req, file, cb) {
      cb(null, new Date().toISOString() + +"_" + file.originalname);
    },
  });

  upload = multer({
    storage,
    limits: {
      fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
      if (!file.originalname.toLowerCase().match(/\.(jpg|jpeg|gif|png)$/)) {
        return cb(
          new Error("Invalid file type, only JPEG and PNG is allowed!")
        );
      }
      cb(undefined, true);
    },
  });

  return upload;
};
module.exports = fileUpload;
