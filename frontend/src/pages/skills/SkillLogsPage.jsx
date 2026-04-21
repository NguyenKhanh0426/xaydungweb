import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { skillService } from '../../services/skillService';
import { useLanguage } from '../../hooks/useLanguage';

const skillOptions = ['listening', 'speaking', 'reading', 'writing'];

export default function SkillLogsPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [data, setData] = useState({ logs: [], summary: { totalMinutes: 0, totalRecords: 0, bySkill: {} } });
  const [filter, setFilter] = useState('');
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    skillType: 'listening',
    title: '',
    description: '',
    studyMinutes: 30,
    score: '',
    studiedAt: new Date().toISOString().slice(0, 16)
  });

  const loadLogs = async (nextFilter = filter) => {
    setLoading(true);
    try {
      const response = await skillService.getSkillLogs(nextFilter);
      setData(response);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs(filter);
  }, [filter]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await skillService.createSkillLog({
        ...form,
        studyMinutes: Number(form.studyMinutes),
        score: form.score === '' ? null : Number(form.score)
      });
      setMessage(isVi ? 'Đã lưu nhật ký học kỹ năng.' : 'Skill log saved.');
      setForm({ ...form, title: '', description: '', studyMinutes: 30, score: '' });
      await loadLogs(filter);
    } catch (error) {
      setMessage(error.response?.data?.error?.detail || error.response?.data?.message || (isVi ? 'Lưu nhật ký thất bại' : 'Failed to save skill log'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(isVi ? 'Bạn có chắc muốn xóa nhật ký này không?' : 'Are you sure you want to delete this log?');
    if (!confirmed) return;
    try {
      await skillService.deleteSkillLog(id);
      setMessage(isVi ? 'Đã xóa nhật ký kỹ năng.' : 'Skill log deleted.');
      await loadLogs(filter);
    } catch (error) {
      setMessage(error.response?.data?.message || (isVi ? 'Xóa nhật ký thất bại' : 'Failed to delete skill log'));
    }
  };

  return (
    <DashboardLayout>
      <div className="skill-logs-page">
        <div className="app-page-intro mb-4">
          <span className="dashboard-eyebrow">{isVi ? '4 kỹ năng' : '4 skills'}</span>
          <h2 className="dashboard-page-title mb-2">{isVi ? 'Nhật ký kỹ năng' : 'Skill study log'}</h2>
          <p className="dashboard-muted mb-0">{isVi ? 'Ghi lại thời gian học và tự đánh giá sau mỗi buổi — xem tổng phút theo kỹ năng.' : 'Log study time and self-scores per session — see minutes by skill.'}</p>
        </div>

        {message ? <div className="alert alert-info auth-alert py-2 mb-4">{message}</div> : null}

        <div className="row g-4">
          <div className="col-12 col-xl-5">
            <div className="app-surface-panel app-surface-panel--gradient h-100">
              <div className="app-surface-panel-header">
                <span className="dashboard-eyebrow">{isVi ? 'Ghi mới' : 'New entry'}</span>
                <h3 className="app-section-title mb-1">{isVi ? 'Thêm buổi học' : 'Add session'}</h3>
                <p className="text-secondary small mb-0">{isVi ? 'Kỹ năng, phút học, tiêu đề và thời điểm.' : 'Skill, minutes, title, and when you studied.'}</p>
              </div>
              <div className="app-surface-panel-body">
                <form className="row g-3" onSubmit={handleSubmit}>
                  <div className="col-12 col-md-6">
                    <label className="auth-label">{isVi ? 'Kỹ năng' : 'Skill'}</label>
                    <select className="form-select auth-input" value={form.skillType} onChange={(e) => setForm({ ...form, skillType: e.target.value })}>
                      {skillOptions.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
                    </select>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="auth-label">{isVi ? 'Phút học' : 'Minutes'}</label>
                    <input type="number" className="form-control auth-input" value={form.studyMinutes} onChange={(e) => setForm({ ...form, studyMinutes: e.target.value })} min="0" max="600" />
                  </div>
                  <div className="col-12">
                    <label className="auth-label">{isVi ? 'Tiêu đề buổi học' : 'Session title'}</label>
                    <input className="form-control auth-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={isVi ? 'Ví dụ: BBC 6 Minute English' : 'e.g. BBC 6 Minute English'} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="auth-label">{isVi ? 'Điểm tự đánh giá' : 'Self score'}</label>
                    <input type="number" className="form-control auth-input" value={form.score} onChange={(e) => setForm({ ...form, score: e.target.value })} min="0" max="100" placeholder="0–100" />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="auth-label">{isVi ? 'Thời điểm' : 'Studied at'}</label>
                    <input type="datetime-local" className="form-control auth-input" value={form.studiedAt} onChange={(e) => setForm({ ...form, studiedAt: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <label className="auth-label">{isVi ? 'Mô tả' : 'Description'}</label>
                    <textarea className="form-control profile-textarea" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={isVi ? 'Nội dung đã học...' : 'What you studied...'} />
                  </div>
                  <div className="col-12">
                    <button className="btn dashboard-primary-btn px-4 rounded-3 fw-bold" type="submit" disabled={saving}>
                      {saving ? (isVi ? 'Đang lưu...' : 'Saving...') : (isVi ? 'Lưu nhật ký' : 'Save log')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-7">
            <div className="app-surface-panel h-100">
              <div className="app-toolbar">
                <div>
                  <span className="dashboard-eyebrow">{isVi ? 'Lịch sử' : 'History'}</span>
                  <h3 className="app-section-title fs-5 mb-1">{isVi ? 'Đã ghi nhận' : 'Logged sessions'}</h3>
                  <p className="text-secondary small mb-0">{isVi ? 'Lọc theo kỹ năng.' : 'Filter by skill.'}</p>
                </div>
                <div className="d-flex gap-2 flex-wrap align-items-center">
                  <select className="form-select auth-input" style={{ width: '180px' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
                    <option value="">{isVi ? 'Tất cả kỹ năng' : 'All skills'}</option>
                    {skillOptions.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
                  </select>
                  <span className="app-count-pill">{data.summary.totalMinutes || 0}′</span>
                </div>
              </div>
              <div className="app-surface-panel-body app-surface-panel-body--tight-top">
                <div className="minitest-stat-grid mb-4">
                  {skillOptions.map((skill) => (
                    <div key={skill} className="minitest-stat-tile">
                      <small className="text-uppercase">{skill}</small>
                      <strong className="d-block">{data.summary.bySkill?.[skill] || 0}</strong>
                      <div className="dashboard-muted small">{isVi ? 'bản ghi' : 'rows'}</div>
                    </div>
                  ))}
                </div>

                {loading ? <p className="text-secondary small mb-0">{isVi ? 'Đang tải...' : 'Loading...'}</p> : data.logs.length === 0 ? (
                  <div className="reminder-empty my-2">
                    <div className="reminder-empty-icon" aria-hidden>📒</div>
                    <h5 className="fw-bold mb-2">{isVi ? 'Chưa có nhật ký' : 'No logs yet'}</h5>
                    <p className="mb-0 text-secondary small">{isVi ? 'Lưu buổi học đầu tiên ở cột trái.' : 'Save your first session on the left.'}</p>
                  </div>
                ) : (
                  <div className="d-grid gap-3">
                    {data.logs.map((log) => (
                      <div key={log.id} className="goal-card goal-card--soft">
                        <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                          <div className="min-w-0">
                            <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                              <span className="profile-chip profile-chip-soft">{log.skillType}</span>
                              <span className="profile-chip">{log.studyMinutes} {isVi ? 'phút' : 'min'}</span>
                              {log.score != null ? <span className="profile-chip profile-chip-soft">{isVi ? 'Điểm' : 'Score'}: {log.score}</span> : null}
                            </div>
                            <h5 className="mb-1 fs-6 fw-bold">{log.title}</h5>
                            <p className="text-secondary small mb-0">{log.description || (isVi ? 'Không có mô tả.' : 'No description.')}</p>
                          </div>
                          <div className="text-end flex-shrink-0">
                            <div className="small text-secondary">{new Date(log.studiedAt).toLocaleString()}</div>
                            <button type="button" className="btn btn-sm btn-outline-danger rounded-3 mt-2" onClick={() => handleDelete(log.id)}>{isVi ? 'Xóa' : 'Delete'}</button>
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
