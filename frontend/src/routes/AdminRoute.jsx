import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

function AdminRoute() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return <LoadingSpinner type="page" />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'super_admin') {
    return <Navigate to="/app/dashboard" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;
