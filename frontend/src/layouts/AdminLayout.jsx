import { useState, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import Badge from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import {
  HiOutlineHome,
  HiOutlineBuildingOffice2,
  HiOutlineCreditCard,
  HiOutlineCurrencyRupee,
  HiOutlineBanknotes,
  HiOutlineClipboardDocumentList,
  HiOutlineCog6Tooth,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineSparkles,
  HiOutlineLifebuoy,
} from 'react-icons/hi2';

const adminSidebarItems = [
  { label: 'Dashboard', icon: HiOutlineHome, path: '/admin/dashboard' },
  { label: 'Businesses', icon: HiOutlineBuildingOffice2, path: '/admin/businesses' },
  { label: 'Plans', icon: HiOutlineCreditCard, path: '/admin/plans' },
  { label: 'Subscriptions', icon: HiOutlineCurrencyRupee, path: '/admin/subscriptions' },
  { label: 'Payments', icon: HiOutlineBanknotes, path: '/admin/payments' },
  { label: 'Users', icon: HiOutlineUsers, path: '/admin/users' },
  { label: 'Revenue', icon: HiOutlineChartBar, path: '/admin/revenue' },
  { label: 'Feature Flags', icon: HiOutlineSparkles, path: '/admin/feature-flags' },
  { label: 'Support', icon: HiOutlineLifebuoy, path: '/admin/support-requests' },
  { label: 'Audit Logs', icon: HiOutlineClipboardDocumentList, path: '/admin/audit-logs' },
  { label: 'Settings', icon: HiOutlineCog6Tooth, path: '/admin/settings' },
];

function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' && window.innerWidth >= 1024
  );

  // Close sidebar on route change when mobile
  const handleClose = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  // Build items with navigation handlers
  const items = adminSidebarItems.map((item) => ({
    ...item,
    onClick: () => navigate(item.path),
  }));

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={handleClose}
          items={items}
          activePath={location.pathname}
          activeColor="purple"
        />
      </div>

      {/* Mobile sidebar (overlay) */}
      <div className="lg:hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={handleClose}
          items={items}
          activePath={location.pathname}
          activeColor="purple"
        />
      </div>

      {/* Main content area */}
      <div
        className={[
          'transition-all duration-300',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-0',
        ].join(' ')}
      >
        <Topbar
          onMenuClick={toggleSidebar}
          title="Super Admin"
          user={user}
          unreadCount={0}
        />

        {/* Super Admin badge bar */}
        <div className="px-6 pt-3">
          <Badge variant="primary" className="bg-purple-50 text-purple-700 border-purple-200">
            Super Admin Panel
          </Badge>
        </div>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
