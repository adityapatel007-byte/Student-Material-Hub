const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Student Material Hub API',
      version: '1.0.0',
      description: 'A comprehensive API for a student material sharing platform',
      contact: {
        name: 'Student Material Hub Team',
        email: 'support@studenthub.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000/api',
        description: 'Development server'
      },
      {
        url: 'https://your-production-domain.com/api',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          required: ['name', 'email', 'password', 'university', 'course', 'semester'],
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 50,
              description: 'User full name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address'
            },
            university: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'University name'
            },
            course: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Course name'
            },
            semester: {
              type: 'integer',
              minimum: 1,
              maximum: 12,
              description: 'Current semester'
            },
            role: {
              type: 'string',
              enum: ['student', 'admin'],
              description: 'User role'
            },
            isVerified: {
              type: 'boolean',
              description: 'Email verification status'
            },
            accountStatus: {
              type: 'string',
              enum: ['active', 'suspended', 'pending'],
              description: 'Account status'
            },
            avatar: {
              type: 'object',
              properties: {
                public_id: { type: 'string' },
                url: { type: 'string' }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Subject: {
          type: 'object',
          required: ['name', 'code', 'department', 'semester'],
          properties: {
            _id: {
              type: 'string',
              description: 'Subject ID'
            },
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Subject name'
            },
            code: {
              type: 'string',
              minLength: 2,
              maxLength: 20,
              description: 'Subject code'
            },
            department: {
              type: 'string',
              minLength: 2,
              maxLength: 100,
              description: 'Department name'
            },
            semester: {
              type: 'integer',
              minimum: 1,
              maximum: 12,
              description: 'Semester number'
            },
            description: {
              type: 'string',
              maxLength: 500,
              description: 'Subject description'
            },
            createdBy: {
              type: 'string',
              description: 'User ID who created the subject'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Material: {
          type: 'object',
          required: ['title', 'subject', 'materialType'],
          properties: {
            _id: {
              type: 'string',
              description: 'Material ID'
            },
            title: {
              type: 'string',
              minLength: 3,
              maxLength: 200,
              description: 'Material title'
            },
            description: {
              type: 'string',
              maxLength: 1000,
              description: 'Material description'
            },
            subject: {
              type: 'string',
              description: 'Subject ID reference'
            },
            materialType: {
              type: 'string',
              enum: ['notes', 'assignment', 'presentation', 'book', 'paper', 'other'],
              description: 'Type of material'
            },
            difficulty: {
              type: 'string',
              enum: ['beginner', 'intermediate', 'advanced'],
              description: 'Difficulty level'
            },
            file: {
              type: 'object',
              properties: {
                public_id: { type: 'string' },
                url: { type: 'string' },
                filename: { type: 'string' },
                size: { type: 'number' },
                mimetype: { type: 'string' }
              }
            },
            uploadedBy: {
              type: 'string',
              description: 'User ID who uploaded the material'
            },
            tags: {
              type: 'array',
              items: { type: 'string' },
              maxItems: 10,
              description: 'Material tags'
            },
            likes: {
              type: 'array',
              items: { type: 'string' },
              description: 'User IDs who liked the material'
            },
            downloads: {
              type: 'number',
              default: 0,
              description: 'Download count'
            },
            academicYear: {
              type: 'string',
              pattern: '^\\d{4}-\\d{2}$',
              description: 'Academic year (e.g., 2024-25)'
            },
            semester: {
              type: 'integer',
              minimum: 1,
              maximum: 12,
              description: 'Semester number'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false
            },
            message: {
              type: 'string',
              description: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                  value: { type: 'string' }
                }
              }
            }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true
            },
            message: {
              type: 'string',
              description: 'Success message'
            },
            data: {
              type: 'object',
              description: 'Response data'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      },
      {
        cookieAuth: []
      }
    ]
  },
  apis: ['./routes/*.js', './controllers/*.js'] // Path to the API docs
};

const specs = swaggerJsdoc(options);

const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .info .title { color: #007bff }
  `,
  customSiteTitle: 'Student Material Hub API Documentation',
  customfavIcon: '/favicon.ico'
};

module.exports = {
  specs,
  swaggerUi,
  swaggerOptions
};