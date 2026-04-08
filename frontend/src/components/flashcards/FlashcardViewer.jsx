import { useLanguage } from '../../hooks/useLanguage';

export default function FlashcardViewer({ card, showAnswer, onToggleAnswer, reviewed = 0, total = 0 }) {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  if (!card) {
    return (
      <div className="card shadow-sm border-0 text-center p-5 flashcard-empty-state">
        <div className="flashcard-empty-icon mx-auto mb-3">✓</div>
        <h3 className="mb-2">{isVi ? 'Không có thẻ đến hạn' : 'No due flashcards'}</h3>
        <p className="text-muted mb-0">{isVi ? 'Bạn đã hoàn thành hết thẻ hiện tại. Hãy quay lại sau cho phiên ôn tiếp theo.' : 'You are all caught up for now. Come back later for the next review wave.'}</p>
      </div>
    );
  }

  return (
    <div className="card shadow-sm border-0 flashcard-card-modern overflow-hidden">
      <div className="flashcard-card-topbar d-flex justify-content-between align-items-center gap-3 px-4 px-lg-5 py-3">
        <div>
          <span className="flashcard-micro-label">{isVi ? 'Mặt trước thẻ' : 'Card prompt'}</span>
          <div className="text-muted small">{isVi ? `Ôn ${reviewed + 1} / ${total}` : `Review ${reviewed + 1} of ${total}`}</div>
        </div>
        <span className="badge rounded-pill flashcard-badge">{isVi ? 'SRS đang hoạt động' : 'SRS active'}</span>
      </div>

      <div className="card-body text-center p-4 p-lg-5 d-flex flex-column justify-content-center">
        <div className="flashcard-surface mx-auto w-100">
          <p className="text-uppercase text-muted small fw-semibold mb-2">{isVi ? 'Mặt trước' : 'Front'}</p>
          <h1 className="flashcard-main-text mb-3">{card.front_text}</h1>
          {!showAnswer ? (
            <>
              <p className="flashcard-helper-text mx-auto mb-4">{isVi ? 'Hãy nhớ lại nghĩa, cách phát âm và một ví dụ trước khi hiện đáp án.' : 'Try to recall the meaning, pronunciation, and one example before revealing the answer.'}</p>
              <button className="btn auth-submit-btn px-4" onClick={onToggleAnswer}>{isVi ? 'Hiện đáp án' : 'Show answer'}</button>
            </>
          ) : (
            <>
              <div className="flashcard-divider my-4" />
              <p className="text-uppercase text-muted small fw-semibold mb-2">{isVi ? 'Mặt sau' : 'Back'}</p>
              <h3 className="mb-3">{card.back_text}</h3>
              {card.phonetic && <p className="flashcard-phonetic mb-2">{card.phonetic}</p>}
              {card.example_sentence && <p className="flashcard-example mb-0">{card.example_sentence}</p>}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
