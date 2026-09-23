// server/src/middleware/rateLimiter.js

/**
 * Creates an in-memory sliding-window rate limiting middleware.
 * 
 * @param {Object} options
 * @param {number} [options.windowMs=900000] - Time window in milliseconds (default: 15 minutes)
 * @param {number} [options.maxRequests=100] - Max allowed requests per window (default: 100)
 * @param {string} [options.message] - Error message when rate limit is exceeded
 */
function createRateLimiter(options = {}) {
  const windowMs = options.windowMs || 15 * 60 * 1000;
  const maxRequests = options.maxRequests || 100;
  const message = options.message || 'Too many requests, please try again later.';
  
  // IP -> Array of request timestamps
  const hits = new Map();

  // Periodic cleanup to avoid memory leaks
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [ip, timestamps] of hits.entries()) {
      const valid = timestamps.filter(time => now - time < windowMs);
      if (valid.length === 0) {
        hits.delete(ip);
      } else {
        hits.set(ip, valid);
      }
    }
  }, Math.max(windowMs, 60000));

  // Allow Node process to exit cleanly without keeping interval alive
  if (cleanupInterval.unref) {
    cleanupInterval.unref();
  }

  return function rateLimiterMiddleware(req, res, next) {
    // Extract real client IP even if behind proxies or load balancers
    const forwarded = req.headers['x-forwarded-for'];
    const rawIp = (typeof forwarded === 'string' && forwarded.length > 0)
      ? forwarded.split(',')[0].trim()
      : (req.socket && req.socket.remoteAddress) || req.ip || 'unknown';

    const now = Date.now();
    const timestamps = hits.get(rawIp) || [];
    const validTimestamps = timestamps.filter(time => now - time < windowMs);

    if (validTimestamps.length >= maxRequests) {
      const oldest = validTimestamps[0];
      const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
      
      res.set('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({ 
        message,
        retryAfter: retryAfterSeconds
      });
    }

    validTimestamps.push(now);
    hits.set(rawIp, validTimestamps);
    
    res.set('X-RateLimit-Limit', String(maxRequests));
    res.set('X-RateLimit-Remaining', String(Math.max(0, maxRequests - validTimestamps.length)));

    next();
  };
}

module.exports = {
  createRateLimiter
};
