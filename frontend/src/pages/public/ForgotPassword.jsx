import { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';
import toast from 'react-hot-toast';
import { authApi } from '../../api/authApi';
import { validateEmail } from '../../utils/helpers';

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    if (!validateEmail(email)) {
      setError('Enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSent(true);
      toast.success('Check your email for the reset link');
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Failed to send reset link. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center py-4">
        <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-7 h-7 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Check your email</h2>
        <p className="text-sm text-gray-500 mt-2 leading-relaxed">
          We&apos;ve sent a password reset link to{' '}
          <strong className="text-gray-700">{email}</strong>. The link will
          expire in 15 minutes.
        </p>
        <p className="text-xs text-gray-400 mt-3">
          Didn&apos;t receive the email? Check your spam folder or{' '}
          <button
            onClick={() => {
              setSent(false);
              setEmail('');
            }}
            className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
          >
            try again
          </button>
          .
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 mt-6 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Forgot password?</h1>
        <p className="text-sm text-gray-500 mt-1.5">
          No worries. Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormInput
          label="Email Address"
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
          error={error}
          autoComplete="email"
        />
        <Button type="submit" className="w-full" loading={loading} size="lg">
          Send Reset Link
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

export default ForgotPassword;
