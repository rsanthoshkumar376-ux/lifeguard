export const validatePhone = (phone: string): boolean => {
  // Indian phone validation (+91 followed by 10 digits, or just 10 digits)
  const phoneRegex = /^(?:(?:\+|0{0,2})91(\s*[\-]\s*)?|[0]?)?[789]\d{9}$/;
  return phoneRegex.test(phone);
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateBloodGroup = (bg: string): boolean => {
  const validGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  return validGroups.includes(bg);
};

export const validateName = (name: string): boolean => {
  const nameRegex = /^[a-zA-Z\s]{2,}$/;
  return nameRegex.test(name.trim());
};

export const validateOTP = (otp: string): boolean => {
  const otpRegex = /^\d{6}$/;
  return otpRegex.test(otp);
};

export const sanitizeInput = (input: string): string => {
  if (!input) return input;
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

export const validateFileUpload = (file: File, maxSizeMB: number, allowedTypes: string[]): { isValid: boolean, error?: string } => {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  const fileSizeMB = file.size / (1024 * 1024);
  if (fileSizeMB > maxSizeMB) {
    return { isValid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
  }

  if (!allowedTypes.includes(file.type)) {
    return { isValid: false, error: `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}` };
  }

  return { isValid: true };
};
