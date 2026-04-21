import { ok } from '../utils/apiResponse.js';
import { testService } from '../services/test.service.js';

export const testController = {
  generate: async (req, res) => ok(res, await testService.generateMiniTest(req.user.id, req.body), 'Mini test created', 201),
  submit: async (req, res) => ok(res, await testService.submitMiniTest(req.user.id, Number(req.params.attemptId), req.body), 'Mini test submitted'),
  recent: async (req, res) => ok(res, await testService.getRecentAttempts(req.user.id), 'Mini test attempts fetched'),
  history: async (req, res) => ok(
    res,
    await testService.getAttemptHistory(req.user.id, { date: req.query.date }),
    'Mini test history fetched'
  )
};
