import { useLanguage } from '../../hooks/useLanguage';

export default function RecentTestTable({ tests = [] }) {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  return (
    <div className="dashboard-card h-100">
      <div className="dashboard-card-body">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
          <div>
            <span className="dashboard-eyebrow">{isVi ? 'Kiểm tra' : 'Testing'}</span>
            <h5 className="mb-1">{isVi ? 'Kết quả bài test gần đây' : 'Recent test performance'}</h5>
            <p className="dashboard-muted mb-0">{isVi ? 'Xem lại các lần làm bài mới nhất và xác định điểm cần cải thiện tiếp theo.' : 'Review your latest attempts and identify where to improve next.'}</p>
          </div>
          <span className="table-chip">{tests.length} {isVi ? 'bản ghi' : 'records'}</span>
        </div>

        <div className="table-responsive">
          <table className="table align-middle modern-table mb-0">
            <thead>
              <tr>
                <th>{isVi ? 'Bài test' : 'Test'}</th>
                <th>{isVi ? 'Điểm' : 'Score'}</th>
                <th>{isVi ? 'Trạng thái' : 'Status'}</th>
                <th>{isVi ? 'Ngày' : 'Date'}</th>
              </tr>
            </thead>
            <tbody>
              {tests.length > 0 ? (
                tests.map((test) => (
                  <tr key={test.id}>
                    <td>
                      <div className="fw-semibold text-dark">{test.title}</div>
                      <small className="text-secondary">{test.test_type || (isVi ? 'Bài luyện tập' : 'Practice test')}</small>
                    </td>
                    <td>{test.percentage_score ?? 0}%</td>
                    <td>
                      <span className={`status-pill ${Number(test.percentage_score ?? 0) >= 70 ? 'status-pill-success' : 'status-pill-warning'}`}>
                        {Number(test.percentage_score ?? 0) >= 70 ? (isVi ? 'Tốt' : 'Strong') : (isVi ? 'Cần cải thiện' : 'Needs work')}
                      </span>
                    </td>
                    <td>{new Date(test.created_at).toLocaleDateString()}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="text-center text-secondary py-4">{isVi ? 'Chưa có lần làm test nào.' : 'No test attempts yet.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
