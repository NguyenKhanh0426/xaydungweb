import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../layouts/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { useLanguage } from '../../hooks/useLanguage';

export default function LoginPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || (isVi ? 'Đăng nhập thất bại' : 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title={isVi ? 'Chào mừng quay lại' : 'Welcome back'}
      subtitle={isVi ? 'Đăng nhập để tiếp tục hành trình học tiếng Anh của bạn.' : 'Sign in to continue your English learning journey.'}
    >
      {error && <div className="alert alert-danger auth-alert">{error}</div>}

      <form onSubmit={handleSubmit} className="d-grid gap-3">
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
            placeholder={isVi ? 'Nhập mật khẩu' : 'Enter your password'}
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>

        <button className="btn auth-submit-btn" disabled={loading}>
          {loading ? (isVi ? 'Đang đăng nhập...' : 'Signing in...') : (isVi ? 'Đăng nhập' : 'Sign in')}
        </button>
      </form>

      <div className="auth-footer mt-4">
        <span className="text-muted">{isVi ? 'Bạn mới ở đây?' : 'New here?'}</span>{' '}
        <Link to="/register" className="auth-footer-link">{isVi ? 'Tạo tài khoản' : 'Create an account'}</Link>
      </div>
    </AuthLayout>
  );
}
