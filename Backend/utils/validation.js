const validator = require('validator');

/**
 * Custom validation utilities
 */
class ValidationUtils {
  
  /**
   * Validate email format
   * @param {string} email - Email to validate
   * @returns {boolean} - Is valid email
   */
  static isValidEmail(email) {
    return validator.isEmail(email) && email.length <= 254;
  }

  /**
   * Validate password strength
   * @param {string} password - Password to validate
   * @returns {object} - Validation result with errors
   */
  static validatePassword(password) {
    const errors = [];
    
    if (!password || password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (password && password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }
    
    if (password && !/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (password && !/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (password && !/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (password && !/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate university name
   * @param {string} university - University name to validate
   * @returns {boolean} - Is valid university name
   */
  static isValidUniversity(university) {
    return university && 
           typeof university === 'string' && 
           university.trim().length >= 2 && 
           university.trim().length <= 100 &&
           /^[a-zA-Z\s\-\.]+$/.test(university.trim());
  }

  /**
   * Validate course name
   * @param {string} course - Course name to validate
   * @returns {boolean} - Is valid course name
   */
  static isValidCourse(course) {
    return course && 
           typeof course === 'string' && 
           course.trim().length >= 2 && 
           course.trim().length <= 100;
  }

  /**
   * Validate semester number
   * @param {number} semester - Semester to validate
   * @returns {boolean} - Is valid semester
   */
  static isValidSemester(semester) {
    return Number.isInteger(semester) && semester >= 1 && semester <= 12;
  }

  /**
   * Validate user name
   * @param {string} name - Name to validate
   * @returns {boolean} - Is valid name
   */
  static isValidName(name) {
    return name && 
           typeof name === 'string' && 
           name.trim().length >= 2 && 
           name.trim().length <= 50 &&
           /^[a-zA-Z\s]+$/.test(name.trim());
  }

  /**
   * Validate material title
   * @param {string} title - Title to validate
   * @returns {boolean} - Is valid title
   */
  static isValidTitle(title) {
    return title && 
           typeof title === 'string' && 
           title.trim().length >= 3 && 
           title.trim().length <= 200;
  }

  /**
   * Validate material description
   * @param {string} description - Description to validate
   * @returns {boolean} - Is valid description
   */
  static isValidDescription(description) {
    return !description || 
           (typeof description === 'string' && 
            description.trim().length <= 1000);
  }

  /**
   * Validate tags array
   * @param {Array} tags - Tags to validate
   * @returns {boolean} - Is valid tags array
   */
  static isValidTags(tags) {
    if (!Array.isArray(tags)) return false;
    if (tags.length > 10) return false;
    
    return tags.every(tag => 
      typeof tag === 'string' && 
      tag.trim().length >= 2 && 
      tag.trim().length <= 30 &&
      /^[a-zA-Z0-9\-]+$/.test(tag.trim())
    );
  }

  /**
   * Validate MongoDB ObjectId
   * @param {string} id - ID to validate
   * @returns {boolean} - Is valid ObjectId
   */
  static isValidObjectId(id) {
    return validator.isMongoId(id);
  }

  /**
   * Sanitize string input
   * @param {string} input - Input to sanitize
   * @returns {string} - Sanitized input
   */
  static sanitizeString(input) {
    if (typeof input !== 'string') return '';
    return validator.escape(input.trim());
  }

  /**
   * Validate file upload
   * @param {object} file - File object to validate
   * @param {object} options - Validation options
   * @returns {object} - Validation result
   */
  static validateFile(file, options = {}) {
    const errors = [];
    
    if (!file) {
      errors.push('No file provided');
      return { isValid: false, errors };
    }

    // Check file size
    const maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB default
    if (file.size > maxSize) {
      errors.push(`File size must be less than ${maxSize / (1024 * 1024)}MB`);
    }

    // Check file type
    const allowedTypes = options.allowedTypes || [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];

    if (!allowedTypes.includes(file.mimetype)) {
      errors.push('File type not allowed');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate search query
   * @param {string} query - Search query to validate
   * @returns {boolean} - Is valid search query
   */
  static isValidSearchQuery(query) {
    return query && 
           typeof query === 'string' && 
           query.trim().length >= 1 && 
           query.trim().length <= 100;
  }

  /**
   * Validate pagination parameters
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   * @returns {object} - Validated pagination parameters
   */
  static validatePagination(page, limit) {
    const validatedPage = Math.max(1, parseInt(page) || 1);
    const validatedLimit = Math.min(100, Math.max(1, parseInt(limit) || 10));
    
    return {
      page: validatedPage,
      limit: validatedLimit,
      skip: (validatedPage - 1) * validatedLimit
    };
  }
}

module.exports = ValidationUtils;