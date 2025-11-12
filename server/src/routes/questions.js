const express = require('express');
const { requireAuth } = require('../middleware/auth');
const Question = require('../models/Question');

const router = express.Router();

// Get all questions
router.get('/', requireAuth, async (req, res) => {
  try {
    const { subject, search } = req.query;
    let query = {};
    
    if (subject && subject !== 'all') {
      query.subject = subject;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    const questions = await Question.find(query)
      .populate('author', 'name email role')
      .populate('answers.author', 'name email role')
      .sort({ createdAt: -1 });
    res.json({ questions });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get single question
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id)
      .populate('author', 'name email role')
      .populate('answers.author', 'name email role');
    if (!question) return res.status(404).json({ error: 'Question not found' });
    res.json({ question });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Create question
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, content, subject } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }
    
    const question = await Question.create({
      title,
      content,
      subject: subject || 'General',
      author: req.userId,
    });
    
    const populatedQuestion = await Question.findById(question._id)
      .populate('author', 'name email role');
    res.status(201).json({ question: populatedQuestion });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add answer to question
router.post('/:id/answers', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ error: 'Answer content is required' });
    }
    
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    
    question.answers.push({
      content,
      author: req.userId,
    });
    
    await question.save();
    
    const updatedQuestion = await Question.findById(req.params.id)
      .populate('author', 'name email role')
      .populate('answers.author', 'name email role');
    
    res.json({ question: updatedQuestion });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Mark question as resolved
router.patch('/:id/resolve', requireAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    
    // Only author can mark as resolved
    if (question.author.toString() !== req.userId) {
      return res.status(403).json({ error: 'Only the author can mark as resolved' });
    }
    
    question.resolved = !question.resolved;
    await question.save();
    
    const updatedQuestion = await Question.findById(req.params.id)
      .populate('author', 'name email role')
      .populate('answers.author', 'name email role');
    
    res.json({ question: updatedQuestion });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete question
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    
    // Only author or admin can delete
    if (question.author.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    await Question.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete answer
router.delete('/:id/answers/:answerId', requireAuth, async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    
    const answer = question.answers.id(req.params.answerId);
    if (!answer) return res.status(404).json({ error: 'Answer not found' });
    
    // Only answer author or admin can delete
    if (answer.author.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }
    
    answer.remove();
    await question.save();
    
    const updatedQuestion = await Question.findById(req.params.id)
      .populate('author', 'name email role')
      .populate('answers.author', 'name email role');
    
    res.json({ question: updatedQuestion });
  } catch (e) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
