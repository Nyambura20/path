import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../utils/AuthContext';
import apiClient from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

function AIPredictions() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedStudent, setExpandedStudent] = useState(null);
  const [filterRisk, setFilterRisk] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);
      const data = await apiClient.getTeacherCourses();
      const courseList = data?.courses || data;
      setCourses(Array.isArray(courseList) ? courseList : []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError('Failed to load courses.');
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.is_teacher) {
      fetchCourses();
    }
  }, [user, fetchCourses]);

  const generatePredictions = async (courseId) => {
    try {
      setLoading(true);
      setError(null);
      setPredictions(null);
      setSelectedCourse(courseId);
      setExpandedStudent(null);
      const data = await apiClient.getAIPredictions(courseId);
      setPredictions(data);
    } catch (err) {
      setError(err.message || 'Failed to generate predictions. Please ensure the Gemini API key is configured.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskBadge = (level) => {
    const styles = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      low: 'bg-green-100 text-green-800 border-green-200',
    };
    return styles[level] || styles.low;
  };

  const getRiskIcon = (level) => {
    if (level === 'high') {
      return (
        <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      );
    }
    if (level === 'medium') {
      return (
        <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    );
  };

  const getGradeColor = (grade) => {
    if (grade == null) return 'text-gray-400';
    if (grade >= 80) return 'text-green-600';
    if (grade >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredPredictions = predictions?.predictions?.filter((p) => {
    const matchesRisk = filterRisk === 'all' || p.risk_level === filterRisk;
    const matchesSearch =
      !searchTerm ||
      p.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesRisk && matchesSearch;
  }) || [];

  if (!user?.is_teacher) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
            <p className="text-gray-600 mt-2">AI Predictions are available to teachers only.</p>
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
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Performance Predictions</h1>
              <p className="text-gray-600">
                Powered by Google Gemini AI - Analyze student performance, attendance, and identify at-risk students
              </p>
            </div>
          </div>
        </div>

        {/* Course Selection */}
        <div className="card mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a Course to Analyze</h2>
          {coursesLoading ? (
            <LoadingSpinner size="small" text="Loading courses..." />
          ) : courses.length === 0 ? (
            <p className="text-gray-500">No courses found. You need assigned courses to generate predictions.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <button
                  key={course.id}
                  onClick={() => generatePredictions(course.id)}
                  disabled={loading}
                  className={`text-left p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                    selectedCourse === course.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-purple-300 bg-white'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{course.name}</p>
                      <p className="text-sm text-gray-500">{course.code}</p>
                    </div>
                    {selectedCourse === course.id && !loading && predictions && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Analyzed
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600">
                    <span>{course.enrolled_students_count || 0} students</span>
                    <span>{course.difficulty_level || 'N/A'}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="card text-center py-16">
            <div className="inline-flex items-center space-x-3">
              <LoadingSpinner size="large" />
            </div>
            <p className="text-gray-600 mt-4 text-lg">Analyzing student data with Gemini AI...</p>
            <p className="text-gray-400 text-sm mt-2">
              This may take a moment as we process performance and attendance records
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="card bg-red-50 border-red-200 mb-6">
            <div className="flex items-start space-x-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-red-800 font-semibold">Prediction Error</h3>
                <p className="text-red-700 mt-1">{error}</p>
                <button
                  onClick={() => selectedCourse && generatePredictions(selectedCourse)}
                  className="mt-3 text-sm font-medium text-red-700 hover:text-red-900 underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {predictions && !loading && !error && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{predictions.summary?.total_students || 0}</p>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-gray-500">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{predictions.summary?.high_risk || 0}</p>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-gray-500">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{predictions.summary?.medium_risk || 0}</p>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-gray-500">Low Risk</p>
                <p className="text-2xl font-bold text-green-600">{predictions.summary?.low_risk || 0}</p>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-gray-500">Class Predicted Avg</p>
                <p className={`text-2xl font-bold ${getGradeColor(predictions.summary?.class_predicted_avg)}`}>
                  {predictions.summary?.class_predicted_avg ?? '-'}%
                </p>
              </div>
            </div>

            {/* Risk Distribution Bar */}
            {predictions.summary?.total_students > 0 && (
              <div className="card mb-8">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Risk Distribution</h3>
                <div className="flex h-4 rounded-full overflow-hidden bg-gray-100">
                  {predictions.summary.high_risk > 0 && (
                    <div
                      className="bg-red-500 transition-all"
                      style={{ width: `${(predictions.summary.high_risk / predictions.summary.total_students) * 100}%` }}
                      title={`High Risk: ${predictions.summary.high_risk}`}
                    />
                  )}
                  {predictions.summary.medium_risk > 0 && (
                    <div
                      className="bg-yellow-400 transition-all"
                      style={{ width: `${(predictions.summary.medium_risk / predictions.summary.total_students) * 100}%` }}
                      title={`Medium Risk: ${predictions.summary.medium_risk}`}
                    />
                  )}
                  {predictions.summary.low_risk > 0 && (
                    <div
                      className="bg-green-500 transition-all"
                      style={{ width: `${(predictions.summary.low_risk / predictions.summary.total_students) * 100}%` }}
                      title={`Low Risk: ${predictions.summary.low_risk}`}
                    />
                  )}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-1"></span>High Risk</span>
                  <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-400 mr-1"></span>Medium Risk</span>
                  <span className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-1"></span>Low Risk</span>
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="card mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium text-gray-700">Filter by Risk:</label>
                  <select
                    value={filterRisk}
                    onChange={(e) => setFilterRisk(e.target.value)}
                    className="rounded-md border-gray-300 shadow-sm text-sm focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="all">All Students</option>
                    <option value="high">High Risk</option>
                    <option value="medium">Medium Risk</option>
                    <option value="low">Low Risk</option>
                  </select>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search student..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 rounded-md border-gray-300 shadow-sm text-sm focus:ring-purple-500 focus:border-purple-500 w-full md:w-64"
                  />
                  <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Student Predictions List */}
            <div className="space-y-4">
              {filteredPredictions.length === 0 ? (
                <div className="card text-center py-8">
                  <p className="text-gray-500">No students match the current filters.</p>
                </div>
              ) : (
                filteredPredictions.map((student, idx) => (
                  <div
                    key={student.student_id || idx}
                    className={`card border-l-4 transition-shadow hover:shadow-md ${
                      student.risk_level === 'high'
                        ? 'border-l-red-500'
                        : student.risk_level === 'medium'
                        ? 'border-l-yellow-400'
                        : 'border-l-green-500'
                    }`}
                  >
                    {/* Summary Row */}
                    <div
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() =>
                        setExpandedStudent(expandedStudent === student.student_id ? null : student.student_id)
                      }
                    >
                      <div className="flex items-center space-x-4">
                        {getRiskIcon(student.risk_level)}
                        <div>
                          <h3 className="font-semibold text-gray-900">{student.student_name}</h3>
                          <p className="text-sm text-gray-500">
                            ID: {student.student_id} &middot; Year {student.year_of_study} &middot; {student.major}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-center hidden sm:block">
                          <p className="text-xs text-gray-500">Current Avg</p>
                          <p className={`font-semibold ${getGradeColor(student.current_avg)}`}>
                            {student.current_avg != null ? `${student.current_avg}%` : '-'}
                          </p>
                        </div>
                        <div className="text-center hidden sm:block">
                          <p className="text-xs text-gray-500">Attendance</p>
                          <p className={`font-semibold ${getGradeColor(student.attendance?.attendance_rate)}`}>
                            {student.attendance?.attendance_rate != null
                              ? `${student.attendance.attendance_rate}%`
                              : '-'}
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-xs text-gray-500">Predicted</p>
                          <p className={`text-lg font-bold ${getGradeColor(student.predicted_grade)}`}>
                            {student.predicted_grade != null ? `${student.predicted_grade}%` : '-'}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getRiskBadge(
                            student.risk_level
                          )}`}
                        >
                          {student.risk_level?.toUpperCase()} RISK
                        </span>
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedStudent === student.student_id ? 'rotate-180' : ''
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    {/* Expanded Detail */}
                    {expandedStudent === student.student_id && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        {/* AI Summary */}
                        {student.summary && (
                          <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
                            <div className="flex items-start space-x-2">
                              <svg className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              <div>
                                <p className="text-sm font-medium text-purple-800">AI Analysis</p>
                                <p className="text-sm text-purple-700 mt-1">{student.summary}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Risk Factors */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                              <svg className="w-4 h-4 text-red-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                              </svg>
                              Risk Factors
                            </h4>
                            {student.risk_factors?.length > 0 ? (
                              <ul className="space-y-2">
                                {student.risk_factors.map((rf, i) => (
                                  <li key={i} className="flex items-start text-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-1.5 mr-2 flex-shrink-0"></span>
                                    <span className="text-gray-700">{rf}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-400 italic">No risk factors identified</p>
                            )}
                          </div>

                          {/* Strengths */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                              <svg className="w-4 h-4 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Strengths
                            </h4>
                            {student.strengths?.length > 0 ? (
                              <ul className="space-y-2">
                                {student.strengths.map((s, i) => (
                                  <li key={i} className="flex items-start text-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 mr-2 flex-shrink-0"></span>
                                    <span className="text-gray-700">{s}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-400 italic">No specific strengths noted</p>
                            )}
                          </div>

                          {/* Recommendations */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                              <svg className="w-4 h-4 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                              </svg>
                              Recommendations
                            </h4>
                            {student.recommendations?.length > 0 ? (
                              <ul className="space-y-2">
                                {student.recommendations.map((r, i) => (
                                  <li key={i} className="flex items-start text-sm">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-1.5 mr-2 flex-shrink-0"></span>
                                    <span className="text-gray-700">{r}</span>
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <p className="text-sm text-gray-400 italic">No recommendations</p>
                            )}
                          </div>
                        </div>

                        {/* Student Metrics */}
                        <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-500">GPA</p>
                            <p className="font-semibold text-gray-900">{student.gpa ?? '-'}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-500">Assessments</p>
                            <p className="font-semibold text-gray-900">{student.assessments_completed ?? 0}</p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-500">Historical Avg</p>
                            <p className={`font-semibold ${getGradeColor(student.historical_avg)}`}>
                              {student.historical_avg != null ? `${student.historical_avg}%` : '-'}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-500">Classes Attended</p>
                            <p className="font-semibold text-gray-900">
                              {student.attendance
                                ? `${student.attendance.present + student.attendance.late}/${student.attendance.total_classes}`
                                : '-'}
                            </p>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3 text-center">
                            <p className="text-xs text-gray-500">Absences</p>
                            <p className={`font-semibold ${student.attendance?.absent > 3 ? 'text-red-600' : 'text-gray-900'}`}>
                              {student.attendance?.absent ?? '-'}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer info */}
            {predictions.generated_at && (
              <div className="mt-8 text-center text-sm text-gray-400">
                <p>
                  Generated on {new Date(predictions.generated_at).toLocaleString()} using {predictions.model || 'Gemini AI'}
                </p>
                <p className="mt-1">
                  Predictions are AI-generated estimates and should be used as guidance alongside professional judgment.
                </p>
              </div>
            )}
          </>
        )}

        {/* Empty state when no course is selected */}
        {!predictions && !loading && !error && (
          <div className="card text-center py-16">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Course to Begin</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              Choose one of your courses above to generate AI-powered performance predictions.
              The analysis uses student grades, attendance records, and historical performance data.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIPredictions;
