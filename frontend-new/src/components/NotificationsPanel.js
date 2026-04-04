import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from './ui/Card';
import Button from './ui/Button';
import Select from './ui/Select';
import PaginatedDataTable from './ui/PaginatedDataTable';

function NotificationsPanel({ isStandalone = false }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.getNotifications();
      setNotifications(response.results || []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markNotificationAsRead = async (notificationId) => {
    try {
      await apiClient.markNotificationAsRead(notificationId);
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, is_read: true } : n)));
    } catch {
      // Keep current state if API update fails.
    }
  };

  const markAllAsRead = async () => {
    const unread = notifications.filter((n) => !n.is_read);
    try {
      await Promise.all(unread.map((n) => apiClient.markNotificationAsRead(n.id)));
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    } catch {
      // Keep current state if API update fails.
    }
  };

  const filteredNotifications = useMemo(() => {
    let data = [...notifications];

    if (filter === 'unread') data = data.filter((n) => !n.is_read);
    if (filter === 'read') data = data.filter((n) => n.is_read);
    if (typeFilter !== 'all') data = data.filter((n) => n.type === typeFilter);

    return data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [notifications, filter, typeFilter]);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const columns = [
    {
      key: 'title',
      header: 'Title',
      render: (row) => (
        <div className="space-y-1">
          <p className="font-semibold text-neutral-800 dark:text-white">{row.title}</p>
          {!row.is_read && (
            <span className="inline-block rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-800 dark:bg-primary-950/40 dark:text-primary-300">
              New
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <span className="inline-flex rounded-full bg-neutral-100 px-2.5 py-1 text-xs font-medium capitalize text-neutral-700 dark:bg-[var(--bp-surface-soft)] dark:text-[var(--bp-text-muted)]">
          {row.type || 'general'}
        </span>
      ),
    },
    {
      key: 'message',
      header: 'Message',
      render: (row) => (
        <p className="max-w-[52ch] truncate text-neutral-700 dark:text-[var(--bp-text-muted)]" title={row.message || '-'}>
          {row.message || '-'}
        </p>
      ),
    },
    {
      key: 'created_at',
      header: 'Created',
      render: (row) => (
        <span className="text-neutral-600 dark:text-[var(--bp-text-subtle)]">
          {row.created_at ? new Date(row.created_at).toLocaleString() : 'N/A'}
        </span>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (row) =>
        row.is_read ? (
          <span className="text-xs text-neutral-500">Read</span>
        ) : (
          <Button variant="secondary" className="px-3 py-1.5 text-xs" onClick={() => markNotificationAsRead(row.id)}>
            Mark Read
          </Button>
        ),
    },
  ];

  if (loading) {
    return (
      <div className="py-8 text-center">
        <LoadingSpinner size="medium" text="Loading notifications..." />
      </div>
    );
  }

  const content = (
    <>
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-neutral-500">Total</p>
          <p className="mt-2 text-3xl font-bold text-primary-700 dark:text-primary-400">{notifications.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-500">Unread</p>
          <p className="mt-2 text-3xl font-bold text-amber-700 dark:text-amber-400">{unreadCount}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-500">Read</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700 dark:text-emerald-400">{Math.max(0, notifications.length - unreadCount)}</p>
        </Card>
      </div>

      <Card className="mb-6" aria-label="Notification filters">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Select label="Read Status" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </Select>
          <Select label="Notification Type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
            <option value="all">All Types</option>
            <option value="enrollment">Enrollment</option>
            <option value="grade">Grade</option>
            <option value="attendance">Attendance</option>
          </Select>
          <div className="flex items-end">
            <Button variant="secondary" onClick={markAllAsRead} disabled={unreadCount === 0} className="w-full">
              Mark All Read
            </Button>
          </div>
        </div>
      </Card>

      <div aria-live="polite" className="mb-4 text-sm text-neutral-600">
        {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
      </div>

      <Card className="overflow-hidden" aria-label="Notifications list">
        <PaginatedDataTable
          columns={columns}
          data={filteredNotifications}
          pageSize={10}
          emptyMessage="No notifications found for the selected filters."
          ariaLabel="Notifications table"
        />
      </Card>
    </>
  );

  if (!isStandalone) return content;

  return (
    <DashboardLayout title="Notifications" subtitle="Stay informed about enrollments, grades, and attendance updates.">
      {content}
    </DashboardLayout>
  );
}

export default NotificationsPanel;
