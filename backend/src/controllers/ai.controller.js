import { ok } from '../utils/apiResponse.js';
import { aiService } from '../services/ai.service.js';

export const aiController = {
  async assistant(req, res) {
    const { message, history } = req.body;
    const result = await aiService.askAssistant({ message, history });
    return ok(res, result, 'Assistant response generated');
  }
};
