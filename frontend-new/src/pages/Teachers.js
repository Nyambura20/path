import React, { useState, useEffect } from 'react';
import apiClient from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterDepartment, setFilterDepartment] = useState('all');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getTeachers();
      setTeachers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredAndSortedTeachers = () => {
    let filtered = teachers.filter(teacher => {
      const matchesSearch = searchTerm === '' || 
        teacher.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.specialization?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesDepartment = filterDepartment === 'all' || 
        teacher.department?.toLowerCase() === filterDepartment.toLowerCase();

      return matchesSearch && matchesDepartment;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`);
        case 'email':
          return (a.email || '').localeCompare(b.email || '');
        case 'department':
          return (a.department || '').localeCompare(b.department || '');
        case 'experience':
          return (b.years_of_experience || 0) - (a.years_of_experience || 0);
        default:
          return 0;
      }
    });
  };

  const getDepartments = () => {
    const departments = [...new Set(teachers.map(t => t.department).filter(Boolean))];
    return departments.sort();
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'text-primary-600 bg-primary-100' : 'text-red-600 bg-red-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <LoadingSpinner size="large" text="Loading teachers..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Teachers</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button onClick={fetchTeachers} className="btn-primary">
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const filteredTeachers = getFilteredAndSortedTeachers();
  const departments = getDepartments();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Teachers</h1>
          <p className="text-gray-600">Manage and view all teachers in the system</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Teachers
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by name, email, ID, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              />
            </div>

            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="name">Name</option>
                <option value="email">Email</option>
                <option value="department">Department</option>
                <option value="experience">Experience</option>
              </select>
            </div>

            <div>
              <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                Department Filter
              </label>
              <select
                id="department"
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            Showing {filteredTeachers.length} of {teachers.length} teachers
          </p>
        </div>

        {/* Teachers Grid */}
        {filteredTeachers.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m3 5.197H9m6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Teachers Found</h3>
              <p className="text-gray-600">
                {teachers.length === 0 
                  ? "No teachers have been registered yet."
                  : "No teachers match your current search criteria. Try adjusting your filters."
                }
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeachers.map((teacher) => (
              <div key={teacher.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <div className="p-6">
                  {/* Teacher Avatar */}
                  <div className="flex items-center mb-4">
                    <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center mr-4">
                      <span className="text-white font-medium text-lg">
                        {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {teacher.first_name} {teacher.last_name}
                      </h3>
                      <p className="text-sm text-gray-600">{teacher.employee_id || 'No ID'}</p>
                    </div>
                  </div>

                  {/* Teacher Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm">
                      <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600">{teacher.email}</span>
                    </div>

                    {teacher.department && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-gray-600">{teacher.department}</span>
                      </div>
                    )}

                    {teacher.specialization && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span className="text-gray-600">{teacher.specialization}</span>
                      </div>
                    )}

                    {teacher.phone_number && (
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span className="text-gray-600">{teacher.phone_number}</span>
                      </div>
                    )}
                  </div>

                  {/* Status and Metrics */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(teacher.is_active)}`}>
                        {teacher.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {teacher.courses_taught_count || 0} courses
                        </div>
                      </div>
                    </div>

                    {(teacher.years_of_experience || teacher.education_level) && (
                      <div className="flex justify-between text-sm">
                        {teacher.years_of_experience && (
                          <span className="text-gray-600">
                            {teacher.years_of_experience} years exp.
                          </span>
                        )}
                        {teacher.education_level && (
                          <span className="text-primary-600 font-medium">
                            {teacher.education_level}
                          </span>
                        )}
                      </div>
                    )}

                    {teacher.rating && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Rating:</span>
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span className="text-sm font-medium">{parseFloat(teacher.rating).toFixed(1)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="bg-gray-50 px-6 py-3">
                  <div className="flex space-x-2">
                    <button className="flex-1 text-sm bg-primary-600 hover:bg-primary-700 text-white py-2 px-3 rounded-md transition-colors duration-200">
                      View Profile
                    </button>
                    <button className="flex-1 text-sm border border-gray-300 hover:bg-gray-100 text-gray-700 py-2 px-3 rounded-md transition-colors duration-200">
                      View Schedule
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Teachers;
