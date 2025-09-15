const cloudinary = require('../config/cloudinary');
const Material = require('../models/Material');
const User = require('../models/User');
const fs = require('fs');

// Upload file to cloudinary and create material
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a file'
      });
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'student-materials',
      resource_type: 'auto'
    });

    // Create material data
    const materialData = {
      ...req.body,
      uploadedBy: req.user.id,
      file: {
        public_id: result.public_id,
        url: result.secure_url,
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype
      }
    };

    const material = await Material.create(materialData);

    // Delete temporary file
    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      data: material
    });
  } catch (error) {
    // Delete temporary file if upload fails
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// Upload avatar for user
exports.uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload an image'
      });
    }

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'user-avatars',
      width: 200,
      height: 200,
      crop: 'fill'
    });

    // Update user avatar
    const user = await User.findByIdAndUpdate(
      req.user.id,
      {
        avatar: {
          public_id: result.public_id,
          url: result.secure_url
        }
      },
      { new: true, runValidators: true }
    );

    // Delete temporary file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    // Delete temporary file if upload fails
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};
