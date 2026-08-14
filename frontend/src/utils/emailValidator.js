// Strict Email Format and Domain Validator
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return { isValid: false, message: 'Email address is required.' };
  }

  const trimmed = email.trim();
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(trimmed)) {
    return { isValid: false, message: 'Please enter a valid email format (e.g. name@gmail.com).' };
  }

  const parts = trimmed.split('@');
  if (parts.length !== 2) {
    return { isValid: false, message: 'Email must contain exactly one "@" symbol.' };
  }

  const domain = parts[1].toLowerCase();

  // Known typo domains
  const typoMap = {
    'gmai.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'hotmai.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
  };

  if (typoMap[domain]) {
    return { isValid: false, message: `Did you mean ${parts[0]}@${typoMap[domain]}? Please check your domain spelling.` };
  }

  // TLD check
  const domainParts = domain.split('.');
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2 || !/^[a-z]+$/i.test(tld)) {
    return { isValid: false, message: 'Invalid domain extension in email address.' };
  }

  return { isValid: true, message: '' };
};
