const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { createReadStream } = require("fs");
const sharp = require("sharp");
const path = require("path");
const { fileTypeFromFile } = require("file-type");

require("dotenv").config();

const s3Client = new S3Client({ 
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  }
});

const uploadToS3 = async (file, key) => {
  try {
    const fileType = await fileTypeFromFile(file.path);
    let body;
    let contentType;
    let fileName;

    if (fileType && fileType.mime.startsWith('image/')) {
      body = (key == "content")
        ? createReadStream(file.path)
        : await sharp(file.path)
            .resize({
              width: key.startsWith("gallery") ? 720 : undefined,
              height: key.startsWith("gallery") ? 720 : key == "thumbnail" ? 1080 : undefined,
              fit: "inside",
              withoutEnlargement: true,
            })
            .jpeg({ quality: 75 })
            .toBuffer();
      contentType = "image/jpeg";
      fileName = `${crypto.randomUUID()}.jpg`;
    } else {
      // Upload as is for non-images
      body = createReadStream(file.path);
      contentType = fileType ? fileType.mime : "application/octet-stream";
      const ext = path.extname(file.name);
      fileName = `${crypto.randomUUID()}${ext}`;
    }

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.S3_BUCKET,
        Key: fileName,
        Body: body,
        ContentType: contentType,
      },
      queueSize: 10,
    });

    await upload.done();
    return fileName;
  }
  catch (err) {
    throw err;
  }
};

const deleteFromS3 = async (fileName) => {
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: fileName,
    }));
  } catch (err) {
    throw err;
  }
};

module.exports = { uploadToS3, deleteFromS3 };