import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { useNotification } from '../../utils/NotificationContext';
import apiClient from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

function AttendanceReports() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [attendanceData, setAttendanceData] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('sessions'); // 'sessions' or 'students'
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

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

  const fetchAttendanceData = useCallback(async () => {
    if (!selectedCourse) return;
    
    try {
      setLoading(true);
      const response = await apiClient.getCourseAttendance(selectedCourse, dateRange);
      setAttendanceData(response.sessions || []);
      setStudents(response.students || []);
    } catch (error) {
      addNotification('Error fetching attendance data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, dateRange, addNotification]);

  useEffect(() => {
    if (user?.is_teacher) {
      fetchTeacherCourses();
    }
  }, [user, fetchTeacherCourses]);

  useEffect(() => {
    if (selectedCourse) {
      fetchAttendanceData();
    }
  }, [selectedCourse, dateRange, fetchAttendanceData]);

  const handleExportCSV = () => {
    if (!attendanceData.length) {
      addNotification('No data to export', 'warning');
      return;
    }

    let csvContent = '';
    
    if (viewMode === 'sessions') {
      // Sessions view - each row is a session with student statuses
      csvContent = 'Session Name,Date,Student Name,Student ID,Status\n';
      attendanceData.forEach(session => {
        session.attendance.forEach(record => {
          csvContent += `"${session.session_name}","${session.date}","${record.student_name}","${record.student_id}","${record.status}"\n`;
        });
      });
    } else {
      // Students view - each row is a student with session attendance
      csvContent = 'Student Name,Student ID,';
      // Add session headers
      const sessionHeaders = attendanceData.map(session => `"${session.session_name} (${session.date})"`).join(',');
      csvContent += sessionHeaders + ',Total Present,Total Absent,Attendance Rate\n';
      
      students.forEach(student => {
        csvContent += `"${student.name}","${student.student_id}",`;
        let presentCount = 0;
        let totalSessions = 0;
        
        attendanceData.forEach(session => {
          const record = session.attendance.find(r => r.student_id === student.student_id);
          const status = record ? record.status : 'absent';
          csvContent += `"${status}",`;
          
          if (status === 'present') presentCount++;
          totalSessions++;
        });
        
        const attendanceRate = totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(1) : '0';
        csvContent += `${presentCount},${totalSessions - presentCount},${attendanceRate}%\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `attendance_report_${selectedCourse}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status) => {
    const styles = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
      excused: 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status?.charAt(0).toUpperCase() + status?.slice(1)}
      </span>
    );
  };

  const calculateAttendanceRate = (studentId) => {
    const totalSessions = attendanceData.length;
    if (totalSessions === 0) return '0%';
    
    const presentSessions = attendanceData.filter(session => 
      session.attendance.some(record => 
        record.student_id === studentId && record.status === 'present'
      )
    ).length;
    
    return `${((presentSessions / totalSessions) * 100).toFixed(1)}%`;
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
          <h1 className="text-3xl font-bold text-gray-900">Attendance Reports</h1>
          <p className="text-gray-600 mt-2">View and download attendance reports for your courses</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleExportCSV}
                disabled={!attendanceData.length}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* View Mode Toggle */}
          {selectedCourse && (
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('sessions')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'sessions'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Sessions View
              </button>
              <button
                onClick={() => setViewMode('students')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'students'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Students View
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="large" text="Loading attendance data..." />
          </div>
        ) : selectedCourse && attendanceData.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {viewMode === 'sessions' ? (
              /* Sessions View */
              <div className="space-y-6 p-6">
                {attendanceData.map(session => (
                  <div key={session.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{session.session_name}</h3>
                        <p className="text-gray-600">{session.date}</p>
                      </div>
                      <div className="text-sm text-gray-600">
                        {session.attendance?.length || 0} students
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {session.attendance?.map(record => (
                        <div key={record.student_id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium text-sm">{record.student_name}</p>
                            <p className="text-xs text-gray-600">ID: {record.student_id}</p>
                          </div>
                          {getStatusBadge(record.status)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Students View */
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      {attendanceData.map(session => (
                        <th key={session.id} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div>{session.session_name}</div>
                          <div className="text-gray-400">{session.date}</div>
                        </th>
                      ))}
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attendance Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map(student => (
                      <tr key={student.student_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-600">ID: {student.student_id}</div>
                          </div>
                        </td>
                        {attendanceData.map(session => {
                          const record = session.attendance?.find(r => r.student_id === student.student_id);
                          return (
                            <td key={session.id} className="px-3 py-4 whitespace-nowrap text-center">
                              {record ? getStatusBadge(record.status) : getStatusBadge('absent')}
                            </td>
                          );
                        })}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-sm font-medium text-gray-900">
                            {calculateAttendanceRate(student.student_id)}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : selectedCourse ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Attendance Data</h3>
            <p className="text-gray-600">No attendance records found for the selected course and date range.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Course</h3>
            <p className="text-gray-600">Choose a course from the dropdown above to view attendance reports.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceReports;
