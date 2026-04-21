import { useLanguage } from '../../hooks/useLanguage';

export default function FocusPanel({ dueFlashcards = 0, streak = 0, exp = 0 }) {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const focusItems = [
    {
      label: isVi ? 'Thẻ đến hạn' : 'Flashcards due',
      value: dueFlashcards,
      note: isVi ? 'Xử lý hết thẻ đến hạn để SRS hoạt động hiệu quả.' : 'Clear your due queue to keep SRS effective.'
    },
    {
      label: isVi ? 'Chuỗi hiện tại' : 'Current streak',
      value: isVi ? `${streak} ngày` : `${streak} days`,
      note: isVi ? 'Một phiên ngắn hôm nay sẽ giữ chuỗi không bị đứt.' : 'One small session today keeps the chain alive.'
    },
    {
      label: isVi ? 'Tổng EXP' : 'Total EXP',
      value: exp,
      note: isVi ? 'Sự đều đặn mỗi ngày sẽ tích lũy thành tiến bộ rõ rệt.' : 'Daily consistency compounds into visible progress.'
    }
  ];

  return (
    <div className="dashboard-card h-100">
      <div className="dashboard-card-body">
        <span className="dashboard-eyebrow">{isVi ? 'Hôm nay' : 'Today'}</span>
        <h5 className="mb-1">{isVi ? 'Kế hoạch trọng tâm' : 'Focus plan'}</h5>
        <p className="dashboard-muted mb-4">{isVi ? 'Những hành động có tác động cao nhất cho phiên học này.' : 'Your highest-impact actions for this session.'}</p>

        <div className="focus-list">
          {focusItems.map((item, index) => (
            <div className="focus-item" key={item.label}>
              <div className="focus-item-number">0{index + 1}</div>
              <div>
                <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                  <span className="fw-semibold text-dark">{item.label}</span>
                  <span className="table-chip">{item.value}</span>
                </div>
                <p className="dashboard-muted mb-0">{item.note}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
