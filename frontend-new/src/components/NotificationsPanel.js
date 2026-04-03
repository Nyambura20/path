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
        <div>
          <p className="font-medium text-neutral-800">{row.title}</p>
          {!row.is_read && (
            <span className="mt-1 inline-block rounded-full bg-primary-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-800">
              New
            </span>
          )}
        </div>
      ),
    },
    { key: 'type', header: 'Type', render: (row) => row.type || 'general' },
    { key: 'message', header: 'Message', render: (row) => row.message || '-' },
    { key: 'created_at', header: 'Created', render: (row) => (row.created_at ? new Date(row.created_at).toLocaleString() : 'N/A') },
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

      <PaginatedDataTable
        columns={columns}
        data={filteredNotifications}
        pageSize={10}
        emptyMessage="No notifications found for the selected filters."
        ariaLabel="Notifications table"
      />
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
