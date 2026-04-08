import { ok } from '../utils/apiResponse.js';
import { dashboardService } from '../services/dashboard.service.js';

export const dashboardController = {
  overview: async (req, res) => {
    const data = await dashboardService.getOverview(req.user.id);
    return ok(res, data, 'Dashboard overview fetched');
  }
};
