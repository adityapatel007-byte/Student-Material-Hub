const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require('path');
const multer = require('multer');

// Load env vars
dotenv.config();

// Database connection
const connectDB = require('./config/database');

// Swagger documentation
const { specs, swaggerUi, swaggerOptions } = require('./config/swagger');

// Route files
const auth = require('./routes/auth');
const subjects = require('./routes/subjects');
const materials = require('./routes/materials');
const upload = require('./routes/upload');

// Middleware
const errorHandler = require('./middleware/error');

// Connect to database
connectDB();

const app = express();

// Trust proxy
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Slow down repeated requests
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // allow 50 requests per windowMs without delay
  delayMs: () => 500, // add 500ms delay per request after delayAfter
  validate: { delayMs: false } // disable warning
});

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(limiter);
app.use(speedLimiter);

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['sort', 'fields', 'page', 'limit', 'search']
}));

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
}));

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Add multer for form-data parsing (without file uploads)
const formUpload = multer();
app.use('/api/auth', formUpload.none()); // Handle form-data for auth routes

// Cookie parser
app.use(cookieParser());

// Compression middleware
app.use(compression());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Student Material Hub API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV
  });
});

// API Documentation
if (process.env.NODE_ENV === 'development') {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, swaggerOptions));
  console.log('📚 API Documentation available at /api-docs');
}

// Mount routers
app.use('/api/auth', auth);
app.use('/api/subjects', subjects);
app.use('/api/materials', materials);
app.use('/api/upload', upload);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
  🚀 Student Material Hub Backend Server is running!
  📡 Port: ${PORT}
  🌍 Environment: ${process.env.NODE_ENV}
  🔗 Health Check: http://localhost:${PORT}/api/health
  📚 API Base URL: http://localhost:${PORT}/api
  `);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received');
  console.log('🏥 Shutting down gracefully');
  server.close(() => {
    console.log('💀 Process terminated');
  });
});

module.exports = app;
