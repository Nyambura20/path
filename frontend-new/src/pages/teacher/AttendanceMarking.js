import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { useNotification } from '../../utils/NotificationContext';
import apiClient from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

function AttendanceMarking() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [sessionName, setSessionName] = useState('');
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTeacherCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTeacherCourses();
      setCourses(response);
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
      case 'present': return 'bg-green-100 text-green-800 border-green-300';
      case 'absent': return 'bg-red-100 text-red-800 border-red-300';
      case 'late': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'excused': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
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
          <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-600 mt-2">Record student attendance for class sessions and assignments</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="large" text="Loading courses..." />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Session Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Course
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Session Name
                  </label>
                  <input
                    type="text"
                    value={sessionName}
                    onChange={(e) => setSessionName(e.target.value)}
                    placeholder="e.g., Week 1 Lecture, Assignment 1 Submission"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              {/* Bulk Actions */}
              {students.length > 0 && (
                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Students ({students.length})
                    </h3>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => handleBulkAction('present')}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors text-sm"
                      >
                        Mark All Present
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBulkAction('absent')}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-md hover:bg-red-200 transition-colors text-sm"
                      >
                        Mark All Absent
                      </button>
                    </div>
                  </div>

                  {/* Student List */}
                  <div className="space-y-2">
                    {students.map(student => (
                      <div key={student.student_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{student.name}</p>
                            <p className="text-sm text-gray-600">ID: {student.student_id}</p>
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
                                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
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
                <div className="flex justify-end pt-6 border-t">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
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
