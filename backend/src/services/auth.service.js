import bcrypt from 'bcryptjs';
import { ApiError } from '../utils/ApiError.js';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../config/jwt.js';
import { pool } from '../config/db.js';
import { userRepository } from '../repositories/user.repository.js';

export const authService = {
  async register(payload) {
    const existingUser = await userRepository.findByEmail(payload.email);
    if (existingUser) {
      throw new ApiError(409, 'Email already exists');
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const userId = await userRepository.createUser(
        { email: payload.email, passwordHash },
        connection
      );
      await userRepository.createProfile({ userId, fullName: payload.fullName }, connection);
      await userRepository.createStats(userId, connection);

      await connection.commit();
      return { id: userId, email: payload.email, role: 'learner' };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  },

  async login(payload) {
    const user = await userRepository.findByEmail(payload.email);
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const isValid = await bcrypt.compare(payload.password, user.password_hash);
    if (!isValid) {
      throw new ApiError(401, 'Invalid credentials');
    }

    const profile = await userRepository.findProfileByUserId(user.id);
    const tokenPayload = { id: user.id, email: user.email, role: user.role };

    return {
      accessToken: signAccessToken(tokenPayload),
      refreshToken: signRefreshToken(tokenPayload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: profile?.full_name || ''
      }
    };
  },

  refreshToken(refreshToken) {
    if (!refreshToken) {
      throw new ApiError(401, 'Refresh token is required');
    }

    const decoded = verifyRefreshToken(refreshToken);
    return {
      accessToken: signAccessToken({ id: decoded.id, email: decoded.email, role: decoded.role })
    };
  }
};
