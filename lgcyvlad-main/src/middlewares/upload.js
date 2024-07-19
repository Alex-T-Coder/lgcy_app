const util = require('util');
const multer = require('multer');

const maxSize = 100 * 1024 * 1024;
const storage = multer.memoryStorage();

const uploadFiles = multer({
  storage,
  limits: { fileSize: maxSize },
}).array('myFiles', 10); // Set the field name and maximum number of files

const uploadFile = multer({
  storage,
  limits: { fileSize: maxSize },
}).single('myFile');

const uploadFilesMiddleware = util.promisify(uploadFiles);
const uploadFileMiddleware = util.promisify(uploadFile);
module.exports = {
  uploadFilesMiddleware,
  uploadFileMiddleware,
};
