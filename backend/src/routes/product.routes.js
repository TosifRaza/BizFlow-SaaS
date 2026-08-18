const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, requirePermission } = require('../middlewares/auth');
const { setTenant } = require('../middlewares/tenant');
const { setBranchFilter } = require('../middlewares/branch');
const validate = require('../middlewares/validate');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const csvUpload = multer({
  dest: uploadDir,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'text/csv' || file.mimetype === 'application/vnd.ms-excel' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  },
});

router.use(verifyToken, setTenant, setBranchFilter);
router.get('/', requirePermission('products.view'), productController.getAll);
router.get('/stats', requirePermission('products.view'), productController.getStats);
router.get('/bulk-export', requirePermission('products.export'), productController.bulkExport);
router.post('/', requirePermission('products.create'), validate({
  name: { required: true, minLength: 1, message: 'Product name is required' },
  sellingPrice: { required: true, min: 0, message: 'Selling price must be at least 0' },
}), productController.create);
router.post('/bulk-import', requirePermission('products.import'), csvUpload.single('file'), productController.bulkImport);
router.post('/bulk-delete', requirePermission('products.delete'), productController.bulkDelete);
router.get('/:id', requirePermission('products.view'), productController.getById);
router.put('/:id', requirePermission('products.update'), productController.update);
router.delete('/:id', requirePermission('products.delete'), productController.delete);

module.exports = router;
