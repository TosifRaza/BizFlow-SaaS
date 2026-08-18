import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineBellSlash,
  HiOutlineInbox,
  HiOutlineExclamationTriangle,
  HiOutlineCurrencyRupee,
  HiOutlineInformationCircle,
  HiOutlineCube,
  HiOutlineClock,
} from 'react-icons/hi2';

import PageHeader from '../../components/PageHeader';
import Badge from '../../components/Badge';
import EmptyState from '../../components/EmptyState';
import LoadingSpinner from '../../components/LoadingSpinner';
import { notificationApi } from '../../api/notificationApi';

const TYPE_CONFIG = {
  stock: {
    icon: HiOutlineCube,
    bg: 'bg-yellow-100',
    color: 'text-yellow-600',
    label: 'Stock',
  },
  payment: {
    icon: HiOutlineCurrencyRupee,
    bg: 'bg-green-100',
    color: 'text-green-600',
    label: 'Payment',
  },
  alert: {
    icon: HiOutlineExclamationTriangle,
    bg: 'bg-red-100',
    color: 'text-red-600',
    label: 'Alert',
  },
  info: {
    icon: HiOutlineInformationCircle,
    bg: 'bg-blue-100',
    color: 'text-blue-600',
    label: 'Info',
  },
};

const getRelativeTime = (dateStr) => {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'unread', label: 'Unread' },
];

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await notificationApi.getAll();
      const list = data?.data ?? data ?? [];
      setNotifications(list);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const { data } = await notificationApi.getUnreadCount();
      setUnreadCount(data?.data ?? data?.count ?? 0);
    } catch {
      // silently handle
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, [fetchNotifications, fetchUnreadCount]);

  const filteredNotifications = activeFilter === 'unread'
    ? notifications.filter((n) => !n.read)
    : notifications;

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // silently handle
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      toast.success('All notifications marked as read');
    } catch {
      toast.error('Failed to mark all as read');
    }
  };

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Stay updated with your business activities"
        actions={
          unreadCount > 0
            ? [
                {
                  label: 'Mark All Read',
                  icon: HiOutlineCheckCircle,
                  onClick: handleMarkAllRead,
                  variant: 'secondary',
                },
              ]
            : []
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-4 w-fit">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors cursor-pointer ${
              activeFilter === tab.key
                ? 'bg-gray-900 text-white'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
            {tab.key === 'unread' && unreadCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 animate-pulse">
              <div className="flex items-center gap-4 p-5">
                <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
                <div className="h-3 bg-gray-100 rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredNotifications.length === 0 ? (
        <EmptyState
          title={activeFilter === 'unread' ? 'No unread notifications' : 'No notifications'}
          description={
            activeFilter === 'unread'
              ? 'You\'re all caught up! No unread notifications.'
              : 'Notifications will appear here when there are business updates.'
          }
          icon={<HiOutlineBellSlash className="w-16 h-16" />}
        />
      ) : (
        <div className="space-y-2">
          {filteredNotifications.map((notif) => {
            const typeConfig = TYPE_CONFIG[notif.type] || TYPE_CONFIG.info;
            const Icon = typeConfig.icon;

            return (
              <div
                key={notif.id}
                onClick={() => !notif.read && handleMarkRead(notif.id)}
                className={`bg-white rounded-xl border transition-all cursor-pointer hover:shadow-sm ${
                  !notif.read ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start gap-4 p-4">
                  {/* Icon */}
                  <div className={`shrink-0 p-2.5 rounded-full ${typeConfig.bg}`}>
                    <Icon className={`w-5 h-5 ${typeConfig.color}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${
                          !notif.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'
                        }`}>
                          {notif.title || 'Notification'}
                        </p>
                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="gray">{typeConfig.label}</Badge>
                      </div>
                    </div>
                    {notif.message && (
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{notif.message}</p>
                    )}
                    <div className="flex items-center gap-1.5 mt-2">
                      <HiOutlineClock className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-xs text-gray-400">{getRelativeTime(notif.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Notifications;
