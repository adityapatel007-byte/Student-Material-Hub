const mongoose = require('mongoose');

const AnswerSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const QuestionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    subject: { type: String, required: true, default: 'General' },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: [AnswerSchema],
    resolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Question', QuestionSchema);
