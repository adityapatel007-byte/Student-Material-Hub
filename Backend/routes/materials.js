const express = require('express');
const {
  getMaterials,
  getMaterial,
  uploadMaterial,
  updateMaterial,
  deleteMaterial,
  likeMaterial,
  downloadMaterial
} = require('../controllers/materialController');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

router.route('/')
  .get(optionalAuth, getMaterials)
  .post(protect, uploadMaterial);

router.route('/:id')
  .get(optionalAuth, getMaterial)
  .put(protect, updateMaterial)
  .delete(protect, deleteMaterial);

router.put('/:id/like', protect, likeMaterial);
router.get('/:id/download', protect, downloadMaterial);

module.exports = router;
