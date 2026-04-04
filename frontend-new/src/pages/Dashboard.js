import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useRecentPages } from '../utils/useRecentPages';
import apiClient from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import TeacherDashboard from '../components/TeacherDashboard';

function Dashboard() {
  const { user } = useAuth();
  const { recentPages } = useRecentPages();
  const [dashboardData, setDashboardData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [data, enrollments] = await Promise.all([
        apiClient.getDashboardStats(),
        apiClient.getEnrollments().catch(() => []),
      ]);
      setDashboardData(data);
      const enrollmentList = enrollments.results || enrollments || [];
      setEnrolledCourses(enrollmentList);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-shell py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <LoadingSpinner size="large" text="Loading dashboard..." />
          </div>
        </div>
      </div>
    );
  }

  // Render teacher dashboard for teachers
  if (user?.is_teacher) {
    return <TeacherDashboard />;
  }

  return (
    <div className="page-shell py-8">
      <div className="mx-auto max-w-7xl px-4 pl-14 sm:px-6 sm:pl-16 lg:px-8 lg:pl-20">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.first_name || user?.username}!
          </h1>
          <p className="text-gray-600 mt-2 dark:text-[var(--bp-text-muted)]">
            Here's what's happening in your educational journey today.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 lg:grid-cols-4 mb-8">
          <div className="rounded-2xl border border-neutral-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)] dark:hover:shadow-lg dark:hover:shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-[var(--bp-text-subtle)]">Total Courses</p>
                <p className="text-3xl font-bold text-primary-700 dark:text-primary-400">{dashboardData?.stats?.enrolled_courses || 0}</p>
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
                <p className="text-sm text-neutral-500 dark:text-[var(--bp-text-subtle)]">Active Enrollments</p>
                <p className="text-3xl font-bold text-neutral-800 dark:text-[var(--bp-text)]">{dashboardData?.stats?.enrolled_courses || 0}</p>
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
                <p className="text-sm text-neutral-500 dark:text-[var(--bp-text-subtle)]">Avg Performance</p>
                <p className="text-3xl font-bold text-amber-700 dark:text-amber-400">{dashboardData?.stats?.average_grade ? `${dashboardData.stats.average_grade.toFixed(1)}%` : 'N/A'}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200/80 bg-white/95 p-6 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)] dark:hover:shadow-lg dark:hover:shadow-black/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-500 dark:text-[var(--bp-text-subtle)]">Attendance Rate</p>
                <p className="text-3xl font-bold text-violet-700 dark:text-violet-400">{dashboardData?.stats?.attendance_rate ? `${dashboardData.stats.attendance_rate}%` : 'N/A'}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* My Courses */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Courses</h2>
            <Link to="/courses" className="text-primary-600 hover:text-primary-700 text-sm font-medium dark:text-primary-400 dark:hover:text-primary-300">
              View All &rarr;
            </Link>
          </div>
          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledCourses.slice(0, 6).map((enrollment) => (
                <Link
                  key={enrollment.id}
                  to={`/courses/${enrollment.course}`}
                  className="rounded-xl border border-neutral-200/70 bg-white/95 p-5 shadow-sm transition-all hover:border-neutral-300/70 hover:shadow-md dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)] dark:hover:border-[var(--bp-border)] dark:hover:shadow-lg dark:hover:shadow-black/20"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center dark:bg-primary-950/40">
                      <svg className="w-5 h-5 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      enrollment.status === 'active' || enrollment.is_active
                        ? 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-500/20 dark:text-gray-400'
                    }`}>
                      {enrollment.status || (enrollment.is_active ? 'Active' : 'Inactive')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm mb-1 dark:text-white">{enrollment.course_name}</h3>
                  <p className="text-xs text-gray-500 dark:text-[var(--bp-text-subtle)]">
                    Enrolled: {new Date(enrollment.enrollment_date).toLocaleDateString()}
                  </p>
                  {enrollment.final_grade && (
                    <p className="text-xs text-gray-600 mt-1 dark:text-[var(--bp-text-muted)]">Grade: {enrollment.final_grade}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-neutral-200/70 bg-white/95 p-8 text-center shadow-sm dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)]">
              <svg className="h-12 w-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="mb-1 text-lg font-medium text-gray-900 dark:text-white">No courses yet</h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-[var(--bp-text-muted)]">You haven't enrolled in any courses.</p>
              <Link
                to="/courses"
                className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Browse Courses
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Overview</h2>
          <p className="text-sm text-gray-600 dark:text-[var(--bp-text-muted)]">Shortcuts and your recent navigation activity.</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card">
            <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Quick Actions</h2>
            <div className="space-y-3">
              <a href="/courses" className="flex items-center rounded-xl border border-primary-100 bg-primary-50 p-3 transition-colors hover:bg-primary-100 dark:border-primary-900/40 dark:bg-primary-950/25 dark:hover:bg-primary-900/35">
                <svg className="h-8 w-8 text-primary-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Browse Courses</p>
                  <p className="text-sm text-gray-600 dark:text-[var(--bp-text-muted)]">Explore available courses and enroll</p>
                </div>
              </a>

              <a href="/performance" className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-3 transition-colors hover:bg-slate-100 dark:border-slate-700/50 dark:bg-slate-900/30 dark:hover:bg-slate-800/45">
                <svg className="h-8 w-8 text-secondary-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">View Performance</p>
                  <p className="text-sm text-gray-600 dark:text-[var(--bp-text-muted)]">Check grades and analytics</p>
                </div>
              </a>

              <a href="/attendance" className="flex items-center rounded-xl border border-amber-200 bg-amber-50 p-3 transition-colors hover:bg-amber-100 dark:border-amber-900/45 dark:bg-amber-950/25 dark:hover:bg-amber-900/35">
                <svg className="h-8 w-8 text-yellow-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Attendance Records</p>
                  <p className="text-sm text-gray-600 dark:text-[var(--bp-text-muted)]">Track your attendance</p>
                </div>
              </a>
            </div>
          </div>

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
                      {page.icon === 'bell' && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
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
                      {!['book', 'chart', 'clipboard', 'bell', 'user', 'home'].includes(page.icon) && (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{page.title}</p>
                        <span className="text-xs font-medium text-gray-500 dark:text-[var(--bp-text-subtle)]">
                          {page.timeAgo}
                        </span>
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
                  <p className="mt-1 text-sm text-gray-500 dark:text-[var(--bp-text-muted)]">Explore courses, attendance, or performance to start your trail.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
