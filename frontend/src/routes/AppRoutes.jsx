// // // import { Routes, Route } from 'react-router-dom';

// // // // Layouts
// // // import AuthLayout from '../layouts/AuthLayout';
// // // import MainLayout from '../layouts/MainLayout';
// // // import AdminLayout from '../layouts/AdminLayout';

// // // // Route Guards
// // // import ProtectedRoute from './ProtectedRoute';
// // // import AdminRoute from './AdminRoute';

// // // // Public Pages
// // // import Landing from '../pages/public/Landing';
// // // import Login from '../pages/public/Login';
// // // import Register from '../pages/public/Register';
// // // import ForgotPassword from '../pages/public/ForgotPassword';
// // // import ResetPassword from '../pages/public/ResetPassword';
// // // import Pricing from '../pages/public/Pricing';

// // // // App Pages
// // // import Dashboard from '../pages/app/Dashboard';
// // // import Products from '../pages/app/Products';
// // // import Categories from '../pages/app/Categories';
// // // import Inventory from '../pages/app/Inventory';
// // // import POS from '../pages/app/POS';
// // // import Sales from '../pages/app/Sales';
// // // import Customers from '../pages/app/Customers';
// // // import Suppliers from '../pages/app/Suppliers';
// // // import Purchases from '../pages/app/Purchases';
// // // import Expenses from '../pages/app/Expenses';
// // // import Employees from '../pages/app/Employees';
// // // import Roles from '../pages/app/Roles';
// // // import Reports from '../pages/app/Reports';
// // // import Analytics from '../pages/app/Analytics';
// // // import Branches from '../pages/app/Branches';
// // // import Notifications from '../pages/app/Notifications';
// // // import Settings from '../pages/app/Settings';
// // // import Subscription from '../pages/app/Subscription';

// // // // Admin Pages
// // // import AdminDashboard from '../pages/admin/AdminDashboard';
// // // import Businesses from '../pages/admin/Businesses';
// // // import Plans from '../pages/admin/Plans';
// // // import Users from '../pages/admin/Users';
// // // import Subscriptions from '../pages/admin/Subscriptions';
// // // import Payments from '../pages/admin/Payments';
// // // import AuditLogs from '../pages/admin/AuditLogs';
// // // import AdminSettings from '../pages/admin/AdminSettings';

// // // function AppRoutes() {
// // //   return (
// // //     <Routes>
// // //       {/* ====== Public Routes ====== */}
// // //       <Route path="/" element={<Landing />} />
// // //       <Route path="/pricing" element={<Pricing />} />
// // //       <Route element={<AuthLayout />}>
// // //         <Route path="/login" element={<Login />} />
// // //         <Route path="/register" element={<Register />} />
// // //         <Route path="/forgot-password" element={<ForgotPassword />} />
// // //         <Route path="/reset-password" element={<ResetPassword />} />
// // //       </Route>

// // //       {/* ====== Protected App Routes (MainLayout) ====== */}
// // //       <Route element={<ProtectedRoute />}>
// // //         <Route element={<MainLayout />}>
// // //           <Route path="/app/dashboard" element={<Dashboard />} />
// // //           <Route path="/app/pos" element={<POS />} />

// // //           <Route path="/app/products" element={<ProtectedRoute permission="products.view"><Products /></ProtectedRoute>} />
// // //           <Route path="/app/categories" element={<ProtectedRoute permission="categories.view"><Categories /></ProtectedRoute>} />
// // //           <Route path="/app/inventory" element={<ProtectedRoute permission="inventory.view"><Inventory /></ProtectedRoute>} />
// // //           <Route path="/app/sales" element={<ProtectedRoute permission="sales.view"><Sales /></ProtectedRoute>} />
// // //           <Route path="/app/customers" element={<ProtectedRoute permission="customers.view"><Customers /></ProtectedRoute>} />
// // //           <Route path="/app/notifications" element={<ProtectedRoute permission="notifications.view"><Notifications /></ProtectedRoute>} />
// // //           <Route path="/app/suppliers" element={<ProtectedRoute permission="suppliers.view"><Suppliers /></ProtectedRoute>} />
// // //           <Route path="/app/purchases" element={<ProtectedRoute permission="purchases.view"><Purchases /></ProtectedRoute>} />
// // //           <Route path="/app/expenses" element={<ProtectedRoute permission="expenses.view"><Expenses /></ProtectedRoute>} />
// // //           <Route path="/app/employees" element={<ProtectedRoute permission="employees.view"><Employees /></ProtectedRoute>} />
// // //           <Route path="/app/roles" element={<ProtectedRoute permission="roles.view"><Roles /></ProtectedRoute>} />
// // //           <Route path="/app/reports" element={<ProtectedRoute permission="reports.view"><Reports /></ProtectedRoute>} />
// // //           <Route path="/app/analytics" element={<ProtectedRoute permission="reports.view"><Analytics /></ProtectedRoute>} />
// // //           <Route path="/app/branches" element={<ProtectedRoute permission="branches.view"><Branches /></ProtectedRoute>} />
// // //           <Route path="/app/settings" element={<ProtectedRoute permission="settings.view"><Settings /></ProtectedRoute>} />
// // //           <Route path="/app/subscription" element={<ProtectedRoute ownerOnly><Subscription /></ProtectedRoute>} />
// // //         </Route>
// // //       </Route>

