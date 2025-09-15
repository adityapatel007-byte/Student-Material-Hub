const express = require('express');
const { uploadFile, uploadAvatar } = require('../controllers/uploadController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Upload material file
router.post('/material', protect, upload.single('file'), uploadFile);

// Upload user avatar
router.post('/avatar', protect, upload.single('avatar'), uploadAvatar);

module.exports = router;
