import { ok } from '../utils/apiResponse.js';
import { reminderService } from '../services/reminder.service.js';

export const reminderController = {
  getAll: async (req, res) => ok(res, await reminderService.getReminders(req.user.id), 'Study reminders fetched'),
  create: async (req, res) => ok(res, await reminderService.createReminder(req.user.id, req.body), 'Study reminder created', 201),
  update: async (req, res) => ok(res, await reminderService.updateReminder(req.user.id, Number(req.params.id), req.body), 'Study reminder updated'),
  delete: async (req, res) => ok(res, await reminderService.deleteReminder(req.user.id, Number(req.params.id)), 'Study reminder deleted')
};
