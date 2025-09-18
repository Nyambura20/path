import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { useNotification } from '../../utils/NotificationContext';
import apiClient from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

function MyCourses() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(() => {
    if (user?.is_teacher) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTeacherCourses();
      setCourses(response.courses || []);
    } catch (error) {
      addNotification('Error fetching courses: ' + error.message, 'error');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedCourses = React.useMemo(() => {
    if (!Array.isArray(courses)) return [];

    let filtered = courses.filter(course =>
      course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'code':
          aValue = a.code.toLowerCase();
          bValue = b.code.toLowerCase();
          break;
        case 'students':
          aValue = a.enrolled_students_count || 0;
          bValue = b.enrolled_students_count || 0;
          break;
        case 'start_date':
          aValue = new Date(a.start_date || 0);
          bValue = new Date(b.start_date || 0);
          break;
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [courses, searchTerm, sortBy, sortOrder]);

  const handleRefresh = () => {
    fetchCourses();
  };

  if (!user?.is_teacher) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="text-gray-600 mt-2">This page is only available to teachers.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
              <p className="text-gray-600 mt-2">Manage and view your courses</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <span>🔄</span>
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <span className="text-2xl">📚</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Courses</h3>
                <p className="text-3xl font-bold text-blue-600">{courses.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <span className="text-2xl">👨‍🎓</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Total Students</h3>
                <p className="text-3xl font-bold text-green-600">
                  {Array.isArray(courses) ? courses.reduce((total, course) => total + (course.enrolled_students_count || 0), 0) : 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Active Courses</h3>
                <p className="text-3xl font-bold text-purple-600">
                  {Array.isArray(courses) ? courses.filter(course => course.is_active !== false).length : 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Courses
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or code..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="name">Course Name</option>
                <option value="code">Course Code</option>
                <option value="students">Students Count</option>
                <option value="start_date">Start Date</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
        </div>

        {/* Courses List */}
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="large" text="Loading courses..." />
          </div>
        ) : filteredAndSortedCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAndSortedCourses.map(course => (
              <div key={course.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{course.name}</h3>
                      <p className="text-blue-600 font-medium">{course.code}</p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {course.description || 'No description available'}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <span>👨‍🎓 {course.enrolled_students_count || 0} students</span>
                    <span>📅 {course.start_date ? new Date(course.start_date).toLocaleDateString() : 'No date'}</span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => window.location.href = `/teacher/enrolled-students?course=${course.id}`}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                    >
                      View Students
                    </button>
                    <button
                      onClick={() => window.location.href = `/teacher/attendance/mark?course=${course.id}`}
                      className="flex-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                    >
                      Mark Attendance
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500">
              {searchTerm ? 'Try adjusting your search terms.' : 'You haven\'t been assigned any courses yet.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyCourses;
