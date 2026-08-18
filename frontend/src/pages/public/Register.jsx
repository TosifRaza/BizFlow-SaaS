import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import { BUSINESS_TYPES, INDIAN_STATES, validateEmail, validatePhone } from '../../utils/helpers';
import toast from 'react-hot-toast';

const STEPS = [
  { num: 1, label: 'Account' },
  { num: 2, label: 'Business' },
  { num: 3, label: 'Settings' },
];

const businessTypeOptions = BUSINESS_TYPES;
const stateOptions = INDIAN_STATES.map((s) => ({ value: s, label: s }));

const INITIAL_FORM = {
  name: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
  businessName: '',
  businessType: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  enableTax: true,
  taxRate: '18',
  invoicePrefix: 'INV',
};

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  /* ─── validation per step ─── */
  const validateStep1 = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!validateEmail(form.email)) e.email = 'Enter a valid email address';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    else if (!validatePhone(form.phone)) e.phone = 'Enter a valid 10-digit Indian phone number';
    if (!form.password) e.password = 'Password is required';
    else if (form.password.length < 8) e.password = 'Password must be at least 8 characters';
    if (!form.confirmPassword) e.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep2 = () => {
    const e = {};
    if (!form.businessName.trim()) e.businessName = 'Business name is required';
    if (!form.businessType) e.businessType = 'Please select a business type';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state) e.state = 'Please select a state';
    if (!form.pincode.trim()) e.pincode = 'Pincode is required';
    else if (!/^[1-9][0-9]{5}$/.test(form.pincode)) e.pincode = 'Enter a valid 6-digit pincode';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validateStep3 = () => {
    const e = {};
    if (form.enableTax) {
      const rate = Number(form.taxRate);
      if (isNaN(rate) || rate < 0 || rate > 100) e.taxRate = 'Enter a valid tax rate (0-100)';
    }
    if (!form.invoicePrefix.trim()) e.invoicePrefix = 'Invoice prefix is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step < 3) setStep((s) => s + 1);
  };

  const goBack = () => {
    if (step > 1) setStep((s) => s - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep3()) return;

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        businessName: form.businessName,
        businessType: form.businessType,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        enableTax: form.enableTax,
        taxRate: Number(form.taxRate),
        invoicePrefix: form.invoicePrefix,
      });
      toast.success('Account created successfully!');
      navigate('/app/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please try again.';
      const fieldErrors = err.response?.data?.errors;
      if (fieldErrors) {
        const details = Object.values(fieldErrors).join(', ');
        toast.error(`${msg}: ${details}`);
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
        <p className="text-sm text-gray-500 mt-1.5">
          Start managing your business with BizFlow
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => {
          const isActive = step === s.num;
          const isDone = step > s.num;
          return (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : isDone
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {isDone ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  ) : (
                    s.num
                  )}
                </div>
                <span
                  className={`mt-1 text-xs font-medium ${
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={`h-px flex-1 mt-[-16px] ${
                    step > s.num ? 'bg-blue-400' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate>
        {/* ── Step 1: Account ── */}
        {step === 1 && (
          <div className="space-y-4">
            <FormInput
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Rahul Sharma"
              required
              error={errors.name}
              autoComplete="name"
            />
            <FormInput
              label="Email Address"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="rahul@example.com"
              required
              error={errors.email}
              autoComplete="email"
            />
            <FormInput
              label="Phone Number"
              type="tel"
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="9876543210"
              required
              error={errors.phone}
              autoComplete="tel"
            />
            <FormInput
              label="Password"
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
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Re-enter your password"
              required
              error={errors.confirmPassword}
              autoComplete="new-password"
            />
          </div>
        )}

        {/* ── Step 2: Business ── */}
        {step === 2 && (
          <div className="space-y-4">
            <FormInput
              label="Business Name"
              name="businessName"
              value={form.businessName}
              onChange={handleChange}
              placeholder="Sharma General Store"
              required
              error={errors.businessName}
            />
            <FormSelect
              label="Business Type"
              name="businessType"
              value={form.businessType}
              onChange={handleChange}
              options={businessTypeOptions}
              placeholder="Select business type"
              required
              error={errors.businessType}
            />
            <FormInput
              label="Address"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="123 Main Road, near Bus Stand"
              error={errors.address}
            />
            <div className="grid grid-cols-2 gap-3">
              <FormInput
                label="City"
                name="city"
                value={form.city}
                onChange={handleChange}
                placeholder="Mumbai"
                required
                error={errors.city}
              />
              <FormSelect
                label="State"
                name="state"
                value={form.state}
                onChange={handleChange}
                options={stateOptions}
                placeholder="Select state"
                required
                error={errors.state}
              />
            </div>
            <FormInput
              label="Pincode"
              name="pincode"
              value={form.pincode}
              onChange={handleChange}
              placeholder="400001"
              required
              error={errors.pincode}
            />
          </div>
        )}

        {/* ── Step 3: Settings ── */}
        {step === 3 && (
          <div className="space-y-4">
            <FormSelect
              label="Currency"
              name="currency"
              value="INR"
              onChange={() => {}}
              options={[{ value: 'INR', label: 'INR (₹) — Indian Rupee' }]}
              disabled
            />

            <div className="flex items-center gap-3">
              <input
                id="enableTax"
                name="enableTax"
                type="checkbox"
                checked={form.enableTax}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="enableTax" className="text-sm font-medium text-gray-700 cursor-pointer">
                Enable Tax (GST)
              </label>
            </div>

            {form.enableTax && (
              <FormInput
                label="Tax Rate (%)"
                type="number"
                name="taxRate"
                value={form.taxRate}
                onChange={handleChange}
                placeholder="18"
                error={errors.taxRate}
                min="0"
                max="100"
              />
            )}

            <FormInput
              label="Invoice Prefix"
              name="invoicePrefix"
              value={form.invoicePrefix}
              onChange={handleChange}
              placeholder="INV"
              required
              error={errors.invoicePrefix}
            />

            <p className="text-xs text-gray-400 leading-relaxed">
              Invoices will be numbered like <strong>{form.invoicePrefix || 'INV'}-0001</strong>. You can change this later in settings.
            </p>
          </div>
        )}

        {/* ── Navigation buttons ── */}
        <div className="flex items-center gap-3 mt-8">
          {step > 1 && (
            <Button
              type="button"
              variant="secondary"
              onClick={goBack}
              className="flex-1"
            >
              Back
            </Button>
          )}

          {step < 3 ? (
            <Button
              type="button"
              onClick={goNext}
              className="flex-1"
              size="lg"
            >
              Next
            </Button>
          ) : (
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
              size="lg"
            >
              Create Account
            </Button>
          )}
        </div>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Already have an account?{' '}
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

export default Register;
