import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../hooks/useLanguage';
import EnGrWidget from '../components/common/EnGrWidget';

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

return (
  <div className="dashboard-shell min-vh-100">
    <div className="container-fluid px-0">
      <header className="dashboard-sidebar w-100"> 
        <div className="dashboard-sidebar-inner d-flex align-items-center justify-content-between px-4 py-2">
          
          <div className="d-flex align-items-center gap-4">
            <Link to="/dashboard" className="dashboard-brand text-decoration-none d-inline-flex align-items-center gap-2">
              <span className="dashboard-brand-mark">E</span>
              <div className="d-none d-md-block">
                <div className="dashboard-brand-title">English Growth</div>
              </div>
            </Link>
          </div>

          <nav className="nav d-flex flex-row gap-3 dashboard-nav mt-0">
            <NavLink to="/dashboard" className="nav-link dashboard-nav-link py-1">{t('common.dashboard')}</NavLink>
            <NavLink to="/flashcards/review" className="nav-link dashboard-nav-link py-1">{t('common.flashcards')}</NavLink>
            <NavLink to="/vocabulary" className="nav-link dashboard-nav-link py-1">{t('common.vocabulary')}</NavLink>
            <NavLink to="/goals" className="nav-link dashboard-nav-link py-1">{t('common.goals')}</NavLink>
            <NavLink to="/profile" className="nav-link dashboard-nav-link py-1">{t('common.profile')}</NavLink>
          </nav>

          <div className="d-flex align-items-center gap-3">
            <div className="dashboard-mini-card mb-0 d-none d-xxl-block" style={{padding: '5px 15px'}}>
              <small className="text-white-50">{t('layout.mission')} </small>
              <strong className="text-white small">{t('layout.missionValue')}</strong>
            </div>
            <div className="d-flex align-items-center gap-2">
              <label htmlFor="language-selector" className="text-white-50 small mb-0">{t('layout.language')}</label>
              <select
                id="language-selector"
                className="form-select form-select-sm"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{ width: '120px' }}
              >
                <option value="en">{t('layout.english')}</option>
                <option value="vi">{t('layout.vietnamese')}</option>
              </select>
            </div>
            <div className="dashboard-profile-card d-flex align-items-center gap-2 mt-0 dashboard-profile-avatar-only">
              <div className="dashboard-avatar" style={{width: '32px', height: '32px', fontSize: '0.8rem'}}>
                {(user?.fullName || 'L').charAt(0).toUpperCase()}
              </div>
            </div>
            <button 
              className="btn dashboard-logout-btn btn-sm" 
              style={{width: 'auto', padding: '5px 15px'}} 
              onClick={logout}
            >
              {t('common.logout')}
            </button>
          </div>

        </div>
      </header>

      <main className="dashboard-main w-100 px-4">
        <div className="dashboard-topbar d-flex justify-content-between align-items-center py-4">
          <div>
            <span className="dashboard-eyebrow">{t('layout.overview')}</span>
            <h2 className="dashboard-page-title mb-1">{t('layout.welcomeBack', { name: user?.fullName || t('common.learner') })}</h2>
            <p className="dashboard-muted mb-0">{t('layout.topMessage')}</p>
          </div>
          <div className="dashboard-topbar-actions">
            <Link to="/flashcards/review" className="btn dashboard-primary-btn">{t('layout.startReview')}</Link>
          </div>
        </div>
        <div className="dashboard-content">{children}</div>
      </main>
    </div>
    <EnGrWidget />
  </div>
)};