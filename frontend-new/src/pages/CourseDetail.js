import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import apiClient from '../services/api';
import { useAuth } from '../utils/AuthContext';
import { useNotification } from '../utils/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';

function CourseDetail() {
  const { id } = useParams();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const { addNotification } = useNotification();

  const fetchCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiClient.getCourse(id);
      setCourse(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  const handleEnroll = async () => {
    try {
      await apiClient.enrollInCourse(id);
      addNotification('Successfully enrolled in course!', 'success');
      fetchCourse(); // Refresh course data
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  const handleDropCourse = async () => {
    if (!window.confirm('Are you sure you want to drop this course?')) return;
    
    try {
      await apiClient.dropCourse(id);
      addNotification('Successfully dropped course', 'success');
      fetchCourse(); // Refresh course data
    } catch (err) {
      addNotification(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <LoadingSpinner size="large" text="Loading course details..." />
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Course Not Found</h3>
              <p className="text-red-700 mb-4">{error || 'The requested course could not be found.'}</p>
              <a href="/courses" className="btn-primary">
                Back to Courses
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Course Header */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
          <div className="bg-gradient-primary p-8 text-white">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{course.title}</h1>
                <p className="text-primary-100 text-lg">Course Code: {course.course_code}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(course.difficulty_level)} bg-white`}>
                {course.difficulty_level || 'Not specified'}
              </span>
            </div>
          </div>
          
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{course.credits || 'N/A'}</div>
                <div className="text-gray-600">Credits</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">{course.duration_weeks ? `${course.duration_weeks} weeks` : 'N/A'}</div>
                <div className="text-gray-600">Duration</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {course.enrolled_count || 0}/{course.max_capacity || '∞'}
                </div>
                <div className="text-gray-600">Enrolled</div>
              </div>
            </div>

            {user?.role === 'student' && (
              <div className="flex justify-center">
                {course.is_enrolled ? (
                  <button
                    onClick={handleDropCourse}
                    className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg transition-colors duration-200"
                  >
                    Drop Course
                  </button>
                ) : (
                  <button
                    onClick={handleEnroll}
                    className="btn-primary py-3 px-8"
                    disabled={course.max_capacity && course.enrolled_count >= course.max_capacity}
                  >
                    {course.max_capacity && course.enrolled_count >= course.max_capacity ? 'Course Full' : 'Enroll Now'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="card mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Course Description</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                {course.description}
              </p>

              {course.learning_objectives && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Learning Objectives</h3>
                  <ul className="space-y-2">
                    {course.learning_objectives.split('\n').map((objective, index) => (
                      <li key={index} className="flex items-start">
                        <div className="flex-shrink-0 w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center mr-3 mt-0.5">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-600">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {course.prerequisites && course.prerequisites.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Prerequisites</h3>
                  <div className="space-y-2">
                    {course.prerequisites.map((prereq, index) => (
                      <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-yellow-800 font-medium">{prereq.title}</p>
                        <p className="text-yellow-700 text-sm">{prereq.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Course Schedule */}
            {course.schedules && course.schedules.length > 0 && (
              <div className="card">
                <h2 className="text-2xl font-semibold text-gray-900 mb-4">Schedule</h2>
                <div className="space-y-3">
                  {course.schedules.map((schedule, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{schedule.day_of_week}</p>
                        <p className="text-sm text-gray-600">{schedule.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">
                          {schedule.start_time} - {schedule.end_time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Instructor Info */}
            <div className="card mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Instructor</h3>
              <div className="flex items-center">
                <div className="h-12 w-12 bg-primary-600 rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-medium">
                    {course.instructor_name?.split(' ').map(n => n[0]).join('') || 'TBA'}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{course.instructor_name || 'To Be Announced'}</p>
                  <p className="text-sm text-gray-600">{course.instructor_email || ''}</p>
                </div>
              </div>
            </div>

            {/* Course Info */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start Date:</span>
                  <span className="font-medium">{course.start_date || 'TBA'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">End Date:</span>
                  <span className="font-medium">{course.end_date || 'TBA'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Language:</span>
                  <span className="font-medium">{course.language || 'English'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Format:</span>
                  <span className="font-medium">{course.format || 'In-person'}</span>
                </div>
                {course.is_active !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${course.is_active ? 'text-green-600' : 'text-red-600'}`}>
                      {course.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CourseDetail;
