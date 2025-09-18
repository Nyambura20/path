import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { useNotification } from '../../utils/NotificationContext';
import apiClient from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

function PerformanceRecording() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [students, setStudents] = useState([]);
  const [performanceData, setPerformanceData] = useState({});
  const [assessmentDetails, setAssessmentDetails] = useState({
    name: '',
    assessment_type: 'assignment',
    total_marks: 100,
    due_date: new Date().toISOString().split('T')[0],
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTeacherCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTeacherCourses();
      setCourses(response);
    } catch (error) {
      addNotification('Error fetching courses: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const fetchCourseStudents = useCallback(async () => {
    try {
      const course = courses.find(c => c.id === parseInt(selectedCourse));
      if (course && course.enrolled_students) {
        setStudents(course.enrolled_students);
        // Initialize performance data
        const initialData = {};
        course.enrolled_students.forEach(student => {
          initialData[student.student_id] = {
            marks_obtained: 0,
            comments: ''
          };
        });
        setPerformanceData(initialData);
      }
    } catch (error) {
      addNotification('Error fetching students: ' + error.message, 'error');
    }
  }, [courses, selectedCourse, addNotification]);

  useEffect(() => {
    if (user?.is_teacher) {
      fetchTeacherCourses();
    }
  }, [user, fetchTeacherCourses]);

  useEffect(() => {
    if (selectedCourse) {
      fetchCourseStudents();
    }
  }, [selectedCourse, fetchCourseStudents]);

  const handlePerformanceChange = (studentId, field, value) => {
    setPerformanceData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const handleAssessmentDetailChange = (field, value) => {
    setAssessmentDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const calculateGrade = (marks, totalMarks) => {
    const percentage = (marks / totalMarks) * 100;
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 30) return 'D';
    return 'F';
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'text-green-600 bg-green-100',
      'A': 'text-green-600 bg-green-100',
      'B+': 'text-blue-600 bg-blue-100',
      'B': 'text-blue-600 bg-blue-100',
      'C+': 'text-yellow-600 bg-yellow-100',
      'C': 'text-yellow-600 bg-yellow-100',
      'D': 'text-orange-600 bg-orange-100',
      'F': 'text-red-600 bg-red-100'
    };
    return colors[grade] || 'text-gray-600 bg-gray-100';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCourse || !assessmentDetails.name) {
      addNotification('Please select a course and enter assessment name', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const performanceArray = students.map(student => ({
        student_id: student.id, // Use the actual student profile ID
        marks_obtained: performanceData[student.student_id]?.marks_obtained || 0,
        comments: performanceData[student.student_id]?.comments || '',
        grade: calculateGrade(
          performanceData[student.student_id]?.marks_obtained || 0,
          assessmentDetails.total_marks
        )
      }));

      await apiClient.recordPerformance({
        course_id: selectedCourse,
        assessment_name: assessmentDetails.name,
        assessment_type: assessmentDetails.assessment_type,
        total_marks: assessmentDetails.total_marks,
        due_date: assessmentDetails.due_date,
        description: assessmentDetails.description,
        performance: performanceArray
      });

      addNotification('Performance recorded successfully!', 'success');
      
      // Reset form
      setAssessmentDetails({
        name: '',
        assessment_type: 'assignment',
        total_marks: 100,
        due_date: new Date().toISOString().split('T')[0],
        description: ''
      });
      const initialData = {};
      students.forEach(student => {
        initialData[student.student_id] = {
          marks_obtained: 0,
          comments: ''
        };
      });
      setPerformanceData(initialData);
    } catch (error) {
      addNotification('Error recording performance: ' + error.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBulkMarks = (marks) => {
    const newData = {};
    students.forEach(student => {
      newData[student.student_id] = {
        ...performanceData[student.student_id],
        marks_obtained: marks
      };
    });
    setPerformanceData(newData);
  };

  if (!user?.is_teacher) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="text-gray-600 mt-2">This page is only available to teachers.</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Record Performance</h1>
          <p className="text-gray-600 mt-2">Record student marks and grades for assignments, tests, and exams</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="large" text="Loading courses..." />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Assessment Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Assessment Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Course
                  </label>
                  <select
                    value={selectedCourse}
                    onChange={(e) => setSelectedCourse(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assessment Name
                  </label>
                  <input
                    type="text"
                    value={assessmentDetails.name}
                    onChange={(e) => handleAssessmentDetailChange('name', e.target.value)}
                    placeholder="e.g., Assignment 1, Midterm Exam"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assessment Type
                  </label>
                  <select
                    value={assessmentDetails.assessment_type}
                    onChange={(e) => handleAssessmentDetailChange('assessment_type', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="assignment">Assignment</option>
                    <option value="quiz">Quiz</option>
                    <option value="test">Test</option>
                    <option value="exam">Exam</option>
                    <option value="project">Project</option>
                    <option value="presentation">Presentation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Marks
                  </label>
                  <input
                    type="number"
                    value={assessmentDetails.total_marks}
                    onChange={(e) => handleAssessmentDetailChange('total_marks', parseInt(e.target.value))}
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={assessmentDetails.due_date}
                    onChange={(e) => handleAssessmentDetailChange('due_date', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div className="md:col-span-2 lg:col-span-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={assessmentDetails.description}
                    onChange={(e) => handleAssessmentDetailChange('description', e.target.value)}
                    rows="3"
                    placeholder="Brief description of the assessment..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </div>

            {/* Student Performance */}
            {students.length > 0 && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Student Performance ({students.length} students)
                  </h2>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => handleBulkMarks(assessmentDetails.total_marks)}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 transition-colors text-sm"
                    >
                      Full Marks All
                    </button>
                    <button
                      type="button"
                      onClick={() => handleBulkMarks(0)}
                      className="px-3 py-1 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors text-sm"
                    >
                      Zero All
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    {students.map(student => {
                      const marks = performanceData[student.student_id]?.marks_obtained || 0;
                      const grade = calculateGrade(marks, assessmentDetails.total_marks);
                      
                      return (
                        <div key={student.student_id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="h-10 w-10 bg-primary-600 rounded-full flex items-center justify-center">
                                <span className="text-white font-medium text-sm">
                                  {student.name.split(' ').map(n => n[0]).join('')}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{student.name}</p>
                                <p className="text-sm text-gray-600">ID: {student.student_id}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="number"
                                  value={marks}
                                  onChange={(e) => handlePerformanceChange(
                                    student.student_id, 
                                    'marks_obtained', 
                                    parseInt(e.target.value) || 0
                                  )}
                                  min="0"
                                  max={assessmentDetails.total_marks}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                                <span className="text-gray-600">/ {assessmentDetails.total_marks}</span>
                              </div>
                              
                              <div className={`px-3 py-1 rounded-full text-sm font-medium ${getGradeColor(grade)}`}>
                                {grade}
                              </div>
                              
                              <div className="text-sm text-gray-600">
                                {((marks / assessmentDetails.total_marks) * 100).toFixed(1)}%
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            <textarea
                              value={performanceData[student.student_id]?.comments || ''}
                              onChange={(e) => handlePerformanceChange(
                                student.student_id, 
                                'comments', 
                                e.target.value
                              )}
                              placeholder="Comments or feedback (optional)..."
                              rows="2"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex justify-end pt-6 border-t mt-6">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    >
                      {submitting ? 'Recording Performance...' : 'Record Performance'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PerformanceRecording;
