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
      setCourses(response.courses || response || []);
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
      present: 'bg-primary-100 text-primary-800 dark:bg-primary-950/40 dark:text-primary-300',
      absent: 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300',
      late: 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
      excused: 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300'
    };
    
    return (
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[status] || 'bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-300'}`}>
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
      <div className="page-shell py-8">
        <div className="mx-auto max-w-7xl px-4 pl-14 sm:px-6 sm:pl-16 lg:px-8 lg:pl-20">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[var(--bp-text)]">Access Denied</h2>
            <p className="mt-2 text-gray-600 dark:text-[var(--bp-text-muted)]">This page is only available to teachers.</p>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-[var(--bp-text)]">Attendance Reports</h1>
          <p className="mt-2 text-gray-600 dark:text-[var(--bp-text-muted)]">View and download attendance reports for your courses</p>
        </div>

        {/* Filters */}
        <div className="mb-6 rounded-2xl border border-neutral-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)]/95 dark:shadow-black/20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-[var(--bp-text-muted)]">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="input-field"
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
                Start Date
              </label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="input-field"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-[var(--bp-text-muted)]">
                End Date
              </label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="input-field"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={handleExportCSV}
                disabled={!attendanceData.length}
                className="btn-primary w-full disabled:bg-neutral-400 dark:disabled:bg-neutral-600"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* View Mode Toggle */}
          {selectedCourse && (
            <div className="inline-flex rounded-2xl border border-neutral-200/80 bg-white/70 p-1.5 shadow-sm dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)]">
              <button
                onClick={() => setViewMode('sessions')}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  viewMode === 'sessions'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-[var(--bp-text-subtle)] dark:hover:bg-primary-950/25 dark:hover:text-primary-300'
                }`}
              >
                Sessions View
              </button>
              <button
                onClick={() => setViewMode('students')}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  viewMode === 'students'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 hover:bg-primary-50 hover:text-primary-700 dark:text-[var(--bp-text-subtle)] dark:hover:bg-primary-950/25 dark:hover:text-primary-300'
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
          <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/95 shadow-sm transition-colors duration-300 dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)] dark:shadow-black/20">
            {viewMode === 'sessions' ? (
              /* Sessions View */
              <div className="space-y-6 p-6">
                {attendanceData.map(session => (
                  <div key={session.id} className="rounded-xl border border-neutral-200/80 p-4 transition-colors duration-200 dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface-soft)]/70">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-[var(--bp-text)]">{session.session_name}</h3>
                        <p className="text-gray-600 dark:text-[var(--bp-text-muted)]">{session.date}</p>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-[var(--bp-text-muted)]">
                        {session.attendance?.length || 0} students
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {session.attendance?.map(record => (
                        <div key={record.student_id} className="flex items-center justify-between rounded-lg border border-neutral-200/70 bg-neutral-50 p-2 transition-colors duration-200 dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)]">
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-[var(--bp-text)]">{record.student_name}</p>
                            <p className="text-xs text-gray-600 dark:text-[var(--bp-text-subtle)]">ID: {record.student_id}</p>
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
                <table className="min-w-full divide-y divide-neutral-200 dark:divide-[var(--bp-border)]">
                  <thead className="bg-neutral-50 dark:bg-[var(--bp-surface-soft)]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[var(--bp-text-muted)]">
                        Student
                      </th>
                      {attendanceData.map(session => (
                        <th key={session.id} className="px-3 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[var(--bp-text-muted)]">
                          <div>{session.session_name}</div>
                          <div className="text-gray-400 dark:text-[var(--bp-text-subtle)]">{session.date}</div>
                        </th>
                      ))}
                      <th className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-[var(--bp-text-muted)]">
                        Attendance Rate
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 bg-white dark:divide-[var(--bp-border)] dark:bg-[var(--bp-surface)]">
                    {students.map(student => (
                      <tr key={student.student_id} className="transition-colors duration-150 hover:bg-primary-50/50 dark:hover:bg-primary-950/15">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-[var(--bp-text)]">{student.name}</div>
                            <div className="text-sm text-gray-600 dark:text-[var(--bp-text-subtle)]">ID: {student.student_id}</div>
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
                          <span className="text-sm font-medium text-gray-900 dark:text-[var(--bp-text)]">
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
          <div className="rounded-2xl border border-neutral-200/80 bg-white/90 p-12 text-center shadow-sm transition-colors duration-300 dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)] dark:shadow-black/20">
            <div className="mb-4 text-gray-400 dark:text-[var(--bp-text-subtle)]">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-[var(--bp-text)]">No Attendance Data</h3>
            <p className="text-gray-600 dark:text-[var(--bp-text-muted)]">No attendance records found for the selected course and date range.</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-neutral-200/80 bg-white/90 p-12 text-center shadow-sm transition-colors duration-300 dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)] dark:shadow-black/20">
            <div className="mb-4 text-gray-400 dark:text-[var(--bp-text-subtle)]">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-[var(--bp-text)]">Select a Course</h3>
            <p className="text-gray-600 dark:text-[var(--bp-text-muted)]">Choose a course from the dropdown above to view attendance reports.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceReports;
