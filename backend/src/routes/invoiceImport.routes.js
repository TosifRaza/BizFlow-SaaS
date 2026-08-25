// // const express = require('express');
// // const router = express.Router();
// // const multer = require('multer');
// // const path = require('path');
// // const fs = require('fs');
// // const { verifyToken, requirePermission } = require('../middlewares/auth');
// // const { setTenant } = require('../middlewares/tenant');
// // const { uploadLimiter } = require('../middlewares/rateLimiter');
// // const controller = require('../controllers/invoiceImportController');

// // const invoiceUploadDir = path.join(__dirname, '../../uploads/invoices');
// // if (!fs.existsSync(invoiceUploadDir)) fs.mkdirSync(invoiceUploadDir, { recursive: true });

// // const storage = multer.diskStorage({
// //   destination: (req, file, cb) => cb(null, invoiceUploadDir),
// //   filename: (req, file, cb) => {
// //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
// //     cb(null, `invoice-${uniqueSuffix}${path.extname(file.originalname)}`);
// //   },
// // });

// // const upload = multer({
// //   storage,
// //   limits: { fileSize: 10 * 1024 * 1024 },
// //   fileFilter: (req, file, cb) => {
// //     const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
// //     if (!allowed.includes(file.mimetype)) {
// //       return cb(new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.'), false);
// //     }
// //     cb(null, true);
// //   },
// // });

// // router.use(verifyToken, setTenant);

// // router.post('/upload', uploadLimiter, requirePermission('purchases.import'), upload.single('file'), controller.uploadAndExtract);
// // router.get('/:id', requirePermission('purchases.import'), controller.getById);
// // router.post('/:id/confirm', requirePermission('purchases.import'), controller.confirmImport);
// // router.delete('/:id', requirePermission('purchases.import'), controller.remove);

// // module.exports = router;
// const express = require('express');
// const router = express.Router();
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');
// const { verifyToken, requirePermission } = require('../middlewares/auth');
// const { setTenant } = require('../middlewares/tenant');
// const { uploadLimiter } = require('../middlewares/rateLimiter');
// const { errorResponse } = require('../utils/response');
// const controller = require('../controllers/invoiceImportController');

// const invoiceUploadDir = path.join(__dirname, '../../uploads/invoices');
// if (!fs.existsSync(invoiceUploadDir)) fs.mkdirSync(invoiceUploadDir, { recursive: true });

// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, invoiceUploadDir),
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, `invoice-${uniqueSuffix}${path.extname(file.originalname)}`);
//   },
// });

// const upload = multer({
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
//     if (!allowed.includes(file.mimetype)) {
//       const err = new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.');
//       err.statusCode = 400;
//       err.errorCode = 'INVALID_FILE_TYPE';
//       return cb(err, false);
//     }
//     cb(null, true);
//   },
// });

// router.use(verifyToken, setTenant);

// // Upload + Extract with Multer error handling
// router.post('/upload', uploadLimiter, requirePermission('purchases.import'), (req, res, next) => {
//   upload.single('file')(req, res, (err) => {
//     if (err) {
//       if (err instanceof multer.MulterError) {
//         if (err.code === 'LIMIT_FILE_SIZE') {
//           return errorResponse(res, 'File too large. Maximum size is 10 MB.', 400, 'FILE_TOO_LARGE');
//         }
//         return errorResponse(res, err.message, 400, 'UPLOAD_ERROR');
//       }
//       return errorResponse(res, err.message || 'Upload failed', err.statusCode || 400, err.errorCode || 'UPLOAD_ERROR');
//     }
//     next();
//   });
// }, controller.uploadAndExtract);

// router.get('/:id', requirePermission('purchases.import'), controller.getById);
// router.post('/:id/confirm', requirePermission('purchases.import'), controller.confirmImport);
// router.delete('/:id', requirePermission('purchases.import'), controller.remove);

// module.exports = router;
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken, requirePermission } = require('../middlewares/auth');
const { setTenant } = require('../middlewares/tenant');
const { uploadLimiter } = require('../middlewares/rateLimiter');
const { errorResponse } = require('../utils/response');
const controller = require('../controllers/invoiceImportController');

const invoiceUploadDir = path.join(__dirname, '../../uploads/invoices');
if (!fs.existsSync(invoiceUploadDir)) fs.mkdirSync(invoiceUploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, invoiceUploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `invoice-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowed.includes(file.mimetype)) {
      const err = new Error('Invalid file type. Only PDF, JPG, and PNG files are allowed.');
      err.statusCode = 400;
      err.errorCode = 'INVALID_FILE_TYPE';
      return cb(err, false);
    }
    cb(null, true);
  },
});

router.use(verifyToken, setTenant);

// Upload + Extract with Multer error handling
router.post('/upload', uploadLimiter, requirePermission('purchases.import'), (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return errorResponse(res, 'File too large. Maximum size is 10 MB.', 400, 'FILE_TOO_LARGE');
        }
        return errorResponse(res, err.message, 400, 'UPLOAD_ERROR');
      }
      return errorResponse(res, err.message || 'Upload failed', err.statusCode || 400, err.errorCode || 'UPLOAD_ERROR');
    }
    next();
  });
}, controller.uploadAndExtract);

// Manual entry (no AI needed)
router.post('/manual', requirePermission('purchases.import'), controller.createManual);

// Provider status check (for frontend setup guide)
router.get('/provider-info', requirePermission('purchases.import'), controller.providerInfo);

router.get('/:id', requirePermission('purchases.import'), controller.getById);
router.post('/:id/confirm', requirePermission('purchases.import'), controller.confirmImport);
router.delete('/:id', requirePermission('purchases.import'), controller.remove);

module.exports = router;
