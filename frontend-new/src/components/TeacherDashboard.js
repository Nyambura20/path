import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import apiClient from '../services/api';
import LoadingSpinner from './LoadingSpinner';

function TeacherDashboard() {
  const { user } = useAuth();
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
      <div className="min-h-screen bg-gray-50 py-8">
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
      <div className="min-h-screen bg-gray-50 py-8">
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Teacher Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, {user?.first_name || user?.username}! Manage your courses, track attendance, and monitor student performance.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-primary-100 text-sm">Total Courses</p>
                <p className="text-3xl font-bold">{totalCourses}</p>
              </div>
              <svg className="h-12 w-12 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-r from-secondary-500 to-secondary-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-secondary-100 text-sm">Total Students</p>
                <p className="text-3xl font-bold">{totalStudents}</p>
              </div>
              <svg className="h-12 w-12 text-secondary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm">Pending Grades</p>
                <p className="text-3xl font-bold">{dashboardData?.performance?.summary?.pending_grades || 0}</p>
              </div>
              <svg className="h-12 w-12 text-yellow-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 10v-1a4 4 0 118 0v1m-9 0h10" />
              </svg>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm">New Notifications</p>
                <p className="text-3xl font-bold">{unreadNotifications.length}</p>
              </div>
              <svg className="h-12 w-12 text-red-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5-5-5h5V9a2 2 0 012-2h0a2 2 0 012 2v8z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'courses'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Courses
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Notifications
              {unreadNotifications.length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
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
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <a href="/teacher/attendance/mark" className="flex items-center p-3 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
                  <svg className="h-8 w-8 text-primary-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Mark Attendance</p>
                    <p className="text-sm text-gray-600">Take attendance for today's classes</p>
                  </div>
                </a>

                <a href="/teacher/performance/record" className="flex items-center p-3 bg-secondary-50 rounded-lg hover:bg-secondary-100 transition-colors">
                  <svg className="h-8 w-8 text-secondary-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 10v-1a4 4 0 118 0v1m-9 0h10" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">Record Grades</p>
                    <p className="text-sm text-gray-600">Input student grades and feedback</p>
                  </div>
                </a>

                <a href="/teacher/attendance/records" className="flex items-center p-3 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                  <svg className="h-8 w-8 text-yellow-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-900">View Reports</p>
                    <p className="text-sm text-gray-600">Download attendance & performance reports</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {Array.isArray(courses) && courses.slice(0, 3).map((course) => (
                  <div key={course.id} className="flex items-start">
                    <div className="flex-shrink-0 w-2 h-2 bg-primary-600 rounded-full mt-2 mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{course.name}</p>
                      <p className="text-sm text-gray-600">{course.enrolled_students_count || 0} enrolled students</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Avg. Performance: {course.performance_data?.average || 'N/A'}%
                      </p>
                    </div>
                  </div>
                ))}
                {(!Array.isArray(courses) || courses.length === 0) && (
                  <div className="text-center py-8">
                    <svg className="h-8 w-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-600">No courses assigned yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(courses) && courses.map((course) => (
              <div key={course.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
                    <p className="text-sm text-gray-600">{course.code}</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Students:</span>
                    <span className="font-medium">{course.enrolled_students_count || 0}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg. Attendance:</span>
                    <span className="font-medium">{course.attendance_data?.rate || 'N/A'}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg. Performance:</span>
                    <span className="font-medium">{course.performance_data?.average || 'N/A'}%</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <a
                    href={`/teacher/course/${course.id}/students`}
                    className="flex-1 bg-primary-600 text-white text-center py-2 px-3 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    View Students
                  </a>
                  <a
                    href={`/teacher/course/${course.id}/manage`}
                    className="flex-1 bg-gray-600 text-white text-center py-2 px-3 rounded-md text-sm font-medium hover:bg-gray-700 transition-colors"
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Assigned</h3>
                <p className="text-gray-600">Contact administration to get courses assigned to your account.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="max-w-4xl">
            <div className="card">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Notifications</h2>
              
              {notifications.length > 0 ? (
                <div className="space-y-4">
                  {notifications.map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 rounded-lg border ${
                        notification.is_read 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'bg-blue-50 border-blue-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
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
                              notification.type === 'enrollment' ? 'bg-green-100 text-green-800' :
                              notification.type === 'grade' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {notification.type}
                            </span>
                          </div>
                          <p className={`text-sm ${
                            notification.is_read ? 'text-gray-600' : 'text-blue-800'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 mt-2">
                            {new Date(notification.created_at).toLocaleString()}
                          </p>
                        </div>
                        
                        {!notification.is_read && (
                          <button
                            onClick={() => markNotificationAsRead(notification.id)}
                            className="ml-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
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
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
                  <p className="text-gray-600">You'll receive notifications when students enroll in your courses.</p>
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
