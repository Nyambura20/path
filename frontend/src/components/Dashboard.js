import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState({
    students: [],
    courses: [],
    performance: [],
    attendance: [],
    stats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch data based on user role
        const promises = [];
        
        switch (user?.role) {
          case 'admin':
            promises.push(
              apiService.getUsers(),
              apiService.getStudents(),
              apiService.getCourses(),
              apiService.getPerformance(),
              apiService.getAttendance()
            );
            break;
          case 'teacher':
            promises.push(
              apiService.getStudents(),
              apiService.getCourses(),
              apiService.getPerformance(),
              apiService.getAttendance()
            );
            break;
          case 'student':
            promises.push(
              apiService.getCourses(),
              apiService.getPerformance(),
              apiService.getAttendance()
            );
            break;
          default:
            promises.push(apiService.getCourses());
        }

        const results = await Promise.allSettled(promises);
        
        // Process results
        const data = {
          students: [],
          courses: [],
          performance: [],
          attendance: [],
          stats: {}
        };

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            switch (user?.role) {
              case 'admin':
                if (index === 0) data.users = result.value.results || result.value;
                if (index === 1) data.students = result.value.results || result.value;
                if (index === 2) data.courses = result.value.results || result.value;
                if (index === 3) data.performance = result.value.results || result.value;
                if (index === 4) data.attendance = result.value.results || result.value;
                break;
              case 'teacher':
                if (index === 0) data.students = result.value.results || result.value;
                if (index === 1) data.courses = result.value.results || result.value;
                if (index === 2) data.performance = result.value.results || result.value;
                if (index === 3) data.attendance = result.value.results || result.value;
                break;
              case 'student':
                if (index === 0) data.courses = result.value.results || result.value;
                if (index === 1) data.performance = result.value.results || result.value;
                if (index === 2) data.attendance = result.value.results || result.value;
                break;
              default:
                if (index === 0) data.courses = result.value.results || result.value;
                break;
            }
          }
        });

        // Calculate stats
        data.stats = {
          totalStudents: data.students?.length || 0,
          totalCourses: data.courses?.length || 0,
          totalUsers: data.users?.length || 0,
          averagePerformance: data.performance?.length ? 
            (data.performance.reduce((sum, p) => sum + (p.grade || 0), 0) / data.performance.length).toFixed(2) : 0,
          attendanceRate: data.attendance?.length ? 
            ((data.attendance.filter(a => a.status === 'present').length / data.attendance.length) * 100).toFixed(1) : 0
        };

        setDashboardData(data);
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const renderAdminDashboard = () => (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Users</p>
              <p className="text-2xl font-bold text-secondary-900">{dashboardData.stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-accent-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Students</p>
              <p className="text-2xl font-bold text-secondary-900">{dashboardData.stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Total Courses</p>
              <p className="text-2xl font-bold text-secondary-900">{dashboardData.stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-secondary-900">{dashboardData.stats.attendanceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Recent Students</h3>
          <div className="space-y-3">
            {dashboardData.students.slice(0, 5).map((student) => (
              <div key={student.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-primary-700 font-medium text-sm">
                      {student.first_name?.[0]}{student.last_name?.[0]}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-secondary-900">
                      {student.first_name} {student.last_name}
                    </p>
                    <p className="text-xs text-secondary-500">{student.email}</p>
                  </div>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Recent Courses</h3>
          <div className="space-y-3">
            {dashboardData.courses.slice(0, 5).map((course) => (
              <div key={course.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-secondary-900">{course.name}</p>
                  <p className="text-xs text-secondary-500">{course.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-secondary-900">{course.credits} credits</p>
                  <p className="text-xs text-secondary-500">{course.semester}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderTeacherDashboard = () => (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-accent-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">My Students</p>
              <p className="text-2xl font-bold text-secondary-900">{dashboardData.stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">My Courses</p>
              <p className="text-2xl font-bold text-secondary-900">{dashboardData.stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Avg. Performance</p>
              <p className="text-2xl font-bold text-secondary-900">{dashboardData.stats.averagePerformance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Recent Performance</h3>
          <div className="space-y-3">
            {dashboardData.performance.slice(0, 5).map((performance) => (
              <div key={performance.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-secondary-900">Student ID: {performance.student}</p>
                  <p className="text-xs text-secondary-500">Course ID: {performance.course}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-secondary-900">Grade: {performance.grade}</p>
                  <p className="text-xs text-secondary-500">{performance.assessment_type}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Today's Attendance</h3>
          <div className="space-y-3">
            {dashboardData.attendance.slice(0, 5).map((attendance) => (
              <div key={attendance.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-secondary-900">Student ID: {attendance.student}</p>
                  <p className="text-xs text-secondary-500">Course ID: {attendance.course}</p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  attendance.status === 'present' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {attendance.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderStudentDashboard = () => (
    <>
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Enrolled Courses</p>
              <p className="text-2xl font-bold text-secondary-900">{dashboardData.stats.totalCourses}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Average Grade</p>
              <p className="text-2xl font-bold text-secondary-900">{dashboardData.stats.averagePerformance}</p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-accent-100 rounded-lg flex items-center justify-center">
                <svg className="h-6 w-6 text-accent-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-secondary-600">Attendance Rate</p>
              <p className="text-2xl font-bold text-secondary-900">{dashboardData.stats.attendanceRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">My Courses</h3>
          <div className="space-y-3">
            {dashboardData.courses.slice(0, 5).map((course) => (
              <div key={course.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-secondary-900">{course.name}</p>
                  <p className="text-xs text-secondary-500">{course.code}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-secondary-900">{course.credits} credits</p>
                  <p className="text-xs text-secondary-500">{course.semester}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">Recent Grades</h3>
          <div className="space-y-3">
            {dashboardData.performance.slice(0, 5).map((performance) => (
              <div key={performance.id} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-secondary-900">{performance.assessment_type}</p>
                  <p className="text-xs text-secondary-500">Course ID: {performance.course}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-secondary-900">{performance.grade}</p>
                  <p className="text-xs text-secondary-500">{new Date(performance.date).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );

  const renderDashboardContent = () => {
    switch (user?.role) {
      case 'admin':
        return renderAdminDashboard();
      case 'teacher':
        return renderTeacherDashboard();
      case 'student':
        return renderStudentDashboard();
      default:
        return (
          <div className="text-center py-12">
            <p className="text-secondary-500">Welcome to BrightPath!</p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">
              {getGreeting()}, {user?.first_name}!
            </h1>
            <p className="text-primary-100 mt-1">
              Welcome back to your {user?.role} dashboard
            </p>
          </div>
          <div className="text-right">
            <p className="text-primary-100 text-sm">Today's date</p>
            <p className="text-lg font-semibold">{new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      {renderDashboardContent()}
    </div>
  );
};

export default Dashboard;
