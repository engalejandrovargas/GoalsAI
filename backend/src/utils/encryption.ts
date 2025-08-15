import bcrypt from 'bcryptjs';

export class EncryptionService {
  private static readonly SALT_ROUNDS = 12;

  static async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, this.SALT_ROUNDS);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async generateSecureToken(): Promise<string> {
    const crypto = await import('crypto');
    return crypto.randomBytes(32).toString('hex');
  }

  static async hashSecureData(data: string): Promise<string> {
    const crypto = await import('crypto');
    return crypto.createHash('sha256').update(data).digest('hex');
  }
}