// // //       {/* ====== Admin Routes (AdminLayout) ====== */}
// // //       <Route element={<AdminRoute />}>
// // //         <Route element={<AdminLayout />}>
// // //           <Route path="/admin/dashboard" element={<AdminDashboard />} />
// // //           <Route path="/admin/businesses" element={<Businesses />} />
// // //           <Route path="/admin/plans" element={<Plans />} />
// // //           <Route path="/admin/users" element={<Users />} />
// // //           <Route path="/admin/subscriptions" element={<Subscriptions />} />
// // //           <Route path="/admin/payments" element={<Payments />} />
// // //           <Route path="/admin/audit-logs" element={<AuditLogs />} />
// // //           <Route path="/admin/settings" element={<AdminSettings />} />
// // //         </Route>
// // //       </Route>

// // //       {/* ====== 404 Catch-All ====== */}
// // //       <Route
// // //         path="*"
// // //         element={
// // //           <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
// // //             <h1 className="text-6xl font-bold text-gray-200">404</h1>
// // //             <p className="mt-3 text-lg font-medium text-gray-700">Page not found</p>
// // //             <p className="mt-1 text-sm text-gray-500">
// // //               The page you&apos;re looking for doesn&apos;t exist.
// // //             </p>
// // //             <a
// // //               href="/"
// // //               className="mt-6 inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
// // //             >
// // //               Go Home
// // //             </a>
// // //           </div>
// // //         }
// // //       />
// // //     </Routes>
// // //   );
// // // }

// // // export default AppRoutes;
// import { Routes, Route } from 'react-router-dom';

// // Layouts
// import AuthLayout from '../layouts/AuthLayout';
// import MainLayout from '../layouts/MainLayout';
// import AdminLayout from '../layouts/AdminLayout';

// // Route Guards
// import ProtectedRoute from './ProtectedRoute';
// import AdminRoute from './AdminRoute';

// // Public Pages
// import Landing from '../pages/public/Landing';
// import Login from '../pages/public/Login';
// import Register from '../pages/public/Register';
// import ForgotPassword from '../pages/public/ForgotPassword';
// import ResetPassword from '../pages/public/ResetPassword';
// import Pricing from '../pages/public/Pricing';

// // App Pages
// import Dashboard from '../pages/app/Dashboard';
// import Products from '../pages/app/Products';
// import Categories from '../pages/app/Categories';
// import Inventory from '../pages/app/Inventory';
// import POS from '../pages/app/POS';
// import Sales from '../pages/app/Sales';
// import Customers from '../pages/app/Customers';
// import Suppliers from '../pages/app/Suppliers';
// import Purchases from '../pages/app/Purchases';
// import Expenses from '../pages/app/Expenses';
// import Employees from '../pages/app/Employees';
// import Roles from '../pages/app/Roles';
// import Reports from '../pages/app/Reports';
// import Analytics from '../pages/app/Analytics';
// import Branches from '../pages/app/Branches';
// import Notifications from '../pages/app/Notifications';
// import Settings from '../pages/app/Settings';
// import Subscription from '../pages/app/Subscription';

