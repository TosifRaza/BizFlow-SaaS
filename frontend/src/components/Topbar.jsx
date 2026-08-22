import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineBars3,
  HiOutlineBell,
  HiOutlineUserCircle,
  HiOutlineCog6Tooth,
  HiOutlineArrowRightOnRectangle,
  HiOutlineChevronDown,
  HiOutlineBuildingStorefront,
} from 'react-icons/hi2';
import { useAuth } from '../context/AuthContext';
import { branchApi } from '../api/branchApi';

function Topbar({ onMenuClick, title, user, unreadCount = 0, sidebarOpen }) {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState('');
  const [branchesLoading, setBranchesLoading] = useState(false);

  const showBranchSelector = user && user.role !== 'owner' && user.role !== 'super_admin';

  useEffect(() => {
    if (!showBranchSelector) return;
    const stored = localStorage.getItem('selectedBranchId');
    if (stored) setSelectedBranch(stored);

    let cancelled = false;
    const fetchBranches = async () => {
      setBranchesLoading(true);
      try {
        const { data } = await branchApi.getAll({ limit: 100 });
        const list = data?.data ?? data?.branches ?? [];
        if (!cancelled) {
          setBranches(list);
          // Auto-select if only one branch and none stored
          if (list.length === 1 && !stored) {
            localStorage.setItem('selectedBranchId', list[0]._id);
            setSelectedBranch(list[0]._id);
          }
        }
      } catch {
        // Non-critical
      } finally {
        if (!cancelled) setBranchesLoading(false);
      }
    };
    fetchBranches();
    return () => { cancelled = true; };
  }, [showBranchSelector]);

  const handleBranchChange = (e) => {
    const value = e.target.value;
    setSelectedBranch(value);
    if (value) {
      localStorage.setItem('selectedBranchId', value);
    } else {
      localStorage.removeItem('selectedBranchId');
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate('/login');
  };

  // Show hamburger on mobile always, or on desktop when sidebar is collapsed
  const showHamburger = !sidebarOpen;

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6">
        {/* Left: hamburger + mobile title */}
        <div className="flex items-center gap-3">
          {showHamburger && (
            <button
              onClick={onMenuClick}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Open menu"
            >
              <HiOutlineBars3 className="w-5 h-5" />
            </button>
          )}
          {title && (
            <h2 className="lg:hidden text-sm font-semibold text-gray-900 truncate max-w-[200px]">
              {title}
            </h2>
          )}
        </div>

        {/* Center: branch selector + search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 items-center gap-3">
          {showBranchSelector && branches.length > 0 && (
            <div className="relative flex items-center gap-1.5">
              <HiOutlineBuildingStorefront className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <select
                value={selectedBranch}
                onChange={handleBranchChange}
                disabled={branchesLoading}
                className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Branches</option>
                {branches.map((b) => (
                  <option key={b._id} value={b._id}>{b.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search anything..."
              readOnly
              className="w-full pl-4 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-400 cursor-default focus:outline-none"
            />
          </div>
        </div>

        {/* Right: notifications + user dropdown */}
        <div className="flex items-center gap-2">
          {/* Notification bell */}
          <button
            onClick={() => navigate('/app/notifications')}
            className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          >
            <HiOutlineBell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* User avatar dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
                {initials}
              </div>
              <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
                {user?.name || 'User'}
              </span>
              <HiOutlineChevronDown
                className={`hidden sm:block w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user?.name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'user@example.com'}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => { setDropdownOpen(false); navigate('/app/settings'); }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <HiOutlineCog6Tooth className="w-4 h-4 text-gray-400" />
                    Settings
                  </button>
                </div>

                <div className="border-t border-gray-100 py-1">
                  <button
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    onClick={handleLogout}
                  >
                    <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Topbar;
// import { useState, useRef, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';
// import {
//   HiOutlineBars3,
//   HiOutlineBell,
//   HiOutlineUserCircle,
//   HiOutlineCog6Tooth,
//   HiOutlineArrowRightOnRectangle,
//   HiOutlineChevronDown,
// } from 'react-icons/hi2';

// function Topbar({ onMenuClick, title, user, unreadCount = 0 }) {
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);
//   const navigate = useNavigate();
//   const { logout } = useAuth();

//   useEffect(() => {
//     function handleClickOutside(e) {
//       if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
//         setDropdownOpen(false);
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const initials = user?.name
//     ? user.name
//         .split(' ')
//         .map((w) => w[0])
//         .join('')
//         .toUpperCase()
//         .slice(0, 2)
//     : 'U';

//   const handleLogout = () => {
//     setDropdownOpen(false);
//     logout();
//     navigate('/login');
//   };

//   return (
//     <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
//       <div className="flex items-center justify-between h-16 px-4 sm:px-6">
//         {/* Left: hamburger (mobile) + mobile title */}
//         <div className="flex items-center gap-3">
//           <button
//             onClick={onMenuClick}
//             className="lg:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
//             aria-label="Open menu"
//           >
//             <HiOutlineBars3 className="w-5 h-5" />
//           </button>
//           {title && (
//             <h2 className="lg:hidden text-sm font-semibold text-gray-900 truncate max-w-[200px]">
//               {title}
//             </h2>
//           )}
//         </div>

//         {/* Center: decorative search bar (hidden on very small screens) */}
//         <div className="hidden md:flex flex-1 max-w-md mx-8">
//           <div className="relative w-full">
//             <input
//               type="text"
//               placeholder="Search anything..."
//               readOnly
//               className="w-full pl-4 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg text-gray-400 cursor-default focus:outline-none"
//             />
//           </div>
//         </div>

//         {/* Right: notifications + user dropdown */}
//         <div className="flex items-center gap-2">
//           {/* Notification bell */}
//           <button
//             className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
//             aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
//           >
//             <HiOutlineBell className="w-5 h-5" />
//             {unreadCount > 0 && (
//               <span className="absolute top-1 right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none">
//                 {unreadCount > 99 ? '99+' : unreadCount}
//               </span>
//             )}
//           </button>

//           {/* User avatar dropdown */}
//           <div className="relative" ref={dropdownRef}>
//             <button
//               onClick={() => setDropdownOpen((prev) => !prev)}
//               className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
//               aria-expanded={dropdownOpen}
//               aria-haspopup="true"
//             >
//               <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-semibold">
//                 {initials}
//               </div>
//               <span className="hidden sm:block text-sm font-medium text-gray-700 max-w-[120px] truncate">
//                 {user?.name || 'User'}
//               </span>
//               <HiOutlineChevronDown
//                 className={`hidden sm:block w-4 h-4 text-gray-400 transition-transform duration-200 ${
//                   dropdownOpen ? 'rotate-180' : ''
//                 }`}
//               />
//             </button>

//             {/* Dropdown menu */}
//             {dropdownOpen && (
//               <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
//                 <div className="px-4 py-3 border-b border-gray-100">
//                   <p className="text-sm font-semibold text-gray-900 truncate">
//                     {user?.name || 'User'}
//                   </p>
//                   <p className="text-xs text-gray-500 truncate">
//                     {user?.email || 'user@example.com'}
//                   </p>
//                 </div>

//                 <div className="py-1">
//                   <button
//                     onClick={() => { setDropdownOpen(false); navigate('/app/settings'); }}
//                     className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
//                   >
//                     <HiOutlineUserCircle className="w-4 h-4 text-gray-400" />
//                     Profile
//                   </button>
//                   <button
//                     onClick={() => { setDropdownOpen(false); navigate('/app/settings'); }}
//                     className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
//                   >
//                     <HiOutlineCog6Tooth className="w-4 h-4 text-gray-400" />
//                     Settings
//                   </button>
//                 </div>

//                 <div className="border-t border-gray-100 py-1">
//                   <button
//                     onClick={handleLogout}
//                     className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
//                   >
//                     <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
//                     Logout
//                   </button>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }

// export default Topbar;
