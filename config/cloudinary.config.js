const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    allowed_formats: ['jpg', 'png', 'gif', 'tiff', 'psd', 'pdf', 'eps', 'heic', 'webp'],
    folder: 'Pet-Gossip-User-Img'
    // resource_type: 'raw' => this is in case you want to upload other type of files, not just images
  }
});

module.exports = multer({ storage });