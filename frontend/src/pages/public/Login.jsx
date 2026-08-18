import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';
import toast from 'react-hot-toast';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
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
    const newErrors = {};
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      toast.success('Logged in successfully');
      if (result?.data?.user?.role === 'super_admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/app/dashboard');
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Invalid email or password. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-sm text-gray-500 mt-1.5">
          Sign in to your BizFlow account to continue
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <FormInput
          label="Email Address"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
          error={errors.email}
          autoComplete="email"
        />

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-700"
            >
              Password <span className="ml-0.5 text-red-500">*</span>
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              autoComplete="current-password"
              className={[
                'w-full rounded-lg border px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 transition-colors duration-150',
                'focus:outline-none focus:ring-2 focus:ring-offset-0',
                errors.password
                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
                'bg-white',
              ].join(' ')}
            />
            {errors.password && (
              <p className="text-xs text-red-600 mt-0.5">{errors.password}</p>
            )}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          loading={loading}
          size="lg"
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
          >
            Create one for free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