// // Admin Pages
// import AdminDashboard from '../pages/admin/AdminDashboard';
// import Businesses from '../pages/admin/Businesses';
// import Plans from '../pages/admin/Plans';
// import Subscriptions from '../pages/admin/Subscriptions';
// import Payments from '../pages/admin/Payments';
// import Users from '../pages/admin/Users';
// import Revenue from '../pages/admin/Revenue';
// import FeatureFlags from '../pages/admin/FeatureFlags';
// import SupportRequests from '../pages/admin/SupportRequests';
// import AuditLogs from '../pages/admin/AuditLogs';
// import AdminSettings from '../pages/admin/AdminSettings';

// function AppRoutes() {
//   return (
//     <Routes>
//       {/* ====== Public Routes ====== */}
//       <Route path="/" element={<Landing />} />
//       <Route path="/pricing" element={<Pricing />} />
//       <Route element={<AuthLayout />}>
//         <Route path="/login" element={<Login />} />
//         <Route path="/register" element={<Register />} />
//         <Route path="/forgot-password" element={<ForgotPassword />} />
//         <Route path="/reset-password" element={<ResetPassword />} />
//       </Route>

//       {/* ====== Protected App Routes (MainLayout) ====== */}
//       <Route element={<ProtectedRoute />}>
//         <Route element={<MainLayout />}>
//           <Route path="/app/dashboard" element={<Dashboard />} />
//           <Route path="/app/pos" element={<POS />} />

//           <Route path="/app/products" element={<ProtectedRoute permission="products.view"><Products /></ProtectedRoute>} />
//           <Route path="/app/categories" element={<ProtectedRoute permission="categories.view"><Categories /></ProtectedRoute>} />
//           <Route path="/app/inventory" element={<ProtectedRoute permission="inventory.view"><Inventory /></ProtectedRoute>} />
//           <Route path="/app/sales" element={<ProtectedRoute permission="sales.view"><Sales /></ProtectedRoute>} />
//           <Route path="/app/customers" element={<ProtectedRoute permission="customers.view"><Customers /></ProtectedRoute>} />
//           <Route path="/app/notifications" element={<ProtectedRoute permission="notifications.view"><Notifications /></ProtectedRoute>} />
//           <Route path="/app/suppliers" element={<ProtectedRoute permission="suppliers.view"><Suppliers /></ProtectedRoute>} />
//           <Route path="/app/purchases" element={<ProtectedRoute permission="purchases.view"><Purchases /></ProtectedRoute>} />
//           <Route path="/app/expenses" element={<ProtectedRoute permission="expenses.view"><Expenses /></ProtectedRoute>} />
//           <Route path="/app/employees" element={<ProtectedRoute permission="employees.view"><Employees /></ProtectedRoute>} />
//           <Route path="/app/roles" element={<ProtectedRoute permission="roles.view"><Roles /></ProtectedRoute>} />
//           <Route path="/app/reports" element={<ProtectedRoute permission="reports.view"><Reports /></ProtectedRoute>} />
//           <Route path="/app/analytics" element={<ProtectedRoute permission="reports.view"><Analytics /></ProtectedRoute>} />
//           <Route path="/app/branches" element={<ProtectedRoute permission="branches.view"><Branches /></ProtectedRoute>} />
//           <Route path="/app/settings" element={<ProtectedRoute permission="settings.view"><Settings /></ProtectedRoute>} />
//           <Route path="/app/subscription" element={<ProtectedRoute ownerOnly><Subscription /></ProtectedRoute>} />
//         </Route>
//       </Route>

//       {/* ====== Admin Routes (AdminLayout) ====== */}
//       <Route element={<AdminRoute />}>
//         <Route element={<AdminLayout />}>
//           <Route path="/admin/dashboard" element={<AdminDashboard />} />
//           <Route path="/admin/businesses" element={<Businesses />} />
//           <Route path="/admin/plans" element={<Plans />} />
//           <Route path="/admin/subscriptions" element={<Subscriptions />} />
//           <Route path="/admin/payments" element={<Payments />} />
//           <Route path="/admin/users" element={<Users />} />
//           <Route path="/admin/revenue" element={<Revenue/>} />
//           <Route path="/admin/feature-flags" element={<FeatureFlags/>} />
//           <Route path="/admin/support-requests" element={<SupportRequests/>} />
//           <Route path="/admin/audit-logs" element={<AuditLogs />} />
//           <Route path="/admin/settings" element={<AdminSettings />} />
//         </Route>
//       </Route>

