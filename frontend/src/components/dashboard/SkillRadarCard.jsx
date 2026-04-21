import { useLanguage } from '../../hooks/useLanguage';

export default function SkillRadarCard({ skills }) {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const safeSkills = skills || {
    listening: 62,
    speaking: 54,
    reading: 71,
    writing: 58,
  };

  const items = [
    { label: isVi ? 'Nghe' : 'Listening', value: safeSkills.listening ?? 0 },
    { label: isVi ? 'Nói' : 'Speaking', value: safeSkills.speaking ?? 0 },
    { label: isVi ? 'Đọc' : 'Reading', value: safeSkills.reading ?? 0 },
    { label: isVi ? 'Viết' : 'Writing', value: safeSkills.writing ?? 0 },
  ];

  return (
    <div className="dashboard-card h-100">
      <div className="dashboard-card-body">
        <span className="dashboard-eyebrow">{isVi ? 'Kỹ năng' : 'Skills'}</span>
        <h5 className="mb-1">{isVi ? 'Tổng quan 4 kỹ năng' : '4-skill snapshot'}</h5>
        <p className="dashboard-muted mb-4">{isVi ? 'Ảnh chụp nhanh mức độ cân bằng hiện tại giữa các kỹ năng tiếng Anh cốt lõi.' : 'A fast overview of your current balance across core English skills.'}</p>

        <div className="d-grid gap-3">
          {items.map((item) => (
            <div key={item.label}>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold text-dark">{item.label}</span>
                <span className="dashboard-muted">{item.value}%</span>
              </div>
              <div className="skill-progress-track">
                <div className="skill-progress-fill" style={{ width: `${Math.max(6, item.value)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
