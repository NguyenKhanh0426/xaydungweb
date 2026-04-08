import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';

export default function RegisterPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await register(form);
      setSuccess(isVi ? 'Tạo tài khoản thành công. Đang chuyển đến trang đăng nhập...' : 'Account created successfully. Redirecting to login...');
      setTimeout(() => navigate('/login'), 900);
    } catch (err) {
      const response = err.response?.data;
      const detail = response?.error?.detail ? ` (${response.error.detail})` : '';
      setError((response?.message || (isVi ? 'Đăng ký thất bại' : 'Register failed')) + detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={isVi ? 'Tạo tài khoản' : 'Create your account'}
      subtitle={isVi ? 'Bắt đầu xây dựng thói quen học tiếng Anh thông minh hơn ngay hôm nay.' : 'Start building a smarter English study routine today.'}
    >
      {error && <div className="alert alert-danger auth-alert">{error}</div>}
      {success && <div className="alert alert-success auth-alert">{success}</div>}

      <form onSubmit={handleSubmit} className="d-grid gap-3">
        <div>
          <label className="form-label auth-label">{isVi ? 'Họ và tên' : 'Full name'}</label>
          <input
            className="form-control auth-input"
            placeholder={isVi ? 'Họ và tên của bạn' : 'Your full name'}
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
        </div>

        <div>
          <label className="form-label auth-label">Email</label>
          <input
            className="form-control auth-input"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>

        <div>
          <div className="d-flex justify-content-between align-items-center mb-2">
            <label className="form-label auth-label mb-0">{isVi ? 'Mật khẩu' : 'Password'}</label>
            <button type="button" className="auth-link-button" onClick={() => setShowPassword((v) => !v)}>
              {showPassword ? (isVi ? 'Ẩn' : 'Hide') : (isVi ? 'Hiện' : 'Show')}
            </button>
          </div>
          <input
            className="form-control auth-input"
            placeholder={isVi ? 'Tối thiểu 8 ký tự' : 'At least 8 characters'}
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button className="btn auth-submit-btn" disabled={loading}>
          {loading ? (isVi ? 'Đang tạo tài khoản...' : 'Creating account...') : (isVi ? 'Tạo tài khoản' : 'Create account')}
        </button>
      </form>

      <div className="auth-footer mt-4">
        <span className="text-muted">{isVi ? 'Đã có tài khoản?' : 'Already have an account?'}</span>{' '}
        <Link to="/login" className="auth-footer-link">{isVi ? 'Đăng nhập' : 'Sign in'}</Link>
      </div>
    </AuthLayout>
  );
}