//       {/* ====== 404 Catch-All ====== */}
//       <Route
//         path="*"
//         element={
//           <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
//             <h1 className="text-6xl font-bold text-gray-200">404</h1>
//             <p className="mt-3 text-lg font-medium text-gray-700">Page not found</p>
//             <p className="mt-1 text-sm text-gray-500">
//               The page you&apos;re looking for doesn&apos;t exist.
//             </p>
//             <a
//               href="/"
//               className="mt-6 inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
//             >
//               Go Home
//             </a>
//           </div>
//         }
//       />
//     </Routes>
//   );
// }

// export default AppRoutes;

// // import { Routes, Route, Link } from 'react-router-dom';

// // // Layouts
// // import AuthLayout from '../layouts/AuthLayout';
// // import MainLayout from '../layouts/MainLayout';
// // import AdminLayout from '../layouts/AdminLayout';

// // // Route Guards
// // import ProtectedRoute from './ProtectedRoute';
// // import AdminRoute from './AdminRoute';

// // // Public Pages
// // import Landing from '../pages/public/Landing';
// // import Login from '../pages/public/Login';
// // import Register from '../pages/public/Register';
// // import ForgotPassword from '../pages/public/ForgotPassword';
// // import ResetPassword from '../pages/public/ResetPassword';
// // import Pricing from '../pages/public/Pricing';
// // import Integrations from '../pages/public/Integrations';
// // import Changelog from '../pages/public/Changelog';
// // import About from '../pages/public/About';
// // import Blog from '../pages/public/Blog';
// // import Careers from '../pages/public/Careers';
// // import Contact from '../pages/public/Contact';
// // import Privacy from '../pages/public/Privacy';
// // import Terms from '../pages/public/Terms';
// // import Cookies from '../pages/public/Cookies';
// // import RefundPolicy from '../pages/public/RefundPolicy';

// // // App Pages
// // import Dashboard from '../pages/app/Dashboard';
// // import Products from '../pages/app/Products';
// // import Categories from '../pages/app/Categories';
// // import Inventory from '../pages/app/Inventory';
// // import POS from '../pages/app/POS';
// // import Sales from '../pages/app/Sales';
// // import Customers from '../pages/app/Customers';
// // import Suppliers from '../pages/app/Suppliers';
// // import Purchases from '../pages/app/Purchases';
// // import Expenses from '../pages/app/Expenses';
// // import Employees from '../pages/app/Employees';
// // import Roles from '../pages/app/Roles';
// // import Reports from '../pages/app/Reports';
// // import Analytics from '../pages/app/Analytics';
// // import Branches from '../pages/app/Branches';
// // import Notifications from '../pages/app/Notifications';
// // import Settings from '../pages/app/Settings';
// // import Subscription from '../pages/app/Subscription';

// // // Admin Pages
// // import AdminDashboard from '../pages/admin/AdminDashboard';
// // import Businesses from '../pages/admin/Businesses';
// // import Plans from '../pages/admin/Plans';
// // import Subscriptions from '../pages/admin/Subscriptions';
// // import Payments from '../pages/admin/Payments';
// // import AuditLogs from '../pages/admin/AuditLogs';
// // import AdminSettings from '../pages/admin/AdminSettings';

// // function AppRoutes() {
// //   return (
// //     <Routes>
// //       {/* ====== Public Routes ====== */}
// //       {/* Full-width pages: no layout wrapper */}
// //       <Route path="/" element={<Landing />} />
// //       <Route path="/pricing" element={<Pricing />} />
// //       <Route path="/integrations" element={<Integrations />} />
// //       <Route path="/changelog" element={<Changelog />} />
// //       <Route path="/about" element={<About />} />
// //       <Route path="/blog" element={<Blog />} />
// //       <Route path="/careers" element={<Careers />} />
// //       <Route path="/contact" element={<Contact />} />
// //       <Route path="/privacy" element={<Privacy />} />
// //       <Route path="/terms" element={<Terms />} />
// //       <Route path="/cookies" element={<Cookies />} />
// //       <Route path="/refund-policy" element={<RefundPolicy />} />
// //       {/* Card-style auth pages: wrapped in AuthLayout */}
// //       <Route element={<AuthLayout />}>
// //         <Route path="/login" element={<Login />} />
// //         <Route path="/register" element={<Register />} />
// //         <Route path="/forgot-password" element={<ForgotPassword />} />
// //         <Route path="/reset-password" element={<ResetPassword />} />
// //       </Route>

