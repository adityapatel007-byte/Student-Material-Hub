const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const { connectToDatabase } = require('./utils/db');
const { initializeDatabase } = require('./utils/init');

const authRoutes = require('./routes/auth');
const noteRoutes = require('./routes/notes');
const subjectRoutes = require('./routes/subjects');
const questionRoutes = require('./routes/questions');

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '../../uploads');

app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Static files for uploaded notes
app.use('/uploads', express.static(UPLOAD_DIR));

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/questions', questionRoutes);

async function start() {
  await connectToDatabase();
  await initializeDatabase();
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start();


