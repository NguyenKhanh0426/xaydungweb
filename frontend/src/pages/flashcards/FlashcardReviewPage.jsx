import { useEffect, useMemo, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader from '../../components/common/Loader';
import FlashcardViewer from '../../components/flashcards/FlashcardViewer';
import ReviewButtons from '../../components/flashcards/ReviewButtons';
import { flashcardService } from '../../services/flashcardService';
import { useLanguage } from '../../hooks/useLanguage';

export default function FlashcardReviewPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [summary, setSummary] = useState({ reviewed: 0, again: 0, hard: 0, good: 0, easy: 0 });

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const response = await flashcardService.getDueCards();
        setCards(response);
      } finally {
        setLoading(false);
      }
    };
    fetchCards();
  }, []);

  const currentCard = useMemo(() => cards[0], [cards]);
  const totalCards = cards.length + summary.reviewed;
  const progressPercent = totalCards ? Math.round((summary.reviewed / totalCards) * 100) : 100;

  const handleReview = async (grade) => {
    if (!currentCard || reviewing) return;
    setReviewing(true);
    try {
      await flashcardService.review(currentCard.id, { grade });
      setCards((prev) => prev.slice(1));
      setShowAnswer(false);
      setSummary((prev) => ({
        ...prev,
        reviewed: prev.reviewed + 1,
        [grade]: prev[grade] + 1
      }));
    } finally {
      setReviewing(false);
    }
  };

  return (
    <DashboardLayout>
      {loading ? <Loader /> : (
        <div className="row g-4">
          <div className="col-12 col-xxl-8">
            <div className="flashcard-session-hero card border-0 shadow-sm mb-4">
              <div className="card-body p-4 p-lg-5">
                <div className="d-flex flex-column flex-lg-row gap-4 justify-content-between align-items-lg-center">
                  <div>
                    <span className="dashboard-eyebrow">{isVi ? 'Phiên lặp lại ngắt quãng' : 'Spaced repetition session'}</span>
                    <h3 className="mb-2 flashcard-session-title">{isVi ? 'Xây dựng trí nhớ dài hạn bằng các phiên ôn ngắn mỗi ngày' : 'Build long-term memory with short daily reviews'}</h3>
                    <p className="text-secondary mb-0">{isVi ? 'Hiện đáp án, tự đánh giá mức nhớ trung thực, và để hệ thống lên lịch phiên ôn phù hợp tiếp theo.' : 'Reveal the answer, rate your recall honestly, and let the system schedule the next perfect review.'}</p>
                  </div>
                  <div className="flashcard-progress-wrap">
                    <div className="flashcard-progress-ring">
                      <strong>{progressPercent}%</strong>
                    </div>
                    <div>
                      <div className="text-muted small">{isVi ? 'Tiến độ phiên học' : 'Session progress'}</div>
                      <div className="fw-semibold">{summary.reviewed} / {totalCards} {isVi ? 'đã ôn' : 'reviewed'}</div>
                    </div>
                  </div>
                </div>
                <div className="progress mt-4 flashcard-session-progress" role="progressbar" aria-label={isVi ? 'Tiến độ ôn tập' : 'Review progress'} aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100">
                  <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
            </div>

            <FlashcardViewer
              card={currentCard}
              showAnswer={showAnswer}
              onToggleAnswer={() => setShowAnswer(true)}
              reviewed={summary.reviewed}
              total={totalCards}
            />
            {showAnswer && currentCard && <ReviewButtons onReview={handleReview} disabled={reviewing} />}
          </div>

          <div className="col-12 col-xxl-4">
            <div className="card border-0 shadow-sm h-100 flashcard-side-panel">
              <div className="card-body p-4">
                <div className="d-flex align-items-center justify-content-between mb-3">
                  <h5 className="mb-0">{isVi ? 'Thông tin phiên học' : 'Session insights'}</h5>
                  <span className="badge rounded-pill text-bg-primary">{isVi ? 'Hôm nay' : 'Today'}</span>
                </div>

                <div className="flashcard-insight-grid mb-4">
                  <div className="flashcard-insight-card">
                    <span className="flashcard-insight-label">{isVi ? 'Đến hạn' : 'Due now'}</span>
                    <strong>{cards.length}</strong>
                  </div>
                  <div className="flashcard-insight-card">
                    <span className="flashcard-insight-label">{isVi ? 'Hoàn thành' : 'Completed'}</span>
                    <strong>{summary.reviewed}</strong>
                  </div>
                  <div className="flashcard-insight-card">
                    <span className="flashcard-insight-label">{isVi ? 'Tốt' : 'Good'}</span>
                    <strong>{summary.good}</strong>
                  </div>
                  <div className="flashcard-insight-card">
                    <span className="flashcard-insight-label">{isVi ? 'Dễ' : 'Easy'}</span>
                    <strong>{summary.easy}</strong>
                  </div>
                </div>

                <div className="flashcard-tip-card mb-3">
                  <h6>{isVi ? 'Chiến lược ôn tập' : 'Review strategy'}</h6>
                  <p className="mb-0">{isVi ? <>Chỉ chọn <strong>Học lại</strong> khi bạn thực sự quên. Đánh giá trung thực giúp SRS hiệu quả hơn theo thời gian.</> : <>Use <strong>Again</strong> only when you truly forgot. Honest grading makes SRS much more effective over time.</>}</p>
                </div>

                <div className="flashcard-tip-card flashcard-tip-card-soft">
                  <h6>{isVi ? 'Như thế nào là tiến bộ?' : 'What counts as progress?'}</h6>
                  <ul className="mb-0 ps-3 small text-secondary">
                    <li>{isVi ? 'Hoàn thành thẻ đến hạn mỗi ngày' : 'Finish due cards each day'}</li>
                    <li>{isVi ? 'Giữ phiên ôn ngắn và lặp lại thường xuyên' : 'Keep review sessions short and frequent'}</li>
                    <li>{isVi ? 'Ưu tiên đều đặn thay vì số lượng lớn' : 'Focus on consistency instead of volume'}</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
