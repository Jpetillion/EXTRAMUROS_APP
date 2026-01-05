export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password) => {
  // At least 8 characters
  return password && password.length >= 8;
};

export const validateRequired = (fields, data) => {
  const errors = {};

  for (const field of fields) {
    if (!data[field] || data[field].toString().trim() === '') {
      errors[field] = `${field} is required`;
    }
  }

  return Object.keys(errors).length > 0 ? errors : null;
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  // Basic XSS prevention
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
