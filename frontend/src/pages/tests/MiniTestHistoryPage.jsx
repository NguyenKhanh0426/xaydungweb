import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { testService } from '../../services/testService';
import { useLanguage } from '../../hooks/useLanguage';

const formatDateTime = (value, locale) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(locale === 'vi' ? 'vi-VN' : 'en-US');
};

export default function MiniTestHistoryPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [dateFilter, setDateFilter] = useState('');
  const [history, setHistory] = useState([]);
  const [expandedAttemptId, setExpandedAttemptId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadHistory = async (selectedDate = '') => {
    setLoading(true);
    setError('');
    try {
      const data = await testService.getAttemptHistory(selectedDate ? { date: selectedDate } : {});
      setHistory(data);
    } catch (err) {
      setError(err.response?.data?.error?.detail || err.response?.data?.message || (isVi ? 'Không thể tải lịch sử làm bài' : 'Failed to load test history'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleFilter = (event) => {
    event.preventDefault();
    loadHistory(dateFilter);
  };

  const toggleAttemptDetails = (attemptId) => {
    setExpandedAttemptId((prev) => (prev === attemptId ? null : attemptId));
  };

  return (
    <DashboardLayout>
      <div className="minitest-history-page">
        <div className="app-page-intro mb-4">
          <span className="dashboard-eyebrow">{isVi ? 'Mini test' : 'Mini test'}</span>
          <h2 className="dashboard-page-title mb-2">{isVi ? 'Lịch sử làm bài' : 'Test history'}</h2>
          <p className="dashboard-muted mb-0">{isVi ? 'Xem lại từng lần làm, mở chi tiết đáp án và lọc theo ngày.' : 'Review each attempt, expand answers, filter by date.'}</p>
        </div>

        <div className="app-surface-panel">
          <div className="app-toolbar">
            <div>
              <span className="dashboard-eyebrow">{isVi ? 'Bộ lọc' : 'Filter'}</span>
              <h3 className="app-section-title fs-6 mb-0">{isVi ? 'Theo ngày nộp bài' : 'By submit date'}</h3>
            </div>
            <form className="d-flex gap-2 align-items-center flex-nowrap" onSubmit={handleFilter}>
              <input
                type="date"
                className="form-control auth-input"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ width: '190px' }}
              />
              <button type="submit" className="btn dashboard-primary-btn text-nowrap rounded-3 fw-bold">{isVi ? 'Lọc' : 'Filter'}</button>
              {dateFilter ? (
                <button type="button" className="btn btn-outline-secondary text-nowrap rounded-3" onClick={() => { setDateFilter(''); loadHistory(''); }}>
                  {isVi ? 'Xóa lọc' : 'Clear'}
                </button>
              ) : null}
              <Link to="/mini-tests" className="btn btn-outline-primary text-nowrap rounded-3 fw-semibold">{isVi ? '← Mini test' : '← Mini test'}</Link>
            </form>
          </div>

          <div className="app-surface-panel-body app-surface-panel-body--tight-top">
            {error ? <div className="alert alert-danger py-2">{error}</div> : null}
            {loading ? <p className="text-secondary small mb-0 py-2">{isVi ? 'Đang tải...' : 'Loading...'}</p> : null}

            {!loading && history.length === 0 ? (
              <div className="reminder-empty my-3">
                <div className="reminder-empty-icon" aria-hidden>📅</div>
                <p className="mb-0 text-secondary small">{isVi ? 'Không có dữ liệu phù hợp bộ lọc.' : 'No data for this filter.'}</p>
              </div>
            ) : null}

            <div className="d-grid gap-3">
              {history.map((attempt) => (
                <div key={attempt.id} className="goal-card goal-card--soft">
                  <button
                    type="button"
                    className="btn w-100 text-start p-0 border-0 bg-transparent history-attempt-toggle"
                    onClick={() => toggleAttemptDetails(attempt.id)}
                  >
                    <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap mb-1">
                      <div className="min-w-0">
                        <h5 className="mb-1 fs-6 fw-bold text-truncate">{attempt.title}</h5>
                        <div className="text-secondary small">
                          {formatDateTime(attempt.submittedAt, language)} · {attempt.percentageScore ?? 0}%
                        </div>
                      </div>
                      <div className="d-flex gap-2 flex-wrap flex-shrink-0">
                        <span className="profile-chip">{isVi ? `Đúng ${attempt.correctCount}` : `OK ${attempt.correctCount}`}</span>
                        <span className="profile-chip profile-chip-soft">{isVi ? `Sai ${attempt.wrongCount}` : `Wrong ${attempt.wrongCount}`}</span>
                        <span className="profile-chip profile-chip-soft">{isVi ? `Trống ${attempt.blankCount}` : `Blank ${attempt.blankCount}`}</span>
                      </div>
                    </div>
                    <div className="small text-primary fw-semibold">
                      {expandedAttemptId === attempt.id
                        ? (isVi ? 'Ẩn chi tiết' : 'Hide details')
                        : (isVi ? 'Xem chi tiết' : 'View details')}
                    </div>
                  </button>

                  {expandedAttemptId === attempt.id ? (
                    <div className="d-grid gap-3 mt-3 pt-3 border-top border-light-subtle">
                      {attempt.results.map((item, index) => (
                        <div
                          key={`${attempt.id}-${item.questionId}`}
                          className={`set-list-item ${item.isCorrect ? 'attempt-result-correct' : 'attempt-result-wrong'}`}
                        >
                          <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                            <div className="min-w-0">
                              <strong className="small">{isVi ? `Câu ${index + 1}` : `Q${index + 1}`}: {item.content}</strong>
                              <div className="small mt-1"><strong>{isVi ? 'Bạn chọn:' : 'Yours:'}</strong> {item.selectedText || (isVi ? 'Bỏ trống' : 'Blank')}</div>
                              <div className="small"><strong>{isVi ? 'Đúng:' : 'Correct:'}</strong> {item.correctText}</div>
                              <div className="small text-secondary">{item.explanation}</div>
                            </div>
                            <span className={`profile-chip ${item.isCorrect ? 'result-status-text-success' : 'result-status-text-danger'}`}>
                              {item.isCorrect === null ? (isVi ? 'Trống' : 'Blank') : item.isCorrect ? (isVi ? 'Đúng' : 'OK') : (isVi ? 'Sai' : 'Wrong')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
