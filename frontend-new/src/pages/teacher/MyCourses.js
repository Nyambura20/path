import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { useNotification } from '../../utils/NotificationContext';
import apiClient from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import PaginatedDataTable from '../../components/ui/PaginatedDataTable';
import DashboardLayout from '../../layouts/DashboardLayout';

function MyCourses() {
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  const fetchCourses = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTeacherCourses();
      setCourses(response.courses || []);
    } catch (error) {
      addNotification(`Error fetching courses: ${error.message}`, 'error');
      setCourses([]);
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  useEffect(() => {
    if (user?.is_teacher) {
      fetchCourses();
    }
  }, [user, fetchCourses]);

  const filteredAndSortedCourses = useMemo(() => {
    if (!Array.isArray(courses)) return [];

    const filtered = courses.filter(
      (course) =>
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue = a.name;
      let bValue = b.name;

      if (sortBy === 'code') {
        aValue = a.code;
        bValue = b.code;
      }

      if (sortBy === 'students') {
        aValue = a.enrolled_students_count || 0;
        bValue = b.enrolled_students_count || 0;
      }

      if (sortBy === 'start_date') {
        aValue = new Date(a.start_date || 0).getTime();
        bValue = new Date(b.start_date || 0).getTime();
      }

      if (sortOrder === 'asc') return aValue > bValue ? 1 : -1;
      return aValue < bValue ? 1 : -1;
    });

    return filtered;
  }, [courses, searchTerm, sortBy, sortOrder]);

  const totalStudents = Array.isArray(courses)
    ? courses.reduce((total, course) => total + (course.enrolled_students_count || 0), 0)
    : 0;

  if (!user?.is_teacher) {
    return (
      <DashboardLayout title="Access Denied" subtitle="This page is only available to teachers.">
        <Card>
          <p className="text-sm text-neutral-600">You do not have permission to access this area.</p>
        </Card>
      </DashboardLayout>
    );
  }

  const columns = [
    { key: 'name', header: 'Course' },
    { key: 'code', header: 'Code' },
    {
      key: 'enrolled_students_count',
      header: 'Students',
      render: (row) => row.enrolled_students_count || 0,
    },
    {
      key: 'start_date',
      header: 'Start Date',
      render: (row) => (row.start_date ? new Date(row.start_date).toLocaleDateString() : 'Not set'),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex gap-2">
          <Button
            variant="secondary"
            className="px-3 py-1.5 text-xs"
            onClick={() => (window.location.href = `/teacher/enrolled-students?course=${row.id}`)}
          >
            Students
          </Button>
          <Button
            className="px-3 py-1.5 text-xs"
            onClick={() => (window.location.href = `/teacher/attendance/mark?course=${row.id}`)}
          >
            Attendance
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout
      title="My Courses"
      subtitle="Manage and monitor your teaching courses."
      actions={<Button variant="secondary" onClick={fetchCourses}>Refresh</Button>}
    >
      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-neutral-500">Total Courses</p>
          <p className="mt-2 text-3xl font-bold text-primary-700">{courses.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-500">Total Students</p>
          <p className="mt-2 text-3xl font-bold text-primary-700">{totalStudents}</p>
        </Card>
        <Card>
          <p className="text-sm text-neutral-500">Active Courses</p>
          <p className="mt-2 text-3xl font-bold text-primary-700">
            {Array.isArray(courses) ? courses.filter((course) => course.is_active !== false).length : 0}
          </p>
        </Card>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input
            label="Search Courses"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or code"
          />
          <Select label="Sort By" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Course Name</option>
            <option value="code">Course Code</option>
            <option value="students">Students Count</option>
            <option value="start_date">Start Date</option>
          </Select>
          <Select label="Sort Order" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="py-12 text-center">
          <LoadingSpinner size="large" text="Loading courses..." />
        </div>
      ) : (
        <PaginatedDataTable
          columns={columns}
          data={filteredAndSortedCourses}
          pageSize={9}
          emptyMessage="No courses found for the selected filters."
          ariaLabel="My courses table"
        />
      )}
    </DashboardLayout>
  );
}

export default MyCourses;
