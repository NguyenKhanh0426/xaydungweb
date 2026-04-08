import { useLanguage } from '../../hooks/useLanguage';

const grades = [
  { key: 'again', label: 'Again', hint: 'Need to relearn', className: 'flashcard-grade-again' },
  { key: 'hard', label: 'Hard', hint: 'Barely remembered', className: 'flashcard-grade-hard' },
  { key: 'good', label: 'Good', hint: 'Got it with effort', className: 'flashcard-grade-good' },
  { key: 'easy', label: 'Easy', hint: 'Instant recall', className: 'flashcard-grade-easy' }
];

export default function ReviewButtons({ onReview, disabled = false }) {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const gradeTranslations = {
    again: { label: 'Học lại', hint: 'Cần học lại' },
    hard: { label: 'Khó', hint: 'Vừa nhớ ra' },
    good: { label: 'Tốt', hint: 'Nhớ được có cố gắng' },
    easy: { label: 'Dễ', hint: 'Nhớ ngay lập tức' }
  };

  return (
    <div className="flashcard-review-grid mt-4">
      {grades.map((grade) => (
        <button
          key={grade.key}
          className={`btn flashcard-grade-btn ${grade.className}`}
          onClick={() => onReview(grade.key)}
          disabled={disabled}
        >
          <span className="d-block fw-semibold">{isVi ? gradeTranslations[grade.key].label : grade.label}</span>
          <small>{isVi ? gradeTranslations[grade.key].hint : grade.hint}</small>
        </button>
      ))}
    </div>
  );
}
