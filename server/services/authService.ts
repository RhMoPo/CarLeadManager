import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { storage } from '../storage';
import { logger } from '../utils/logger';

class AuthService {
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, 12);
  }

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }

  async authenticateUser(email: string, password: string) {
    const user = await storage.getUserByEmail(email);
    if (!user || !user.passwordHash || !user.isActive) {
      return null;
    }

    const isValid = await this.verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return null;
    }

    return user;
  }

  async sendMagicLink(email: string) {
    const user = await storage.getUserByEmail(email);
    if (!user || !user.isActive) {
      // Don't reveal if user exists
      logger.info('Magic link requested for non-existent user', { email });
      return;
    }

    if (user.role !== 'VA') {
      throw new Error('Magic links are only available for VAs');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await storage.createMagicToken({
      token,
      userId: user.id,
      expiresAt,
    });

    // TODO: Send email with magic link
    // For now, just log the link
    logger.info('Magic link generated', { 
      email, 
      token,
      link: `${process.env.BASE_URL || 'http://localhost:5000'}/login?token=${token}`
    });
  }

  async consumeMagicLink(token: string) {
    const magicToken = await storage.getMagicToken(token);
    if (!magicToken || magicToken.usedAt || magicToken.expiresAt < new Date()) {
      return null;
    }

    const user = await storage.getUser(magicToken.userId);
    if (!user || !user.isActive) {
      return null;
    }

    await storage.markMagicTokenUsed(token);
    return user;
  }
}

export const authService = new AuthService();
