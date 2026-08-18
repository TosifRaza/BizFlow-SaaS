const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { verifyToken, requirePermission } = require('../middlewares/auth');
const { setTenant } = require('../middlewares/tenant');
const validate = require('../middlewares/validate');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadDir = path.join(__dirname, '../../uploads/receipts');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const receiptUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    cb(null, allowed.includes(file.mimetype));
  },
});

router.use(verifyToken, setTenant);
router.get('/', requirePermission('expenses.view'), expenseController.getAll);
router.get('/stats', requirePermission('expenses.view'), expenseController.getStats);
router.get('/:id', requirePermission('expenses.view'), expenseController.getById);
router.post('/', requirePermission('expenses.create'), receiptUpload.single('receipt'), validate({
  categoryId: { required: true, message: 'Category is required' },
  amount: { required: true, min: 0, message: 'Amount is required and must be positive' },
}), expenseController.create);
router.put('/:id', requirePermission('expenses.update'), receiptUpload.single('receipt'), expenseController.update);
router.delete('/:id', requirePermission('expenses.delete'), expenseController.delete);
router.post('/:id/receipt', requirePermission('expenses.update'), receiptUpload.single('receipt'), expenseController.uploadReceipt);
router.delete('/:id/receipt', requirePermission('expenses.update'), expenseController.deleteReceipt);

module.exports = router;
