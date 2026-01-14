/**
 * Utility functions for transforming data between snake_case (DB) and camelCase (API/Frontend)
 */

/**
 * Convert snake_case string to camelCase
 * @param {string} str - The snake_case string
 * @returns {string} The camelCase string
 */
export function snakeToCamel(str) {
  return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

/**
 * Convert camelCase string to snake_case
 * @param {string} str - The camelCase string
 * @returns {string} The snake_case string
 */
export function camelToSnake(str) {
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Transform object keys from snake_case to camelCase
 * @param {Object|Array} data - The data to transform
 * @returns {Object|Array} The transformed data with camelCase keys
 */
export function toCamelCase(data) {
  if (Array.isArray(data)) {
    return data.map(item => toCamelCase(item));
  }

  if (data === null || typeof data !== 'object') {
    return data;
  }

  // Handle Date objects
  if (data instanceof Date) {
    return data;
  }

  const result = {};

  for (const [key, value] of Object.entries(data)) {
    const camelKey = snakeToCamel(key);

    // Recursively transform nested objects/arrays
    if (Array.isArray(value)) {
      result[camelKey] = value.map(item => toCamelCase(item));
    } else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      result[camelKey] = toCamelCase(value);
    } else {
      result[camelKey] = value;
    }
  }

  return result;
}

/**
 * Transform object keys from camelCase to snake_case
 * @param {Object|Array} data - The data to transform
 * @returns {Object|Array} The transformed data with snake_case keys
 */
export function toSnakeCase(data) {
  if (Array.isArray(data)) {
    return data.map(item => toSnakeCase(item));
  }

  if (data === null || typeof data !== 'object') {
    return data;
  }

  // Handle Date objects
  if (data instanceof Date) {
    return data;
  }

  const result = {};

  for (const [key, value] of Object.entries(data)) {
    const snakeKey = camelToSnake(key);

    // Recursively transform nested objects/arrays
    if (Array.isArray(value)) {
      result[snakeKey] = value.map(item => toSnakeCase(item));
    } else if (value !== null && typeof value === 'object' && !(value instanceof Date)) {
      result[snakeKey] = toSnakeCase(value);
    } else {
      result[snakeKey] = value;
    }
  }

  return result;
}

/**
 * Middleware to automatically transform API responses to camelCase
 */
export function transformResponseMiddleware(req, res, next) {
  // Skip transformation for binary endpoints (image, audio, video)
  if (req.path.includes('/image') || req.path.includes('/audio') || req.path.includes('/video')) {
    return next();
  }

  const originalJson = res.json.bind(res);

  res.json = function(data) {
    // Transform data to camelCase before sending
    const transformedData = toCamelCase(data);
    return originalJson(transformedData);
  };

  next();
}

/**
 * Middleware to automatically transform request body from camelCase to snake_case
 */
export function transformRequestMiddleware(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = toSnakeCase(req.body);
  }

  next();
}
