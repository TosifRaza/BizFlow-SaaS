const fs = require('fs');
const path = require('path');
const config = require('../config');

const uploadImage = async (file) => {
  if (!file) throw new Error('No file uploaded');
  const filePath = `/uploads/${file.filename}`;
  return { url: filePath, filename: file.filename };
};

const deleteImage = async (filename) => {
  if (!filename) throw new Error('Filename is required');
  const safeName = path.basename(filename);
  const filePath = path.join(__dirname, '../../uploads', safeName);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  return { message: 'Image deleted' };
};

module.exports = { uploadImage, deleteImage };
