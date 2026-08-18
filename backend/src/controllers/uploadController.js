const uploadService = require('../services/uploadService');
const { successResponse } = require('../utils/response');

const uploadImage = async (req, res, next) => {
  try {
    const result = await uploadService.uploadImage(req.file);
    successResponse(res, result, 'Image uploaded', 201);
  } catch (error) {
    next(error);
  }
};

const deleteImage = async (req, res, next) => {
  try {
    const result = await uploadService.deleteImage(req.body.filename);
    successResponse(res, result, 'Image deleted');
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadImage, deleteImage };
