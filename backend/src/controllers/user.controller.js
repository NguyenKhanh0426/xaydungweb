import { ok } from '../utils/apiResponse.js';
import { userService } from '../services/user.service.js';
import { goalService } from '../services/goal.service.js';

export const userController = {
  me: async (req, res) => {
    const data = await userService.getMe(req.user.id);
    return ok(res, data, 'Profile fetched');
  },

  updateMe: async (req, res) => {
    const data = await userService.updateMe(req.user.id, req.body);
    return ok(res, data, 'Profile updated');
  },

  getGoals: async (req, res) => {
    const data = await goalService.getGoals(req.user.id);
    return ok(res, data, 'Goals fetched');
  },

  createGoal: async (req, res) => {
    const data = await goalService.createGoal(req.user.id, req.body);
    return ok(res, data, 'Goal created', 201);
  }
};
