import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout';
import { vocabService } from '../../services/vocabService';
import { testService } from '../../services/testService';
import { useLanguage } from '../../hooks/useLanguage';

export default function MiniTestsPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [sets, setSets] = useState([]);
  const [selectedSetId, setSelectedSetId] = useState('');
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [currentTest, setCurrentTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [recentAttempts, setRecentAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const startedAtRef = useRef(null);

  const selectedSet = useMemo(() => sets.find((item) => Number(item.id) === Number(selectedSetId)), [sets, selectedSetId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [setData, recentData] = await Promise.all([
        vocabService.getSets(),
        testService.getRecentAttempts()
      ]);
      setSets(setData);
      if (setData[0] && !selectedSetId) setSelectedSetId(setData[0].id);
      setRecentAttempts(recentData);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleGenerateTest = async (event) => {
    event.preventDefault();
    setCreating(true);
    setMessage('');
    setResult(null);
    try {
      const generated = await testService.generateMiniTest({ setId: Number(selectedSetId), totalQuestions: Number(totalQuestions) });
      setCurrentTest(generated);
      setAnswers({});
      startedAtRef.current = Date.now();
      setMessage(isVi ? 'Đã tạo bài test mini. Hãy chọn đáp án rồi nộp bài.' : 'Mini test created. Choose your answers and submit when ready.');
    } catch (error) {
      setMessage(error.response?.data?.error?.detail || error.response?.data?.message || (isVi ? 'Không thể tạo bài test' : 'Unable to create mini test'));
    } finally {
      setCreating(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentTest) return;
    setSubmitting(true);
    setMessage('');
    try {
      const payload = {
        timeSpentSeconds: startedAtRef.current ? Math.round((Date.now() - startedAtRef.current) / 1000) : 0,
        answers: currentTest.questions.map((question) => ({
          questionId: question.id,
          selectedOptionId: answers[question.id] ? Number(answers[question.id]) : null
        })).filter((item) => item.selectedOptionId)
      };
      const submitted = await testService.submitMiniTest(currentTest.attemptId, payload);
      setResult(submitted);
      setCurrentTest(null);
      await loadInitialData();
    } catch (error) {
      setMessage(error.response?.data?.error?.detail || error.response?.data?.message || (isVi ? 'Nộp bài thất bại' : 'Failed to submit mini test'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="minitest-page">
        <div className="app-page-intro mb-4">
          <span className="dashboard-eyebrow">{isVi ? 'Tự kiểm tra' : 'Self-testing'}</span>
          <h2 className="dashboard-page-title mb-2">{isVi ? 'Mini test từ vựng' : 'Mini vocabulary test'}</h2>
          <p className="dashboard-muted mb-0">{isVi ? 'Tạo đề trắc nghiệm từ bộ từ, làm bài và xem điểm ngay — lịch sử được lưu để ôn lại.' : 'Build a quick quiz from your sets, submit for instant scoring — history is saved for review.'}</p>
        </div>

        {message ? <div className="alert alert-info auth-alert py-2 mb-4">{message}</div> : null}

        <div className="row g-4">
          <div className="col-12 col-xl-4">
            <div className="minitest-panel minitest-panel--form mb-4">
              <div className="minitest-panel-header">
                <h3 className="minitest-section-title mb-1">{isVi ? 'Tạo đề' : 'Create test'}</h3>
                <p className="text-secondary small mb-0">{isVi ? 'Chọn bộ từ và số câu (4–10).' : 'Pick a set and question count (4–10).'}</p>
              </div>
              <div className="minitest-panel-body">
                <form className="row g-3" onSubmit={handleGenerateTest}>
                  <div className="col-12">
                    <label className="auth-label">{isVi ? 'Bộ từ' : 'Vocabulary set'}</label>
                    <select className="form-select auth-input" value={selectedSetId} onChange={(e) => setSelectedSetId(e.target.value)} disabled={loading || sets.length === 0}>
                      {sets.map((set) => (
                        <option key={set.id} value={set.id}>{set.title} ({set.vocabulary_count})</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-12">
                    <label className="auth-label">{isVi ? 'Số câu hỏi' : 'Number of questions'}</label>
                    <input type="number" min="4" max="10" className="form-control auth-input" value={totalQuestions} onChange={(e) => setTotalQuestions(e.target.value)} />
                  </div>
                  <div className="col-12">
                    <button className="btn dashboard-primary-btn w-100 py-2 rounded-3 fw-bold" type="submit" disabled={creating || !selectedSetId}>
                      {creating ? (isVi ? 'Đang tạo đề...' : 'Generating...') : (isVi ? 'Tạo bài test' : 'Generate mini test')}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="minitest-panel">
              <div className="minitest-recent-header">
                <div>
                  <span className="dashboard-eyebrow">{isVi ? 'Hoạt động' : 'Activity'}</span>
                  <h3 className="minitest-section-title mb-0 fs-6">{isVi ? 'Lần làm gần đây' : 'Recent attempts'}</h3>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Link to="/mini-tests/history" className="btn btn-sm btn-outline-primary rounded-3 fw-semibold">
                    {isVi ? 'Lịch sử' : 'History'}
                  </Link>
                  <span className="minitest-count-badge">{recentAttempts.length}</span>
                </div>
              </div>
              <div className="minitest-recent-body">
                {recentAttempts.length === 0 ? (
                  <div className="reminder-empty py-4">
                    <div className="reminder-empty-icon" aria-hidden>📋</div>
                    <p className="mb-0 text-secondary small">{isVi ? 'Chưa có lần làm. Tạo bài và nộp để thấy ở đây.' : 'No attempts yet. Generate and submit a test.'}</p>
                  </div>
                ) : (
                  <div className="d-grid gap-2">
                    {recentAttempts.map((attempt) => (
                      <div key={attempt.id} className="minitest-attempt-card">
                        <div className="minitest-attempt-card__rail" aria-hidden />
                        <div className="minitest-attempt-card__body">
                          <div className="d-flex justify-content-between align-items-start gap-2">
                            <strong className="d-block text-start text-truncate">{attempt.title}</strong>
                            <span className="minitest-attempt-score flex-shrink-0">{attempt.percentage_score ?? 0}%</span>
                          </div>
                          <div className="text-secondary small mt-1">{attempt.test_type}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-12 col-xl-8">
            <div className="minitest-panel minitest-panel--main h-100">
              <div className="minitest-panel-body p-4 p-lg-5">
                {currentTest ? (
                  <>
                    <div className="minitest-work-header">
                      <div>
                        <span className="dashboard-eyebrow">{isVi ? 'Đang làm bài' : 'In progress'}</span>
                        <h3 className="minitest-section-title fs-4 mb-1">{currentTest.title}</h3>
                        <p className="text-secondary small mb-0">{isVi ? `Bộ: ${selectedSet?.title || ''} — chọn một đáp án cho mỗi câu.` : `Set: ${selectedSet?.title || ''} — pick one answer per question.`}</p>
                      </div>
                      <span className="minitest-count-badge">{currentTest.totalQuestions} {isVi ? 'câu' : 'Q'}</span>
                    </div>

                    <div className="d-grid gap-2">
                      {currentTest.questions.map((question, index) => (
                        <div key={question.id} className="minitest-q-card">
                          <div className="minitest-q-card__head">
                            <span className="minitest-q-num">{index + 1}</span>
                            <p className="minitest-q-text">{question.content}</p>
                          </div>
                          <div className="d-grid gap-2">
                            {question.options.map((option) => {
                              const selected = String(answers[question.id] || '') === String(option.id);
                              return (
                                <label key={option.id} className={`minitest-option mb-0 ${selected ? 'is-selected' : ''}`}>
                                  <input type="radio" name={`question-${question.id}`} value={option.id} checked={selected} onChange={(e) => setAnswers((prev) => ({ ...prev, [question.id]: e.target.value }))} />
                                  <span><strong className="text-primary">{option.label}.</strong> {option.text}</span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-2 border-top border-light-subtle">
                      <button type="button" className="btn dashboard-primary-btn px-4 rounded-3 fw-bold" disabled={submitting} onClick={handleSubmit}>
                        {submitting ? (isVi ? 'Đang nộp bài...' : 'Submitting...') : (isVi ? 'Nộp bài' : 'Submit test')}
                      </button>
                    </div>
                  </>
                ) : result ? (
                  <>
                    <div className="minitest-work-header">
                      <div>
                        <span className="dashboard-eyebrow">{isVi ? 'Kết quả' : 'Result'}</span>
                        <h3 className="minitest-section-title fs-4 mb-1">{result.title}</h3>
                        <p className="text-secondary small mb-0">{isVi ? 'Đối chiếu đáp án và giải thích ngắn để ôn ngay.' : 'Compare answers and short explanations to review quickly.'}</p>
                      </div>
                      <span className="minitest-count-badge">{result.percentageScore}%</span>
                    </div>

                    <div className="minitest-stat-grid">
                      <div className="minitest-stat-tile minitest-stat-tile--ok">
                        <small>{isVi ? 'Đúng' : 'Correct'}</small>
                        <strong className="d-block">{result.correctCount}</strong>
                      </div>
                      <div className="minitest-stat-tile minitest-stat-tile--bad">
                        <small>{isVi ? 'Sai' : 'Wrong'}</small>
                        <strong className="d-block">{result.wrongCount}</strong>
                      </div>
                      <div className="minitest-stat-tile">
                        <small>{isVi ? 'Bỏ trống' : 'Blank'}</small>
                        <strong className="d-block">{result.blankCount}</strong>
                      </div>
                      <div className="minitest-stat-tile minitest-stat-tile--exp">
                        <small>EXP</small>
                        <strong className="d-block">+{result.expEarned}</strong>
                      </div>
                    </div>

                    <div className="d-grid gap-2">
                      {result.results.map((item, index) => (
                        <div key={item.questionId} className={`minitest-feedback-card ${item.isCorrect ? 'minitest-feedback-card--ok' : 'minitest-feedback-card--bad'}`}>
                          <div className="d-flex justify-content-between align-items-start gap-3 flex-wrap">
                            <div className="min-w-0">
                              <h5 className="fs-6 fw-bold mb-2">{isVi ? `Câu ${index + 1}` : `Q${index + 1}`}: {item.content}</h5>
                              <div className="small mb-1"><strong>{isVi ? 'Bạn chọn:' : 'Your answer:'}</strong> {item.selectedText || (isVi ? 'Bỏ trống' : 'Blank')}</div>
                              <div className="small mb-1"><strong>{isVi ? 'Đáp án đúng:' : 'Correct:'}</strong> {item.correctText}</div>
                              <p className="text-secondary small mb-0">{item.explanation}</p>
                            </div>
                            <span className={`minitest-feedback-badge ${item.isCorrect ? 'minitest-feedback-badge--ok' : 'minitest-feedback-badge--bad'}`}>
                              {item.isCorrect ? (isVi ? 'Đúng' : 'OK') : (isVi ? 'Sai' : 'Wrong')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-2 border-top border-light-subtle d-flex flex-wrap gap-2">
                      <button type="button" className="btn dashboard-primary-btn rounded-3 fw-bold" onClick={() => { setResult(null); setMessage(''); }}>
                        {isVi ? 'Làm bài mới' : 'New test'}
                      </button>
                      <Link to="/mini-tests/history" className="btn btn-outline-secondary rounded-3 fw-semibold">
                        {isVi ? 'Xem lịch sử đầy đủ' : 'Full history'}
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="minitest-empty h-100 d-flex flex-column justify-content-center my-2">
                    <div className="minitest-empty-icon" aria-hidden>✏️</div>
                    <h5 className="fw-bold mb-2">{isVi ? 'Sẵn sàng kiểm tra' : 'Ready to quiz'}</h5>
                    <p className="text-secondary mb-0 mx-auto" style={{ maxWidth: '32rem' }}>{isVi ? 'Dùng cột bên trái để tạo đề. Mỗi lần làm được chấm điểm và lưu vào lịch sử.' : 'Use the left column to generate a test. Each attempt is scored and saved to your history.'}</p>
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
