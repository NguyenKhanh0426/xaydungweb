import { ok } from '../utils/apiResponse.js';
import { authService } from '../services/auth.service.js';

export const authController = {
  register: async (req, res) => {
    const data = await authService.register(req.body);
    return ok(res, data, 'Register successfully', 201);
  },

  login: async (req, res) => {
    const data = await authService.login(req.body);
    return ok(res, data, 'Login successfully');
  },

  refreshToken: async (req, res) => {
    const data = authService.refreshToken(req.body.refreshToken);
    return ok(res, data, 'Token refreshed');
  }
};
