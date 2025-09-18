import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useSidebar } from '../utils/SidebarContext';

function Sidebar() {
  const { isOpen, toggleSidebar, closeSidebar } = useSidebar();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  
  // State for collapsible sections
  const [expandedSections, setExpandedSections] = useState({
    attendance: false,
    performance: false,
    courses: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const isActive = (path) => location.pathname === path;

  const sidebarLinkClass = (path) => `
    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 mb-1
    ${isActive(path) 
      ? 'bg-primary-600 text-white' 
      : 'text-gray-300 hover:text-white hover:bg-darkbg-700'
    }
  `;

  const subLinkClass = (path) => `
    flex items-center px-8 py-2 text-sm rounded-lg transition-colors duration-200 mb-1
    ${isActive(path) 
      ? 'bg-primary-500 text-white' 
      : 'text-gray-400 hover:text-white hover:bg-darkbg-700'
    }
  `;

  const sectionButtonClass = (expanded) => `
    flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200 mb-1 text-gray-300 hover:text-white hover:bg-darkbg-700
  `;

  // Don't render sidebar if user is not authenticated
  if (!isAuthenticated) return null;

  return (
    <>
      {/* Sidebar Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="fixed top-20 left-4 z-50 p-2 bg-primary-600 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-colors duration-200 md:hidden"
        aria-label="Toggle sidebar"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Desktop Sidebar Toggle */}
      <button
        onClick={toggleSidebar}
        className="hidden md:block fixed top-20 left-4 z-50 p-2 bg-primary-600 text-white rounded-lg shadow-lg hover:bg-primary-700 transition-colors duration-200"
        aria-label="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {isOpen ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-16 left-0 h-full bg-darkbg-800 border-r border-darkbg-700 transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } w-64 shadow-xl`}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-darkbg-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <span className="text-lg font-bold text-white">BrightPath</span>
              </div>
              <button
                onClick={toggleSidebar}
                className="p-1 text-gray-400 hover:text-white transition-colors"
                aria-label="Close sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {/* Dashboard - Always available to authenticated users */}
            <Link to="/dashboard" className={sidebarLinkClass('/dashboard')} onClick={closeSidebar}>
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7zm7 4h4m-4 4h4m-8-4h.01M7 11h.01" />
              </svg>
              Dashboard
            </Link>

            {/* Teacher-specific navigation */}
            {user?.is_teacher && (
              <>
                {/* Courses Section */}
                <div>
                  <button
                    onClick={() => toggleSection('courses')}
                    className={sectionButtonClass(expandedSections.courses)}
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      Courses
                    </div>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${expandedSections.courses ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {expandedSections.courses && (
                    <div className="ml-4 space-y-1">
                      <Link to="/courses" className={subLinkClass('/courses')} onClick={closeSidebar}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h10a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        All Courses
                      </Link>
                      <Link to="/teacher/my-courses" className={subLinkClass('/teacher/my-courses')} onClick={closeSidebar}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                        </svg>
                        My Courses
                      </Link>
                      <Link to="/teacher/enrolled-students" className={subLinkClass('/teacher/enrolled-students')} onClick={closeSidebar}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Enrolled Students
                      </Link>
                    </div>
                  )}
                </div>

                {/* Attendance Section */}
                <div>
                  <button
                    onClick={() => toggleSection('attendance')}
                    className={sectionButtonClass(expandedSections.attendance)}
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                      Attendance
                    </div>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${expandedSections.attendance ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {expandedSections.attendance && (
                    <div className="ml-4 space-y-1">
                      <Link to="/teacher/attendance/mark" className={subLinkClass('/teacher/attendance/mark')} onClick={closeSidebar}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Mark Attendance
                      </Link>
                      <Link to="/teacher/attendance/reports" className={subLinkClass('/teacher/attendance/reports')} onClick={closeSidebar}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        View Reports
                      </Link>
                    </div>
                  )}
                </div>

                {/* Performance Section */}
                <div>
                  <button
                    onClick={() => toggleSection('performance')}
                    className={sectionButtonClass(expandedSections.performance)}
                  >
                    <div className="flex items-center">
                      <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                      </svg>
                      Performance
                    </div>
                    <svg className={`w-4 h-4 transition-transform duration-200 ${expandedSections.performance ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  {expandedSections.performance && (
                    <div className="ml-4 space-y-1">
                      <Link to="/teacher/performance/record" className={subLinkClass('/teacher/performance/record')} onClick={closeSidebar}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Record Grades
                      </Link>
                      <Link to="/teacher/performance/reports" className={subLinkClass('/teacher/performance/reports')} onClick={closeSidebar}>
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                        </svg>
                        View Reports
                      </Link>
                    </div>
                  )}
                </div>

                {/* Notifications */}
                <Link to="/notifications" className={sidebarLinkClass('/notifications')} onClick={closeSidebar}>
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v4" />
                  </svg>
                  Notifications
                </Link>
              </>
            )}

            {/* Student navigation */}
            {user?.is_student && (
              <>
                <Link to="/courses" className={sidebarLinkClass('/courses')} onClick={closeSidebar}>
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  Courses
                </Link>

                <Link to="/performance" className={sidebarLinkClass('/performance')} onClick={closeSidebar}>
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2 2z" />
                  </svg>
                  Performance
                </Link>

                <Link to="/attendance" className={sidebarLinkClass('/attendance')} onClick={closeSidebar}>
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                  Attendance
                </Link>

                <Link to="/notifications" className={sidebarLinkClass('/notifications')} onClick={closeSidebar}>
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19H7a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v4" />
                  </svg>
                  Notifications
                </Link>
              </>
            )}

            {/* Admin only links */}
            {user?.role === 'admin' && (
              <>
                <Link to="/students" className={sidebarLinkClass('/students')} onClick={closeSidebar}>
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                  Students
                </Link>

                <Link to="/teachers" className={sidebarLinkClass('/teachers')} onClick={closeSidebar}>
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Teachers
                </Link>
              </>
            )}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-darkbg-700">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center overflow-hidden">
                {user?.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white font-medium text-sm">
                    {user?.first_name?.charAt(0) || user?.username?.charAt(0) || 'U'}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {user?.first_name || user?.username}
                </p>
                <p className="text-xs text-gray-400 capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
