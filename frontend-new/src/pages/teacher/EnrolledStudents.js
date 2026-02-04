import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { useNotification } from '../../utils/NotificationContext';
import { useLocation } from 'react-router-dom';
import apiClient from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

function EnrolledStudents() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [courseStats, setCourseStats] = useState(null);

  // Read course from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const courseParam = params.get('course');
    if (courseParam) {
      setSelectedCourse(courseParam);
    }
  }, [location.search]);

  const fetchTeacherCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);
      const response = await apiClient.getTeacherCourses();
      setCourses(response.courses || []);
    } catch (error) {
      addNotification('Error fetching courses: ' + error.message, 'error');
      setCourses([]);
    } finally {
      setCoursesLoading(false);
    }
  }, [addNotification]);

  const fetchEnrolledStudents = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getEnrolledStudents(selectedCourse);
      setStudents(response.students || []);
      setCourseStats({
        courseName: response.course?.name || '',
        courseCode: response.course?.code || '',
        totalEnrolled: response.total_enrolled || 0
      });
    } catch (error) {
      addNotification('Error fetching enrolled students: ' + error.message, 'error');
      setStudents([]);
      setCourseStats(null);
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, addNotification]);

  const filterAndSortStudents = useCallback(() => {
    if (!Array.isArray(students)) {
      setFilteredStudents([]);
      return;
    }

    let filtered = students.filter(student =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'student_id':
          aValue = a.student_id.toLowerCase();
          bValue = b.student_id.toLowerCase();
          break;
        case 'email':
          aValue = a.email?.toLowerCase() || '';
          bValue = b.email?.toLowerCase() || '';
          break;
        case 'enrollment_date':
          aValue = new Date(a.enrollment_date || 0);
          bValue = new Date(b.enrollment_date || 0);
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

    setFilteredStudents(filtered);
  }, [students, searchTerm, sortBy, sortOrder]);

  useEffect(() => {
    if (user?.is_teacher) {
      fetchTeacherCourses();
    }
  }, [user, fetchTeacherCourses]);

  useEffect(() => {
    if (selectedCourse) {
      fetchEnrolledStudents();
    }
  }, [selectedCourse, fetchEnrolledStudents]);

  useEffect(() => {
    filterAndSortStudents();
  }, [students, searchTerm, sortBy, sortOrder, filterAndSortStudents]);

  const handleRefresh = () => {
    if (selectedCourse) {
      fetchEnrolledStudents();
    } else {
      fetchTeacherCourses();
    }
  };

  const handleExportCSV = () => {
    if (!Array.isArray(filteredStudents) || filteredStudents.length === 0) {
      addNotification('No students to export', 'warning');
      return;
    }

    const csvHeaders = ['Name', 'Student ID', 'Email', 'Phone Number', 'Year of Study', 'Major', 'GPA', 'Enrollment Date', 'Status'];
    
    const csvContent = csvHeaders.join(',') + '\n' +
      filteredStudents.map(student => [
        `"${student.name || ''}"`,
        `"${student.student_id || ''}"`,
        `"${student.email || ''}"`,
        `"${student.phone_number || ''}"`,
        `"${student.year_of_study || ''}"`,
        `"${student.major || ''}"`,
        `"${student.gpa || ''}"`,
        `"${student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : ''}"`,
        `"${student.status || 'Active'}"`
      ].join(',')
      ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    
    const courseName = courseStats?.courseCode || selectedCourse;
    const fileName = `enrolled_students_${courseName}_${new Date().toISOString().split('T')[0]}.csv`;
    link.setAttribute('download', fileName);
    
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    addNotification(`Exported ${filteredStudents.length} students to CSV`, 'success');
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-primary-100 text-primary-800',
      inactive: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-gray-100 text-gray-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status?.toLowerCase()] || styles.active}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1) || 'Active'}
      </span>
    );
  };

  const handleSendMessage = async (studentId) => {
    // This would open a messaging modal or redirect to messaging interface
    addNotification('Messaging feature coming soon!', 'info');
  };

  const handleViewProfile = (studentId) => {
    // This would redirect to student profile page
    addNotification('Student profile view coming soon!', 'info');
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
          <h1 className="text-3xl font-bold text-gray-900">Enrolled Students</h1>
          <p className="text-gray-600 mt-2">View and manage students enrolled in your courses</p>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                disabled={coursesLoading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {coursesLoading ? 'Loading courses...' : 'Choose a course...'}
                </option>
                {Array.isArray(courses) && courses.map(course => (
                  <option key={course.id} value={course.id}>
                    {course.code} - {course.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Students
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, ID, or email..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="name">Name</option>
                <option value="student_id">Student ID</option>
                <option value="email">Email</option>
                <option value="enrollment_date">Enrollment Date</option>
              </select>
            </div>

            <div className="flex items-end space-x-2">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading || coursesLoading}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                title="Refresh"
              >
                <span>🔄</span>
              </button>
              <button
                onClick={handleExportCSV}
                disabled={!Array.isArray(filteredStudents) || filteredStudents.length === 0}
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Course Statistics */}
          {selectedCourse && courseStats && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {courseStats.courseCode} - {courseStats.courseName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {courseStats.totalEnrolled} student{courseStats.totalEnrolled !== 1 ? 's' : ''} enrolled
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">
                    {courseStats.totalEnrolled}
                  </div>
                  <div className="text-xs text-gray-500">Total Students</div>
                </div>
              </div>
            </div>
          )}

          {selectedCourse && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600">
                Showing {Array.isArray(filteredStudents) ? filteredStudents.length : 0} of {Array.isArray(students) ? students.length : 0} students
              </p>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="large" text="Loading students..." />
          </div>
        ) : selectedCourse && Array.isArray(filteredStudents) && filteredStudents.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Academic Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Enrollment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Array.isArray(filteredStudents) && filteredStudents.map(student => (
                    <tr key={student.student_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-600">ID: {student.student_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{student.email || 'N/A'}</div>
                        <div className="text-sm text-gray-600">{student.phone_number || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {student.major || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600">
                          Year {student.year_of_study || 'N/A'} • GPA: {student.gpa || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {student.enrollment_date ? new Date(student.enrollment_date).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(student.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleViewProfile(student.id)}
                            className="text-primary-600 hover:text-primary-900 transition-colors"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => handleSendMessage(student.id)}
                            className="text-primary-600 hover:text-primary-900 transition-colors"
                          >
                            Message
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : selectedCourse && Array.isArray(filteredStudents) && filteredStudents.length === 0 && Array.isArray(students) && students.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600">No students match your search criteria. Try adjusting your search terms.</p>
          </div>
        ) : selectedCourse ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Enrolled</h3>
            <p className="text-gray-600">No students are currently enrolled in this course.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Course</h3>
            <p className="text-gray-600">Choose a course from the dropdown above to view enrolled students.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnrolledStudents;
