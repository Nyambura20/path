import React, { useEffect, useMemo, useState } from 'react';
import apiClient from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Button from '../components/ui/Button';
import PaginatedDataTable from '../components/ui/PaginatedDataTable';

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterDepartment, setFilterDepartment] = useState('all');

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getTeachers();
      const normalized = data?.results || data || [];
      setTeachers(Array.isArray(normalized) ? normalized : []);
    } catch (err) {
      setError(err.message || 'Failed to load teachers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const departments = useMemo(() => {
    const unique = [...new Set(teachers.map((t) => t.department).filter(Boolean))];
    return unique.sort();
  }, [teachers]);

  const filteredTeachers = useMemo(() => {
    const filtered = teachers.filter((teacher) => {
      const fullName = `${teacher.first_name || ''} ${teacher.last_name || ''}`.toLowerCase();
      const matchesSearch =
        !searchTerm ||
        fullName.includes(searchTerm.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.specialization?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = filterDepartment === 'all' || teacher.department === filterDepartment;
      return matchesSearch && matchesDepartment;
    });

    return filtered.sort((a, b) => {
      if (sortBy === 'name') return `${a.first_name || ''} ${a.last_name || ''}`.localeCompare(`${b.first_name || ''} ${b.last_name || ''}`);
      if (sortBy === 'email') return (a.email || '').localeCompare(b.email || '');
      if (sortBy === 'department') return (a.department || '').localeCompare(b.department || '');
      if (sortBy === 'experience') return (b.years_of_experience || 0) - (a.years_of_experience || 0);
      return 0;
    });
  }, [teachers, searchTerm, sortBy, filterDepartment]);

  const columns = [
    { key: 'name', header: 'Teacher', render: (row) => `${row.first_name || ''} ${row.last_name || ''}`.trim() || 'Unnamed' },
    { key: 'employee_id', header: 'Employee ID', render: (row) => row.employee_id || 'N/A' },
    { key: 'email', header: 'Email', render: (row) => row.email || 'N/A' },
    { key: 'department', header: 'Department', render: (row) => row.department || 'N/A' },
    { key: 'specialization', header: 'Specialization', render: (row) => row.specialization || 'N/A' },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span className={`rounded-full px-2 py-1 text-xs font-semibold ${row.is_active ? 'bg-primary-100 text-primary-800' : 'bg-red-100 text-red-800'}`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Teachers" subtitle="Loading teacher records.">
        <div className="py-12 text-center">
          <LoadingSpinner size="large" text="Loading teachers..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="Teachers" subtitle="An error occurred while loading data.">
        <Card className="max-w-xl">
          <p className="text-sm text-red-700">{error}</p>
          <div className="mt-4">
            <Button onClick={fetchTeachers}>Try Again</Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Teachers" subtitle="Manage and browse teacher records with accessible filters and pagination." actions={<Button variant="secondary" onClick={fetchTeachers}>Refresh</Button>}>
      <Card className="mb-6" aria-label="Teacher filters">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Input label="Search Teachers" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search by name, email, ID, or specialization" />
          <Select label="Sort By" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="department">Department</option>
            <option value="experience">Experience</option>
          </Select>
          <Select label="Department Filter" value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)}>
            <option value="all">All Departments</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <PaginatedDataTable columns={columns} data={filteredTeachers} pageSize={12} emptyMessage="No teachers found for the selected filters." ariaLabel="Teachers records table" />
    </DashboardLayout>
  );
}

export default Teachers;
