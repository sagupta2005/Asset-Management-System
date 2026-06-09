const express = require('express');
const router = express.Router();
const multer = require('multer');
const { authenticate } = require('../middleware/auth');
const { ApiResponse } = require('../utils/apiResponse');
const ocrService = require('../services/ocrService');

/**
 * @swagger
 * tags:
 *   name: OCR
 *   description: Invoice OCR extraction using Tesseract.js
 */

// Multer — in-memory storage for OCR
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images (JPEG, PNG, GIF, WEBP) and PDF are allowed.'));
    }
  },
});

/**
 * POST /api/ocr/scan
 * Upload a file and extract invoice data using OCR.
 */
router.post('/scan', authenticate, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json(ApiResponse.error(400, 'No file uploaded'));
  }
  const result = await ocrService.extractInvoiceData(req.file);
  res.status(200).json(ApiResponse.success(result, 'OCR extraction completed'));
});

module.exports = router;
