// import { useState, useEffect, useMemo, useCallback } from 'react';
// import { Outlet, useLocation, useNavigate } from 'react-router-dom';
// import Sidebar from '../components/Sidebar';
// import Topbar from '../components/Topbar';
// import { useAuth } from '../context/AuthContext';
// import { useBusiness } from '../context/BusinessContext';
// import { notificationApi } from '../api/notificationApi';
// import {
//   HiOutlineHome,
//   HiOutlineCube,
//   HiOutlineSquares2X2,
//   HiOutlineArchiveBox,
//   HiOutlineShoppingCart,
//   HiOutlineReceiptPercent,
//   HiOutlineUserGroup,
//   HiOutlineTruck,
//   HiOutlineDocumentDuplicate,
//   HiOutlineCurrencyRupee,
//   HiOutlineIdentification,
//   HiOutlineShieldCheck,
//   HiOutlineChartBarSquare,
//   HiOutlineArrowTrendingUp,
//   HiOutlineBuildingStorefront,
//   HiOutlineBell,
//   HiOutlineCog6Tooth,
//   HiOutlineCreditCard,
// } from 'react-icons/hi2';

// const sidebarItems = [
//   { label: 'Dashboard', icon: HiOutlineHome, path: '/app/dashboard' },
//   { label: 'Products', icon: HiOutlineCube, path: '/app/products', permission: 'products.view' },
//   { label: 'Categories', icon: HiOutlineSquares2X2, path: '/app/categories', permission: 'categories.view' },
//   { label: 'Inventory', icon: HiOutlineArchiveBox, path: '/app/inventory', permission: 'inventory.view' },
//   { label: 'POS', icon: HiOutlineShoppingCart, path: '/app/pos', highlight: true },
//   { label: 'Sales', icon: HiOutlineReceiptPercent, path: '/app/sales', permission: 'sales.view' },
//   { label: 'Customers', icon: HiOutlineUserGroup, path: '/app/customers', permission: 'customers.view' },
//   { label: 'Suppliers', icon: HiOutlineTruck, path: '/app/suppliers', permission: 'suppliers.view' },
//   { label: 'Purchases', icon: HiOutlineDocumentDuplicate, path: '/app/purchases', permission: 'purchases.view' },
//   { label: 'Expenses', icon: HiOutlineCurrencyRupee, path: '/app/expenses', permission: 'expenses.view' },
//   { label: 'Employees', icon: HiOutlineIdentification, path: '/app/employees', permission: 'employees.view' },
//   { label: 'Roles', icon: HiOutlineShieldCheck, path: '/app/roles', permission: 'roles.view' },
//   { label: 'Reports', icon: HiOutlineChartBarSquare, path: '/app/reports', permission: 'reports.view' },
//   { label: 'Analytics', icon: HiOutlineArrowTrendingUp, path: '/app/analytics', permission: 'reports.view' },
//   { label: 'Branches', icon: HiOutlineBuildingStorefront, path: '/app/branches', permission: 'branches.view' },
//   { label: 'Notifications', icon: HiOutlineBell, path: '/app/notifications', permission: 'notifications.view' },
//   { label: 'Settings', icon: HiOutlineCog6Tooth, path: '/app/settings', permission: 'settings.view' },
//   { label: 'Subscription', icon: HiOutlineCreditCard, path: '/app/subscription', ownerOnly: true },
// ];

// function MainLayout() {
//   const { user, hasPermission } = useAuth();
//   const { business } = useBusiness();
//   const location = useLocation();
//   const navigate = useNavigate();

//   const [sidebarOpen, setSidebarOpen] = useState(
//     typeof window !== 'undefined' && window.innerWidth >= 1024
//   );
//   const [unreadCount, setUnreadCount] = useState(0);

//   useEffect(() => {
//     let cancelled = false;
//     const fetchUnread = async () => {
//       try {
//         const res = await notificationApi.getUnreadCount();
//         if (!cancelled) {
//           setUnreadCount(res.data?.data ?? res.data?.count ?? 0);
//         }
//       } catch {
//         // Silently ignore
//       }
//     };
//     fetchUnread();
//     return () => { cancelled = true; };
//   }, []);

//   useEffect(() => {
//     if (window.innerWidth < 1024) {
//       setSidebarOpen(false);
//     }
//   }, [location.pathname]);

//   const filteredItems = useMemo(() => {
//     return sidebarItems.filter((item) => {
//       if (item.ownerOnly && user?.role !== 'owner') return false;
//       if (item.permission && !hasPermission(item.permission)) return false;
//       return true;
//     });
//   }, [user, hasPermission]);

//   const items = useMemo(() => {
//     return filteredItems.map((item) => ({
//       ...item,
//       onClick: () => navigate(item.path),
//       ...(item.badgeKey === 'notifications' && unreadCount > 0
//         ? { badge: unreadCount }
//         : {}),
//     }));
//   }, [navigate, unreadCount, filteredItems]);

//   const toggleSidebar = useCallback(() => {
//     setSidebarOpen((prev) => !prev);
//   }, []);

//   const closeSidebar = useCallback(() => {
//     setSidebarOpen(false);
//   }, []);

//   return (
//     <div className="min-h-screen bg-gray-50">
//       <div className="hidden lg:block">
//         <Sidebar
//           isOpen={sidebarOpen}
//           onClose={closeSidebar}
//           items={items}
//           activePath={location.pathname}
//           activeColor="blue"
//         />
//       </div>

