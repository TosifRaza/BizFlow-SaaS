import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineCog6Tooth,
  HiOutlineEnvelope,
  HiOutlineWrenchScrewdriver,
} from 'react-icons/hi2';
import PageHeader from '../../components/PageHeader';
import Button from '../../components/Button';
import FormInput from '../../components/FormInput';
import LoadingSpinner from '../../components/LoadingSpinner';
import { adminApi } from '../../api/adminApi';

const TABS = [
  { id: 'platform', label: 'Platform Settings', icon: HiOutlineCog6Tooth },
  { id: 'email', label: 'Email Settings', icon: HiOutlineEnvelope },
  { id: 'maintenance', label: 'Maintenance', icon: HiOutlineWrenchScrewdriver },
];

const INITIAL_PLATFORM = {
  platformName: 'StoreX',
  supportEmail: 'support@StoreX.com',
  defaultTrialDays: '14',
};

const INITIAL_EMAIL = {
  smtpHost: '',
  smtpPort: '587',
  smtpUser: '',
  smtpPassword: '',
};

const INITIAL_MAINTENANCE = {
  maintenanceMode: false,
  maintenanceMessage: 'We are currently performing scheduled maintenance. Please check back shortly.',
};

function AdminSettings() {
  const [activeTab, setActiveTab] = useState('platform');
  const [saving, setSaving] = useState({});
  const [loading, setLoading] = useState(true);

  const [platform, setPlatform] = useState(INITIAL_PLATFORM);
  const [email, setEmail] = useState(INITIAL_EMAIL);
  const [maintenance, setMaintenance] = useState(INITIAL_MAINTENANCE);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getPlatformSettings();
      const data = res.data?.data || res.data || res;
      if (data && typeof data === 'object') {
        if (data.platformName !== undefined) setPlatform((prev) => ({ ...prev, platformName: data.platformName }));
        if (data.supportEmail !== undefined) setPlatform((prev) => ({ ...prev, supportEmail: data.supportEmail }));
        if (data.defaultTrialDays !== undefined) setPlatform((prev) => ({ ...prev, defaultTrialDays: String(data.defaultTrialDays) }));
        if (data.smtpHost !== undefined) setEmail((prev) => ({ ...prev, smtpHost: data.smtpHost }));
        if (data.smtpPort !== undefined) setEmail((prev) => ({ ...prev, smtpPort: String(data.smtpPort) }));
        if (data.smtpUser !== undefined) setEmail((prev) => ({ ...prev, smtpUser: data.smtpUser }));
        if (data.smtpPass !== undefined) setEmail((prev) => ({ ...prev, smtpPassword: data.smtpPass }));
        if (data.emailFromName !== undefined) setEmail((prev) => ({ ...prev, emailFromName: data.emailFromName }));
        if (data.emailFromEmail !== undefined) setEmail((prev) => ({ ...prev, emailFromEmail: data.emailFromEmail }));
        if (data.maintenanceMode !== undefined) setMaintenance((prev) => ({ ...prev, maintenanceMode: data.maintenanceMode }));
        if (data.maintenanceMessage !== undefined) setMaintenance((prev) => ({ ...prev, maintenanceMessage: data.maintenanceMessage }));
      }
    } catch {
      // Settings not yet configured — use defaults
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handlePlatformChange = (field, value) => {
    setPlatform((prev) => ({ ...prev, [field]: value }));
  };

  const handleEmailChange = (field, value) => {
    setEmail((prev) => ({ ...prev, [field]: value }));
  };

  const handleMaintenanceChange = (field, value) => {
    setMaintenance((prev) => ({ ...prev, [field]: value }));
  };

  const savePlatform = async () => {
    if (!platform.platformName.trim() || !platform.supportEmail.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }
    try {
      setSaving((prev) => ({ ...prev, platform: true }));
      await adminApi.updatePlatformSettings({
        platformName: platform.platformName,
        supportEmail: platform.supportEmail,
        defaultTrialDays: platform.defaultTrialDays,
      });
      toast.success('Platform settings saved successfully');
    } catch {
      toast.error('Failed to save platform settings');
    } finally {
      setSaving((prev) => ({ ...prev, platform: false }));
    }
  };

  const saveEmail = async () => {
    if (!email.smtpHost.trim() || !email.smtpUser.trim()) {
      toast.error('Please fill in SMTP host and user');
      return;
    }
    try {
      setSaving((prev) => ({ ...prev, email: true }));
      await adminApi.updatePlatformSettings({
        smtpHost: email.smtpHost,
        smtpPort: email.smtpPort,
        smtpUser: email.smtpUser,
        smtpPass: email.smtpPassword,
        emailFromName: email.emailFromName || '',
        emailFromEmail: email.emailFromEmail || '',
      });
      toast.success('Email settings saved successfully');
    } catch {
      toast.error('Failed to save email settings');
    } finally {
      setSaving((prev) => ({ ...prev, email: false }));
    }
  };

  const saveMaintenance = async () => {
    try {
      setSaving((prev) => ({ ...prev, maintenance: true }));
      await adminApi.updatePlatformSettings({
        maintenanceMode: maintenance.maintenanceMode,
        maintenanceMessage: maintenance.maintenanceMessage,
      });
      toast.success('Maintenance settings saved successfully');
    } catch {
      toast.error('Failed to save maintenance settings');
    } finally {
      setSaving((prev) => ({ ...prev, maintenance: false }));
    }
  };

  if (loading) return <LoadingSpinner type="page" />;

  return (
    <div>
      <PageHeader
        title="Admin Settings"
        subtitle="Configure platform-wide settings and preferences"
      />

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex gap-0 -mb-px" aria-label="Settings tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={[
                  'inline-flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors cursor-pointer',
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                ].join(' ')}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'platform' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Platform Configuration</h3>
          <p className="text-sm text-gray-500 mb-6">Global settings for the StoreX platform.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <FormInput
              label="Platform Name"
              name="platformName"
              required
              value={platform.platformName}
              onChange={(e) => handlePlatformChange('platformName', e.target.value)}
              placeholder="StoreX"
            />
            <FormInput
              label="Support Email"
              name="supportEmail"
              type="email"
              required
              value={platform.supportEmail}
              onChange={(e) => handlePlatformChange('supportEmail', e.target.value)}
              placeholder="support@StoreX.com"
            />
            <FormInput
              label="Default Trial Days"
              name="defaultTrialDays"
              type="number"
              min="1"
              value={platform.defaultTrialDays}
              onChange={(e) => handlePlatformChange('defaultTrialDays', e.target.value)}
              placeholder="14"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={savePlatform} loading={saving.platform}>
              Save Platform Settings
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'email' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Email Configuration</h3>
          <p className="text-sm text-gray-500 mb-6">
            Configure SMTP settings for transactional and notification emails.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
            <FormInput
              label="SMTP Host"
              name="smtpHost"
              required
              value={email.smtpHost}
              onChange={(e) => handleEmailChange('smtpHost', e.target.value)}
              placeholder="smtp.gmail.com"
            />
            <FormInput
              label="SMTP Port"
              name="smtpPort"
              type="number"
              value={email.smtpPort}
              onChange={(e) => handleEmailChange('smtpPort', e.target.value)}
              placeholder="587"
            />
            <FormInput
              label="SMTP User"
              name="smtpUser"
              required
              value={email.smtpUser}
              onChange={(e) => handleEmailChange('smtpUser', e.target.value)}
              placeholder="noreply@StoreX.com"
            />
            <FormInput
              label="SMTP Password"
              name="smtpPassword"
              type="password"
              value={email.smtpPassword}
              onChange={(e) => handleEmailChange('smtpPassword', e.target.value)}
              placeholder="Enter SMTP password"
            />
          </div>

          <div className="flex justify-end">
            <Button onClick={saveEmail} loading={saving.email}>
              Save Email Settings
            </Button>
          </div>
        </div>
      )}

      {activeTab === 'maintenance' && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-base font-semibold text-gray-900 mb-1">Maintenance Mode</h3>
          <p className="text-sm text-gray-500 mb-6">
            Enable maintenance mode to temporarily disable access for all non-admin users.
          </p>

          <div className="space-y-5 mb-6">
            {/* Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-900">Maintenance Mode</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  When enabled, non-admin users will see the maintenance message.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={maintenance.maintenanceMode}
                  onChange={(e) =>
                    handleMaintenanceChange('maintenanceMode', e.target.checked)
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Maintenance Message */}
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-gray-700">
                Maintenance Message
              </label>
              <textarea
                value={maintenance.maintenanceMessage}
                onChange={(e) =>
                  handleMaintenanceChange('maintenanceMessage', e.target.value)
                }
                rows={4}
                placeholder="Enter a message to display to users during maintenance..."
                className="w-full rounded-lg border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={saveMaintenance} loading={saving.maintenance}>
              Save Maintenance Settings
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminSettings;