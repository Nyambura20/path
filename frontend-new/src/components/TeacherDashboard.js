import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useRecentPages } from '../utils/useRecentPages';
import apiClient from '../services/api';
import LoadingSpinner from './LoadingSpinner';

function TeacherDashboard() {
  const { user } = useAuth();
  const { recentPages } = useRecentPages();
  const [dashboardData, setDashboardData] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (user?.is_teacher) {
      fetchTeacherDashboardData();
      fetchNotifications();
    }
  }, [user]);

  const fetchTeacherDashboardData = async () => {
    try {
      // Fetch teacher course data
      const coursesResponse = await apiClient.getTeacherCourses();
      const attendanceResponse = await apiClient.getTeacherAttendanceDashboard();
      const performanceResponse = await apiClient.getTeacherPerformanceDashboard();

      setDashboardData({
        courses: coursesResponse,
        attendance: attendanceResponse,
        performance: performanceResponse
      });
    } catch (error) {
      console.error('Error fetching teacher dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      const response = await apiClient.getNotifications();
      setNotifications(response.results || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
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

  if (loading) {
    return (
      <div className="page-shell py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <LoadingSpinner size="large" text="Loading teacher dashboard..." />
          </div>
        </div>
      </div>
    );
  }

  if (!user?.is_teacher) {
    return (
      <div className="page-shell py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="text-gray-600 mt-2">This dashboard is only available to teachers.</p>
          </div>
        </div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(n => !n.is_read);
  const courses = dashboardData?.courses || [];
  const totalStudents = Array.isArray(courses) ? courses.reduce((sum, course) => sum + (course.enrolled_students_count || 0), 0) : 0;
  const totalCourses = Array.isArray(courses) ? courses.length : 0;

  return (
    <div className="page-shell py-8">
      <div className="mx-auto max-w-7xl px-4 pl-14 sm:px-6 sm:pl-16 lg:px-8 lg:pl-20">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Teacher Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-[var(--bp-text-muted)]">
            Welcome back, {user?.first_name || user?.username}! Manage your courses, track attendance, and monitor student performance.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-neutral-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)] dark:hover:shadow-lg dark:hover:shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-[var(--bp-text-subtle)]">Total Courses</p>
                <p className="text-3xl font-bold text-primary-700 dark:text-primary-400">{totalCourses}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-100 text-primary-700 dark:bg-primary-950/40 dark:text-primary-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)] dark:hover:shadow-lg dark:hover:shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-[var(--bp-text-subtle)]">Total Students</p>
                <p className="text-3xl font-bold text-neutral-800 dark:text-[var(--bp-text)]">{totalStudents}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)] dark:hover:shadow-lg dark:hover:shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-[var(--bp-text-subtle)]">Pending Grades</p>
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">{dashboardData?.performance?.summary?.pending_grades || 0}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 10v-1a4 4 0 118 0v1m-9 0h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)] dark:hover:shadow-lg dark:hover:shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-[var(--bp-text-subtle)]">New Notifications</p>
                <p className="text-3xl font-bold text-rose-700 dark:text-rose-400">{unreadNotifications.length}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V9a2 2 0 012-2h0a2 2 0 012 2v8z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="inline-flex rounded-2xl border border-neutral-200/80 bg-white/80 p-1.5 shadow-sm backdrop-blur dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'overview'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-[var(--bp-text-muted)] dark:hover:bg-primary-950/30 dark:hover:text-primary-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'courses'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-[var(--bp-text-muted)] dark:hover:bg-primary-950/30 dark:hover:text-primary-300'
              }`}
            >
              My Courses
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                activeTab === 'notifications'
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-[var(--bp-text-muted)] dark:hover:bg-primary-950/30 dark:hover:text-primary-300'
              }`}
            >
              Notifications
              {unreadNotifications.length > 0 && (
                <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800 dark:bg-red-950/40 dark:text-red-300">
                  {unreadNotifications.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Quick Actions */}
            <div className="card">
              <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
              <div className="space-y-3">
                <a href="/teacher/attendance/mark" className="flex items-center rounded-xl border border-primary-100 bg-primary-50 p-3 transition-colors hover:bg-primary-100 dark:border-primary-900/40 dark:bg-primary-950/25 dark:hover:bg-primary-900/35">
                  <svg className="h-8 w-8 text-primary-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Mark Attendance</p>
                    <p className="text-sm text-gray-600 dark:text-[var(--bp-text-muted)]">Take attendance for today's classes</p>
                  </div>
                </a>

                <a href="/teacher/performance/record" className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:border-slate-700/50 dark:bg-slate-900/30 dark:hover:bg-slate-800/45">
                  <svg className="h-8 w-8 text-secondary-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 10v-1a4 4 0 118 0v1m-9 0h10" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Record Grades</p>
                    <p className="text-sm text-gray-600 dark:text-[var(--bp-text-muted)]">Input student grades and feedback</p>
                  </div>
                </a>

                <a href="/teacher/attendance/records" className="flex items-center rounded-xl border border-amber-200 bg-amber-50 p-3 transition-colors hover:bg-amber-100 dark:border-amber-900/45 dark:bg-amber-950/25 dark:hover:bg-amber-900/35">
                  <svg className="h-8 w-8 text-yellow-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">View Reports</p>
                    <p className="text-sm text-gray-600 dark:text-[var(--bp-text-muted)]">Download attendance & performance reports</p>
                  </div>
                </a>

                <a href="/teacher/ai-predictions" className="flex items-center rounded-xl border border-violet-200 bg-violet-50 p-3 transition-colors hover:bg-violet-100 dark:border-violet-900/45 dark:bg-violet-950/25 dark:hover:bg-violet-900/35">
                  <svg className="h-8 w-8 text-purple-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">AI Predictions</p>
                    <p className="text-sm text-gray-600 dark:text-[var(--bp-text-muted)]">Identify at-risk students with Gemini AI</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                {recentPages.length > 0 && (
                  <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600 dark:bg-primary-950/35 dark:text-primary-300">
                    Recent sessions
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {recentPages.length > 0 ? (
                  recentPages.slice(0, 4).map((page, index) => (
                    <Link
                      key={index}
                      to={page.path}
                      className="group flex items-center gap-4 rounded-2xl border border-neutral-200/70 bg-white/95 px-4 py-3 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary-200/70 hover:shadow-md dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)] dark:hover:border-primary-700/50 dark:hover:shadow-black/20"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 text-white shadow-inner shadow-primary-900/30">
                        {page.icon === 'book' && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        )}
                        {page.icon === 'chart' && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        )}
                        {page.icon === 'clipboard' && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        )}
                        {page.icon === 'edit' && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        )}
                        {page.icon === 'bell' && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                          </svg>
                        )}
                        {page.icon === 'users' && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        )}
                        {page.icon === 'user' && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        )}
                        {page.icon === 'home' && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                          </svg>
                        )}
                        {!['book', 'chart', 'clipboard', 'edit', 'bell', 'users', 'user', 'home'].includes(page.icon) && (
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">{page.title}</p>
                          <span className="text-xs font-medium text-gray-500 dark:text-[var(--bp-text-subtle)]">{page.timeAgo}</span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-[var(--bp-text-muted)]">{page.description}</p>
                        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-[var(--bp-text-subtle)]">
                          <svg className="h-3 w-3 text-gray-400 dark:text-[var(--bp-text-subtle)]" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
                            <path d="M9.293 16.707a1 1 0 010-1.414L12.586 12 9.293 8.707a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" />
                          </svg>
                          <span className="font-medium text-primary-600 group-hover:text-primary-700 dark:text-primary-300 dark:group-hover:text-primary-200">Open page</span>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-neutral-200/80 bg-neutral-50 p-8 text-center dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)]">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-50 text-primary-500 dark:bg-primary-950/35 dark:text-primary-300">
                      <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="mt-4 text-base font-medium text-gray-900 dark:text-white">No recent activity yet</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-[var(--bp-text-muted)]">Navigate the platform to start building your teaching timeline.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(courses) && courses.map((course) => (
              <div key={course.id} className="card hover:shadow-lg transition-shadow dark:hover:shadow-black/20">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{course.name}</h3>
                    <p className="text-sm text-gray-600 dark:text-[var(--bp-text-muted)]">{course.code}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-950/40 dark:text-primary-300">
                    Active
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-[var(--bp-text-muted)]">Students:</span>
                    <span className="font-medium dark:text-white">{course.enrolled_students_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-[var(--bp-text-muted)]">Avg. Attendance:</span>
                    <span className="font-medium dark:text-white">{course.attendance_data?.rate || 'N/A'}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-[var(--bp-text-muted)]">Avg. Performance:</span>
                    <span className="font-medium dark:text-white">{course.performance_data?.average || 'N/A'}%</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <a
                    href={`/teacher/course/${course.id}/students`}
                    className="btn-primary flex-1 rounded-lg px-3 py-2 text-center text-sm"
                  >
                    View Students
                  </a>
                  <a
                    href={`/teacher/course/${course.id}/manage`}
                    className="btn-secondary flex-1 rounded-lg px-3 py-2 text-center text-sm"
                  >
                    Manage
                  </a>
                </div>
              </div>
            ))}
            
            {(!Array.isArray(courses) || courses.length === 0) && (
              <div className="col-span-full text-center py-12">
                <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">No Courses Assigned</h3>
                <p className="text-gray-600 dark:text-[var(--bp-text-muted)]">Contact administration to get courses assigned to your account.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="max-w-4xl">
            <div className="card">
              <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Notifications</h2>
              
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`rounded-xl border p-4 ${
                        notification.is_read 
                          ? 'bg-gray-50 border-gray-200 dark:bg-[var(--bp-surface-soft)] dark:border-[var(--bp-border)]' 
                          : 'bg-blue-50 border-blue-200 dark:bg-blue-950/25 dark:border-blue-900/45'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className={`text-sm font-medium ${
                              notification.is_read ? 'text-gray-900 dark:text-white' : 'text-blue-900 dark:text-blue-200'
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.is_read && (
                              <span className="inline-flex items-center rounded-full bg-blue-100 px-1.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-950/45 dark:text-blue-300">
                                New
                              </span>
                            )}
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              notification.type === 'enrollment' ? 'bg-primary-100 text-primary-800 dark:bg-primary-950/40 dark:text-primary-300' :
                              notification.type === 'grade' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300' :
                              'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-300'
                            }`}>
                              {notification.type}
                            </span>
                          </div>
                          <p className={`text-sm ${
                            notification.is_read ? 'text-gray-600 dark:text-[var(--bp-text-muted)]' : 'text-blue-800 dark:text-blue-300'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="mt-2 text-xs text-gray-500 dark:text-[var(--bp-text-subtle)]">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        
                        {!notification.is_read && (
                          <button
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="ml-4 text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                          >
                            Mark as read
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V9a2 2 0 012-2h0a2 2 0 012 2v8z" />
                  </svg>
                  <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">No Notifications</h3>
                  <p className="text-gray-600 dark:text-[var(--bp-text-muted)]">You'll receive notifications when students enroll in your courses.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TeacherDashboard;
