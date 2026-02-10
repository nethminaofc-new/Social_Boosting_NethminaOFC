/**
 * Generates a random 15-character alphanumeric Order ID.
 * Allowed characters: A-Z, a-z, 0-9.
 * No symbols.
 */
export const generateOrderId = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 15; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Validates a WhatsApp number.
 * Rules: Numbers only, exactly 11 digits.
 * Example: 94712345678
 */
export const validateWhatsAppNumber = (num: string): boolean => {
  const regex = /^\d{11}$/;
  return regex.test(num);
};

/**
 * Generates a Customer ID.
 * Format: CUS + 12 random alphanumeric characters (Total 15 chars).
 * Characters: Uppercase letters (A–Z), Lowercase letters (a–z), Numbers (0–9).
 * Example: CUSa9K2X7mP0QZ4
 */
export const generateCustomerId = (): string => {
  const prefix = 'CUS';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let randomPart = '';
  for (let i = 0; i < 12; i++) {
    randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return prefix + randomPart;
};
