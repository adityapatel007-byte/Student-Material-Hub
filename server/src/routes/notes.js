const path = require('path');
const fs = require('fs');
const express = require('express');
const multer = require('multer');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const Note = require('../models/Note');

const router = express.Router();

const uploadDir = process.env.UPLOAD_DIR
  ? path.isAbsolute(process.env.UPLOAD_DIR)
    ? process.env.UPLOAD_DIR
    : path.join(__dirname, '../../', process.env.UPLOAD_DIR)
  : path.join(__dirname, '../../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get('/', requireAuth, async (req, res) => {
  try {
    const { subject, search } = req.query;
    let query = {};
    
    // Filter by subject if provided
    if (subject && subject !== 'all') {
      query.subject = subject;
    }
    
    // Search in title and description if search term provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const notes = await Note.find(query).populate('uploader', 'name email role').sort({ createdAt: -1 });
    res.json({ notes });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'File is required' });
    const { title, description, subject } = req.body;
    const note = await Note.create({
      title: title || req.file.originalname,
      description: description || '',
      subject: subject || 'General',
      filename: req.file.filename,
      originalName: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      uploader: req.userId,
    });
    res.status(201).json({ note });
  } catch (e) {
    res.status(500).json({ error: 'Upload failed' });
  }
});

router.get('/:id/download', requireAuth, async (req, res) => {
  const note = await Note.findById(req.params.id);
  if (!note) return res.status(404).json({ error: 'Not found' });
  const filePath = path.join(uploadDir, note.filename);
  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File missing' });
  res.download(filePath, note.originalName);
});

router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  const note = await Note.findByIdAndDelete(req.params.id);
  if (!note) return res.status(404).json({ error: 'Not found' });
  const filePath = path.join(uploadDir, note.filename);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  res.json({ ok: true });
});

router.delete('/:id/student', requireAuth, async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ error: 'Not found' });
    
    // Check if the current user is the uploader of this note
    // Handle both ObjectId and populated user object
    const uploaderId = note.uploader._id ? note.uploader._id.toString() : note.uploader.toString();
    if (uploaderId !== req.userId) {
      return res.status(403).json({ error: 'You can only delete your own files' });
    }
    
    // Delete the note from database
    await Note.findByIdAndDelete(req.params.id);
    
    // Delete the physical file
    const filePath = path.join(uploadDir, note.filename);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    
    res.json({ ok: true });
  } catch (e) {
    console.error('Delete error:', e);
    res.status(500).json({ error: 'Delete failed' });
  }
});

module.exports = router;


