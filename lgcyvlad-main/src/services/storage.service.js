const { S3Client, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const { randomUUID } = require('node:crypto');
const config = require('../config/config');

const client = new S3Client({
  region: config.bucket.region,
  credentials: {
    accessKeyId: config.bucket.accessKey,
    secretAccessKey: config.bucket.secretKey,
  },
});

/**
 * upload files to storage
 * @param {Express.Multer.File[]} files
 * @returns {Promise<{ url: string, originalName: string, key: string }[]>}
 */
async function uploadFiles(files) {
  const uploadedFiles = await Promise.all(
    files.map((file) => {
      const params = {
        Bucket: config.bucket.name,
        Key: randomUUID(),
        Body: file.buffer,
        ContentType: file.mimetype,
        ContentDisposition: 'inline',
      };

      const upload = new Upload({
        client,
        params,
      });

      return upload.done();
    })
  );

  return uploadedFiles.map((file, index) => ({
    url: file.Location,
    memeType: files[index].mimetype,
    originalName: files[index].originalname,
    key: file.Key,
  }));
}

/**
 * delete files from storage
 * @param {string[]} keys
 */
async function deleteFiles(keys) {
  const params = {
    Bucket: config.bucket.name,
    Delete: { Objects: keys.map((key) => ({ Key: key })) },
  };

  const command = new DeleteObjectsCommand(params);
  await client.send(command);
}

module.exports = {
  uploadFiles,
  deleteFiles,
};
