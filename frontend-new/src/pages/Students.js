import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import PaginatedDataTable from '../components/ui/PaginatedDataTable';

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getStudents();
      const normalized = data?.results || data || [];
      setStudents(Array.isArray(normalized) ? normalized : []);
    } catch (err) {
      setError(err.message || 'Failed to load students.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const filtered = students.filter((student) => {
      const fullName = `${student.first_name || ''} ${student.last_name || ''}`.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        fullName.includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.student_id?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        filterStatus === 'all' ||
        (filterStatus === 'active' && student.is_active) ||
        (filterStatus === 'inactive' && !student.is_active);

      return matchesSearch && matchesStatus;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'name') return `${a.first_name || ''} ${a.last_name || ''}`.localeCompare(`${b.first_name || ''} ${b.last_name || ''}`);
      if (sortBy === 'email') return (a.email || '').localeCompare(b.email || '');
      if (sortBy === 'student_id') return (a.student_id || '').localeCompare(b.student_id || '');
      if (sortBy === 'enrollment_date') return new Date(a.date_joined || 0) - new Date(b.date_joined || 0);
      return 0;
    });
  }, [students, searchTerm, sortBy, filterStatus]);

  const columns = [
    { key: 'name', header: 'Student', render: (row) => `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Unnamed' },
    { key: 'student_id', header: 'Student ID', render: (row) => row.student_id || 'N/A' },
    { key: 'email', header: 'Email', render: (row) => row.email || 'N/A' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${row.is_active ? 'bg-primary-100 text-primary-800' : 'bg-red-100 text-red-800'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    { key: 'gpa', header: 'GPA', render: (row) => (row.gpa ? Number(row.gpa).toFixed(2) : 'N/A') },
    { key: 'courses', header: 'Courses', render: (row) => row.enrolled_courses_count || 0 },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Students" subtitle="Loading student records.">
        <div className="py-12 text-center">
          <LoadingSpinner size="large" text="Loading students..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Students" subtitle="An error occurred while loading data.">
        <Card className="max-w-xl">
          <p className="text-sm text-red-700">{error}</p>
          <div className="mt-4">
            <Button onClick={fetchStudents}>Try Again</Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Students" subtitle="Manage and browse student records with accessible filters and pagination." actions={<Button variant="secondary" onClick={fetchStudents}>Refresh</Button>}>
      <Card className="mb-6" aria-label="Student filters">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input label="Search Students" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name, email, or student ID" />
          <Select label="Sort By" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="student_id">Student ID</option>
            <option value="enrollment_date">Enrollment Date</option>
          </Select>
          <Select label="Status Filter" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All Students</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </Select>
        </div>
      </Card>

      <PaginatedDataTable columns={columns} data={filteredStudents} pageSize={12} emptyMessage="No students found for the selected filters." ariaLabel="Students records table" />
    </DashboardLayout>
  );
}

export default Students;