// //       {/* ====== Protected App Routes (MainLayout) ====== */}
// //       <Route element={<ProtectedRoute />}>
// //         <Route element={<MainLayout />}>
// //           {/* No specific permission needed - all authenticated users */}
// //           <Route path="/app/dashboard" element={<Dashboard />} />
// //           <Route path="/app/pos" element={<POS />} />

// //           {/* Permission-gated routes */}
// //           <Route path="/app/products" element={<ProtectedRoute permission="products.view"><Products /></ProtectedRoute>} />
// //           <Route path="/app/categories" element={<ProtectedRoute permission="categories.view"><Categories /></ProtectedRoute>} />
// //           <Route path="/app/inventory" element={<ProtectedRoute permission="inventory.view"><Inventory /></ProtectedRoute>} />
// //           <Route path="/app/sales" element={<ProtectedRoute permission="sales.view"><Sales /></ProtectedRoute>} />
// //           <Route path="/app/customers" element={<ProtectedRoute permission="customers.view"><Customers /></ProtectedRoute>} />
// //           <Route path="/app/notifications" element={<ProtectedRoute permission="notifications.view"><Notifications /></ProtectedRoute>} />

// //           <Route path="/app/suppliers" element={<ProtectedRoute permission="suppliers.view"><Suppliers /></ProtectedRoute>} />
// //           <Route path="/app/purchases" element={<ProtectedRoute permission="purchases.view"><Purchases /></ProtectedRoute>} />
// //           <Route path="/app/expenses" element={<ProtectedRoute permission="expenses.view"><Expenses /></ProtectedRoute>} />
// //           <Route path="/app/employees" element={<ProtectedRoute permission="employees.view"><Employees /></ProtectedRoute>} />
// //           <Route path="/app/roles" element={<ProtectedRoute permission="roles.view"><Roles /></ProtectedRoute>} />
// //           <Route path="/app/reports" element={<ProtectedRoute permission="reports.view"><Reports /></ProtectedRoute>} />
// //           <Route path="/app/analytics" element={<ProtectedRoute permission="reports.view"><Analytics /></ProtectedRoute>} />
// //           <Route path="/app/branches" element={<ProtectedRoute permission="branches.view"><Branches /></ProtectedRoute>} />
// //           <Route path="/app/settings" element={<ProtectedRoute permission="settings.view"><Settings /></ProtectedRoute>} />
// //           <Route path="/app/subscription" element={<ProtectedRoute ownerOnly><Subscription /></ProtectedRoute>} />
// //         </Route>
// //       </Route>

// //       {/* ====== Admin Routes (AdminLayout) ====== */}
// //       <Route element={<AdminRoute />}>
// //         <Route element={<AdminLayout />}>
// //           <Route path="/admin/dashboard" element={<AdminDashboard />} />
// //           <Route path="/admin/businesses" element={<Businesses />} />
// //           <Route path="/admin/plans" element={<Plans />} />
// //           <Route path="/admin/subscriptions" element={<Subscriptions />} />
// //           <Route path="/admin/payments" element={<Payments />} />
// //           <Route path="/admin/audit-logs" element={<AuditLogs />} />
// //           <Route path="/admin/settings" element={<AdminSettings />} />
// //         </Route>
// //       </Route>

// //       {/* ====== 404 Catch-All ====== */}
// //       <Route
// //         path="*"
// //         element={
// //           <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
// //             <h1 className="text-6xl font-bold text-gray-200">404</h1>
// //             <p className="mt-3 text-lg font-medium text-gray-700">Page not found</p>
// //             <p className="mt-1 text-sm text-gray-500">
// //               The page you&apos;re looking for doesn&apos;t exist.
// //             </p>
// //             <Link
// //               to="/"
// //               className="mt-6 inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
// //             >
// //               Go Home
// //             </Link>
// //           </div>
// //         }
// //       />
// //     </Routes>
// //   );
// // }

// // export default AppRoutes;

import { Routes, Route, Link } from 'react-router-dom';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';

// Route Guards
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

