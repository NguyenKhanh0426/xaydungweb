import axiosClient from './axiosClient';

export const reminderService = {
  async getReminders() {
    const { data } = await axiosClient.get('/study-reminders');
    return data.data;
  },
  async createReminder(payload) {
    const { data } = await axiosClient.post('/study-reminders', payload);
    return data.data;
  },
  async updateReminder(id, payload) {
    const { data } = await axiosClient.put(`/study-reminders/${id}`, payload);
    return data.data;
  },
  async deleteReminder(id) {
    const { data } = await axiosClient.delete(`/study-reminders/${id}`);
    return data.data;
  }
};
