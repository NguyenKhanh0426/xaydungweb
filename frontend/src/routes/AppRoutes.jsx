import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import FlashcardReviewPage from '../pages/flashcards/FlashcardReviewPage';
import ProfilePage from '../pages/profile/ProfilePage';
import GoalsPage from '../pages/goals/GoalsPage';
import VocabularyPage from '../pages/vocabulary/VocabularyPage';
import EnGrAssistantPage from '../pages/assistant/EnGrAssistantPage';
import StudyRemindersPage from '../pages/reminders/StudyRemindersPage';
import SkillLogsPage from '../pages/skills/SkillLogsPage';
import MiniTestsPage from '../pages/tests/MiniTestsPage';
import MiniTestHistoryPage from '../pages/tests/MiniTestHistoryPage';
import PrivateRoute from './PrivateRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
      <Route path="/flashcards/review" element={<PrivateRoute><FlashcardReviewPage /></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
      <Route path="/goals" element={<PrivateRoute><GoalsPage /></PrivateRoute>} />
      <Route path="/vocabulary" element={<PrivateRoute><VocabularyPage /></PrivateRoute>} />
      <Route path="/study-reminders" element={<PrivateRoute><StudyRemindersPage /></PrivateRoute>} />
      <Route path="/skill-logs" element={<PrivateRoute><SkillLogsPage /></PrivateRoute>} />
      <Route path="/mini-tests" element={<PrivateRoute><MiniTestsPage /></PrivateRoute>} />
      <Route path="/mini-tests/history" element={<PrivateRoute><MiniTestHistoryPage /></PrivateRoute>} />
      <Route path="/assistant" element={<PrivateRoute><EnGrAssistantPage /></PrivateRoute>} />
    </Routes>
  );
}
