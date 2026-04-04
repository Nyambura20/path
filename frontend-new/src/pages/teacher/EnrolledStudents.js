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
      active: 'bg-primary-100 text-primary-800 dark:bg-primary-950/40 dark:text-primary-300',
      inactive: 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
      pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
      suspended: 'bg-gray-100 text-gray-800 dark:bg-neutral-500/20 dark:text-neutral-300'
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
      <div className="page-shell py-8">
        <div className="mx-auto max-w-7xl px-4 pl-14 sm:px-6 sm:pl-16 lg:px-8 lg:pl-20">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="text-gray-600 mt-2">This page is only available to teachers.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell py-8">
      <div className="mx-auto max-w-7xl px-4 pl-14 sm:px-6 sm:pl-16 lg:px-8 lg:pl-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[var(--bp-text)]">Enrolled Students</h1>
          <p className="mt-2 text-gray-600 dark:text-[var(--bp-text-muted)]">View and manage students enrolled in your courses</p>
        </div>

        {/* Filters and Controls */}
        <div className="mb-6 rounded-2xl border border-neutral-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)]/95 dark:shadow-black/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-[var(--bp-text-muted)]">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                disabled={coursesLoading}
                className="input-field disabled:bg-neutral-100 disabled:text-neutral-400 dark:disabled:bg-[var(--bp-surface)]"
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
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-[var(--bp-text-muted)]">
                Search Students
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, ID, or email..."
                  className="input-field pr-10"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 dark:text-slate-500" aria-hidden="true">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                  </svg>
                </span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-[var(--bp-text-muted)]">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field"
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
                className="rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 text-gray-700 transition-colors hover:bg-neutral-200 dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)] dark:text-[var(--bp-text-muted)] dark:hover:bg-[var(--bp-surface)]"
                title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
              <button
                onClick={handleRefresh}
                disabled={loading || coursesLoading}
                className="btn-secondary px-3 py-2"
                title="Refresh"
              >
                <span className="text-xs font-semibold uppercase tracking-wide">Refresh</span>
              </button>
              <button
                onClick={handleExportCSV}
                disabled={!Array.isArray(filteredStudents) || filteredStudents.length === 0}
                className="btn-primary px-4 py-2 disabled:bg-neutral-400 dark:disabled:bg-neutral-600"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Course Statistics */}
          {selectedCourse && courseStats && (
            <div className="mb-4 rounded-xl border border-blue-200/60 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 transition-colors duration-300 dark:border-blue-900/35 dark:from-blue-950/20 dark:to-indigo-950/20">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--bp-text)]">
                    {courseStats.courseCode} - {courseStats.courseName}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-[var(--bp-text-muted)]">
                    {courseStats.totalEnrolled} student{courseStats.totalEnrolled !== 1 ? 's' : ''} enrolled
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-indigo-600">
                    {courseStats.totalEnrolled}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-slate-400">Total Students</div>
                </div>
              </div>
            </div>
          )}

          {selectedCourse && (
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-600 dark:text-[var(--bp-text-muted)]">
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
          <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/95 shadow-sm transition-colors duration-300 dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)] dark:shadow-black/20">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-neutral-200 dark:divide-[var(--bp-border)]">
                <thead className="bg-neutral-50 dark:bg-[var(--bp-surface-soft)]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[var(--bp-text-muted)]">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[var(--bp-text-muted)]">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[var(--bp-text-muted)]">
                      Academic Info
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[var(--bp-text-muted)]">
                      Enrollment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[var(--bp-text-muted)]">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[var(--bp-text-muted)]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 bg-white dark:divide-[var(--bp-border)] dark:bg-[var(--bp-surface)]">
                  {Array.isArray(filteredStudents) && filteredStudents.map(student => (
                    <tr key={student.student_id} className="transition-colors duration-150 hover:bg-primary-50/50 dark:hover:bg-primary-950/15">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-[var(--bp-text)]">{student.name}</div>
                            <div className="text-sm text-gray-600 dark:text-[var(--bp-text-soft)]">ID: {student.student_id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-[var(--bp-text)]">{student.email || 'N/A'}</div>
                        <div className="text-sm text-gray-600 dark:text-[var(--bp-text-muted)]">{student.phone_number || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-[var(--bp-text)]">
                          {student.major || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-[var(--bp-text-muted)]">
                          Year {student.year_of_study || 'N/A'} • GPA: {student.gpa || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-[var(--bp-text)]">
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
                            className="text-primary-600 transition-colors hover:text-primary-900 dark:text-primary-300 dark:hover:text-primary-200"
                          >
                            View Profile
                          </button>
                          <button
                            onClick={() => handleSendMessage(student.id)}
                            className="text-primary-600 transition-colors hover:text-primary-900 dark:text-primary-300 dark:hover:text-primary-200"
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
          <div className="rounded-2xl border border-neutral-200/80 bg-white/90 p-12 text-center shadow-sm dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)] dark:shadow-black/20">
            <div className="mb-4 text-gray-400 dark:text-[var(--bp-text-subtle)]">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--bp-text)] mb-2">No Students Found</h3>
            <p className="text-gray-600 dark:text-[var(--bp-text-muted)]">No students match your search criteria. Try adjusting your search terms.</p>
          </div>
        ) : selectedCourse ? (
          <div className="rounded-2xl border border-neutral-200/80 bg-white/90 p-12 text-center shadow-sm dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)] dark:shadow-black/20">
            <div className="mb-4 text-gray-400 dark:text-[var(--bp-text-subtle)]">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--bp-text)] mb-2">No Students Enrolled</h3>
            <p className="text-gray-600 dark:text-[var(--bp-text-muted)]">No students are currently enrolled in this course.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200/80 bg-white/90 p-12 text-center shadow-sm dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)] dark:shadow-black/20">
            <div className="mb-4 text-gray-400 dark:text-[var(--bp-text-subtle)]">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-[var(--bp-text)] mb-2">Select a Course</h3>
            <p className="text-gray-600 dark:text-[var(--bp-text-muted)]">Choose a course from the dropdown above to view enrolled students.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default EnrolledStudents;
