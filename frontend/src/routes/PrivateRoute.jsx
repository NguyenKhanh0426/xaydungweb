import { Navigate } from 'react-router-dom';
import Loader from '../components/common/Loader';
import { useAuth } from '../hooks/useAuth';

export default function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <Loader />;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