//       <div className="lg:hidden">
//         <Sidebar
//           isOpen={sidebarOpen}
//           onClose={closeSidebar}
//           items={items}
//           activePath={location.pathname}
//           activeColor="blue"
//         />
//       </div>

//       <div
//         className={[
//           'transition-all duration-300',
//           sidebarOpen ? 'lg:ml-64' : 'lg:ml-0',
//         ].join(' ')}
//       >
//         <Topbar
//           onMenuClick={toggleSidebar}
//           title={business?.name || 'StoreX'}
//           user={user}
//           unreadCount={unreadCount}
//         />

//         <main className="p-6">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// }

// export default MainLayout;

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useAuth } from '../context/AuthContext';
import { useBusiness } from '../context/BusinessContext';
import { notificationApi } from '../api/notificationApi';
import {
  HiOutlineHome,
  HiOutlineCube,
  HiOutlineSquares2X2,
  HiOutlineArchiveBox,
  HiOutlineShoppingCart,
  HiOutlineReceiptPercent,
  HiOutlineUserGroup,
  HiOutlineTruck,
  HiOutlineDocumentDuplicate,
  HiOutlineCamera,
  HiOutlineCurrencyRupee,
  HiOutlineIdentification,
  HiOutlineShieldCheck,
  HiOutlineChartBarSquare,
  HiOutlineArrowTrendingUp,
  HiOutlineBuildingStorefront,
  HiOutlineBell,
  HiOutlineCog6Tooth,
  HiOutlineCreditCard,
} from 'react-icons/hi2';

const sidebarItems = [
  { label: 'Dashboard', icon: HiOutlineHome, path: '/app/dashboard' },
  { label: 'Products', icon: HiOutlineCube, path: '/app/products', permission: 'products.view' },
  { label: 'Categories', icon: HiOutlineSquares2X2, path: '/app/categories', permission: 'categories.view' },
  { label: 'Inventory', icon: HiOutlineArchiveBox, path: '/app/inventory', permission: 'inventory.view' },
  { label: 'POS', icon: HiOutlineShoppingCart, path: '/app/pos', highlight: true },
  { label: 'Sales', icon: HiOutlineReceiptPercent, path: '/app/sales', permission: 'sales.view' },
  { label: 'Customers', icon: HiOutlineUserGroup, path: '/app/customers', permission: 'customers.view' },
  { label: 'Suppliers', icon: HiOutlineTruck, path: '/app/suppliers', permission: 'suppliers.view' },
  { label: 'Purchases', icon: HiOutlineDocumentDuplicate, path: '/app/purchases', permission: 'purchases.view' },
  { label: 'Scan & Stock', icon: HiOutlineCamera, path: '/app/invoice-import', permission: 'purchases.import' },
  { label: 'Expenses', icon: HiOutlineCurrencyRupee, path: '/app/expenses', permission: 'expenses.view' },
  { label: 'Employees', icon: HiOutlineIdentification, path: '/app/employees', permission: 'employees.view' },
  { label: 'Roles', icon: HiOutlineShieldCheck, path: '/app/roles', permission: 'roles.view' },
  { label: 'Reports', icon: HiOutlineChartBarSquare, path: '/app/reports', permission: 'reports.view' },
  { label: 'Analytics', icon: HiOutlineArrowTrendingUp, path: '/app/analytics', permission: 'reports.view' },
  { label: 'Branches', icon: HiOutlineBuildingStorefront, path: '/app/branches', permission: 'branches.view' },
  { label: 'Notifications', icon: HiOutlineBell, path: '/app/notifications', permission: 'notifications.view' },
  { label: 'Settings', icon: HiOutlineCog6Tooth, path: '/app/settings', permission: 'settings.view' },
  { label: 'Subscription', icon: HiOutlineCreditCard, path: '/app/subscription', ownerOnly: true },
];

function MainLayout() {
  const { user, hasPermission } = useAuth();
  const { business } = useBusiness();
  const location = useLocation();
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(
    typeof window !== 'undefined' && window.innerWidth >= 1024
  );
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notification count
  useEffect(() => {
    let cancelled = false;
    const fetchUnread = async () => {
      try {
        const res = await notificationApi.getUnreadCount();
        if (!cancelled) {
          setUnreadCount(res.data?.data ?? res.data?.count ?? 0);
        }
      } catch {
        // Silently ignore — user may not have notifications set up yet
      }
    };
    fetchUnread();
    return () => { cancelled = true; };
  }, []);

  // Close sidebar on route change when mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  // Filter sidebar items based on permissions
  const filteredItems = useMemo(() => {
    return sidebarItems.filter((item) => {
      if (item.ownerOnly && user?.role !== 'owner') return false;
      if (item.permission && !hasPermission(item.permission)) return false;
      return true;
    });
  }, [user, hasPermission]);

  // Build items with navigation handlers and badges
  const items = useMemo(() => {
    return filteredItems.map((item) => ({
      ...item,
      onClick: () => navigate(item.path),
      ...(item.badgeKey === 'notifications' && unreadCount > 0
        ? { badge: unreadCount }
        : {}),
    }));
  }, [navigate, unreadCount, filteredItems]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const closeSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          items={items}
          activePath={location.pathname}
          activeColor="blue"
        />
      </div>

      {/* Mobile sidebar (overlay) */}
      <div className="lg:hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
          items={items}
          activePath={location.pathname}
          activeColor="blue"
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
          title={business?.name || 'StoreX'}
          user={user}
          unreadCount={unreadCount}
        />

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;
