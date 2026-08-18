import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const e = {};
    if (!form.password) {
      e.password = 'New password is required';
    } else if (form.password.length < 8) {
      e.password = 'Password must be at least 8 characters';
    }
    if (!form.confirmPassword) {
      e.confirmPassword = 'Please confirm your new password';
    } else if (form.password !== form.confirmPassword) {
      e.confirmPassword = 'Passwords do not match';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await authApi.resetPassword({ token, password: form.password });
      toast.success('Password reset successfully! You can now sign in.');
      navigate('/login');
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          'Failed to reset password. The link may have expired.'
      );
    } finally {
      setLoading(false);
    }
  };

  /* ─── Invalid / missing token state ─── */
  if (!token) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-yellow-100 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Invalid reset link</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          This password reset link is invalid or may have expired. Please
          request a new one.
        </p>
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          Request a new reset link
        </Link>
      </div>
    );
  }

  /* ─── Reset form ─── */
  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Reset password</h1>
        <p className="text-sm text-gray-500 mt-1.5">
          Enter your new password below
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormInput
          label="New Password"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          placeholder="Min. 8 characters"
          required
          error={errors.password}
          autoComplete="new-password"
        />
        <FormInput
          label="Confirm New Password"
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter your new password"
          required
          error={errors.confirmPassword}
          autoComplete="new-password"
        />
        <Button type="submit" className="w-full" loading={loading} size="lg">
          Reset Password
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Remember your password?{' '}
        <Link
          to="/login"
          className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}

export default ResetPassword;
