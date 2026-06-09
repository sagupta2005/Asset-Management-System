const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { generateQrCode, generateQrDataUrl } = require('../utils/qrCodeGenerator');
const { authenticate } = require('../middleware/auth');
const { ApiResponse } = require('../utils/apiResponse');
const config = require('../config/env');
const { Asset } = require('../models');
const { ResourceNotFoundError } = require('../middleware/errorHandler');

router.get('/:assetTag', async (req, res) => {
  const { assetTag } = req.params;
  const filePath = path.join(path.resolve(config.app.qrDir), `${assetTag}.png`);

  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'image/png');
    return fs.createReadStream(filePath).pipe(res);
  }

  // Generate on-the-fly
  const asset = await Asset.findOne({ where: { assetTag, isActive: true } });
  if (!asset) throw new ResourceNotFoundError('Asset', 'tag', assetTag);

  const qrUrl = await generateQrCode(assetTag);
  res.setHeader('Content-Type', 'image/png');
  fs.createReadStream(path.resolve(qrUrl.replace('/uploads', '').replace(/^\//, ''))).pipe(res);
});

router.post('/regenerate/:assetTag', authenticate, async (req, res) => {
  const { assetTag } = req.params;
  const asset = await Asset.findOne({ where: { assetTag, isActive: true } });
  if (!asset) throw new ResourceNotFoundError('Asset', 'tag', assetTag);

  const qrUrl = await generateQrCode(assetTag);
  asset.qrCodeUrl = qrUrl;
  await asset.save();

  res.status(200).json(ApiResponse.success({ qrUrl }, 'QR code regenerated'));
});

router.get('/dataurl/:assetTag', authenticate, async (req, res) => {
  const content = `${config.app.frontendUrl}/assets/passport/${req.params.assetTag}`;
  const dataUrl = await generateQrDataUrl(content);
  res.status(200).json(ApiResponse.success({ dataUrl }));
});

module.exports = router;
