import { ok } from '../utils/apiResponse.js';
import { skillService } from '../services/skill.service.js';

export const skillController = {
  create: async (req, res) => ok(res, await skillService.createSkillLog(req.user.id, req.body), 'Skill log created', 201),
  getAll: async (req, res) => ok(res, await skillService.getSkillLogs(req.user.id, { skillType: req.query.skillType || null }), 'Skill logs fetched'),
  delete: async (req, res) => ok(res, await skillService.deleteSkillLog(req.user.id, Number(req.params.id)), 'Skill log deleted')
};
