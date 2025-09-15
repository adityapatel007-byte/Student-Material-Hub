const Material = require('../models/Material');
const Subject = require('../models/Subject');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');

// @desc    Get all materials
// @route   GET /api/materials
// @access  Public
exports.getMaterials = async (req, res, next) => {
  try {
    let query = Material.find({ isActive: true, isApproved: true });

    // Filter by subject
    if (req.query.subject) {
      query = query.find({ subject: req.query.subject });
    }

    // Filter by material type
    if (req.query.type) {
      query = query.find({ materialType: req.query.type });
    }

    // Filter by semester
    if (req.query.semester) {
      query = query.find({ semester: req.query.semester });
    }

    // Filter by difficulty
    if (req.query.difficulty) {
      query = query.find({ difficulty: req.query.difficulty });
    }

    // Search by title, description, or tags
    if (req.query.search) {
      query = query.find({
        $text: { $search: req.query.search }
      });
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Material.countDocuments({ isActive: true, isApproved: true });

    query = query.skip(startIndex).limit(limit);

    // Populate references
    query = query.populate('subject', 'name code department')
                 .populate('uploadedBy', 'name university course');

    const materials = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      success: true,
      count: materials.length,
      pagination,
      data: materials
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single material
// @route   GET /api/materials/:id
// @access  Public
exports.getMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('subject', 'name code department')
      .populate('uploadedBy', 'name university course')
      .populate('likes.user', 'name')
      .populate('downloads.user', 'name');

    if (!material || !material.isActive || !material.isApproved) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Increment views
    material.views += 1;
    await material.save();

    res.status(200).json({
      success: true,
      data: material
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload new material
// @route   POST /api/materials
// @access  Private
exports.uploadMaterial = async (req, res, next) => {
  try {
    // Check if subject exists
    const subject = await Subject.findById(req.body.subject);
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found'
      });
    }

    // Add user to req.body
    req.body.uploadedBy = req.user.id;

    const material = await Material.create(req.body);

    // Add material to user's materialsShared array
    await User.findByIdAndUpdate(req.user.id, {
      $push: { materialsShared: material._id }
    });

    res.status(201).json({
      success: true,
      data: material
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update material
// @route   PUT /api/materials/:id
// @access  Private
exports.updateMaterial = async (req, res, next) => {
  try {
    let material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Make sure user is material owner or admin
    if (material.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this material'
      });
    }

    material = await Material.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: material
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete material
// @route   DELETE /api/materials/:id
// @access  Private
exports.deleteMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Make sure user is material owner or admin
    if (material.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to delete this material'
      });
    }

    // Delete file from cloudinary
    if (material.file.public_id) {
      await cloudinary.uploader.destroy(material.file.public_id);
    }

    await material.remove();

    // Remove from user's materialsShared array
    await User.findByIdAndUpdate(material.uploadedBy, {
      $pull: { materialsShared: material._id }
    });

    res.status(200).json({
      success: true,
      message: 'Material deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Like/Unlike material
// @route   PUT /api/materials/:id/like
// @access  Private
exports.likeMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Check if already liked
    const likeIndex = material.likes.findIndex(
      like => like.user.toString() === req.user.id
    );

    if (likeIndex > -1) {
      // Unlike
      material.likes.splice(likeIndex, 1);
    } else {
      // Like
      material.likes.push({ user: req.user.id });
    }

    await material.save();

    res.status(200).json({
      success: true,
      data: material
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Download material
// @route   GET /api/materials/:id/download
// @access  Private
exports.downloadMaterial = async (req, res, next) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Material not found'
      });
    }

    // Add to downloads if not already downloaded by this user
    const downloadIndex = material.downloads.findIndex(
      download => download.user.toString() === req.user.id
    );

    if (downloadIndex === -1) {
      material.downloads.push({ user: req.user.id });
      await material.save();
    }

    res.status(200).json({
      success: true,
      downloadUrl: material.file.url,
      filename: material.file.originalName
    });
  } catch (error) {
    next(error);
  }
};
