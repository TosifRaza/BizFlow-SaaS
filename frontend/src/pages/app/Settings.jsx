import { useState, useEffect, useCallback, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineBuildingOffice,
  HiOutlineArrowPath,
  HiOutlineShieldCheck,
  HiOutlineBell,
  HiOutlineEye,
  HiOutlineClock,
  HiOutlineDevicePhoneMobile,
  HiOutlineLockClosed,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';

import PageHeader from '../../components/PageHeader';
import FormInput from '../../components/FormInput';
import FormSelect from '../../components/FormSelect';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import ConfirmDialog from '../../components/ConfirmDialog';
import { businessApi } from '../../api/businessApi';
import { uploadApi } from '../../api/uploadApi';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import { BUSINESS_TYPES, INDIAN_STATES } from '../../utils/helpers';


const ALL_TABS = [
  { key: 'profile', label: 'Business Profile' },
  { key: 'invoice', label: 'Invoice Settings' },
  { key: 'tax', label: 'Tax Settings' },
  { key: 'security', label: 'Security' },
  { key: 'notifications', label: 'Notifications' },
  { key: 'danger', label: 'Danger Zone', ownerOnly: true },
];

const INVOICE_FORMATS = [
  { value: 'standard', label: 'Standard' },
  { value: 'custom', label: 'Custom' },
];

function ToggleSwitch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      onClick={onChange}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
        checked ? 'bg-blue-600' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

function Settings() {
  // const { user, hasPermission } = useAuth();
// const canUpdate = hasPermission('settings.update');
// const isOwner = user?.role === 'owner';
// const tabs = TABS.filter((t) => !t.ownerOnly || isOwner);
  const { user, hasPermission } = useAuth();
  const canUpdate = hasPermission('settings.update');
  const isOwner = user?.role === 'owner';
  const tabs = ALL_TABS.filter((t) => !t.ownerOnly || isOwner);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Business profile form
  const [profile, setProfile] = useState({
    name: '', type: '', address: '', city: '', state: '',
    pincode: '', phone: '', email: '', gstNumber: '', logo: '',
  });

  // Invoice settings form
  const [invoiceSettings, setInvoiceSettings] = useState({
    invoicePrefix: '', invoiceFormat: 'standard',
  });

  // Tax settings form
  const [taxSettings, setTaxSettings] = useState({
    enableTax: true, defaultTaxRate: '',
  });

  // Danger zone
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Security
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Notifications
  const [notifSettings, setNotifSettings] = useState({
    email: true,
    sms: false,
    lowStock: true,
    salesAlert: false,
    paymentReminder: true,
  });
  const [notifSaving, setNotifSaving] = useState(false);

  // Granular notification preferences
  const [notifPrefs, setNotifPrefs] = useState({
    lowStock: { email: true, inApp: true },
    sales: { inApp: true },
    payments: { email: true, inApp: true },
    expenses: { inApp: true },
    subscription: { email: true, inApp: true },
    dailySummary: { email: false },
  });
  const [prefsSaving, setPrefsSaving] = useState(false);

  // 2FA
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Security display
  const [sessionTimeout, setSessionTimeout] = useState('30 minutes');
  const [passwordExpiry, setPasswordExpiry] = useState('90 days');

  const fileInputRef = useRef(null);

  const fetchBusiness = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await businessApi.getBusiness();
      const biz = data?.data ?? data ?? {};
      setProfile({
        name: biz.name || '',
        type: biz.type || '',
        address: biz.address || '',
        city: biz.city || '',
        state: biz.state || '',
        pincode: biz.pincode || '',
        phone: biz.phone || '',
        email: biz.email || '',
        gstNumber: biz.gstNumber || '',
        logo: biz.logo || '',
      });

      const settings = biz.settings || {};
      setInvoiceSettings({
        invoicePrefix: settings.invoicePrefix || '',
        invoiceFormat: settings.invoiceFormat || 'standard',
      });
      setTaxSettings({
        enableTax: settings.enableTax !== undefined ? settings.enableTax : true,
        defaultTaxRate: settings.defaultTaxRate ?? '',
      });
      const notifs = settings.notifications || {};
      setNotifSettings({
        email: notifs.email !== undefined ? notifs.email : true,
        sms: notifs.sms !== undefined ? notifs.sms : false,
        lowStock: notifs.lowStock !== undefined ? notifs.lowStock : true,
        salesAlert: notifs.salesAlert !== undefined ? notifs.salesAlert : false,
        paymentReminder: notifs.paymentReminder !== undefined ? notifs.paymentReminder : true,
      });
      const security = settings.security || {};
      setTwoFactorEnabled(security.twoFactorEnabled || false);
      setSessionTimeout(security.sessionTimeout ? `${security.sessionTimeout} minutes` : '30 minutes');
      setPasswordExpiry(security.passwordExpiry ? `${security.passwordExpiry} days` : '90 days');

      // Load granular notification preferences
      const prefs = biz.notificationPreferences || {};
      setNotifPrefs({
        lowStock: { email: prefs.lowStock?.email ?? true, inApp: prefs.lowStock?.inApp ?? true },
        sales: { inApp: prefs.sales?.inApp ?? true },
        payments: { email: prefs.payments?.email ?? true, inApp: prefs.payments?.inApp ?? true },
        expenses: { inApp: prefs.expenses?.inApp ?? true },
        subscription: { email: prefs.subscription?.email ?? true, inApp: prefs.subscription?.inApp ?? true },
        dailySummary: { email: prefs.dailySummary?.email ?? false },
      });
    } catch {
      toast.error('Failed to load business settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusiness();
  }, [fetchBusiness]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await uploadApi.uploadImage(formData);
      const url = data?.data?.url ?? data?.url ?? '';
      setProfile((prev) => ({ ...prev, logo: url }));
      toast.success('Logo uploaded');
    } catch {
      toast.error('Failed to upload logo');
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await businessApi.updateBusiness(profile);
      toast.success('Business profile updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveInvoice = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await businessApi.updateSettings(invoiceSettings);
      toast.success('Invoice settings updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update invoice settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTax = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await businessApi.updateSettings({
        ...taxSettings,
        defaultTaxRate: Number(taxSettings.defaultTaxRate),
      });
      toast.success('Tax settings updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update tax settings');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success('Password changed successfully');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleNotifToggle = async (key) => {
    const newVal = !notifSettings[key];
    const updated = { ...notifSettings, [key]: newVal };
    setNotifSettings(updated);
    setNotifSaving(true);
    try {
      await businessApi.updateSettings({ notifications: updated });
      toast.success('Notification preference updated');
    } catch (err) {
      setNotifSettings({ ...updated, [key]: !newVal });
      toast.error(err?.response?.data?.message || 'Failed to update notification');
    } finally {
      setNotifSaving(false);
    }
  };

  const handlePrefToggle = async (category, channel) => {
    const updated = { ...notifPrefs };
    updated[category] = { ...updated[category], [channel]: !updated[category][channel] };
    setNotifPrefs(updated);
    setPrefsSaving(true);
    try {
      await businessApi.updateBusiness({ notificationPreferences: updated });
      toast.success('Notification preference saved');
    } catch (err) {
      setNotifPrefs({ ...notifPrefs });
      toast.error(err?.response?.data?.message || 'Failed to save preference');
    } finally {
      setPrefsSaving(false);
    }
  };

  const handleDeactivate = async () => {
    try {
      await businessApi.updateBusiness({ status: 'inactive' });
      toast.success('Business deactivated');
      setShowDeactivateConfirm(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to deactivate business');
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== profile.name) {
      toast.error('Business name does not match');
      return;
    }
    setDeleting(true);
    try {
      await businessApi.updateBusiness({ status: 'deleted' });
      toast.success('Business deletion initiated');
      setShowDeleteConfirm(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete business');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner type="form" />;

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure your business preferences"
      />

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 mb-4">
        <div className="flex overflow-x-auto px-2 pt-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap rounded-t-lg transition-colors cursor-pointer ${
                activeTab === tab.key
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Business Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Business Information</h3>
          <p className="text-sm text-gray-500 mb-6">Update your business details and contact information.</p>

          <form onSubmit={handleSaveProfile} className="space-y-6">
            <fieldset disabled={!canUpdate} className={canUpdate ? '' : 'opacity-70 pointer-events-none'}>
            {/* Logo upload */}
            <div className="flex flex-col gap-3">
              <label className="text-sm font-medium text-gray-700">Business Logo</label>
              <div className="flex items-center gap-4">
                {profile.logo ? (
                  <div className="relative">
                    <img
                      src={profile.logo}
                      alt="Business logo"
                      className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => setProfile({ ...profile, logo: '' })}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50">
                    <HiOutlineBuildingOffice className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Logo
                  </Button>
                  <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 2MB</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                name="name"
                label="Business Name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                required
                placeholder="Enter business name"
              />
              <FormSelect
                name="type"
                label="Business Type"
                value={profile.type}
                onChange={(e) => setProfile({ ...profile, type: e.target.value })}
                options={BUSINESS_TYPES}
                placeholder="Select type"
              />
              <FormInput
                name="address"
                label="Address"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                placeholder="Street address"
                className="sm:col-span-2"
              />
              <FormInput
                name="city"
                label="City"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="City"
              />
              <FormSelect
                name="state"
                label="State"
                value={profile.state}
                onChange={(e) => setProfile({ ...profile, state: e.target.value })}
                options={INDIAN_STATES.map((s) => ({ value: s, label: s }))}
                placeholder="Select state"
              />
              <FormInput
                name="pincode"
                label="Pincode"
                value={profile.pincode}
                onChange={(e) => setProfile({ ...profile, pincode: e.target.value })}
                placeholder="123456"
              />
              <FormInput
                name="phone"
                label="Phone"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                placeholder="9876543210"
              />
              <FormInput
                name="email"
                label="Email"
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="business@email.com"
              />
              <FormInput
                name="gstNumber"
                label="GST Number"
                value={profile.gstNumber}
                onChange={(e) => setProfile({ ...profile, gstNumber: e.target.value })}
                placeholder="22AAAAA0000A1Z5"
              />
            </div>

            <div className="flex justify-end">
              {canUpdate && <Button type="submit" loading={saving}>
                <HiOutlineArrowPath className="w-4 h-4" /> Save Profile
              </Button>}
            </div>
            </fieldset>
          </form>
        </div>
      )}

      {/* Invoice Settings Tab */}
      {activeTab === 'invoice' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Invoice Settings</h3>
          <p className="text-sm text-gray-500 mb-6">Configure how your invoices look and are numbered.</p>

          <form onSubmit={handleSaveInvoice} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormInput
                name="invoicePrefix"
                label="Invoice Prefix"
                value={invoiceSettings.invoicePrefix}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, invoicePrefix: e.target.value })}
                placeholder="e.g. INV-"
              />
              <FormSelect
                name="invoiceFormat"
                label="Invoice Format"
                value={invoiceSettings.invoiceFormat}
                onChange={(e) => setInvoiceSettings({ ...invoiceSettings, invoiceFormat: e.target.value })}
                options={INVOICE_FORMATS}
              />
            </div>

            <div className="flex justify-end">
              {canUpdate && <Button type="submit" loading={saving}>
                <HiOutlineArrowPath className="w-4 h-4" /> Save Invoice Settings
              </Button>}
            </div>
          </form>
        </div>
      )}

      {/* Tax Settings Tab */}
      {activeTab === 'tax' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Tax Settings</h3>
          <p className="text-sm text-gray-500 mb-6">Configure tax rules for your business.</p>

          <form onSubmit={handleSaveTax} className="space-y-6">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={taxSettings.enableTax}
                  onChange={(e) => setTaxSettings({ ...taxSettings, enableTax: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
              <span className="text-sm font-medium text-gray-700">Enable Tax</span>
            </div>

            {taxSettings.enableTax && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormInput
                  name="defaultTaxRate"
                  label="Default Tax Rate (%)"
                  type="number"
                  value={taxSettings.defaultTaxRate}
                  onChange={(e) => setTaxSettings({ ...taxSettings, defaultTaxRate: e.target.value })}
                  min="0"
                  max="100"
                  placeholder="e.g. 18"
                />
              </div>
            )}

            <div className="flex justify-end">
              {canUpdate && <Button type="submit" loading={saving}>
                <HiOutlineArrowPath className="w-4 h-4" /> Save Tax Settings
              </Button>}
            </div>
          </form>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-base font-semibold text-gray-900 mb-1">Security Settings</h3>
            <p className="text-sm text-gray-500 mb-6">Manage your account security and password.</p>

            {/* Session Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <HiOutlineClock className="w-4 h-4" />
                  Session Timeout
                </div>
                <p className="text-sm font-semibold text-gray-900">{sessionTimeout}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                  <HiOutlineShieldCheck className="w-4 h-4" />
                  Password Expiry
                </div>
                <p className="text-sm font-semibold text-gray-900">{passwordExpiry}</p>
              </div>
            </div>

            {/* Active Session */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Active Session</h4>
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <HiOutlineDevicePhoneMobile className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-green-900">Current Session</p>
                      <p className="text-xs text-green-700">Your session expires after 24 hours</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-green-700 bg-green-100 rounded-full">
                    Active
                  </span>
                </div>
              </div>
            </div>

            {/* Two-Factor Authentication */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Two-Factor Authentication</h4>
              <p className="text-xs text-gray-500 mb-3">Add an extra layer of security to your account.</p>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <HiOutlineLockClosed className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Enable 2FA</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <HiOutlineExclamationTriangle className="w-3 h-3 text-amber-500" />
                      <p className="text-xs text-amber-600">Coming soon</p>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  disabled
                  className={`relative inline-flex h-6 w-11 items-center rounded-full bg-gray-300 cursor-not-allowed opacity-50`}
                >
                  <span className="inline-block h-5 w-5 transform rounded-full bg-white translate-x-1" />
                </button>
              </div>
            </div>

            {/* Change Password */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-semibold text-gray-900 mb-4">Change Password</h4>
              <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                <div className="relative">
                  <FormInput
                    name="currentPassword"
                    label="Current Password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    <HiOutlineEye className="w-5 h-5" />
                  </button>
                </div>
                <FormInput
                  name="newPassword"
                  label="New Password"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  placeholder="Enter new password"
                  required
                />
                <FormInput
                  name="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  placeholder="Confirm new password"
                  required
                />
                <div className="pt-1">
                  <Button type="submit" loading={passwordLoading}>
                    <HiOutlineShieldCheck className="w-4 h-4" /> Change Password
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Notification Preferences</h3>
          <p className="text-sm text-gray-500 mb-6">Choose how and when you want to be notified.</p>

          {prefsSaving && (
            <p className="text-xs text-blue-600 mb-4">Saving...</p>
          )}

          <div className="space-y-4">
            {/* Column headers */}
            <div className="grid grid-cols-[1fr,100px,100px] gap-4 px-4 pb-2 border-b border-gray-200">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Notification Type</span>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">Email</span>
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wider text-center">In-App</span>
            </div>

            {/* Low Stock Alerts */}
            <div className="grid grid-cols-[1fr,100px,100px] gap-4 items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Low Stock Alerts</p>
                <p className="text-xs text-gray-500 mt-0.5">Get alerted when product stock is running low</p>
              </div>
              <div className="flex justify-center">
                <ToggleSwitch checked={notifPrefs.lowStock?.email} onChange={() => handlePrefToggle('lowStock', 'email')} disabled={prefsSaving || !canUpdate} />
              </div>
              <div className="flex justify-center">
                <ToggleSwitch checked={notifPrefs.lowStock?.inApp} onChange={() => handlePrefToggle('lowStock', 'inApp')} disabled={prefsSaving || !canUpdate} />
              </div>
            </div>

            {/* Sale Notifications */}
            <div className="grid grid-cols-[1fr,100px,100px] gap-4 items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Sale Notifications</p>
                <p className="text-xs text-gray-500 mt-0.5">Get notified about new sales and orders</p>
              </div>
              <div className="flex justify-center">
                <span className="text-xs text-gray-400">—</span>
              </div>
              <div className="flex justify-center">
                <ToggleSwitch checked={notifPrefs.sales?.inApp} onChange={() => handlePrefToggle('sales', 'inApp')} disabled={prefsSaving || !canUpdate} />
              </div>
            </div>

            {/* Payment Reminders */}
            <div className="grid grid-cols-[1fr,100px,100px] gap-4 items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Payment Reminders</p>
                <p className="text-xs text-gray-500 mt-0.5">Receive reminders for pending payments</p>
              </div>
              <div className="flex justify-center">
                <ToggleSwitch checked={notifPrefs.payments?.email} onChange={() => handlePrefToggle('payments', 'email')} disabled={prefsSaving || !canUpdate} />
              </div>
              <div className="flex justify-center">
                <ToggleSwitch checked={notifPrefs.payments?.inApp} onChange={() => handlePrefToggle('payments', 'inApp')} disabled={prefsSaving || !canUpdate} />
              </div>
            </div>

            {/* Expense Alerts */}
            <div className="grid grid-cols-[1fr,100px,100px] gap-4 items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Expense Alerts</p>
                <p className="text-xs text-gray-500 mt-0.5">Get notified about new expense entries</p>
              </div>
              <div className="flex justify-center">
                <span className="text-xs text-gray-400">—</span>
              </div>
              <div className="flex justify-center">
                <ToggleSwitch checked={notifPrefs.expenses?.inApp} onChange={() => handlePrefToggle('expenses', 'inApp')} disabled={prefsSaving || !canUpdate} />
              </div>
            </div>

            {/* Subscription Renewal Reminders */}
            <div className="grid grid-cols-[1fr,100px,100px] gap-4 items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Subscription Renewal</p>
                <p className="text-xs text-gray-500 mt-0.5">Get reminded before your plan expires</p>
              </div>
              <div className="flex justify-center">
                <ToggleSwitch checked={notifPrefs.subscription?.email} onChange={() => handlePrefToggle('subscription', 'email')} disabled={prefsSaving || !canUpdate} />
              </div>
              <div className="flex justify-center">
                <ToggleSwitch checked={notifPrefs.subscription?.inApp} onChange={() => handlePrefToggle('subscription', 'inApp')} disabled={prefsSaving || !canUpdate} />
              </div>
            </div>

            {/* Daily Summary Email */}
            <div className="grid grid-cols-[1fr,100px,100px] gap-4 items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div>
                <p className="text-sm font-medium text-gray-900">Daily Summary Email</p>
                <p className="text-xs text-gray-500 mt-0.5">Receive a daily summary of your business activity</p>
              </div>
              <div className="flex justify-center">
                <ToggleSwitch checked={notifPrefs.dailySummary?.email} onChange={() => handlePrefToggle('dailySummary', 'email')} disabled={prefsSaving || !canUpdate} />
              </div>
              <div className="flex justify-center">
                <span className="text-xs text-gray-400">—</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Danger Zone Tab */}
      {activeTab === 'danger' && (
        <div className="bg-white rounded-xl border border-red-200 p-6">
          <h3 className="text-base font-semibold text-red-700 mb-1">Danger Zone</h3>
          <p className="text-sm text-gray-500 mb-6">Irreversible and destructive actions for your business.</p>

          <div className="space-y-6">
            {/* Deactivate */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div>
                <h4 className="text-sm font-semibold text-gray-900">Deactivate Business</h4>
                <p className="text-sm text-gray-500 mt-0.5">
                  Temporarily disable your business. You can reactivate it later.
                </p>
              </div>
              <Button variant="secondary" className="!bg-yellow-500 !text-white hover:!bg-yellow-600 shrink-0" onClick={() => setShowDeactivateConfirm(true)}>
                Deactivate
              </Button>
            </div>

            {/* Delete */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div>
                <h4 className="text-sm font-semibold text-red-700">Delete Business</h4>
                <p className="text-sm text-gray-500 mt-0.5">
                  Permanently delete your business and all associated data. This cannot be undone.
                </p>
              </div>
              <Button variant="danger" className="shrink-0" onClick={() => setShowDeleteConfirm(true)}>
                Delete Business
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirm */}
      <ConfirmDialog
        isOpen={showDeactivateConfirm}
        onCancel={() => setShowDeactivateConfirm(false)}
        onConfirm={handleDeactivate}
        title="Deactivate Business?"
        message="Your business will be temporarily disabled. All users will lose access until you reactivate."
        confirmText="Deactivate"
        variant="warning"
      />

      {/* Delete Confirm - Must type business name */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Business" size="md">
        <div className="space-y-4">
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <p className="text-sm text-red-700 font-medium">
              ⚠️ This action is permanent and cannot be undone. All data will be permanently deleted.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-600">
              Type <span className="font-bold text-gray-900">{profile.name || 'your business name'}</span> to confirm:
            </p>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Enter business name"
              className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-gray-400"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              loading={deleting}
              disabled={deleteConfirmText !== profile.name}
            >
              Delete Permanently
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Settings;
