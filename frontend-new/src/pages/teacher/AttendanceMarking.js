import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { useNotification } from '../../utils/NotificationContext';
import { useLocation } from 'react-router-dom';
import apiClient from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

function AttendanceMarking() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const location = useLocation();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [sessionName, setSessionName] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      setLoading(true);
      const response = await apiClient.getTeacherCourses();
      setCourses(response.courses || response || []);
    } catch (error) {
      addNotification('Error fetching courses: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const fetchCourseStudents = useCallback(async () => {
    try {
      const course = courses.find(c => c.id === parseInt(selectedCourse));
      if (course && course.enrolled_students) {
        setStudents(course.enrolled_students);
        // Initialize attendance data
        const initialData = {};
        course.enrolled_students.forEach(student => {
          initialData[student.student_id] = 'present';
        });
        setAttendanceData(initialData);
      }
    } catch (error) {
      addNotification('Error fetching students: ' + error.message, 'error');
    }
  }, [courses, selectedCourse, addNotification]);

  useEffect(() => {
    if (user?.is_teacher) {
      fetchTeacherCourses();
    }
  }, [user, fetchTeacherCourses]);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseStudents();
    }
  }, [selectedCourse, fetchCourseStudents]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleBulkAction = (status) => {
    const newData = {};
    students.forEach(student => {
      newData[student.student_id] = status;
    });
    setAttendanceData(newData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !sessionName) {
      addNotification('Please select a course and enter session name', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const attendanceArray = students.map(student => ({
        student_id: student.id, // Use the actual student profile ID
        status: attendanceData[student.student_id] || 'present',
        notes: ''
      }));

      await apiClient.markClassAttendance({
        course_id: selectedCourse,
        date: sessionDate,
        session_name: sessionName,
        attendance: attendanceArray
      });

      addNotification('Attendance marked successfully!', 'success');
      
      // Reset form
      setSessionName('');
      setAttendanceData({});
      const initialData = {};
      students.forEach(student => {
        initialData[student.student_id] = 'present';
      });
      setAttendanceData(initialData);
    } catch (error) {
      addNotification('Error marking attendance: ' + error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'bg-primary-100 text-primary-800 border-primary-300 dark:bg-primary-950/40 dark:text-primary-300 dark:border-primary-800/60';
      case 'absent': return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/60';
      case 'late': return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60';
      case 'excused': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/60';
      default: return 'bg-neutral-100 text-neutral-700 border-neutral-300 dark:bg-neutral-500/20 dark:text-neutral-300 dark:border-[var(--bp-border)]';
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[var(--bp-text)]">Mark Attendance</h1>
          <p className="mt-2 text-gray-600 dark:text-[var(--bp-text-muted)]">Record student attendance for class sessions and assignments</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="large" text="Loading courses..." />
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)]/95 dark:shadow-black/20">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Session Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-[var(--bp-text-muted)]">
                    Select Course
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">Choose a course...</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.code} - {course.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-[var(--bp-text-muted)]">
                    Session Name
                  </label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="e.g., Week 1 Lecture, Assignment 1 Submission"
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-[var(--bp-text-muted)]">
                    Date
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              {/* Bulk Actions */}
              {students.length > 0 && (
                <div className="border-t border-neutral-200/80 pt-6 dark:border-[var(--bp-border)]">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--bp-text)]">
                      Students ({students.length})
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleBulkAction('present')}
                        className="rounded-lg border border-primary-200 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700 transition-colors hover:bg-primary-100 dark:border-primary-900/45 dark:bg-primary-950/30 dark:text-primary-300 dark:hover:bg-primary-900/40"
                      >
                        Mark All Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkAction('absent')}
                        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 dark:border-red-900/45 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-900/40"
                      >
                        Mark All Absent
                      </button>
                    </div>
                  </div>

                  {/* Student List */}
                  <div className="space-y-2">
                    {students.map(student => (
                      <div key={student.student_id} className="flex items-center justify-between rounded-xl border border-neutral-200/70 bg-neutral-50 p-3 transition-colors duration-200 dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)]/70">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-[var(--bp-text)]">{student.name}</p>
                            <p className="text-sm text-gray-600 dark:text-[var(--bp-text-subtle)]">ID: {student.student_id}</p>
                          </div>
                        </div>

                        <div className="flex space-x-2">
                          {['present', 'absent', 'late', 'excused'].map(status => (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleAttendanceChange(student.student_id, status)}
                              className={`px-3 py-1 rounded-md text-sm font-medium border transition-colors ${
                                attendanceData[student.student_id] === status
                                  ? getStatusColor(status)
                                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 dark:bg-[var(--bp-surface)] dark:text-[var(--bp-text-muted)] dark:border-[var(--bp-border)] dark:hover:bg-[var(--bp-surface-soft)]'
                              }`}
                            >
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              {students.length > 0 && (
                <div className="flex justify-end pt-6 border-t border-neutral-200/80 dark:border-[var(--bp-border)]">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary px-6 py-3 disabled:bg-neutral-400 dark:disabled:bg-neutral-600"
                  >
                    {submitting ? 'Marking Attendance...' : 'Mark Attendance'}
                  </button>
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceMarking;
