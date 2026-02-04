import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import apiClient from '../services/api';
import LoadingSpinner from './LoadingSpinner';

function AttendanceMarking() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [sessionName, setSessionName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (user?.is_teacher) {
      fetchTeacherCourses();
    }
  }, [user]);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseStudents();
      setSessionName(`${selectedCourse.name} - ${new Date(date).toLocaleDateString()}`);
    }
  }, [selectedCourse, date]);

  const fetchTeacherCourses = async () => {
    try {
      const response = await apiClient.getTeacherCourses();
      setCourses(response?.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const fetchCourseStudents = async () => {
    if (!selectedCourse) return;
    
    try {
      const response = await apiClient.get(`/users/teachers/courses/${selectedCourse.id}/students/`);
      const studentsData = response.data.students || [];
      setStudents(studentsData);
      
      // Initialize attendance data for all students as present
      const initialAttendance = {};
      studentsData.forEach(student => {
        initialAttendance[student.id] = {
          student_id: student.id,
          status: 'present',
          notes: ''
        };
      });
      setAttendanceData(initialAttendance);
    } catch (error) {
      console.error('Error fetching students:', error);
      setError('Failed to load students for this course');
    }
  };

  const handleStatusChange = (studentId, status) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status
      }
    }));
  };

  const handleNotesChange = (studentId, notes) => {
    setAttendanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        notes
      }
    }));
  };

  const handleBulkAction = (status) => {
    const updated = {};
    Object.keys(attendanceData).forEach(studentId => {
      updated[studentId] = {
        ...attendanceData[studentId],
        status
      };
    });
    setAttendanceData(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse) {
      setError('Please select a course');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const attendanceList = Object.values(attendanceData);
      
      const response = await apiClient.markClassAttendance({
        course_id: selectedCourse.id,
        date: date,
        session_name: sessionName,
        attendance: attendanceList
      });

      setSuccess(`Attendance marked successfully! ${response.total_processed} students processed.`);
      
      // Reset form
      setAttendanceData({});
      setSelectedCourse(null);
      setStudents([]);
      setSessionName('');
      
    } catch (error) {
      console.error('Error marking attendance:', error);
      setError(error.message || 'Failed to mark attendance');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'present':
        return 'bg-primary-100 text-primary-800 border-primary-200';
      case 'absent':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'excused':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusCounts = () => {
    const counts = { present: 0, absent: 0, late: 0, excused: 0 };
    Object.values(attendanceData).forEach(item => {
      counts[item.status] = (counts[item.status] || 0) + 1;
    });
    return counts;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <LoadingSpinner size="large" text="Loading courses..." />
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
            <p className="text-gray-600 mt-2">This page is only available to teachers.</p>
          </div>
        </div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-600 mt-2">
            Take attendance for your class sessions
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-primary-50 border border-primary-200 rounded-md p-4">
            <div className="flex">
              <svg className="h-5 w-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-primary-700">{success}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Session Details */}
          <div className="card">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Session Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Course *
                </label>
                <select
                  id="course"
                  value={selectedCourse?.id || ''}
                  onChange={(e) => {
                    const course = courses.find(c => c.id === parseInt(e.target.value));
                    setSelectedCourse(course);
                  }}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Choose a course...</option>
                  {courses.map(course => (
                    <option key={course.id} value={course.id}>
                      {course.name} ({course.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="sessionName" className="block text-sm font-medium text-gray-700 mb-2">
                  Session Name
                </label>
                <input
                  type="text"
                  id="sessionName"
                  value={sessionName}
                  onChange={(e) => setSessionName(e.target.value)}
                  placeholder="e.g., Morning Lecture, Lab Session"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Student List */}
          {selectedCourse && students.length > 0 && (
            <div className="card">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Student Attendance</h2>
                  <p className="text-sm text-gray-600 mt-1">
                    {students.length} students enrolled in {selectedCourse.name}
                  </p>
                </div>

                {/* Bulk Actions */}
                <div className="flex space-x-2 mt-4 sm:mt-0">
                  <button
                    type="button"
                    onClick={() => handleBulkAction('present')}
                    className="bg-primary-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    Mark All Present
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkAction('absent')}
                    className="bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    Mark All Absent
                  </button>
                </div>
              </div>

              {/* Status Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-primary-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-primary-800">Present</p>
                  <p className="text-2xl font-bold text-primary-900">{statusCounts.present}</p>
                </div>
                <div className="bg-red-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-red-800">Absent</p>
                  <p className="text-2xl font-bold text-red-900">{statusCounts.absent}</p>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800">Late</p>
                  <p className="text-2xl font-bold text-yellow-900">{statusCounts.late}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-800">Excused</p>
                  <p className="text-2xl font-bold text-blue-900">{statusCounts.excused}</p>
                </div>
              </div>

              {/* Student List */}
              <div className="space-y-4">
                {students.map(student => (
                  <div key={student.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {student.user.first_name?.[0]}{student.user.last_name?.[0]}
                          </span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {student.user.first_name} {student.user.last_name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {student.student_id} • {student.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {/* Status Buttons */}
                      <div className="flex space-x-1">
                        {['present', 'absent', 'late', 'excused'].map(status => (
                          <button
                            key={status}
                            type="button"
                            onClick={() => handleStatusChange(student.id, status)}
                            className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                              attendanceData[student.id]?.status === status
                                ? getStatusColor(status)
                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </button>
                        ))}
                      </div>

                      {/* Notes Input */}
                      <input
                        type="text"
                        placeholder="Notes (optional)"
                        value={attendanceData[student.id]?.notes || ''}
                        onChange={(e) => handleNotesChange(student.id, e.target.value)}
                        className="w-32 text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          {selectedCourse && students.length > 0 && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="bg-primary-600 text-white px-6 py-3 rounded-md font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving Attendance...' : 'Save Attendance'}
              </button>
            </div>
          )}
        </form>

        {courses.length === 0 && (
          <div className="text-center py-12">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Assigned</h3>
            <p className="text-gray-600">Contact administration to get courses assigned to your account.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceMarking;