// Public Pages
import Landing from '../pages/public/Landing';
import Login from '../pages/public/Login';
import Register from '../pages/public/Register';
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';
import Pricing from '../pages/public/Pricing';
import Integrations from '../pages/public/Integrations';
import Changelog from '../pages/public/Changelog';
import About from '../pages/public/About';
import Blog from '../pages/public/Blog';
import Careers from '../pages/public/Careers';
import Contact from '../pages/public/Contact';
import Privacy from '../pages/public/Privacy';
import Terms from '../pages/public/Terms';
import Cookies from '../pages/public/Cookies';
import RefundPolicy from '../pages/public/RefundPolicy';

// App Pages
import Dashboard from '../pages/app/Dashboard';
import Products from '../pages/app/Products';
import Categories from '../pages/app/Categories';
import Inventory from '../pages/app/Inventory';
import POS from '../pages/app/POS';
import Sales from '../pages/app/Sales';
import Customers from '../pages/app/Customers';
import Suppliers from '../pages/app/Suppliers';
import Purchases from '../pages/app/Purchases';
import Expenses from '../pages/app/Expenses';
import Employees from '../pages/app/Employees';
import Roles from '../pages/app/Roles';
import Reports from '../pages/app/Reports';
import Analytics from '../pages/app/Analytics';
import Branches from '../pages/app/Branches';
import Notifications from '../pages/app/Notifications';
import Settings from '../pages/app/Settings';
import Subscription from '../pages/app/Subscription';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import Businesses from '../pages/admin/Businesses';
import Plans from '../pages/admin/Plans';
import Subscriptions from '../pages/admin/Subscriptions';
import Payments from '../pages/admin/Payments';
import Users from '../pages/admin/Users';
import Revenue from '../pages/admin/Revenue';
import FeatureFlags from '../pages/admin/FeatureFlags';
import SupportRequests from '../pages/admin/SupportRequests';
import AuditLogs from '../pages/admin/AuditLogs';
import AdminSettings from '../pages/admin/AdminSettings';

