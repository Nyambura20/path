import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import apiClient from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import PaginatedDataTable from '../components/ui/PaginatedDataTable';

function Attendance() {
  const { user } = useAuth();
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [courses, setCourses] = useState([]);

  const fetchAttendanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let data = [];
      if (user?.role === 'student') {
        const response = await apiClient.getStudentAttendance();
        data = response.results || [];
      } else if (user?.role === 'teacher') {
        const response = await apiClient.getTeacherAttendanceDashboard();
        data = response.results || [];
      } else {
        const response = await apiClient.getAllAttendanceData();
        data = response.results || [];
      }

      setAttendanceData(data);
    } catch (err) {
      setError(err.message || 'Failed to load attendance data.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  const fetchStudentCourses = useCallback(async () => {
    try {
      const data = await apiClient.getStudentCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch {
      setCourses([]);
    }
  }, []);

  useEffect(() => {
    fetchAttendanceData();
    if (user?.role === 'student') fetchStudentCourses();
  }, [fetchAttendanceData, fetchStudentCourses, user]);

  const filteredData = useMemo(() => {
    let filtered = [...attendanceData];

    if (selectedCourse !== 'all') {
      filtered = filtered.filter((item) => String(item.course) === String(selectedCourse));
    }

    if (selectedMonth !== 'all') {
      filtered = filtered.filter((item) => {
        const month = new Date(item.date).getMonth();
        return String(month) === selectedMonth;
      });
    }

    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [attendanceData, selectedCourse, selectedMonth]);

  const attendanceRate = useMemo(() => {
    if (!filteredData.length) return 0;
    const present = filteredData.filter((item) => item.status === 'present').length;
    return ((present / filteredData.length) * 100).toFixed(1);
  }, [filteredData]);

  const columns = [
    {
      key: 'date',
      header: 'Date',
      render: (row) => (row.date ? new Date(row.date).toLocaleDateString() : 'N/A'),
    },
    {
      key: 'course',
      header: 'Course',
      render: (row) => row.course_name || row.course || 'N/A',
    },
    {
      key: 'session',
      header: 'Session',
      render: (row) => row.session_name || row.session || 'N/A',
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className="rounded-full bg-primary-100 px-2 py-1 text-xs font-semibold uppercase tracking-wide text-primary-800">
          {row.status || 'Unknown'}
        </span>
      ),
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (row) => row.notes || '-',
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Attendance" subtitle="Loading attendance data.">
        <div className="py-12 text-center">
          <LoadingSpinner size="large" text="Loading attendance data..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Attendance" subtitle="An error occurred while loading data.">
        <Card className="max-w-xl">
          <p className="text-sm text-red-700">{error}</p>
          <div className="mt-4">
            <Button onClick={fetchAttendanceData}>Try Again</Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <DashboardLayout
      title={user?.role === 'student' ? 'My Attendance' : 'Attendance Management'}
      subtitle="Track attendance records and trends with clear filtering and pagination."
      actions={<Button variant="secondary" onClick={fetchAttendanceData}>Refresh</Button>}
    >
      <Card className="mb-6" aria-label="Attendance filters">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {user?.role === 'student' && courses.length > 0 && (
            <Select label="Course" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title || course.name}
                </option>
              ))}
            </Select>
          )}
          <Select label="Month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
            <option value="all">All Months</option>
            {months.map((month, index) => (
              <option key={month} value={index}>
                {month}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4" aria-live="polite">
        <Card>
          <p className="text-sm text-neutral-500">Attendance Rate</p>
          <p className="mt-2 text-3xl font-bold text-primary-700">{attendanceRate}%</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-500">Present</p>
          <p className="mt-2 text-3xl font-bold text-primary-700">{filteredData.filter((d) => d.status === 'present').length}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-500">Absent</p>
          <p className="mt-2 text-3xl font-bold text-red-700">{filteredData.filter((d) => d.status === 'absent').length}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-500">Late</p>
          <p className="mt-2 text-3xl font-bold text-amber-700">{filteredData.filter((d) => d.status === 'late').length}</p>
        </Card>
      </div>

      <PaginatedDataTable
        columns={columns}
        data={filteredData}
        pageSize={12}
        emptyMessage="No attendance records found for the selected filters."
        ariaLabel="Attendance records table"
      />
    </DashboardLayout>
  );
}

export default Attendance;
