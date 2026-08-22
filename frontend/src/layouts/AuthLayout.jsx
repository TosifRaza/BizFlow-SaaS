import { Outlet } from 'react-router-dom';
import { HiOutlineCube } from 'react-icons/hi2';

function AuthLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100">
      {/* Subtle pattern overlay */}
      <div
        className="fixed inset-0 opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      {/* Brand header */}
      <div className="relative z-10 flex items-center justify-center pt-8 pb-4 sm:pt-12 sm:pb-6">
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:shadow-blue-600/40 transition-shadow">
            <HiOutlineCube className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight">
            BizFlow
          </span>
        </a>
      </div>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 sm:px-6">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 text-center py-6 px-4">
        <p className="text-xs text-gray-400">
          &copy; {new Date().getFullYear()} BizFlow. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default AuthLayout;
// import { Outlet, Link } from 'react-router-dom';
// import { HiOutlineCube } from 'react-icons/hi2';

// function AuthLayout() {
//   return (
//     <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100">
//       {/* Subtle pattern overlay */}
//       <div
//         className="fixed inset-0 opacity-[0.015] pointer-events-none"
//         style={{
//           backgroundImage:
//             'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
//           backgroundSize: '32px 32px',
//         }}
//       />

//       {/* Brand header */}
//       <div className="relative z-10 flex items-center justify-center pt-8 pb-4 sm:pt-12 sm:pb-6">
//         <Link to="/" className="flex items-center gap-2.5 group">
//           <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:shadow-blue-600/40 transition-shadow">
//             <HiOutlineCube className="w-5 h-5 text-white" />
//           </div>
//           <span className="text-xl font-bold text-gray-900 tracking-tight">
//             BizFlow
//           </span>
//         </Link>
//       </div>

//       {/* Main content */}
//       <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-6 sm:px-6">
//         <div className="w-full max-w-md">
//           <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-6 sm:p-8">
//             <Outlet />
//           </div>
//         </div>
//       </main>

//       {/* Footer */}
//       <footer className="relative z-10 text-center py-6 px-4">
//         <p className="text-xs text-gray-400">
//           &copy; {new Date().getFullYear()} BizFlow. All rights reserved.
//         </p>
//       </footer>
//     </div>
//   );
// }

// export default AuthLayout;
