const { S3Client, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const { Upload } = require("@aws-sdk/lib-storage");
const { createReadStream } = require("fs");
const sharp = require("sharp");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("ffmpeg-static");
const ffprobePath = require("ffprobe-static").path;
const { fileTypeFromFile } = require("file-type");

require("dotenv").config();

ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const s3Client = new S3Client({ 
  region: "us-east-1",
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  }
});

const heightOfImage = async (file) => {
  const image = sharp(file.path);
  return (await image.metadata()).height;
};

const uploadToS3 = async (file, key) => {
  try {
    const fileType = await fileTypeFromFile(file.path);
    let body;
    let contentType;
    let fileName;

    if (fileType && fileType.mime.startsWith('image/') && (!key.startsWith("content") || (await heightOfImage(file) >= 2160))) {
      const image = sharp(file.path);

      body = await image
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
      body = createReadStream(file.path);
      if (fileType.mime.startsWith('video/')) {
        const probeVideo = () => {
          return new Promise((resolve, reject) => {
            ffmpeg.ffprobe(file.path, (err, metadata) => {
              if (err) {
                return reject(err);
              }
              const videoStream = metadata.streams.find(stream => stream.codec_type == 'video');
              if (!videoStream) {
                return reject(new Error("No video stream"));
              }
              resolve(videoStream.height);
            });
          })
        };
        const height = await probeVideo();
        if (height > 1080) {
          const outputPath = path.join(path.parse(file.path).dir, `${crypto.randomUUID()}${path.extname(file.name)}`);
          const compressVideo = () => {
            return new Promise((resolve, reject) => {
              ffmpeg(file.path)
                .videoFilters('scale=-1:1080')
                .output(outputPath)
                .on('end', () => resolve())
                .on('error', (err) => reject(err))
                .run();
            });
          };
          await compressVideo();
          body = createReadStream(outputPath);
        }
      }
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