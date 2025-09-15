import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/api';
import { useNotification } from '../utils/NotificationContext';
import { useAuth } from '../utils/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';

function Courses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    difficulty: '',
    instructor: '',
    search: '',
  });
  const { addNotification } = useNotification();
  const { user } = useAuth();

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {};
      if (filters.difficulty) params.difficulty = filters.difficulty;
      if (filters.instructor) params.instructor = filters.instructor;
      if (filters.search) params.search = filters.search;
      
      const data = await apiClient.getCourses(params);
      setCourses(data.results || data || []);
    } catch (err) {
      setError(err.message);
      addNotification('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, addNotification]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleEnroll = async (courseId) => {
    try {
      await apiClient.enrollInCourse(courseId);
      addNotification('Successfully enrolled in course!', 'success');
      fetchCourses(); // Refresh the list
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  const handleDropCourse = async (courseId) => {
    if (!window.confirm('Are you sure you want to drop this course?')) return;
    
    try {
      await apiClient.dropCourse(courseId);
      addNotification('Successfully dropped course', 'success');
      fetchCourses(); // Refresh the list
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <svg className="h-12 w-12 text-red-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Courses</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={fetchCourses}
                className="btn-primary"
              >
                Try Again
              </button>
            </div>
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Courses</h1>
          <p className="text-gray-600">
            Explore and manage your educational journey with our comprehensive course catalog.
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search Courses
              </label>
              <input
                type="text"
                id="search"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder="Search by title or description..."
                className="input-field"
              />
            </div>
            
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                id="difficulty"
                value={filters.difficulty}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                className="input-field"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="instructor" className="block text-sm font-medium text-gray-700 mb-2">
                Instructor
              </label>
              <input
                type="text"
                id="instructor"
                value={filters.instructor}
                onChange={(e) => setFilters({ ...filters, instructor: e.target.value })}
                placeholder="Filter by instructor ID..."
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* Course Grid */}
        {courses.length === 0 ? (
          <div className="text-center py-12">
            <svg className="h-12 w-12 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or check back later for new courses.
            </p>
            <button
              onClick={() => setFilters({ difficulty: '', instructor: '', search: '' })}
              className="btn-outline"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course.id} className="card hover:shadow-lg transition-shadow duration-300">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Course Code: {course.course_code}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty_level)}`}>
                    {course.difficulty_level || 'Not specified'}
                  </span>
                </div>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {course.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Credits:</span>
                    <span className="font-medium">{course.credits || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{course.duration_weeks ? `${course.duration_weeks} weeks` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Instructor:</span>
                    <span className="font-medium">{course.instructor_name || 'TBA'}</span>
                  </div>
                  {course.max_capacity && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Capacity:</span>
                      <span className="font-medium">
                        {course.enrolled_count || 0}/{course.max_capacity}
                      </span>
                    </div>
                  )}
                </div>

                <div className="border-t pt-4 flex space-x-2">
                  <Link
                    to={`/courses/${course.id}`}
                    className="btn-outline flex-1 text-center"
                  >
                    View Details
                  </Link>
                  
                  {user?.role === 'student' && (
                    <>
                      {course.is_enrolled ? (
                        <button
                          onClick={() => handleDropCourse(course.id)}
                          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex-1"
                        >
                          Drop Course
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEnroll(course.id)}
                          className="btn-primary flex-1"
                          disabled={course.max_capacity && course.enrolled_count >= course.max_capacity}
                        >
                          {course.max_capacity && course.enrolled_count >= course.max_capacity ? 'Full' : 'Enroll'}
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Courses;