function AppRoutes() {
  return (
    <Routes>
      {/* =========================================================
          PUBLIC ROUTES
      ========================================================= */}

      {/* Main landing page */}
      <Route path="/" element={<Landing />} />

      {/* Pricing */}
      <Route path="/pricing" element={<Pricing />} />

      {/* Product / Company / Legal Pages */}
      <Route path="/integrations" element={<Integrations />} />
      <Route path="/changelog" element={<Changelog />} />
      <Route path="/about" element={<About />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/contact" element={<Contact />} />

      {/* Legal */}
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/cookies" element={<Cookies />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />

      {/* =========================================================
          AUTH ROUTES
      ========================================================= */}

      <Route element={<AuthLayout />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* =========================================================
          PROTECTED APP ROUTES
          MainLayout
      ========================================================= */}

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>

          {/* -----------------------------------------------------
              General authenticated pages
          ----------------------------------------------------- */}

          <Route
            path="/app/dashboard"
            element={<Dashboard />}
          />

          <Route
            path="/app/pos"
            element={<POS />}
          />

          {/* -----------------------------------------------------
              Products
          ----------------------------------------------------- */}

          <Route
            path="/app/products"
            element={
              <ProtectedRoute permission="products.view">
                <Products />
              </ProtectedRoute>
            }
          />

          {/* -----------------------------------------------------
              Categories
          ----------------------------------------------------- */}

          <Route
            path="/app/categories"
            element={
              <ProtectedRoute permission="categories.view">
                <Categories />
              </ProtectedRoute>
            }
          />

          {/* -----------------------------------------------------
              Inventory
          ----------------------------------------------------- */}

          <Route
            path="/app/inventory"
            element={
              <ProtectedRoute permission="inventory.view">
                <Inventory />
              </ProtectedRoute>
            }
          />

          {/* -----------------------------------------------------
              Sales
          ----------------------------------------------------- */}

          <Route
            path="/app/sales"
            element={
              <ProtectedRoute permission="sales.view">
                <Sales />
              </ProtectedRoute>
            }
          />

          {/* -----------------------------------------------------
              Customers
          ----------------------------------------------------- */}

          <Route
            path="/app/customers"
            element={
              <ProtectedRoute permission="customers.view">
                <Customers />
              </ProtectedRoute>
            }
          />

          {/* -----------------------------------------------------
              Notifications
          ----------------------------------------------------- */}

          <Route
            path="/app/notifications"
            element={
              <ProtectedRoute permission="notifications.view">
                <Notifications />
              </ProtectedRoute>
            }
          />

          {/* -----------------------------------------------------
              Suppliers
          ----------------------------------------------------- */}

          <Route
            path="/app/suppliers"
            element={
              <ProtectedRoute permission="suppliers.view">
                <Suppliers />
              </ProtectedRoute>
            }
          />

          {/* -----------------------------------------------------
              Purchases
          ----------------------------------------------------- */}

          <Route
            path="/app/purchases"
            element={
              <ProtectedRoute permission="purchases.view">
                <Purchases />
              </ProtectedRoute>
            }
          />

          {/* -----------------------------------------------------
              Expenses
          ----------------------------------------------------- */}

          <Route
            path="/app/expenses"
            element={
              <ProtectedRoute permission="expenses.view">
                <Expenses />
              </ProtectedRoute>
            }
          />

          {/* -----------------------------------------------------
              Employees
          ----------------------------------------------------- */}

          <Route
            path="/app/employees"
            element={
              <ProtectedRoute permission="employees.view">
                <Employees />
              </ProtectedRoute>
            }
          />

          {/* -----------------------------------------------------
              Roles
          ----------------------------------------------------- */}

          <Route
            path="/app/roles"
            element={
              <ProtectedRoute permission="roles.view">
                <Roles />
              </ProtectedRoute>
            }
          />

          {/* -----------------------------------------------------
              Reports
          ----------------------------------------------------- */}

          <Route
            path="/app/reports"
            element={
              <ProtectedRoute permission="reports.view">
                <Reports />
              </ProtectedRoute>
            }
          />

          {/* -----------------------------------------------------
              Analytics
          ----------------------------------------------------- */}

          <Route
            path="/app/analytics"
            element={
              <ProtectedRoute permission="reports.view">
                <Analytics />
              </ProtectedRoute>
            }
          />

          {/* -----------------------------------------------------
              Branches
          ----------------------------------------------------- */}

          <Route
            path="/app/branches"
            element={
              <ProtectedRoute permission="branches.view">
                <Branches />
              </ProtectedRoute>
            }
          />

          {/* -----------------------------------------------------
              Settings
          ----------------------------------------------------- */}

          <Route
            path="/app/settings"
            element={
              <ProtectedRoute permission="settings.view">
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* -----------------------------------------------------
              Subscription
              Owner only
          ----------------------------------------------------- */}

          <Route
            path="/app/subscription"
            element={
              <ProtectedRoute ownerOnly>
                <Subscription />
              </ProtectedRoute>
            }
          />

        </Route>
      </Route>

      {/* =========================================================
          ADMIN ROUTES
          AdminLayout
      ========================================================= */}

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>

          {/* Admin Dashboard */}
          <Route
            path="/admin/dashboard"
            element={<AdminDashboard />}
          />

          {/* Businesses */}
          <Route
            path="/admin/businesses"
            element={<Businesses />}
          />

          {/* Plans */}
          <Route
            path="/admin/plans"
            element={<Plans />}
          />

          {/* Subscriptions */}
          <Route
            path="/admin/subscriptions"
            element={<Subscriptions />}
          />

          {/* Payments */}
          <Route
            path="/admin/payments"
            element={<Payments />}
          />

          {/* Users - added from first version */}
          <Route
            path="/admin/users"
            element={<Users />}
          />

          {/* Revenue - added from first version */}
          <Route
            path="/admin/revenue"
            element={<Revenue />}
          />

          {/* Feature Flags - added from first version */}
          <Route
            path="/admin/feature-flags"
            element={<FeatureFlags />}
          />

          {/* Support Requests - added from first version */}
          <Route
            path="/admin/support-requests"
            element={<SupportRequests />}
          />

          {/* Audit Logs */}
          <Route
            path="/admin/audit-logs"
            element={<AuditLogs />}
          />

          {/* Admin Settings */}
          <Route
            path="/admin/settings"
            element={<AdminSettings />}
          />

        </Route>
      </Route>

      {/* =========================================================
          404 CATCH-ALL
      ========================================================= */}

      <Route
        path="*"
        element={
          <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
            <h1 className="text-6xl font-bold text-gray-200">
              404
            </h1>

            <p className="mt-3 text-lg font-medium text-gray-700">
              Page not found
            </p>

            <p className="mt-1 text-sm text-gray-500">
              The page you&apos;re looking for doesn&apos;t exist.
            </p>

            <Link
              to="/"
              className="mt-6 inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </Link>
          </div>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
