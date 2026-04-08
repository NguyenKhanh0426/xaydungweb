import { useLanguage } from '../hooks/useLanguage';

export default function AuthLayout({ children, title, subtitle, badge }) {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const badgeText = badge || (isVi ? 'Hệ thống phát triển tiếng Anh' : 'English Growth System');
  return (
    <div className="auth-shell min-vh-100 d-flex align-items-center py-4 py-lg-5">
      <div className="container">
        <div className="row justify-content-center align-items-stretch g-0 auth-wrapper shadow-lg overflow-hidden rounded-4">
          <div className="col-12 col-lg-6 d-none d-lg-flex">
            <div className="auth-brand-panel w-100 p-5 text-white d-flex flex-column justify-content-between">
              <div>
                <span className="auth-badge">{badgeText}</span>
                <h1 className="auth-brand-title mt-4 mb-3">{isVi ? 'Học tiếng Anh với một hệ thống hằng ngày rõ ràng hơn.' : 'Learn English with a clearer daily system.'}</h1>
                <p className="auth-brand-subtitle mb-0">
                  {isVi
                    ? 'Theo dõi từ vựng, ôn tập thông minh với SRS, và duy trì đều đặn bằng chuỗi học, mục tiêu, cùng dashboard tiến độ.'
                    : 'Track vocabulary, review smarter with SRS, and stay consistent with streaks, goals, and progress dashboards.'}
                </p>
              </div>

              <div className="auth-feature-list">
                <div className="auth-feature-item">
                  <div className="auth-feature-icon">✓</div>
                  <div>
                    <h6>{isVi ? 'Ôn flashcard thông minh' : 'Smart flashcard review'}</h6>
                    <p>{isVi ? 'Lặp lại ngắt quãng tập trung vào những từ bạn sắp quên.' : 'Spaced repetition that focuses on the words you are about to forget.'}</p>
                  </div>
                </div>
                <div className="auth-feature-item">
                  <div className="auth-feature-icon">↗</div>
                  <div>
                    <h6>{isVi ? 'Tiến độ hằng ngày rõ ràng' : 'Visible daily progress'}</h6>
                    <p>{isVi ? 'Xem chuỗi học, EXP và số phút học trong một dashboard trực quan.' : 'See streaks, EXP, and study minutes in one clean dashboard.'}</p>
                  </div>
                </div>
                <div className="auth-feature-item">
                  <div className="auth-feature-icon">★</div>
                  <div>
                    <h6>{isVi ? 'Thiết kế cho mục tiêu cá nhân' : 'Built for personal goals'}</h6>
                    <p>{isVi ? 'IELTS, TOEIC, giao tiếp hoặc tăng vốn từ - tất cả trong một nơi.' : 'IELTS, TOEIC, communication, or vocabulary growth in one place.'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6">
            <div className="auth-form-panel h-100 d-flex align-items-center">
              <div className="w-100 p-4 p-md-5">
                <div className="d-lg-none mb-4">
                  <span className="auth-badge auth-badge-light">{badgeText}</span>
                </div>
                {title && <h2 className="auth-form-title mb-2">{title}</h2>}
                {subtitle && <p className="auth-form-subtitle mb-4">{subtitle}</p>}
                {children}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
