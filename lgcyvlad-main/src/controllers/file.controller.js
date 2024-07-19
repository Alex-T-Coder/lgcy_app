const httpStatus = require('http-status');
const path = require('path');
const fs = require('fs/promises');
const mime = require('mime-types');
const { uploadFileMiddleware, uploadFilesMiddleware } = require('../middlewares/upload');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { makeMix } = require('../services/name.service');

const singleUpload = catchAsync(async (req, res, next) => {
  try {
    await uploadFileMiddleware(req, res);
    next();
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Could not upload the file: ${err}`);
  }
});

const multipleUpload = catchAsync(async (req, res, next) => {
  try {
    await uploadFilesMiddleware(req, res);
    next();
  } catch (err) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, `Could not upload the file: ${err}`);
  }
});

const download = catchAsync((req, res) => {
  const fileName = req.params.name;
  const directoryPath = path.join(__dirname, '../resources/posts/uploads/');

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
        message: `Could not download the file. ${err}`,
      });
    }
  });
});

// TODO make async function, use promise
const unlinkFile = async (userId, fileName) => {
  console.log("Inside unlink method")
  if (fileName){
    console.log("Inside if condition",fileName)

    const filePath = path.join(__dirname, `../resources/posts/uploads/${userId}/${fileName}`);

    await fs.rm(filePath);
  } 
};

const uploadBase64Image = async (base64String, filePath, userId) => {
  if (!base64String || typeof base64String !== 'string') {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Invalid base64 string');
  }
  const matches = base64String.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Invalid base64 string format');
  }

  const mimeType = matches[1];
  const data = matches[2];
  // Convert the base64 data to a buffer
  const buffer = Buffer.from(data, 'base64');
  // Determine the file extension based on the MIME type
  const extension = mime.extension(mimeType);
  const fileName = `${await makeMix(12)}image_${Date.now()}`;
  // Append the extension to the file path
  const targetPath = `${filePath}/${fileName}.${extension}`;
  if (!fs.existsSync(filePath)) fs.mkdirSync(filePath, { recursive: true });
  // Write the buffer to a file
  fs.writeFileSync(targetPath, buffer);
  return `${process.env.BACKEND_URL}/${userId}/${fileName}.${extension}`;
};

module.exports = {
  multipleUpload,
  singleUpload,
  download,
  unlinkFile,
  uploadBase64Image,
};
