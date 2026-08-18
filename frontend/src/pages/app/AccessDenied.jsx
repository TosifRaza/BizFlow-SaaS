import { useNavigate } from 'react-router-dom';
import { HiOutlineShieldExclamation } from 'react-icons/hi2';
import Button from '../../components/Button';

function AccessDenied() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
        <HiOutlineShieldExclamation className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
      <p className="mt-2 text-sm text-gray-500 text-center max-w-md">
        You do not have permission to access this page. Contact your business owner or manager if you believe this is an error.
      </p>
      <div className="mt-6">
        <Button variant="secondary" onClick={() => navigate('/app/dashboard')}>
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}

export default AccessDenied;