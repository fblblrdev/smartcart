import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import LoadingScreen from './LoadingScreen';

interface Props {
  children: React.ReactNode;
  role?: UserRole;
}

export default function ProtectedRoute({ children, role }: Props) {
  const { appUser, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!appUser) return <Navigate to="/login" replace />;
  if (role && appUser.role !== role) return <Navigate to="/" replace />;
  return <>{children}</>;
}
