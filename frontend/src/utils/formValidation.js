// Form Validation Utility

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Please enter a valid email address';
  return null;
};

export const validatePassword = (password, strict = false) => {
  if (!password) return 'Password is required';
  if (password.length < 6) return 'Password must be at least 6 characters';
  
  // Strict validation (optional - for better security)
  if (strict) {
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number';
  }
  
  return null;
};

export const validateName = (name) => {
  if (!name) return 'Name is required';
  if (name.length < 2) return 'Name must be at least 2 characters';
  if (!/^[a-zA-Z\s]+$/.test(name)) return 'Name can only contain letters and spaces';
  return null;
};

export const validateDate = (date, fieldName = 'Date') => {
  if (!date) return `${fieldName} is required`;
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDate < today) return `${fieldName} cannot be in the past`;
  return null;
};

export const validateDateRange = (startDate, endDate) => {
  if (!startDate) return 'Start date is required';
  if (!endDate) return 'End date is required';
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (start < today) return 'Start date cannot be in the past';
  if (end < start) return 'End date must be after start date';
  if (end.getTime() === start.getTime()) return 'End date must be different from start date';
  
  return null;
};

export const validateRequired = (value, fieldName = 'Field') => {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
};

export const validateForm = (fields) => {
  const errors = {};
  let isValid = true;

  Object.keys(fields).forEach(key => {
    const { value, validator, fieldName } = fields[key];
    const error = validator(value, fieldName);
    if (error) {
      errors[key] = error;
      isValid = false;
    }
  });

  return { isValid, errors };
};
