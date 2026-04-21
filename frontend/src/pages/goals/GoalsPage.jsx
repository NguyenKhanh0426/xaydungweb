import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { goalService } from '../../services/goalService';
import { useLanguage } from '../../hooks/useLanguage';

const goalTypes = ['IELTS', 'TOEIC', 'COMMUNICATION', 'VOCABULARY', 'GRAMMAR', 'CUSTOM'];
const statusOptions = ['active', 'completed', 'paused'];

export default function GoalsPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [drafts, setDrafts] = useState({});
  const [savingGoalId, setSavingGoalId] = useState(null);
  const [form, setForm] = useState({
    goalType: 'IELTS',
    targetValue: '',
    currentValue: '0',
    targetUnit: 'band',
    startDate: new Date().toISOString().slice(0, 10),
    targetDate: '',
    description: ''
  });

  const buildDrafts = (data) => Object.fromEntries(
    data.map((goal) => [goal.id, {
      currentValue: goal.current_value ?? 0,
      status: goal.status,
      description: goal.description || '',
      targetDate: goal.target_date?.slice(0, 10) || ''
    }])
  );

  const loadGoals = async (nextStatus = statusFilter) => {
    setLoading(true);
    try {
      const data = await goalService.getGoals(nextStatus);
      setGoals(data);
      setDrafts(buildDrafts(data));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals(statusFilter);
  }, [statusFilter]);

  const activeCount = useMemo(() => goals.filter((goal) => goal.status === 'active').length, [goals]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await goalService.createGoal({
        ...form,
        targetValue: form.targetValue ? Number(form.targetValue) : null,
        currentValue: form.currentValue ? Number(form.currentValue) : 0,
        targetDate: form.targetDate || null,
        targetUnit: form.targetUnit || null,
        description: form.description || null
      });
      setMessage(isVi ? 'Tạo mục tiêu thành công.' : 'Goal created successfully.');
      setForm({ ...form, targetValue: '', currentValue: '0', targetDate: '', description: '' });
      await loadGoals(statusFilter);
    } catch (error) {
      setMessage(error.response?.data?.error?.detail || error.response?.data?.message || (isVi ? 'Tạo mục tiêu thất bại' : 'Failed to create goal'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDraftChange = (goalId, key, value) => {
    setDrafts((prev) => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        [key]: value
      }
    }));
  };

  const handleSaveGoal = async (goalId) => {
    setSavingGoalId(goalId);
    setMessage('');
    try {
      const draft = drafts[goalId];
      await goalService.updateGoal(goalId, {
        currentValue: draft.currentValue === '' ? 0 : Number(draft.currentValue),
        status: draft.status,
        targetDate: draft.targetDate || null,
        description: draft.description || null
      });
      setMessage(isVi ? 'Đã cập nhật tiến độ mục tiêu.' : 'Goal progress updated.');
      await loadGoals(statusFilter);
    } catch (error) {
      setMessage(error.response?.data?.error?.detail || error.response?.data?.message || (isVi ? 'Cập nhật mục tiêu thất bại' : 'Failed to update goal'));
    } finally {
      setSavingGoalId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="goals-page">
        <div className="app-page-intro mb-4">
          <span className="dashboard-eyebrow">{isVi ? 'Lộ trình' : 'Roadmap'}</span>
          <h2 className="dashboard-page-title mb-2">{isVi ? 'Mục tiêu học tập' : 'Learning goals'}</h2>
          <p className="dashboard-muted mb-0">{isVi ? 'Tạo mục tiêu đo được, cập nhật tiến độ và lọc theo trạng thái.' : 'Set measurable targets, update progress, and filter by status.'}</p>
        </div>

        {message ? <div className="alert alert-info auth-alert py-2 mb-4">{message}</div> : null}

        <div className="row g-4">
          <div className="col-12 col-xxl-5">
            <div className="app-surface-panel app-surface-panel--gradient h-100">
              <div className="app-surface-panel-header">
                <span className="dashboard-eyebrow">{isVi ? 'Mới' : 'New'}</span>
                <h3 className="app-section-title mb-1">{isVi ? 'Thêm mục tiêu' : 'Add a goal'}</h3>
                <p className="text-secondary small mb-0">{isVi ? 'Điền loại mục tiêu, giá trị và mốc thời gian.' : 'Fill goal type, values, and timeline.'}</p>
              </div>
              <div className="app-surface-panel-body">
                <form className="row g-3" onSubmit={handleSubmit}>
                  <div className="col-12 col-md-6">
                    <label className="auth-label">{isVi ? 'Loại mục tiêu' : 'Goal type'}</label>
                    <select className="form-select auth-input" value={form.goalType} onChange={(e) => setForm({ ...form, goalType: e.target.value })}>
                      {goalTypes.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="auth-label">{isVi ? 'Giá trị mục tiêu' : 'Target value'}</label>
                    <input className="form-control auth-input" value={form.targetValue} onChange={(e) => setForm({ ...form, targetValue: e.target.value })} placeholder="6.5 / 850 / 1000" />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="auth-label">{isVi ? 'Giá trị hiện tại' : 'Current value'}</label>
                    <input className="form-control auth-input" value={form.currentValue} onChange={(e) => setForm({ ...form, currentValue: e.target.value })} placeholder="0" />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="auth-label">{isVi ? 'Đơn vị' : 'Unit'}</label>
                    <input className="form-control auth-input" value={form.targetUnit} onChange={(e) => setForm({ ...form, targetUnit: e.target.value })} placeholder={isVi ? 'band / điểm / từ' : 'band / score / words'} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="auth-label">{isVi ? 'Ngày bắt đầu' : 'Start date'}</label>
                    <input type="date" className="form-control auth-input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="auth-label">{isVi ? 'Ngày hoàn thành' : 'Target date'}</label>
                    <input type="date" className="form-control auth-input" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
                  </div>
                  <div className="col-12">
                    <label className="auth-label">{isVi ? 'Mô tả' : 'Description'}</label>
                    <textarea className="form-control profile-textarea" rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={isVi ? 'Ví dụ: Đạt IELTS 6.5 với kỹ năng viết và đọc chính xác hơn.' : 'Example: Reach IELTS 6.5 with stronger writing and reading.'} />
                  </div>
                  <div className="col-12">
                    <button className="btn dashboard-primary-btn w-100 rounded-3 fw-bold py-2" type="submit" disabled={submitting}>
                      {submitting ? (isVi ? 'Đang lưu...' : 'Saving...') : (isVi ? 'Tạo mục tiêu' : 'Create goal')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-12 col-xxl-7">
            <div className="app-surface-panel h-100">
              <div className="app-toolbar">
                <div>
                  <span className="dashboard-eyebrow">{isVi ? 'Danh sách' : 'List'}</span>
                  <h3 className="app-section-title fs-5 mb-1">{isVi ? 'Mục tiêu hiện có' : 'Your goals'}</h3>
                  <p className="text-secondary small mb-0">{isVi ? `${activeCount} đang hoạt động.` : `${activeCount} active.`}</p>
                </div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <select className="form-select auth-input" style={{ width: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="all">{isVi ? 'Tất cả trạng thái' : 'All statuses'}</option>
                    <option value="active">{isVi ? 'Đang thực hiện' : 'Active'}</option>
                    <option value="completed">{isVi ? 'Hoàn thành' : 'Completed'}</option>
                    <option value="paused">{isVi ? 'Tạm dừng' : 'Paused'}</option>
                  </select>
                  <span className="app-count-pill">{goals.length}</span>
                </div>
              </div>
              <div className="app-surface-panel-body app-surface-panel-body--tight-top">
                {loading ? <p className="text-secondary mb-0 py-2">{isVi ? 'Đang tải...' : 'Loading...'}</p> : goals.length === 0 ? (
                  <div className="reminder-empty my-2">
                    <div className="reminder-empty-icon" aria-hidden>🎯</div>
                    <h5 className="fw-bold mb-2">{isVi ? 'Chưa có mục tiêu' : 'No goals yet'}</h5>
                    <p className="mb-0 text-secondary small">{isVi ? 'Tạo mục tiêu đầu tiên ở cột bên trái.' : 'Create your first goal in the left column.'}</p>
                  </div>
                ) : (
                  <div className="d-grid gap-3">
                    {goals.map((goal) => {
                      const draft = drafts[goal.id] || {};
                      const progress = Number(goal.progress_percentage || 0);
                      return (
                        <div key={goal.id} className="goal-card goal-card--soft">
                          <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-3">
                            <div>
                              <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                <span className="profile-chip profile-chip-soft">{goal.goal_type}</span>
                                <span className={`profile-chip ${goal.status === 'active' ? '' : 'profile-chip-soft'}`}>{goal.status}</span>
                              </div>
                              <h5 className="mb-1 fs-6 fw-bold">{goal.target_value ? `${goal.target_value} ${goal.target_unit || ''}`.trim() : (isVi ? 'Mục tiêu tùy chỉnh' : 'Custom target')}</h5>
                              <p className="text-secondary small mb-0">{goal.description || (isVi ? 'Chưa có mô tả.' : 'No description yet.')}</p>
                            </div>
                            <div className="text-secondary small text-end">
                              <div>{isVi ? 'Bắt đầu' : 'Start'}: {goal.start_date?.slice(0, 10)}</div>
                              <div>{isVi ? 'Hạn' : 'Due'}: {goal.target_date?.slice(0, 10) || (isVi ? 'Mở' : 'Open')}</div>
                              <div>{isVi ? 'Còn' : 'Left'}: {goal.days_remaining == null ? '—' : `${goal.days_remaining} ${isVi ? 'ngày' : 'd'}`}</div>
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="d-flex justify-content-between small text-secondary mb-1">
                              <span>{isVi ? 'Tiến độ' : 'Progress'}</span>
                              <span className="fw-semibold">{progress}%</span>
                            </div>
                            <div className="progress rounded-pill" role="progressbar" aria-valuenow={progress} aria-valuemin="0" aria-valuemax="100" style={{ height: '10px' }}>
                              <div className="progress-bar rounded-pill" style={{ width: `${progress}%` }} />
                            </div>
                          </div>

                          <div className="row g-3 align-items-end">
                            <div className="col-12 col-md-3">
                              <label className="auth-label small">{isVi ? 'Hiện tại' : 'Current'}</label>
                              <input className="form-control auth-input" value={draft.currentValue ?? ''} onChange={(e) => handleDraftChange(goal.id, 'currentValue', e.target.value)} />
                            </div>
                            <div className="col-12 col-md-3">
                              <label className="auth-label small">{isVi ? 'Trạng thái' : 'Status'}</label>
                              <select className="form-select auth-input" value={draft.status || goal.status} onChange={(e) => handleDraftChange(goal.id, 'status', e.target.value)}>
                                {statusOptions.map((status) => <option key={status} value={status}>{status}</option>)}
                              </select>
                            </div>
                            <div className="col-12 col-md-3">
                              <label className="auth-label small">{isVi ? 'Hạn mới' : 'New due'}</label>
                              <input type="date" className="form-control auth-input" value={draft.targetDate || ''} onChange={(e) => handleDraftChange(goal.id, 'targetDate', e.target.value)} />
                            </div>
                            <div className="col-12 col-md-3">
                              <button type="button" className="btn dashboard-primary-btn w-100 rounded-3 fw-bold" onClick={() => handleSaveGoal(goal.id)} disabled={savingGoalId === goal.id}>
                                {savingGoalId === goal.id ? (isVi ? 'Đang lưu...' : 'Saving...') : (isVi ? 'Lưu' : 'Save')}
                              </button>
                            </div>
                            <div className="col-12">
                              <label className="auth-label small">{isVi ? 'Ghi chú' : 'Note'}</label>
                              <textarea className="form-control profile-textarea" rows="2" value={draft.description || ''} onChange={(e) => handleDraftChange(goal.id, 'description', e.target.value)} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
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
