import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export class EncryptionService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly ALGORITHM = 'aes-256-gcm';
  private static readonly SECRET_KEY = process.env.ENCRYPTION_SECRET_KEY || 'default-secret-key-change-in-production';

  // Password hashing methods
  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async generateSecureToken(): Promise<string> {
    return crypto.randomBytes(32).toString('hex');
  }

  static async hashSecureData(data: string): Promise<string> {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  // Symmetric encryption methods for API keys
  private getKey(): Buffer {
    return crypto.scryptSync(EncryptionService.SECRET_KEY, 'salt', 32);
  }

  encrypt(text: string): string {
    const key = this.getKey();
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(EncryptionService.ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  decrypt(encryptedText: string): string {
    try {
      const key = this.getKey();
      const parts = encryptedText.split(':');
      
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted format');
      }
      
      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];
      
      const decipher = crypto.createDecipheriv(EncryptionService.ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);
      
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt data');
    }
  }

  // Generate encryption key for new installations
  static generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}