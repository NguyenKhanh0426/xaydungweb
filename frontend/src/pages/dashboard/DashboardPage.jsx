import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import Loader from '../../components/common/Loader';
import StatCard from '../../components/dashboard/StatCard';
import ProgressChart from '../../components/dashboard/ProgressChart';
import RecentTestTable from '../../components/dashboard/RecentTestTable';
import SkillRadarCard from '../../components/dashboard/SkillRadarCard';
import FocusPanel from '../../components/dashboard/FocusPanel';
import { dashboardService } from '../../services/dashboardService';
import { useLanguage } from '../../hooks/useLanguage';

export default function DashboardPage() {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await dashboardService.getOverview();
        setData(response);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <DashboardLayout><Loader /></DashboardLayout>;

  const labels = isVi ? ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeklyMinutes = data?.weeklyStudyMinutes?.length ? data.weeklyStudyMinutes : [20, 35, 40, 30, 55, 60, 45];
  const weeklyExp = data?.weeklyExp?.length ? data.weeklyExp : [15, 25, 30, 20, 35, 42, 28];
  const averageMinutes = Math.round(weeklyMinutes.reduce((sum, item) => sum + Number(item || 0), 0) / weeklyMinutes.length);

  return (
    <DashboardLayout>
      <section className="dashboard-hero mb-4">
        <div className="row g-4 align-items-center">
          <div className="col-12 col-xl-7">
            <span className="dashboard-eyebrow dashboard-eyebrow-light">{isVi ? 'Hiệu suất' : 'Performance'}</span>
            <h3 className="dashboard-hero-title mt-2 mb-3">{isVi ? 'Xây dựng thói quen học tiếng Anh mạnh mẽ hơn với tín hiệu rõ ràng mỗi ngày.' : 'Build a stronger English routine with clear daily signals.'}</h3>
            <p className="dashboard-hero-text mb-4">
              {isVi ? 'Ôn các thẻ đến hạn, theo dõi chuỗi ngày học và dùng phần phân tích bên dưới để giữ nhịp tiến bộ.' : 'Review your due cards, watch your streak, and use the analytics below to keep momentum steady.'}
            </p>
            <div className="dashboard-hero-metrics d-flex flex-wrap gap-3">
              <div className="hero-metric-card">
                <strong>{averageMinutes} min</strong>
                <span>{isVi ? 'trung bình mỗi ngày' : 'avg daily study'}</span>
              </div>
              <div className="hero-metric-card">
                <strong>{data?.todayDueFlashcards || 0}</strong>
                <span>{isVi ? 'thẻ đến hạn' : 'cards due now'}</span>
              </div>
              <div className="hero-metric-card">
                <strong>{data?.user?.currentStreak || 0}</strong>
                <span>{isVi ? 'chuỗi ngày học' : 'day streak'}</span>
              </div>
            </div>
          </div>
          <div className="col-12 col-xl-5">
            <div className="dashboard-hero-panel">
              <div className="dashboard-hero-panel-ring">
                <div>
                  <small>{isVi ? 'Mốc tiếp theo' : 'Next milestone'}</small>
                  <strong>{(data?.user?.totalExp || 0) + 120} EXP</strong>
                </div>
              </div>
              <div className="dashboard-hero-panel-copy">
                <span className="dashboard-eyebrow">{isVi ? 'Gợi ý' : 'Recommendation'}</span>
                <h5 className="mb-2">{isVi ? 'Kết quả nhanh nhất hôm nay' : 'Your fastest win today'}</h5>
                <p className="dashboard-muted mb-0">{isVi ? 'Hãy hoàn thành thẻ đến hạn trước, sau đó làm một phiên viết hoặc đọc tập trung.' : 'Finish your due flashcards first, then do one focused writing or reading session.'}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="row g-3 mb-4">
        <div className="col-12 col-md-6 col-xxl-3">
          <StatCard title={isVi ? 'Tổng EXP' : 'Total EXP'} value={data?.user?.totalExp || 0} subtitle={isVi ? 'Điểm học tích lũy' : 'Accumulated learning points'} accent="blue" trend={isVi ? '+12% so với tuần trước' : '+12% vs last week'} />
        </div>
        <div className="col-12 col-md-6 col-xxl-3">
          <StatCard title={isVi ? 'Chuỗi hiện tại' : 'Current Streak'} value={data?.user?.currentStreak || 0} subtitle={isVi ? 'Số ngày học liên tiếp' : 'Days studied continuously'} accent="violet" trend={isVi ? 'Đều đặn là lợi thế' : 'Consistency is your edge'} />
        </div>
        <div className="col-12 col-md-6 col-xxl-3">
          <StatCard title={isVi ? 'Thẻ đến hạn' : 'Due Flashcards'} value={data?.todayDueFlashcards || 0} subtitle={isVi ? 'Các thẻ đang chờ ôn' : 'Cards waiting for review'} accent="cyan" trend={isVi ? 'Hoàn thành trước khi thêm mới' : 'Clear them before adding new'} />
        </div>
        <div className="col-12 col-md-6 col-xxl-3">
          <StatCard title={isVi ? 'Bài test gần đây' : 'Recent Tests'} value={data?.recentTests?.length || 0} subtitle={isVi ? 'Các lần làm bài mới nhất' : 'Latest test attempts'} accent="amber" trend={isVi ? 'Luyện tập tạo tiến bộ' : 'Practice creates signal'} />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-xl-8">
          <ProgressChart labels={labels} minutes={weeklyMinutes} exp={weeklyExp} />
        </div>
        <div className="col-12 col-xl-4">
          <SkillRadarCard skills={data?.skillStats} />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-12 col-lg-5 col-xl-4">
          <FocusPanel
            dueFlashcards={data?.todayDueFlashcards || 0}
            streak={data?.user?.currentStreak || 0}
            exp={data?.user?.totalExp || 0}
          />
        </div>
        <div className="col-12 col-lg-7 col-xl-8">
          <RecentTestTable tests={data?.recentTests || []} />
        </div>
      </div>
    </DashboardLayout>
  );
}
