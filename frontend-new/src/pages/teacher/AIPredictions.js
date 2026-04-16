import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../utils/AuthContext';
import apiClient from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, ScatterChart, Scatter, ZAxis,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const RISK_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const PIE_COLORS = ['#ef4444', '#f59e0b', '#10b981'];

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
      setError(err.message || 'Failed to generate predictions. Please check your AI service configuration.');
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
      <div className="page-shell py-8">
        <div className="mx-auto max-w-7xl px-4 pl-14 sm:px-6 sm:pl-16 lg:px-8 lg:pl-20">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-[var(--bp-text)]">Access Denied</h2>
            <p className="mt-2 text-gray-600 dark:text-[var(--bp-text-muted)]">AI Predictions are available to teachers only.</p>
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
          <div className="flex items-center space-x-3 mb-2">
            <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-950/30">
              <svg className="w-8 h-8 text-purple-600 dark:text-purple-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-[var(--bp-text)]">AI Performance Predictions</h1>
              <p className="text-gray-600 dark:text-[var(--bp-text-muted)]">
                AI-powered analysis of student performance, attendance, and at-risk patterns
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
                      ? 'border-purple-500 bg-purple-50 dark:border-purple-700/70 dark:bg-purple-950/25'
                      : 'border-gray-200 hover:border-purple-300 bg-white dark:border-[var(--bp-border)] dark:bg-[var(--bp-surface)] dark:hover:border-purple-600/70'
                  } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-[var(--bp-text)]">{course.name}</p>
                      <p className="text-sm text-gray-500 dark:text-[var(--bp-text-subtle)]">{course.code}</p>
                    </div>
                    {selectedCourse === course.id && !loading && predictions && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        Analyzed
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center space-x-4 text-sm text-gray-600 dark:text-[var(--bp-text-muted)]">
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
            <p className="mt-4 text-lg text-gray-600 dark:text-[var(--bp-text-muted)]">Analyzing student data...</p>
            <p className="mt-2 text-sm text-gray-400 dark:text-[var(--bp-text-subtle)]">
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

            {/* Analytics Charts Section */}
            {predictions.summary?.total_students > 0 && (() => {
              const allPredictions = predictions.predictions || [];

              // Risk distribution pie data
              const riskPieData = [
                { name: 'High Risk', value: predictions.summary.high_risk || 0 },
                { name: 'Medium Risk', value: predictions.summary.medium_risk || 0 },
                { name: 'Low Risk', value: predictions.summary.low_risk || 0 },
              ].filter(d => d.value > 0);

              // Student predicted grades bar chart (sorted by grade ascending so at-risk are visible first)
              const studentGradesData = [...allPredictions]
                .filter(s => s.predicted_grade != null)
                .sort((a, b) => a.predicted_grade - b.predicted_grade)
                .map(s => ({
                  name: s.student_name?.split(' ')[0] || s.student_id,
                  fullName: s.student_name,
                  predicted: s.predicted_grade,
                  current: s.current_avg ?? 0,
                  risk: s.risk_level,
                  fill: RISK_COLORS[s.risk_level] || RISK_COLORS.low,
                }));

              // Scatter data: attendance vs predicted grade
              const scatterData = allPredictions
                .filter(s => s.predicted_grade != null && s.attendance?.attendance_rate != null)
                .map(s => ({
                  x: s.attendance.attendance_rate,
                  y: s.predicted_grade,
                  z: 80,
                  name: s.student_name,
                  risk: s.risk_level,
                  fill: RISK_COLORS[s.risk_level] || RISK_COLORS.low,
                }));

              // At-risk students radar/comparison
              const atRiskStudents = allPredictions
                .filter(s => s.risk_level === 'high' || s.risk_level === 'medium')
                .slice(0, 8)
                .map(s => ({
                  name: s.student_name?.split(' ')[0] || s.student_id,
                  fullName: s.student_name,
                  predicted: s.predicted_grade ?? 0,
                  attendance: s.attendance?.attendance_rate ?? 0,
                  current: s.current_avg ?? 0,
                  risk: s.risk_level,
                }));

              // Class overview radar data
              const classAvg = predictions.summary.class_predicted_avg || 0;
              const highRiskPct = predictions.summary.total_students > 0 ? Math.round((predictions.summary.high_risk / predictions.summary.total_students) * 100) : 0;
              const avgAttendance = allPredictions.length > 0
                ? Math.round(allPredictions.reduce((sum, s) => sum + (s.attendance?.attendance_rate || 0), 0) / allPredictions.length)
                : 0;
              const classRadarData = [
                { subject: 'Predicted Avg', value: classAvg, fullMark: 100 },
                { subject: 'Attendance', value: avgAttendance, fullMark: 100 },
                { subject: 'Low Risk %', value: predictions.summary.total_students > 0 ? Math.round((predictions.summary.low_risk / predictions.summary.total_students) * 100) : 0, fullMark: 100 },
                { subject: 'Engagement', value: Math.min(100, Math.round((avgAttendance * 0.5) + (classAvg * 0.5))), fullMark: 100 },
                { subject: 'Stability', value: Math.max(0, 100 - highRiskPct * 2), fullMark: 100 },
              ];

              const CustomBarTooltip = ({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">{d.fullName}</p>
                    <p className="text-sm" style={{ color: '#8b5cf6' }}>Predicted: {d.predicted}%</p>
                    {d.current > 0 && <p className="text-sm text-gray-500">Current: {d.current}%</p>}
                    <p className="text-xs mt-1" style={{ color: RISK_COLORS[d.risk] }}>{d.risk?.toUpperCase()} RISK</p>
                  </div>
                );
              };

              const CustomScatterTooltip = ({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">{d.name}</p>
                    <p className="text-sm text-blue-600">Attendance: {d.x}%</p>
                    <p className="text-sm text-purple-600">Predicted: {d.y}%</p>
                    <p className="text-xs mt-1" style={{ color: RISK_COLORS[d.risk] }}>{d.risk?.toUpperCase()} RISK</p>
                  </div>
                );
              };

              return (
                <>
                  {/* Row 1: Risk Pie + Class Overview Radar */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Risk Distribution</h3>
                      <p className="text-sm text-gray-500 mb-4">Breakdown of students by risk level</p>
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={riskPieData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={4}
                            dataKey="value"
                            label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                          >
                            {riskPieData.map((entry, idx) => (
                              <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Class Health Overview</h3>
                      <p className="text-sm text-gray-500 mb-4">Overall class performance indicators</p>
                      <ResponsiveContainer width="100%" height={280}>
                        <RadarChart data={classRadarData}>
                          <PolarGrid stroke="#e5e7eb" />
                          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#6b7280' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 10, fill: '#9ca3af' }} />
                          <Radar name="Class" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Row 2: Student Predicted Grades Bar Chart */}
                  {studentGradesData.length > 0 && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Student Predicted Grades</h3>
                      <p className="text-sm text-gray-500 mb-4">Each bar is color-coded by risk level — red (high), yellow (medium), green (low)</p>
                      <ResponsiveContainer width="100%" height={Math.max(300, studentGradesData.length * 20)}>
                        <BarChart data={studentGradesData} layout="vertical" margin={{ left: 10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                          <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12, fill: '#6b7280' }} />
                          <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#6b7280' }} width={80} />
                          <Tooltip content={<CustomBarTooltip />} />
                          <Bar dataKey="predicted" name="Predicted Grade" radius={[0, 6, 6, 0]} barSize={16}>
                            {studentGradesData.map((entry, idx) => (
                              <Cell key={idx} fill={entry.fill} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Row 3: Attendance vs Predicted Grade Scatter + At-Risk Comparison */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {scatterData.length > 0 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">Attendance vs Predicted Grade</h3>
                        <p className="text-sm text-gray-500 mb-4">Correlation between attendance and predicted performance</p>
                        <ResponsiveContainer width="100%" height={300}>
                          <ScatterChart margin={{ bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis type="number" dataKey="x" name="Attendance" unit="%" domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <YAxis type="number" dataKey="y" name="Predicted" unit="%" domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <ZAxis dataKey="z" range={[60, 120]} />
                            <Tooltip content={<CustomScatterTooltip />} />
                            <Scatter data={scatterData} shape="circle">
                              {scatterData.map((entry, idx) => (
                                <Cell key={idx} fill={entry.fill} />
                              ))}
                            </Scatter>
                          </ScatterChart>
                        </ResponsiveContainer>
                        <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-red-500 mr-1"></span>High</span>
                          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400 mr-1"></span>Medium</span>
                          <span className="flex items-center"><span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-1"></span>Low</span>
                        </div>
                      </div>
                    )}

                    {atRiskStudents.length > 0 && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">At-Risk Students Comparison</h3>
                        <p className="text-sm text-gray-500 mb-4">Predicted grade, attendance, and current average for at-risk students</p>
                        <ResponsiveContainer width="100%" height={300}>
                          <BarChart data={atRiskStudents} barGap={2}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                            <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6b7280' }} />
                            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#6b7280' }} />
                            <Tooltip formatter={(value) => `${value}%`} />
                            <Legend />
                            <Bar dataKey="predicted" name="Predicted" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={14} />
                            <Bar dataKey="attendance" name="Attendance" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={14} />
                            <Bar dataKey="current" name="Current Avg" fill="#a78bfa" radius={[4, 4, 0, 0]} barSize={14} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                  </div>
                </>
              );
            })()}

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
                  Generated on {new Date(predictions.generated_at).toLocaleString()}
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
