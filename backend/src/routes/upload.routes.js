const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { verifyToken } = require('../middlewares/auth');
const { setTenant } = require('../middlewares/tenant');
const { uploadLimiter } = require('../middlewares/rateLimiter');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.use(verifyToken, setTenant);
router.post('/image', uploadLimiter, upload.single('image'), uploadController.uploadImage);
router.delete('/image', uploadController.deleteImage);

module.exports = router;
