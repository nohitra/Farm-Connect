/**
 * Validates 10-digit Indian Phone Numbers
 */
export const validatePhone = (phone) => {
  if (!phone) return { isValid: false, message: 'Phone number is required.' };
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return {
      isValid: false,
      message: 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.',
    };
  }
  return { isValid: true, cleanPhone };
};

/**
 * Calculates Password Strength score (0 to 4)
 */
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: 'Empty', color: '#cbd5e1' };
  
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: 'Weak (use 8+ chars, numbers & symbols)', color: '#ef4444' };
  if (score === 2) return { score: 2, label: 'Medium (add uppercase & symbols)', color: '#f59e0b' };
  if (score === 3) return { score: 3, label: 'Strong', color: '#10b981' };
  return { score: 4, label: 'Very Strong 💪', color: '#059669' };
};
