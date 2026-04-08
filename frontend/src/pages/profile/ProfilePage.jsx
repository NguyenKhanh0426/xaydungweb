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
      <div className="row g-4 align-items-start">
        <div className="col-12 col-xl-4">
          <div className="card border-0 shadow-sm profile-hero-card">
            <div className="card-body p-4 p-lg-5 text-white">
              <div className="profile-avatar mb-4">{initials}</div>
              <span className="dashboard-eyebrow text-white-50">{isVi ? 'Hồ sơ cá nhân' : 'Personal profile'}</span>
              <h3 className="mb-2">{form.fullName || (isVi ? 'Hồ sơ người học' : 'Learner profile')}</h3>
              <p className="mb-4 text-white-50">{isVi ? 'Cập nhật rõ danh tính, trình độ mục tiêu và kỳ thi để hệ thống gợi ý lộ trình tốt hơn.' : 'Keep your identity, target level, and exam focus clear so the system can guide your learning path better.'}</p>

              <div className="profile-summary-list">
                <div className="profile-summary-item">
                  <span>{isVi ? 'Trình độ hiện tại' : 'Current level'}</span>
                  <strong>{levelLabel}</strong>
                </div>
                <div className="profile-summary-item">
                  <span>{isVi ? 'Kỳ thi mục tiêu' : 'Target exam'}</span>
                  <strong>{examLabel}</strong>
                </div>
                <div className="profile-summary-item">
                  <span>{isVi ? 'Chế độ học' : 'Learning mode'}</span>
                  <strong>{isVi ? 'Phát triển cá nhân' : 'Personal growth'}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-xl-8">
          <div className="card border-0 shadow-sm profile-form-card">
            <div className="card-body p-4 p-lg-5">
              <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4">
                <div>
                  <span className="dashboard-eyebrow">{isVi ? 'Chỉnh sửa thông tin' : 'Edit details'}</span>
                  <h3 className="mb-1">{isVi ? 'Cài đặt hồ sơ' : 'Profile settings'}</h3>
                  <p className="text-secondary mb-0">{isVi ? 'Cập nhật hồ sơ để cá nhân hóa gợi ý, mục tiêu và dữ liệu trên dashboard.' : 'Update your profile to personalize recommendations, targets, and dashboard insights.'}</p>
                </div>
                <div className="profile-chip-group">
                  <span className="profile-chip">Modern UI</span>
                  <span className="profile-chip">{isVi ? 'Đồng bộ' : 'Synced'}</span>
                </div>
              </div>

              {message && <div className="alert alert-success auth-alert">{message}</div>}

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
                    placeholder={isVi ? 'Viết ngắn về mục tiêu, điểm mạnh hoặc khó khăn khi học tiếng Anh' : 'Write a short note about your goals, strengths, or challenges in English learning'}
                  />
                </div>
                <div className="col-12 d-flex flex-column flex-sm-row gap-3 justify-content-between align-items-sm-center">
                  <p className="text-secondary mb-0">{isVi ? 'Hồ sơ của bạn giúp hệ thống gợi ý mục tiêu, cung cấp insight dashboard và cá nhân hóa sau này.' : 'Your profile powers goal suggestions, dashboard insights, and future personalization.'}</p>
                  <button className="btn auth-submit-btn px-4" disabled={saving}>{saving ? (isVi ? 'Đang lưu...' : 'Saving...') : (isVi ? 'Lưu hồ sơ' : 'Save profile')}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
