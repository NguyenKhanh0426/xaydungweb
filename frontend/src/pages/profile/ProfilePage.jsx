import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import { userService } from '../../services/userService';
import { useLanguage } from '../../hooks/useLanguage';

const levelOptions = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'elementary', label: 'Elementary' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'upper_intermediate', label: 'Upper Intermediate' },
  { value: 'advanced', label: 'Advanced' }
];

const examOptions = [
  { value: 'IELTS', label: 'IELTS' },
  { value: 'TOEIC', label: 'TOEIC' },
  { value: 'COMMUNICATION', label: 'Communication' },
  { value: 'OTHER', label: 'Other' }
];

export default function ProfilePage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [form, setForm] = useState({ fullName: '', englishLevel: '', targetExam: '', bio: '' });
  const [message, setMessage] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const profile = await userService.getMe();
      setForm({
        fullName: profile.full_name || '',
        englishLevel: profile.english_level || '',
        targetExam: profile.target_exam || '',
        bio: profile.bio || ''
      });
    };
    fetchData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setSaving(true);
    try {
      await userService.updateMe(form);
      setMessage(isVi ? 'Cập nhật hồ sơ thành công' : 'Profile updated successfully');
    } finally {
      setSaving(false);
    }
  };

  const initials = (form.fullName || 'L').trim().charAt(0).toUpperCase();
  const levelLabel = levelOptions.find((item) => item.value === form.englishLevel)?.label || (isVi ? 'Chưa đặt' : 'Not set');
  const examLabel = examOptions.find((item) => item.value === form.targetExam)?.label || (isVi ? 'Chưa đặt' : 'Not set');

  return (
    <DashboardLayout>
      <div className="profile-page">
        <div className="app-page-intro mb-4">
          <span className="dashboard-eyebrow">{isVi ? 'Cá nhân hóa' : 'Personalization'}</span>
          <h2 className="dashboard-page-title mb-2">{isVi ? 'Hồ sơ người học' : 'Learner profile'}</h2>
          <p className="dashboard-muted mb-0">{isVi ? 'Thông tin giúp gợi ý mục tiêu và hiển thị insight phù hợp trên dashboard.' : 'Details power goal suggestions and dashboard insights tailored to you.'}</p>
        </div>

        {message ? <div className="alert alert-success auth-alert py-2 mb-4">{message}</div> : null}

        <div className="row g-4 align-items-start">
          <div className="col-12 col-xl-4">
            <div className="app-surface-panel app-surface-panel--flush h-100">
              <div className="profile-hero-card h-100 card border-0 shadow-none">
                <div className="card-body p-4 p-lg-5 text-white">
                  <div className="profile-avatar mb-4">{initials}</div>
                  <span className="dashboard-eyebrow text-white-50">{isVi ? 'Tóm tắt' : 'Summary'}</span>
                  <h3 className="mb-2">{form.fullName || (isVi ? 'Học viên' : 'Learner')}</h3>
                  <p className="mb-4 text-white-50">{isVi ? 'Trình độ và kỳ thi mục tiêu hiển thị bên dưới — chỉnh trong form bên phải.' : 'Level and exam focus below — edit in the form on the right.'}</p>

                  <div className="profile-summary-list">
                    <div className="profile-summary-item">
                      <span>{isVi ? 'Trình độ' : 'Level'}</span>
                      <strong>{levelLabel}</strong>
                    </div>
                    <div className="profile-summary-item">
                      <span>{isVi ? 'Kỳ thi' : 'Exam'}</span>
                      <strong>{examLabel}</strong>
                    </div>
                    <div className="profile-summary-item">
                      <span>{isVi ? 'Chế độ' : 'Mode'}</span>
                      <strong>{isVi ? 'Phát triển cá nhân' : 'Personal growth'}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-8">
            <div className="app-surface-panel app-surface-panel--gradient h-100">
              <div className="app-surface-panel-header">
                <span className="dashboard-eyebrow">{isVi ? 'Chỉnh sửa' : 'Edit'}</span>
                <h3 className="app-section-title mb-1">{isVi ? 'Cài đặt hồ sơ' : 'Profile settings'}</h3>
                <p className="text-secondary small mb-0">{isVi ? 'Cập nhật để cá nhân hóa gợi ý và dữ liệu trên dashboard.' : 'Update to personalize recommendations and dashboard data.'}</p>
              </div>
              <div className="app-surface-panel-body">
                <div className="d-flex flex-wrap gap-2 mb-4">
                  <span className="profile-chip">{isVi ? 'Đồng bộ' : 'Synced'}</span>
                  <span className="profile-chip profile-chip-soft">English Growth</span>
                </div>

                <form onSubmit={handleSubmit} className="row g-4">
                  <div className="col-12 col-md-6">
                    <label className="auth-label">{isVi ? 'Họ và tên' : 'Full name'}</label>
                    <input
                      className="form-control auth-input"
                      value={form.fullName}
                      onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                      placeholder={isVi ? 'Nhập họ và tên' : 'Enter your full name'}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="auth-label">{isVi ? 'Trình độ tiếng Anh' : 'English level'}</label>
                    <select
                      className="form-select auth-input"
                      value={form.englishLevel}
                      onChange={(e) => setForm({ ...form, englishLevel: e.target.value })}
                    >
                      <option value="">{isVi ? 'Chọn trình độ' : 'Select level'}</option>
                      {levelOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="auth-label">{isVi ? 'Kỳ thi mục tiêu' : 'Target exam'}</label>
                    <select
                      className="form-select auth-input"
                      value={form.targetExam}
                      onChange={(e) => setForm({ ...form, targetExam: e.target.value })}
                    >
                      <option value="">{isVi ? 'Chọn mục tiêu' : 'Select target'}</option>
                      {examOptions.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="auth-label">{isVi ? 'Trọng tâm học tập' : 'Learning focus'}</label>
                    <div className="profile-static-field d-flex align-items-center">{isVi ? 'Đều đặn và tăng trưởng đo lường được' : 'Consistency and measurable growth'}</div>
                  </div>
                  <div className="col-12">
                    <label className="auth-label">{isVi ? 'Giới thiệu' : 'Bio'}</label>
                    <textarea
                      className="form-control profile-textarea"
                      rows="5"
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      placeholder={isVi ? 'Viết ngắn về mục tiêu, điểm mạnh hoặc khó khăn khi học tiếng Anh' : 'Short note about goals, strengths, or challenges in English'}
                    />
                  </div>
                  <div className="col-12 d-flex flex-column flex-sm-row gap-3 justify-content-between align-items-sm-center pt-2 border-top border-light-subtle">
                    <p className="text-secondary small mb-0">{isVi ? 'Hồ sơ hỗ trợ gợi ý mục tiêu và cá nhân hóa sau này.' : 'Your profile powers goals and future personalization.'}</p>
                    <button className="btn dashboard-primary-btn px-4 rounded-3 fw-bold" type="submit" disabled={saving}>
                      {saving ? (isVi ? 'Đang lưu...' : 'Saving...') : (isVi ? 'Lưu hồ sơ' : 'Save profile')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
