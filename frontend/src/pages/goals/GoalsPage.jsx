import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { goalService } from '../../services/goalService';
import { useLanguage } from '../../hooks/useLanguage';

const goalTypes = ['IELTS', 'TOEIC', 'COMMUNICATION', 'VOCABULARY', 'GRAMMAR', 'CUSTOM'];

export default function GoalsPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    goalType: 'IELTS',
    targetValue: '',
    targetUnit: 'band',
    startDate: new Date().toISOString().slice(0, 10),
    targetDate: '',
    description: ''
  });

  const loadGoals = async () => {
    setLoading(true);
    try {
      const data = await goalService.getGoals();
      setGoals(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const activeCount = useMemo(() => goals.filter((goal) => goal.status === 'active').length, [goals]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await goalService.createGoal({
        ...form,
        targetValue: form.targetValue ? Number(form.targetValue) : null,
        targetDate: form.targetDate || null,
        targetUnit: form.targetUnit || null,
        description: form.description || null
      });
      setMessage(isVi ? 'Tạo mục tiêu thành công.' : 'Goal created successfully.');
      setForm({ ...form, targetValue: '', targetDate: '', description: '' });
      await loadGoals();
    } catch (error) {
      setMessage(error.response?.data?.error?.detail || error.response?.data?.message || (isVi ? 'Tạo mục tiêu thất bại' : 'Failed to create goal'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="row g-4">
        <div className="col-12 col-xxl-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4 p-lg-5">
              <span className="dashboard-eyebrow">{isVi ? 'Lập kế hoạch mục tiêu' : 'Goal planner'}</span>
              <h3 className="mb-2">{isVi ? 'Thiết lập mục tiêu có thể đo lường' : 'Set a measurable target'}</h3>
              <p className="text-secondary mb-4">{isVi ? 'Biến mục tiêu mơ hồ thành cột mốc rõ ràng để việc học và dashboard luôn tập trung.' : 'Turn vague ambitions into clear milestones so your dashboard and study flow stay focused.'}</p>
              {message && <div className="alert alert-info auth-alert">{message}</div>}
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
                  <label className="auth-label">{isVi ? 'Đơn vị' : 'Unit'}</label>
                  <input className="form-control auth-input" value={form.targetUnit} onChange={(e) => setForm({ ...form, targetUnit: e.target.value })} placeholder={isVi ? 'band / điểm / từ' : 'band / score / words'} />
                </div>
                <div className="col-12 col-md-6">
                  <label className="auth-label">{isVi ? 'Ngày bắt đầu' : 'Start date'}</label>
                  <input type="date" className="form-control auth-input" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="auth-label">{isVi ? 'Ngày hoàn thành' : 'Target date'}</label>
                  <input type="date" className="form-control auth-input" value={form.targetDate} onChange={(e) => setForm({ ...form, targetDate: e.target.value })} />
                </div>
                <div className="col-12">
                  <label className="auth-label">{isVi ? 'Mô tả' : 'Description'}</label>
                  <textarea className="form-control profile-textarea" rows="4" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder={isVi ? 'Ví dụ: Đạt IELTS 6.5 với kỹ năng viết và đọc chính xác hơn.' : 'Example: Reach IELTS 6.5 with stronger writing and reading accuracy.'} />
                </div>
                <div className="col-12">
                  <button className="btn auth-submit-btn px-4" disabled={submitting}>{submitting ? (isVi ? 'Đang lưu...' : 'Saving...') : (isVi ? 'Tạo mục tiêu' : 'Create goal')}</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-12 col-xxl-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4 p-lg-5">
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
                <div>
                  <span className="dashboard-eyebrow">{isVi ? 'Lộ trình của bạn' : 'Your roadmap'}</span>
                  <h3 className="mb-1">{isVi ? 'Mục tiêu hiện tại' : 'Current goals'}</h3>
                  <p className="text-secondary mb-0">{isVi ? `${activeCount} mục tiêu đang hoạt động và định hướng kế hoạch học của bạn.` : `${activeCount} active target${activeCount === 1 ? '' : 's'} currently shaping your study plan.`}</p>
                </div>
                <span className="profile-chip">{goals.length} {isVi ? 'tổng' : 'total'}</span>
              </div>

              {loading ? <p className="text-secondary mb-0">{isVi ? 'Đang tải mục tiêu...' : 'Loading goals...'}</p> : goals.length === 0 ? (
                <div className="empty-state-card">
                  <h5>{isVi ? 'Chưa có mục tiêu' : 'No goals yet'}</h5>
                  <p className="mb-0 text-secondary">{isVi ? 'Hãy tạo mục tiêu đầu tiên để biến dashboard thành kế hoạch thực sự.' : 'Create your first target to turn the dashboard into a real plan.'}</p>
                </div>
              ) : (
                <div className="d-grid gap-3">
                  {goals.map((goal) => (
                    <div key={goal.id} className="goal-card">
                      <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-2 flex-wrap">
                            <span className="profile-chip profile-chip-soft">{goal.goal_type}</span>
                            <span className={`profile-chip ${goal.status === 'active' ? '' : 'profile-chip-soft'}`}>{goal.status}</span>
                          </div>
                          <h5 className="mb-1">{goal.target_value ? `${goal.target_value} ${goal.target_unit || ''}`.trim() : (isVi ? 'Mục tiêu tùy chỉnh' : 'Custom target')}</h5>
                          <p className="text-secondary mb-0">{goal.description || (isVi ? 'Chưa có mô tả thêm.' : 'No extra description yet.')}</p>
                        </div>
                        <div className="text-secondary small text-end">
                          <div>{isVi ? 'Bắt đầu' : 'Start'}: {goal.start_date?.slice(0, 10)}</div>
                          <div>{isVi ? 'Mục tiêu' : 'Target'}: {goal.target_date?.slice(0, 10) || (isVi ? 'Mở' : 'Open')}</div>
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
    </DashboardLayout>
  );
}
