import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../utils/AuthContext';
import { useNotification } from '../../utils/NotificationContext';
import apiClient from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

function PerformanceReports() {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [performanceData, setPerformanceData] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('assessments'); // 'assessments' or 'students'
  const [selectedAssessmentType, setSelectedAssessmentType] = useState('all');

  const fetchTeacherCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiClient.getTeacherCourses();
      setCourses(response.courses || response || []);
    } catch (error) {
      addNotification('Error fetching courses: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [addNotification]);

  const fetchPerformanceData = useCallback(async () => {
    if (!selectedCourse) return;
    
    try {
      setLoading(true);
      const response = await apiClient.getCoursePerformance(selectedCourse, {
        assessment_type: selectedAssessmentType !== 'all' ? selectedAssessmentType : undefined
      });
      setPerformanceData(response.assessments || []);
      setStudents(response.students || []);
    } catch (error) {
      addNotification('Error fetching performance data: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedCourse, selectedAssessmentType, addNotification]);

  useEffect(() => {
    if (user?.is_teacher) {
      fetchTeacherCourses();
    }
  }, [user, fetchTeacherCourses]);

  useEffect(() => {
    if (selectedCourse) {
      fetchPerformanceData();
    }
  }, [selectedCourse, selectedAssessmentType, fetchPerformanceData]);

  const calculateStudentAverage = (studentId) => {
    const studentPerformances = [];
    performanceData.forEach(assessment => {
      const record = assessment.performance?.find(p => p.student_id === studentId);
      if (record) {
        const percentage = (record.marks_obtained / assessment.total_marks) * 100;
        studentPerformances.push(percentage);
      }
    });
    
    if (studentPerformances.length === 0) return '0%';
    const average = studentPerformances.reduce((sum, p) => sum + p, 0) / studentPerformances.length;
    return `${average.toFixed(1)}%`;
  };

  const getGradeBadge = (grade) => {
    const colors = {
      'A+': 'bg-primary-100 text-primary-800',
      'A': 'bg-primary-100 text-primary-800',
      'B+': 'bg-blue-100 text-blue-800',
      'B': 'bg-blue-100 text-blue-800',
      'C+': 'bg-yellow-100 text-yellow-800',
      'C': 'bg-yellow-100 text-yellow-800',
      'D': 'bg-orange-100 text-orange-800',
      'F': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[grade] || 'bg-gray-100 text-gray-800'}`}>
        {grade}
      </span>
    );
  };

  const handleExportCSV = () => {
    if (!performanceData.length) {
      addNotification('No data to export', 'warning');
      return;
    }

    let csvContent = '';
    
    if (viewMode === 'assessments') {
      // Assessments view
      csvContent = 'Assessment Name,Type,Date,Student Name,Student ID,Marks Obtained,Total Marks,Percentage,Grade,Comments\n';
      performanceData.forEach(assessment => {
        assessment.performance?.forEach(record => {
          const percentage = ((record.marks_obtained / assessment.total_marks) * 100).toFixed(1);
          csvContent += `"${assessment.assessment_name}","${assessment.assessment_type}","${assessment.due_date}","${record.student_name}","${record.student_id}",${record.marks_obtained},${assessment.total_marks},${percentage}%,"${record.grade}","${record.comments || ''}"\n`;
        });
      });
    } else {
      // Students view
      csvContent = 'Student Name,Student ID,';
      // Add assessment headers
      const assessmentHeaders = performanceData.map(a => `"${a.assessment_name} (${a.total_marks})"`).join(',');
      csvContent += assessmentHeaders + ',Average,Overall Grade\n';
      
      students.forEach(student => {
        csvContent += `"${student.name}","${student.student_id}",`;
        const percentages = [];
        
        performanceData.forEach(assessment => {
          const record = assessment.performance?.find(p => p.student_id === student.student_id);
          if (record) {
            const percentage = ((record.marks_obtained / assessment.total_marks) * 100).toFixed(1);
            csvContent += `"${record.marks_obtained}/${assessment.total_marks} (${percentage}%)",`;
            percentages.push(parseFloat(percentage));
          } else {
            csvContent += '"N/A",';
          }
        });
        
        const average = percentages.length > 0 ? (percentages.reduce((sum, p) => sum + p, 0) / percentages.length).toFixed(1) : '0';
        const overallGrade = calculateOverallGrade(parseFloat(average));
        csvContent += `${average}%,"${overallGrade}"\n`;
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `performance_report_${selectedCourse}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const calculateOverallGrade = (percentage) => {
    if (percentage >= 90) return 'A+';
    if (percentage >= 80) return 'A';
    if (percentage >= 70) return 'B+';
    if (percentage >= 60) return 'B';
    if (percentage >= 50) return 'C+';
    if (percentage >= 40) return 'C';
    if (percentage >= 30) return 'D';
    return 'F';
  };

  const calculateAssessmentStats = (assessment) => {
    if (!assessment.performance?.length) return { average: 0, highest: 0, lowest: 0 };
    
    const percentages = assessment.performance.map(p => (p.marks_obtained / assessment.total_marks) * 100);
    return {
      average: (percentages.reduce((sum, p) => sum + p, 0) / percentages.length).toFixed(1),
      highest: Math.max(...percentages).toFixed(1),
      lowest: Math.min(...percentages).toFixed(1)
    };
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
          <h1 className="text-3xl font-bold text-gray-900">Performance Reports</h1>
          <p className="text-gray-600 mt-2">View and download performance reports for your courses</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Course
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                Assessment Type
              </label>
              <select
                value={selectedAssessmentType}
                onChange={(e) => setSelectedAssessmentType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Types</option>
                <option value="assignment">Assignments</option>
                <option value="quiz">Quizzes</option>
                <option value="test">Tests</option>
                <option value="exam">Exams</option>
                <option value="project">Projects</option>
                <option value="presentation">Presentations</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleExportCSV}
                disabled={!performanceData.length}
                className="w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* View Mode Toggle */}
          {selectedCourse && (
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode('assessments')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'assessments'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Assessments View
              </button>
              <button
                onClick={() => setViewMode('students')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'students'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Students View
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <LoadingSpinner size="large" text="Loading performance data..." />
          </div>
        ) : selectedCourse && performanceData.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {viewMode === 'assessments' ? (
              /* Assessments View */
              <div className="space-y-6 p-6">
                {performanceData.map(assessment => {
                  const stats = calculateAssessmentStats(assessment);
                  return (
                    <div key={assessment.id} className="border rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{assessment.assessment_name}</h3>
                          <div className="flex items-center space-x-4 mt-1">
                            <span className="text-sm text-gray-600 capitalize">{assessment.assessment_type}</span>
                            <span className="text-sm text-gray-600">Due: {assessment.due_date}</span>
                            <span className="text-sm text-gray-600">Total: {assessment.total_marks} marks</span>
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                          <div>Avg: {stats.average}%</div>
                          <div>High: {stats.highest}% | Low: {stats.lowest}%</div>
                        </div>
                      </div>
                      
                      {assessment.description && (
                        <p className="text-gray-600 mb-4">{assessment.description}</p>
                      )}
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {assessment.performance?.map(record => {
                          const percentage = ((record.marks_obtained / assessment.total_marks) * 100).toFixed(1);
                          return (
                            <div key={record.student_id} className="p-3 bg-gray-50 rounded">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-medium text-sm">{record.student_name}</p>
                                {getGradeBadge(record.grade)}
                              </div>
                              <div className="flex items-center justify-between text-sm text-gray-600">
                                <span>{record.marks_obtained}/{assessment.total_marks}</span>
                                <span>{percentage}%</span>
                              </div>
                              {record.comments && (
                                <p className="text-xs text-gray-500 mt-1">{record.comments}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Students View */
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      {performanceData.map(assessment => (
                        <th key={assessment.id} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <div>{assessment.assessment_name}</div>
                          <div className="text-gray-400">({assessment.total_marks} marks)</div>
                        </th>
                      ))}
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Average
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map(student => (
                      <tr key={student.student_id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-600">ID: {student.student_id}</div>
                          </div>
                        </td>
                        {performanceData.map(assessment => {
                          const record = assessment.performance?.find(p => p.student_id === student.student_id);
                          return (
                            <td key={assessment.id} className="px-3 py-4 whitespace-nowrap text-center">
                              {record ? (
                                <div>
                                  <div className="text-sm font-medium">
                                    {record.marks_obtained}/{assessment.total_marks}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {((record.marks_obtained / assessment.total_marks) * 100).toFixed(1)}%
                                  </div>
                                  {getGradeBadge(record.grade)}
                                </div>
                              ) : (
                                <span className="text-gray-400 text-sm">N/A</span>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div className="text-sm font-medium text-gray-900">
                            {calculateStudentAverage(student.student_id)}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ) : selectedCourse ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Performance Data</h3>
            <p className="text-gray-600">No performance records found for the selected course and filters.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 mb-4">
              <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Course</h3>
            <p className="text-gray-600">Choose a course from the dropdown above to view performance reports.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default PerformanceReports;
