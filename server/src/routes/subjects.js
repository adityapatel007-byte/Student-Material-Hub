const express = require('express');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const Subject = require('../models/Subject');

const router = express.Router();

// Get all subjects
router.get('/', requireAuth, async (req, res) => {
  try {
    const subjects = await Subject.find().populate('createdBy', 'name email').sort({ name: 1 });
    res.json({ subjects });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new subject (Admin only)
router.post('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Subject name is required' });
    
    const existing = await Subject.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (existing) return res.status(409).json({ error: 'Subject already exists' });
    
    const subject = await Subject.create({
      name: name.trim(),
      description: description?.trim() || '',
      createdBy: req.userId,
    });
    
    const populatedSubject = await Subject.findById(subject._id).populate('createdBy', 'name email');
    res.status(201).json({ subject: populatedSubject });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Update subject (Admin only)
router.put('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) return res.status(400).json({ error: 'Subject name is required' });
    
    const subject = await Subject.findByIdAndUpdate(
      req.params.id,
      { name: name.trim(), description: description?.trim() || '' },
      { new: true }
    ).populate('createdBy', 'name email');
    
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json({ subject });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete subject (Admin only)
router.delete('/:id', requireAuth, requireAdmin, async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;