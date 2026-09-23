// server/src/utils/ApiError.js

/**
 * Custom Operational Error Class
 * Distinguishes expected API client/operational errors from unhandled bugs
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Error message
   * @param {boolean} [isOperational=true] - Is this an expected operational error
   */
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.status = statusCode;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = 'Bad Request') {
    return new ApiError(400, msg);
  }

  static unauthorized(msg = 'Unauthorized') {
    return new ApiError(401, msg);
  }

  static forbidden(msg = 'Forbidden') {
    return new ApiError(403, msg);
  }

  static notFound(msg = 'Resource not found') {
    return new ApiError(404, msg);
  }

  static conflict(msg = 'Conflict') {
    return new ApiError(409, msg);
  }

  static tooManyRequests(msg = 'Too many requests, please try again later.') {
    return new ApiError(429, msg);
  }

  static serviceUnavailable(msg = 'Service unavailable') {
    return new ApiError(503, msg);
  }

  static internal(msg = 'Internal server error') {
    return new ApiError(500, msg, false);
  }
}

module.exports = ApiError;
