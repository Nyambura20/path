import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import apiClient from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PerformanceAIChat from '../components/PerformanceAIChat';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/ui/Card';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import PaginatedDataTable from '../components/ui/PaginatedDataTable';

function Performance() {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [courses, setCourses] = useState([]);

  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let data = null;
      if (user?.role === 'student') data = await apiClient.getStudentPerformance();
      else if (user?.role === 'teacher') data = await apiClient.getTeacherPerformanceData();
      else data = await apiClient.getAllPerformanceData();

      setPerformanceData(data);
    } catch (err) {
      setError(err.message || 'Failed to load performance data.');
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
    fetchPerformanceData();
    if (user?.role === 'student') fetchStudentCourses();
  }, [fetchPerformanceData, fetchStudentCourses, user]);

  const filteredData = useMemo(() => {
    const grades = performanceData?.recent_grades || [];
    if (selectedCourse === 'all') return grades;
    return grades.filter((item) => String(item.course) === String(selectedCourse));
  }, [performanceData, selectedCourse]);

  const columns = [
    { key: 'course', header: 'Course', render: (row) => row.course || 'Unknown' },
    { key: 'assessment', header: 'Assessment', render: (row) => row.assessment || 'Assessment' },
    {
      key: 'percentage',
      header: 'Grade',
      render: (row) => {
        const grade = row.percentage || 0;
        const color = grade >= 80 ? 'bg-primary-100 text-primary-800' : grade >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800';
        return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${color}`}>{grade.toFixed(1)}%</span>;
      },
    },
    { key: 'graded_at', header: 'Date', render: (row) => (row.graded_at ? new Date(row.graded_at).toLocaleDateString() : 'N/A') },
    { key: 'status', header: 'Status', render: (row) => row.status || 'Completed' },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Performance" subtitle="Loading performance data.">
        <div className="py-12 text-center">
          <LoadingSpinner size="large" text="Loading performance data..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Performance" subtitle="An error occurred while loading data.">
        <Card className="max-w-xl">
          <p className="text-sm text-red-700">{error}</p>
          <div className="mt-4">
            <Button onClick={fetchPerformanceData}>Try Again</Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout
        title={user?.role === 'student' ? 'My Performance' : 'Performance Analytics'}
        subtitle="Analyze grades and assessment records with consistent filtering and pagination."
        actions={<Button variant="secondary" onClick={fetchPerformanceData}>Refresh</Button>}
      >
        {user?.role === 'student' && courses.length > 0 && (
          <Card className="mb-6" aria-label="Performance filters">
            <Select label="Filter by Course" value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.title || course.name}
                </option>
              ))}
            </Select>
          </Card>
        )}

        {user?.role === 'student' && performanceData && (
          <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3" aria-live="polite">
            <Card>
              <p className="text-sm text-neutral-500">Average Grade</p>
              <p className="mt-2 text-3xl font-bold text-primary-700">{performanceData.average_grade ? `${performanceData.average_grade.toFixed(1)}%` : 'N/A'}</p>
            </Card>
            <Card>
              <p className="text-sm text-neutral-500">Completed Assessments</p>
              <p className="mt-2 text-3xl font-bold text-primary-700">{performanceData.completed_assessments || 0}</p>
            </Card>
            <Card>
              <p className="text-sm text-neutral-500">Total Courses</p>
              <p className="mt-2 text-3xl font-bold text-primary-700">{performanceData.total_courses || 0}</p>
            </Card>
          </div>
        )}

        <PaginatedDataTable
          columns={columns}
          data={filteredData}
          pageSize={10}
          emptyMessage="No performance records found for the selected filters."
          ariaLabel="Performance records table"
        />
      </DashboardLayout>

      {user?.role === 'student' && <PerformanceAIChat />}
    </>
  );
}

export default Performance;
