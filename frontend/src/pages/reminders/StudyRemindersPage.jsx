import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { reminderService } from '../../services/reminderService';
import { useLanguage } from '../../hooks/useLanguage';

const weekdays = [
  { value: 'Mon', vi: 'T2', en: 'Mon' },
  { value: 'Tue', vi: 'T3', en: 'Tue' },
  { value: 'Wed', vi: 'T4', en: 'Wed' },
  { value: 'Thu', vi: 'T5', en: 'Thu' },
  { value: 'Fri', vi: 'T6', en: 'Fri' },
  { value: 'Sat', vi: 'T7', en: 'Sat' },
  { value: 'Sun', vi: 'CN', en: 'Sun' }
];

const initialForm = {
  reminderTime: '20:00',
  daysOfWeek: ['Mon', 'Wed', 'Fri'],
  channel: 'in_app',
  isEnabled: true,
  message: ''
};

const channelLabel = (channel, isVi) => {
  if (channel === 'email') return 'Email';
  return isVi ? 'Trong app' : 'In app';
};

export default function StudyRemindersPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [reminders, setReminders] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadReminders = async () => {
    setLoading(true);
    try {
      const data = await reminderService.getReminders();
      setReminders(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReminders();
  }, []);

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((item) => item !== day)
        : [...prev.daysOfWeek, day]
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      if (editingId) {
        await reminderService.updateReminder(editingId, form);
        setMessage(isVi ? 'Đã cập nhật lịch nhắc học.' : 'Study reminder updated.');
      } else {
        await reminderService.createReminder(form);
        setMessage(isVi ? 'Đã tạo lịch nhắc học.' : 'Study reminder created.');
      }
      resetForm();
      await loadReminders();
    } catch (error) {
      setMessage(error.response?.data?.error?.detail || error.response?.data?.message || (isVi ? 'Lưu lịch nhắc thất bại' : 'Failed to save reminder'));
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (reminder) => {
    setEditingId(reminder.id);
    setForm({
      reminderTime: reminder.reminderTime,
      daysOfWeek: reminder.daysOfWeek,
      channel: reminder.channel,
      isEnabled: reminder.isEnabled,
      message: reminder.message || ''
    });
  };

  const handleToggleEnabled = async (reminder) => {
    try {
      await reminderService.updateReminder(reminder.id, { ...reminder, isEnabled: !reminder.isEnabled });
      setMessage(isVi ? 'Đã cập nhật trạng thái nhắc học.' : 'Reminder status updated.');
      await loadReminders();
    } catch (error) {
      setMessage(error.response?.data?.message || (isVi ? 'Không thể cập nhật nhắc học' : 'Unable to update reminder'));
    }
  };

  const handleDelete = async (reminderId) => {
    const confirmed = window.confirm(isVi ? 'Bạn có chắc muốn xóa lịch nhắc này không?' : 'Are you sure you want to delete this reminder?');
    if (!confirmed) return;
    try {
      await reminderService.deleteReminder(reminderId);
      setMessage(isVi ? 'Đã xóa lịch nhắc.' : 'Reminder deleted.');
      await loadReminders();
    } catch (error) {
      setMessage(error.response?.data?.message || (isVi ? 'Xóa nhắc học thất bại' : 'Failed to delete reminder'));
    }
  };

  return (
    <DashboardLayout>
      <div className="reminder-page">
        <div className="app-page-intro mb-4">
          <span className="dashboard-eyebrow">{isVi ? 'Thói quen học' : 'Study routine'}</span>
          <h2 className="dashboard-page-title mb-2">{isVi ? 'Nhắc học' : 'Study reminders'}</h2>
          <p className="dashboard-muted mb-0">{isVi ? 'Đặt giờ và ngày để duy trì nhịp ôn tập — giao diện gọn, dễ chỉnh sửa.' : 'Set times and days to keep a steady rhythm — clear layout, easy to edit.'}</p>
        </div>

        {message ? <div className="alert alert-info auth-alert py-2 mb-4">{message}</div> : null}

        <div className="row g-4">
          <div className="col-12 col-xl-5">
            <div className="reminder-panel reminder-panel--form h-100">
              <div className="reminder-panel-header">
                <h3 className="mb-1 fs-4 fw-bold">{editingId ? (isVi ? 'Chỉnh sửa lịch nhắc' : 'Edit reminder') : (isVi ? 'Tạo lịch nhắc mới' : 'New reminder')}</h3>
                <p className="text-secondary small mb-0">{isVi ? 'Chọn giờ, ngày trong tuần và kênh thông báo.' : 'Pick time, weekdays, and where to notify you.'}</p>
              </div>
              <div className="reminder-panel-body">
                <form className="row g-0" onSubmit={handleSubmit}>
                  <div className="reminder-form-section col-12">
                    <div className="row g-3">
                      <div className="col-12 col-sm-6">
                        <label className="auth-label">{isVi ? 'Giờ nhắc' : 'Reminder time'}</label>
                        <input type="time" className="form-control auth-input" value={form.reminderTime} onChange={(e) => setForm({ ...form, reminderTime: e.target.value })} />
                      </div>
                      <div className="col-12 col-sm-6">
                        <label className="auth-label">{isVi ? 'Kênh nhắc' : 'Channel'}</label>
                        <select className="form-select auth-input" value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                          <option value="in_app">{isVi ? 'Trong ứng dụng' : 'In app'}</option>
                          <option value="email">Email</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="reminder-form-section col-12">
                    <label className="auth-label d-block mb-2">{isVi ? 'Ngày trong tuần' : 'Weekdays'}</label>
                    <div className="reminder-day-row">
                      {weekdays.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          className={`reminder-day-btn ${form.daysOfWeek.includes(day.value) ? 'is-active' : ''}`}
                          onClick={() => toggleDay(day.value)}
                        >
                          {isVi ? day.vi : day.en}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="reminder-form-section col-12">
                    <label className="auth-label">{isVi ? 'Nội dung nhắc (tuỳ chọn)' : 'Reminder note (optional)'}</label>
                    <textarea
                      className="form-control profile-textarea"
                      rows="3"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder={isVi ? 'Ví dụ: Ôn flashcard 15 phút, ghi 1 skill log.' : 'e.g. Review flashcards 15 min, log one skill.'}
                    />
                  </div>

                  <div className="reminder-form-section col-12">
                    <label className="reminder-toggle-pill mb-0 w-100">
                      <input type="checkbox" checked={form.isEnabled} onChange={(e) => setForm({ ...form, isEnabled: e.target.checked })} />
                      <span className="fw-semibold">{isVi ? 'Bật lịch nhắc này ngay sau khi lưu' : 'Enable this reminder after saving'}</span>
                    </label>
                  </div>

                  <div className="reminder-form-section col-12 pt-2">
                    <div className="d-flex flex-wrap gap-2">
                      <button className="btn dashboard-primary-btn px-4" type="submit" disabled={saving}>
                        {saving ? (isVi ? 'Đang lưu...' : 'Saving...') : editingId ? (isVi ? 'Cập nhật' : 'Update') : (isVi ? 'Tạo lịch nhắc' : 'Create')}
                      </button>
                      {editingId ? (
                        <button type="button" className="btn btn-outline-secondary rounded-3 fw-semibold" onClick={resetForm}>
                          {isVi ? 'Hủy & tạo mới' : 'Cancel & new'}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-7">
            <div className="reminder-panel h-100">
              <div className="reminder-list-header">
                <div>
                  <span className="dashboard-eyebrow">{isVi ? 'Đã lưu' : 'Saved'}</span>
                  <h3 className="mb-1 fs-4 fw-bold">{isVi ? 'Lịch nhắc của bạn' : 'Your reminders'}</h3>
                  <p className="text-secondary small mb-0">{isVi ? 'Bật/tắt nhanh, chỉnh sửa hoặc xóa khi không cần.' : 'Enable, edit, or remove anytime.'}</p>
                </div>
                <span className="reminder-count-badge">{reminders.length}</span>
              </div>

              <div className="reminder-list-body">
                {loading ? (
                  <p className="text-secondary mb-0 py-3">{isVi ? 'Đang tải...' : 'Loading...'}</p>
                ) : reminders.length === 0 ? (
                  <div className="reminder-empty">
                    <div className="reminder-empty-icon" aria-hidden>📅</div>
                    <h5 className="fw-bold mb-2">{isVi ? 'Chưa có lịch nhắc' : 'No reminders yet'}</h5>
                    <p className="text-secondary mb-0 small">{isVi ? 'Thêm một lịch ở cột bên trái để bắt đầu thói quen học đều.' : 'Add a schedule on the left to build your habit.'}</p>
                  </div>
                ) : (
                  <div className="d-grid gap-3">
                    {reminders.map((reminder) => (
                      <div key={reminder.id} className={`reminder-card ${reminder.isEnabled ? 'reminder-card--on' : 'reminder-card--off'}`}>
                        <div className="reminder-card__rail" aria-hidden />
                        <div className="reminder-card__inner">
                          <div className="flex-grow-1 min-w-0">
                            <div className="reminder-card__time">
                              <span className="reminder-card__time-icon" aria-hidden>🕐</span>
                              <div>
                                <div className="reminder-card__time-text">{reminder.reminderTime}</div>
                                <div className="reminder-card__chips">
                                  {reminder.daysOfWeek.map((day) => (
                                    <span key={day} className="reminder-mini-chip reminder-mini-chip--accent">
                                      {weekdays.find((w) => w.value === day)?.[isVi ? 'vi' : 'en'] || day}
                                    </span>
                                  ))}
                                  <span className="reminder-mini-chip">{channelLabel(reminder.channel, isVi)}</span>
                                  <span className={`reminder-mini-chip ${reminder.isEnabled ? 'reminder-mini-chip--accent' : 'reminder-mini-chip--muted'}`}>
                                    {reminder.isEnabled ? (isVi ? 'Đang bật' : 'On') : (isVi ? 'Đang tắt' : 'Off')}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <p className="reminder-card__message">
                              {reminder.message || (isVi ? '— Không ghi chú thêm —' : '— No extra note —')}
                            </p>
                          </div>
                          <div className="reminder-card__actions">
                            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => handleToggleEnabled(reminder)}>
                              {reminder.isEnabled ? (isVi ? 'Tắt' : 'Off') : (isVi ? 'Bật' : 'On')}
                            </button>
                            <button type="button" className="btn btn-sm dashboard-primary-btn" onClick={() => handleEdit(reminder)}>
                              {isVi ? 'Sửa' : 'Edit'}
                            </button>
                            <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(reminder.id)}>
                              {isVi ? 'Xóa' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
