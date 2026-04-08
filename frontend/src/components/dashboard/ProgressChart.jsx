import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useLanguage } from '../../hooks/useLanguage';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

export default function ProgressChart({ labels, minutes, exp = [] }) {
  const { language } = useLanguage();
  const isVi = language === 'vi';
  const data = {
    labels,
    datasets: [
      {
        label: isVi ? 'Phút học' : 'Study minutes',
        data: minutes,
        tension: 0.35,
        fill: true,
        borderWidth: 3,
      },
      {
        label: isVi ? 'EXP nhận được' : 'EXP gained',
        data: exp,
        tension: 0.35,
        borderWidth: 2,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          drawBorder: false
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  return (
    <div className="dashboard-card h-100">
      <div className="dashboard-card-body h-100">
        <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
          <div>
            <span className="dashboard-eyebrow">{isVi ? 'Phân tích' : 'Analytics'}</span>
            <h5 className="mb-1">{isVi ? 'Động lực học tập theo tuần' : 'Weekly learning momentum'}</h5>
            <p className="dashboard-muted mb-0">{isVi ? 'Theo dõi thời gian học và EXP đạt được trong 7 phiên gần nhất.' : 'Track your study time and earned EXP over the last 7 sessions.'}</p>
          </div>
        </div>
        <div className="chart-shell">
          <Line data={data} options={options} />
        </div>
      </div>
    </div>
  );
}
