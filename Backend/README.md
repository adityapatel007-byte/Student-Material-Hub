# Student Material Hub - Backend API

A comprehensive backend API for a student material sharing platform built with Node.js, Express.js, and MongoDB.

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (Student/Admin)
  - Secure password hashing with bcrypt

- **Subject Management**
  - CRUD operations for subjects
  - Search and filter by department, semester
  - Admin-only subject creation/modification

- **Material Sharing System**
  - Upload various file types (PDF, DOC, PPT, images)
  - Cloudinary integration for file storage
  - Material categorization by type and difficulty
  - Like/bookmark functionality
  - Download tracking

- **Advanced Features**
  - File upload with validation
  - Image optimization for avatars
  - Rate limiting and security middleware
  - Comprehensive error handling
  - Search functionality with text indexing

## 📁 Project Structure

```
Backend/
├── config/
│   ├── database.js          # MongoDB connection
│   └── cloudinary.js        # Cloudinary configuration
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── materialController.js # Material management
│   ├── subjectController.js # Subject management
│   └── uploadController.js  # File upload handling
├── middleware/
│   ├── auth.js             # Authentication middleware
│   ├── error.js            # Error handling
│   └── upload.js           # Multer configuration
├── models/
│   ├── User.js             # User schema
│   ├── Subject.js          # Subject schema
│   └── Material.js         # Material schema
├── routes/
│   ├── auth.js             # Authentication routes
│   ├── subjects.js         # Subject routes
│   ├── materials.js        # Material routes
│   └── upload.js           # Upload routes
├── utils/
│   └── auth.js             # Authentication utilities
├── uploads/                # Temporary file storage
├── .env.example           # Environment variables template
├── .gitignore
├── package.json
└── server.js              # Main server file
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Cloudinary account (for file storage)

### 1. Clone and Install Dependencies

```powershell
# Navigate to the Backend folder
cd "c:\Users\adity\OneDrive\Desktop\SEM5\Student Material Hub\Backend"

# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file from the template:

```powershell
copy .env.example .env
```

Update the `.env` file with your actual values:

```env
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://localhost:27017/student-material-hub

# JWT Secret (Use a strong secret in production)
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Client URL
CLIENT_URL=http://localhost:3000
```

### 3. Start the Server

```powershell
# Development mode (with nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## 📡 API Endpoints

### Authentication Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - User login
- `GET /me` - Get current user profile
- `PUT /updatedetails` - Update user details
- `PUT /updatepassword` - Update password
- `GET /logout` - Logout user

### Subject Routes (`/api/subjects`)
- `GET /` - Get all subjects (with filters)
- `GET /:id` - Get single subject
- `POST /` - Create subject (Admin only)
- `PUT /:id` - Update subject (Admin only)
- `DELETE /:id` - Delete subject (Admin only)

### Material Routes (`/api/materials`)
- `GET /` - Get all materials (with filters)
- `GET /:id` - Get single material
- `POST /` - Upload new material
- `PUT /:id` - Update material
- `DELETE /:id` - Delete material
- `PUT /:id/like` - Like/unlike material
- `GET /:id/download` - Download material

### Upload Routes (`/api/upload`)
- `POST /material` - Upload material file
- `POST /avatar` - Upload user avatar

## 🔧 Usage Examples

### Register a User
```javascript
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "university": "ABC University",
  "course": "Computer Science",
  "semester": 5
}
```

### Upload Material
```javascript
POST /api/upload/material
// Form-data with file and material details
{
  "file": [file],
  "title": "Data Structures Notes",
  "description": "Comprehensive notes on data structures",
  "subject": "subject_id_here",
  "materialType": "notes",
  "difficulty": "intermediate",
  "academicYear": "2024-25",
  "semester": 5,
  "tags": ["data-structures", "algorithms", "programming"]
}
```

## 🚀 Next Steps

### To complete the MERN application, you need to:

1. **Install Dependencies**
   ```powershell
   npm install
   ```

2. **Set up MongoDB**
   - Install MongoDB locally OR use MongoDB Atlas
   - Update MONGODB_URI in `.env`

3. **Configure Cloudinary**
   - Create a free Cloudinary account
   - Get your credentials and update `.env`

4. **Start Development**
   ```powershell
   npm run dev
   ```

5. **Create Frontend (React)**
   - Create a React app in a separate folder
   - Connect to this backend API
   - Build user interface for material sharing

6. **Test the API**
   - Use Postman or Thunder Client
   - Test all endpoints
   - Verify file uploads work

## 🔒 Security Features

- JWT authentication with httpOnly cookies
- Password hashing with bcryptjs
- Rate limiting to prevent abuse
- File type validation for uploads
- CORS configuration
- Helmet for security headers
- Input validation with express-validator

## 📝 Environment Variables Required

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `CLOUDINARY_*` - Cloudinary credentials for file storage
- `CLIENT_URL` - Frontend application URL

The backend is now complete and ready to use! 🎉
