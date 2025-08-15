import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-for-development';

export interface JWTPayload {
  id: string;
  email: string;
  googleId: string;
}

export class JWTService {
  static generateToken(user: User): string {
    const payload: JWTPayload = {
      id: user.id,
      email: user.email,
      googleId: user.googleId,
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
  }

  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, JWT_SECRET) as JWTPayload;
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static generateRefreshToken(user: User): string {
    const payload = {
      id: user.id,
      type: 'refresh',
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
  }
}