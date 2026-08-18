import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import AccessDenied from '../pages/app/AccessDenied';

function ProtectedRoute({ permission, ownerOnly, children }) {
  const { isAuthenticated, loading, hasPermission, user } = useAuth();

  if (loading) {
    return <LoadingSpinner type="page" />;
  }

  const hasToken = isAuthenticated || !!localStorage.getItem('token');

  if (!hasToken) {
    return <Navigate to="/login" replace />;
  }

  if (ownerOnly && user?.role !== 'owner') {
    return <AccessDenied />;
  }

  if (permission && !hasPermission(permission)) {
    return <AccessDenied />;
  }

  return children ? children : <Outlet />;
}

export default ProtectedRoute;