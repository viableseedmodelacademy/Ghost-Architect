import crypto from 'node:crypto';

// Encryption key should be stored securely in environment variables
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'ghost-architect-encryption-key-32ch';
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

// Derive a 32-byte key from the encryption key
function deriveKey(key: string): Buffer {
  return crypto.createHash('sha256').update(key).digest();
}

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = deriveKey(ENCRYPTION_KEY);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

export function decrypt(encryptedData: string): string {
  const parts = encryptedData.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted data format');
  }
  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const key = deriveKey(ENCRYPTION_KEY);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Simple hash function for file integrity
export function hashFile(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}