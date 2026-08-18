import { createPortal } from 'react-dom';
import { useEffect } from 'react';
import {
  HiOutlineShoppingCart,
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineClipboardDocument,
  HiOutlineDocumentText,
  HiOutlineTruck,
  HiOutlineCog6Tooth,
  HiOutlineChevronLeft,
  HiOutlineXMark,
} from 'react-icons/hi2';

const iconMap = {
  HiOutlineShoppingCart,
  HiOutlineCube,
  HiOutlineUsers,
  HiOutlineChartBar,
  HiOutlineClipboardDocument,
  HiOutlineDocumentText,
  HiOutlineTruck,
  HiOutlineCog6Tooth,
};

const activeColorMap = {
  blue: { active: 'bg-blue-600 text-white', badge: 'bg-blue-500' },
  purple: { active: 'bg-purple-600 text-white', badge: 'bg-purple-500' },
};

function Sidebar({ isOpen, onClose, items = [], activePath, activeColor = 'blue' }) {
  const colors = activeColorMap[activeColor] || activeColorMap.blue;
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const sidebarContent = (
    <aside
      className={[
        'fixed top-0 left-0 z-40 h-full bg-gray-900 flex flex-col transition-transform duration-300 ease-in-out',
        'w-64',
      ].join(' ')}
    >
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-5 border-b border-gray-800">
        <span className="text-xl font-bold text-white tracking-tight">BizFlow</span>
        {/* Mobile close button */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
          aria-label="Close sidebar"
        >
          <HiOutlineXMark className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3" aria-label="Sidebar navigation">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const Icon = item.icon || HiOutlineCube;
            const isActive = activePath === item.path;
            return (
              <li key={item.path}>
                <a
                  href={item.path}
                  onClick={(e) => {
                    if (item.onClick) {
                      e.preventDefault();
                      item.onClick();
                    }
                  }}
                  className={[
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? colors.active
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                  ].join(' ')}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="truncate flex-1">{item.label}</span>
                  {item.badge !== undefined && item.badge !== null && (
                    <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold bg-blue-500 text-white">
                      {item.badge}
                    </span>
                  )}
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom collapse button */}
      <div className="border-t border-gray-800 p-3">
        <button
          onClick={onClose}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
        >
          <HiOutlineChevronLeft className="w-5 h-5" />
          <span>Collapse</span>
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar: always visible when open, hidden via parent layout */}
      <div
        className={[
          'hidden lg:block shrink-0 transition-all duration-300',
          isOpen ? 'w-64' : 'w-0',
        ].join(' ')}
      >
        {isOpen && sidebarContent}
      </div>

      {/* Mobile overlay + sidebar via portal */}
      {isOpen &&
        createPortal(
          <div className="lg:hidden">
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-30 bg-black/50 transition-opacity"
              onClick={onClose}
            />
            {/* Sidebar portal clone */}
            <aside
              className="fixed top-0 left-0 z-40 h-full w-64 bg-gray-900 flex flex-col animate-in slide-in-from-left"
            >
              <div className="flex items-center justify-between h-16 px-5 border-b border-gray-800">
                <span className="text-xl font-bold text-white tracking-tight">BizFlow</span>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors cursor-pointer"
                  aria-label="Close sidebar"
                >
                  <HiOutlineXMark className="w-5 h-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto py-4 px-3">
                <ul className="flex flex-col gap-1">
                  {items.map((item) => {
                    const Icon = item.icon || HiOutlineCube;
                    const isActive = activePath === item.path;
                    return (
                      <li key={item.path}>
                        <a
                          href={item.path}
                          onClick={(e) => {
                            if (item.onClick) {
                              e.preventDefault();
                              item.onClick();
                            }
                          }}
                          className={[
                            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                            isActive
                              ? colors.active
                              : 'text-gray-300 hover:bg-gray-800 hover:text-white',
                          ].join(' ')}
                          aria-current={isActive ? 'page' : undefined}
                        >
                          <Icon className="w-5 h-5 shrink-0" />
                          <span className="truncate flex-1">{item.label}</span>
                          {item.badge !== undefined && item.badge !== null && (
                            <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold bg-blue-500 text-white">
                              {item.badge}
                            </span>
                          )}
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </nav>

              <div className="border-t border-gray-800 p-3">
                <button
                  onClick={onClose}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-white transition-colors cursor-pointer"
                >
                  <HiOutlineChevronLeft className="w-5 h-5" />
                  <span>Collapse</span>
                </button>
              </div>
            </aside>
          </div>,
          document.body
        )}
    </>
  );
}

export default Sidebar;
