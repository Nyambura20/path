import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import LoadingSpinner from './LoadingSpinner';

function NotificationsPanel({ isStandalone = false }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'enrollment', 'grade', 'attendance'

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.getNotifications();
      setNotifications(response.results || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    try {
      await apiClient.markNotificationAsRead(notificationId);
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, is_read: true } : notif
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(
        unreadNotifications.map(notif => apiClient.markNotificationAsRead(notif.id))
      );
      setNotifications(notifications.map(notif => ({ ...notif, is_read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getFilteredNotifications = () => {
    let filtered = notifications;

    // Filter by read status
    if (filter === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    } else if (filter === 'read') {
      filtered = filtered.filter(n => n.is_read);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(n => n.type === typeFilter);
    }

    return filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'enrollment':
        return (
          <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
        );
      case 'grade':
        return (
          <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 0 012 2m-3 10v-1a4 4 0 118 0v1m-9 0h10" />
          </svg>
        );
      case 'attendance':
        return (
          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V9a2 2 0 012-2h0a2 2 0 012 2v8z" />
          </svg>
        );
    }
  };

  const getNotificationBadgeColor = (type) => {
    switch (type) {
      case 'enrollment':
        return 'bg-primary-100 text-primary-800';
      case 'grade':
        return 'bg-yellow-100 text-yellow-800';
      case 'attendance':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <LoadingSpinner size="medium" text="Loading notifications..." />
      </div>
    );
  }

  const containerClass = isStandalone 
    ? "min-h-screen bg-gray-50 py-8"
    : "";

  const contentClass = isStandalone 
    ? "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8"
    : "";

  return (
    <div className={containerClass}>
      <div className={contentClass}>
        {isStandalone && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            <p className="text-gray-600 mt-2">
              Stay updated with student enrollments, grades, and attendance.
            </p>
          </div>
        )}

        <div className="card">
          {/* Header with filters and actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                {isStandalone ? 'All Notifications' : 'Notifications'}
              </h2>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Read status filter */}
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All</option>
                <option value="unread">Unread</option>
                <option value="read">Read</option>
              </select>

              {/* Type filter */}
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="all">All Types</option>
                <option value="enrollment">Enrollments</option>
                <option value="grade">Grades</option>
                <option value="attendance">Attendance</option>
              </select>

              {/* Mark all as read button */}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* Notifications list */}
          <div className="space-y-4">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.is_read 
                      ? 'bg-gray-50 border-gray-200' 
                      : 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {/* Icon */}
                      <div className="flex-shrink-0 mt-1">
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className={`text-sm font-medium ${
                            notification.is_read ? 'text-gray-900' : 'text-blue-900'
                          }`}>
                            {notification.title}
                          </h3>
                          {!notification.is_read && (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            getNotificationBadgeColor(notification.type)
                          }`}>
                            {notification.type}
                          </span>
                        </div>
                        
                        <p className={`text-sm ${
                          notification.is_read ? 'text-gray-600' : 'text-blue-800'
                        } mb-2`}>
                          {notification.message}
                        </p>
                        
                        <p className="text-xs text-gray-500">
                          {new Date(notification.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Action button */}
                    {!notification.is_read && (
                      <button
                        onClick={() => markNotificationAsRead(notification.id)}
                        className="ml-4 text-sm text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap"
                      >
                        Mark as read
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V9a2 2 0 012-2h0a2 2 0 012 2v8z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {filter === 'unread' ? 'No Unread Notifications' : 
                   filter === 'read' ? 'No Read Notifications' :
                   typeFilter !== 'all' ? `No ${typeFilter} notifications` :
                   'No Notifications'}
                </h3>
                <p className="text-gray-600">
                  {notifications.length === 0 
                    ? "You'll receive notifications when students enroll in your courses or when there are updates."
                    : "Try adjusting your filters to see more notifications."
                  }
                </p>
              </div>
            )}
          </div>

          {/* Pagination could be added here for large lists */}
          {filteredNotifications.length > 0 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Showing {filteredNotifications.length} of {notifications.length} notifications
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationsPanel;
