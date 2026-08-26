import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineCheckCircle,
  HiOutlineCube,
  HiOutlineUserGroup,
  HiOutlineBuildingOffice,
  HiOutlineArrowUpRight,
  HiOutlineCreditCard,
  HiOutlineXMark,
} from 'react-icons/hi2';

import PageHeader from '../../components/PageHeader';
import Badge from '../../components/Badge';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';
import Modal from '../../components/Modal';
import { subscriptionApi } from '../../api/subscriptionApi';
import { formatCurrency } from '../../utils/helpers';

function Subscription() {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [plans, setPlans] = useState([]);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [paymentDialog, setPaymentDialog] = useState({ open: false, plan: null, orderId: '', amount: 0 });
  const [paying, setPaying] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [planRes, plansRes, usageRes] = await Promise.allSettled([
        subscriptionApi.getCurrentPlan(),
        subscriptionApi.getPlans(),
        subscriptionApi.getUsage(),
      ]);

      if (planRes.status === 'fulfilled') {
        setCurrentPlan(planRes.value?.data?.data ?? planRes.value?.data ?? null);
      }
      if (plansRes.status === 'fulfilled') {
        setPlans(plansRes.value?.data?.data ?? plansRes.value?.data ?? plansRes.value?.data?.plans ?? []);
      }
      if (usageRes.status === 'fulfilled') {
        setUsage(usageRes.value?.data?.data ?? usageRes.value?.data ?? null);
      }
    } catch {
      toast.error('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpgrade = async (planId) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) return;

    if (plan.price > 0) {
      // Show payment dialog for paid plans
      try {
        setUpgrading(true);
        const { data } = await subscriptionApi.createPaymentIntent({ planId });
        const intent = data?.data ?? data;
        setPaymentDialog({
          open: true,
          plan,
          orderId: intent.orderId,
          amount: intent.amount,
        });
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to initiate payment');
      } finally {
        setUpgrading(false);
      }
    } else {
      // Free plan - subscribe directly
      setUpgrading(true);
      try {
        await subscriptionApi.subscribe({ planId });
        toast.success('Subscription upgraded successfully');
        fetchData();
      } catch (err) {
        toast.error(err?.response?.data?.message || 'Failed to upgrade subscription');
      } finally {
        setUpgrading(false);
      }
    }
  };

  const handleSimulatedPayment = async () => {
    setPaying(true);
    try {
      // Simulate a successful payment
      const mockPaymentId = `pay_sim_${Date.now()}`;
      await subscriptionApi.subscribe({ planId: paymentDialog.plan.id });
      await subscriptionApi.verifyPayment({
        subscriptionId: currentPlan?._id,
        paymentId: mockPaymentId,
        orderId: paymentDialog.orderId,
        amount: paymentDialog.amount,
      });
      toast.success('Payment successful! Subscription activated.');
      setPaymentDialog({ open: false, plan: null, orderId: '', amount: 0 });
      fetchData();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Payment verification failed');
    } finally {
      setPaying(false);
    }
  };

  const PLAN_COLORS = {
    free: { border: 'border-gray-200', bg: 'bg-gray-50', badge: 'gray', button: 'secondary' },
    starter: { border: 'border-blue-200', bg: 'bg-blue-50/50', badge: 'info', button: 'primary' },
    business: { border: 'border-purple-200', bg: 'bg-purple-50/50', badge: 'info', button: 'primary' },
    pro: { border: 'border-green-200', bg: 'bg-green-50/50', badge: 'success', button: 'primary' },
  };

  const isCurrentPlan = (plan) => {
    if (!currentPlan) return plan?.price === 0;
    return currentPlan.planId === plan.id || currentPlan.name?.toLowerCase() === plan.name?.toLowerCase();
  };

  const isHigherPlan = (plan) => {
    if (!currentPlan) return plan.price > 0;
    const planOrder = ['free', 'starter', 'business', 'pro'];
    const currentIdx = planOrder.indexOf((currentPlan.name || '').toLowerCase());
    const planIdx = planOrder.indexOf((plan.name || '').toLowerCase());
    return planIdx > currentIdx;
  };

  const getPlanFeatures = (plan) => {
    const features = plan.features || [];
    if (features.length > 0) return features;
    // Default features based on plan name
    const name = (plan.name || '').toLowerCase();
    const defaults = {
      free: ['Up to 25 products', 'Up to 2 users', 'Basic reports', 'Single branch'],
      starter: ['Up to 100 products', 'Up to 5 users', 'Basic reports', 'Up to 3 branches', 'Email support'],
      business: ['Unlimited products', 'Up to 20 users', 'Advanced reports', 'Up to 10 branches', 'Priority support', 'API access'],
      pro: ['Unlimited products', 'Unlimited users', 'All reports & analytics', 'Unlimited branches', '24/7 priority support', 'API access', 'Custom integrations'],
    };
    return defaults[name] || ['Basic features'];
  };

  if (loading) return <LoadingSpinner type="card" />;

  return (
    <div>
      <PageHeader
        title="Subscription"
        subtitle="Manage your StoreX subscription plan"
      />

      {/* Current Plan Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                {currentPlan?.name || 'Free Plan'}
              </h3>
              <Badge variant={
                currentPlan?.status === 'active' ? 'success' :
                currentPlan?.status === 'trial' ? 'info' :
                currentPlan?.status === 'expired' ? 'danger' :
                'gray'
              }>
                {currentPlan?.status || 'Active'}
              </Badge>
            </div>
            <p className="text-sm text-gray-500">
              {currentPlan?.price > 0
                ? `${formatCurrency(currentPlan.price)}/${currentPlan.interval || 'month'}`
                : 'Free forever'}
              {currentPlan?.renewalDate && (
                <span className="ml-2">· Renews {new Date(currentPlan.renewalDate).toLocaleDateString('en-IN')}</span>
              )}
            </p>
          </div>
        </div>

        {/* Usage Meters */}
        {usage && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6 pt-6 border-t border-gray-100">
            {[
              { label: 'Products', used: usage.productsUsed ?? usage.products?.used ?? 0, limit: usage.productsLimit ?? usage.products?.limit ?? 25, icon: HiOutlineCube },
              { label: 'Users', used: usage.usersUsed ?? usage.users?.used ?? 1, limit: usage.usersLimit ?? usage.users?.limit ?? 2, icon: HiOutlineUserGroup },
              { label: 'Branches', used: usage.branchesUsed ?? usage.branches?.used ?? 1, limit: usage.branchesLimit ?? usage.branches?.limit ?? 1, icon: HiOutlineBuildingOffice },
            ].map((item) => {
              const percentage = Math.min((item.used / item.limit) * 100, 100);
              const isNearLimit = percentage >= 80;
              const isAtLimit = item.used >= item.limit;
              return (
                <div key={item.label} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <item.icon className={`w-4 h-4 ${isAtLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : 'text-gray-400'}`} />
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                    </div>
                    <span className={`text-sm font-medium ${isAtLimit ? 'text-red-600' : 'text-gray-500'}`}>
                      {item.used} / {item.limit === Infinity ? '∞' : item.limit}
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  {isAtLimit && (
                    <p className="text-xs text-red-500">Limit reached. Upgrade to add more.</p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Plan Comparison */}
      <h3 className="text-base font-semibold text-gray-900 mb-4">Available Plans</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => {
          const isCurrent = isCurrentPlan(plan);
          const isHigher = isHigherPlan(plan);
          const planKey = (plan.name || '').toLowerCase() || 'free';
          const colors = PLAN_COLORS[planKey] || PLAN_COLORS.free;
          const features = getPlanFeatures(plan);

          return (
            <div
              key={plan.id}
              className={`bg-white rounded-xl border-2 p-5 relative transition-shadow ${
                isCurrent ? `${colors.border} shadow-md` : 'border-gray-200 hover:shadow-sm'
              }`}
            >
              {isCurrent && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="success" className="flex items-center gap-1">
                    <HiOutlineCheckCircle className="w-3.5 h-3.5" />
                    Current
                  </Badge>
                </div>
              )}

              <div className={`text-center ${isCurrent ? 'pt-2' : ''}`}>
                <h4 className="text-lg font-bold text-gray-900">{plan.name}</h4>
                <div className="mt-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900">
                    {plan.price > 0 ? formatCurrency(plan.price) : 'Free'}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-gray-500">/{plan.interval || 'month'}</span>
                  )}
                </div>

                <ul className="space-y-2 text-left mb-6">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                      <HiOutlineCheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {!isCurrent && isHigher && (
                  <Button
                    className="w-full"
                    onClick={() => handleUpgrade(plan.id)}
                    loading={upgrading}
                  >
                    {plan.price > 0 ? (
                      <>
                        Pay Now <HiOutlineCreditCard className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Upgrade <HiOutlineArrowUpRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                )}
                {isCurrent && (
                  <Button className="w-full" variant="secondary" disabled>
                    Current Plan
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment Dialog */}
      <Modal
        isOpen={paymentDialog.open}
        onClose={() => setPaymentDialog({ open: false, plan: null, orderId: '', amount: 0 })}
        title="Complete Payment"
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-2">
              <HiOutlineCreditCard className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-900">{paymentDialog.plan?.name} Plan</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {formatCurrency(paymentDialog.amount)}
              <span className="text-sm font-normal text-blue-600">/{paymentDialog.plan?.interval || 'month'}</span>
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500">Order ID</p>
            <p className="text-sm font-mono text-gray-700 mt-0.5">{paymentDialog.orderId}</p>
          </div>

          <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <p className="text-xs text-yellow-700">
              This is a simulated payment gateway. In production, Razorpay checkout will be displayed here.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setPaymentDialog({ open: false, plan: null, orderId: '', amount: 0 })}
              disabled={paying}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleSimulatedPayment}
              loading={paying}
            >
              <HiOutlineCreditCard className="w-4 h-4" />
              Confirm Payment
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Subscription;
