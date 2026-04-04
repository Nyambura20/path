import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
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
      
      const coursePromise = apiClient.getCourses(params);
      const enrollmentPromise = user?.role === 'student'
        ? apiClient.getEnrollments()
        : Promise.resolve(null);

      const [courseData, enrollmentData] = await Promise.all([coursePromise, enrollmentPromise]);
      const courseList = courseData.results || courseData || [];
      setCourses(courseList);

      if (user?.role === 'student' && enrollmentData) {
        const enrollmentList = enrollmentData.results || enrollmentData || [];
        setEnrolledCourseIds(enrollmentList.map((enrollment) => enrollment.course));
      } else {
        setEnrolledCourseIds([]);
      }
    } catch (err) {
      setError(err.message);
      addNotification('Failed to load courses', 'error');
    } finally {
      setLoading(false);
    }
  }, [filters, addNotification, user?.role]);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const visibleCourses = useMemo(() => {
    if (user?.role !== 'student' || enrolledCourseIds.length === 0) {
      return courses;
    }
    const enrolledSet = new Set(enrolledCourseIds);
    return courses.filter((course) => !enrolledSet.has(course.id));
  }, [courses, enrolledCourseIds, user?.role]);

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
        return 'bg-primary-100 text-primary-800 dark:bg-primary-950/40 dark:text-primary-300';
      case 'intermediate':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300';
      case 'advanced':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-300';
      default:
        return 'bg-neutral-100 text-neutral-700 dark:bg-neutral-500/20 dark:text-neutral-300';
    }
  };

  if (loading) {
    return (
      <div className="page-shell py-8">
        <div className="mx-auto max-w-7xl px-4 pl-14 sm:px-6 sm:pl-16 lg:px-8 lg:pl-20">
          <div className="text-center py-12">
            <LoadingSpinner size="large" text="Loading courses..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell py-8">
        <div className="mx-auto max-w-7xl px-4 pl-14 sm:px-6 sm:pl-16 lg:px-8 lg:pl-20">
          <div className="text-center py-12">
            <div className="mx-auto max-w-md rounded-2xl border border-rose-200/70 bg-rose-50/80 p-6 shadow-sm backdrop-blur dark:border-rose-900/40 dark:bg-rose-950/25 dark:shadow-black/20">
              <svg className="mx-auto mb-4 h-12 w-12 text-rose-600 dark:text-rose-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="mb-2 text-lg font-semibold text-rose-900 dark:text-rose-100">Error Loading Courses</h3>
              <p className="mb-4 text-rose-700 dark:text-rose-200">{error}</p>
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
    <div className="page-shell py-8">
      <div className="mx-auto max-w-7xl px-4 pl-14 sm:px-6 sm:pl-16 lg:px-8 lg:pl-20">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-[var(--bp-text)]">Courses</h1>
          <p className="text-gray-600 dark:text-[var(--bp-text-muted)]">
            Explore and manage your educational journey with our comprehensive course catalog.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 rounded-2xl border border-neutral-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)]/95 dark:shadow-black/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="mb-2 block text-sm font-medium text-gray-700 dark:text-[var(--bp-text-muted)]">
                Search Courses
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="search"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search by title or description..."
                  className="input-field pr-10"
                />
                <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400 dark:text-[var(--bp-text-subtle)]" aria-hidden="true">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35m1.85-5.15a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />
                  </svg>
                </span>
              </div>
            </div>
            
            <div>
              <label htmlFor="difficulty" className="mb-2 block text-sm font-medium text-gray-700 dark:text-[var(--bp-text-muted)]">
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
            
            {!user?.is_teacher && (
              <div>
                <label htmlFor="instructor" className="mb-2 block text-sm font-medium text-gray-700 dark:text-[var(--bp-text-muted)]">
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
            )}
          </div>
        </div>

        {/* Course Grid */}
        {visibleCourses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-neutral-200/80 bg-white/70 py-12 text-center shadow-sm dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)]/85 dark:shadow-black/10">
            <svg className="mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-[var(--bp-text-subtle)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-[var(--bp-text)]">No courses found</h3>
            <p className="mb-4 text-gray-600 dark:text-[var(--bp-text-muted)]">
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
            {visibleCourses.map((course) => (
              <div key={course.id} className="rounded-2xl border border-neutral-200/80 bg-white/95 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)] dark:hover:shadow-lg dark:hover:shadow-black/20">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-[var(--bp-text)]">
                      {course.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-[var(--bp-text-muted)]">
                      Course Code: {course.course_code}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(course.difficulty_level)}`}>
                    {course.difficulty_level || 'Not specified'}
                  </span>
                </div>

                <p className="mb-4 line-clamp-3 text-gray-600 dark:text-[var(--bp-text-muted)]">
                  {course.description}
                </p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-[var(--bp-text-subtle)]">Credits:</span>
                    <span className="font-medium text-gray-900 dark:text-[var(--bp-text)]">{course.credits || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-[var(--bp-text-subtle)]">Duration:</span>
                    <span className="font-medium text-gray-900 dark:text-[var(--bp-text)]">{course.duration_weeks ? `${course.duration_weeks} weeks` : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-[var(--bp-text-subtle)]">Instructor:</span>
                    <span className="font-medium text-gray-900 dark:text-[var(--bp-text)]">{course.instructor_name || 'TBA'}</span>
                  </div>
                  {course.max_capacity && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-[var(--bp-text-subtle)]">Capacity:</span>
                      <span className="font-medium text-gray-900 dark:text-[var(--bp-text)]">
                        {course.enrolled_count || 0}/{course.max_capacity}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 border-t border-neutral-200/80 pt-4 dark:border-[var(--bp-border)]">
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
