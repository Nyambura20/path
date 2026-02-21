import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../utils/AuthContext';
import apiClient from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PerformanceAIChat from '../components/PerformanceAIChat';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line, Area, AreaChart,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
} from 'recharts';

const COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

function AIAnalytics() {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [perfData, attData, enrollData] = await Promise.all([
        apiClient.getPerformanceSummary().catch(() => null),
        apiClient.getAttendanceRecords().catch(() => null),
        apiClient.getEnrollments().catch(() => []),
      ]);

      setPerformanceData(perfData);
      setAttendanceData(attData);
      const enrollList = enrollData?.results || enrollData || [];
      setEnrollments(Array.isArray(enrollList) ? enrollList : []);
    } catch (err) {
      setError(err.message || 'Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derive chart data from performance data
  const getGradeDistribution = () => {
    if (!performanceData?.recent_grades?.length) return [];
    const buckets = { 'A (90-100)': 0, 'B (80-89)': 0, 'C (70-79)': 0, 'D (60-69)': 0, 'F (<60)': 0 };
    performanceData.recent_grades.forEach(g => {
      const pct = g.percentage || 0;
      if (pct >= 90) buckets['A (90-100)']++;
      else if (pct >= 80) buckets['B (80-89)']++;
      else if (pct >= 70) buckets['C (70-79)']++;
      else if (pct >= 60) buckets['D (60-69)']++;
      else buckets['F (<60)']++;
    });
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  };

  const getGradeTrend = () => {
    if (!performanceData?.recent_grades?.length) return [];
    return [...performanceData.recent_grades]
      .reverse()
      .map((g, i) => ({
        name: g.assessment?.length > 15 ? g.assessment.substring(0, 15) + '…' : (g.assessment || `Test ${i + 1}`),
        grade: Math.round(g.percentage || 0),
        course: g.course || 'Unknown',
      }));
  };

  const getCoursePerformance = () => {
    if (!performanceData?.recent_grades?.length) return [];
    const courseMap = {};
    performanceData.recent_grades.forEach(g => {
      const course = g.course || 'Unknown';
      if (!courseMap[course]) courseMap[course] = { total: 0, count: 0 };
      courseMap[course].total += (g.percentage || 0);
      courseMap[course].count++;
    });
    return Object.entries(courseMap).map(([name, data]) => ({
      name: name.length > 18 ? name.substring(0, 18) + '…' : name,
      average: Math.round(data.total / data.count),
      assessments: data.count,
    }));
  };

  const getAttendanceBreakdown = () => {
    if (!attendanceData) return [];
    const records = attendanceData?.results || attendanceData || [];
    if (!Array.isArray(records) || records.length === 0) return [];
    
    const counts = { Present: 0, Late: 0, Absent: 0, Excused: 0 };
    records.forEach(r => {
      const status = r.status?.charAt(0).toUpperCase() + r.status?.slice(1).toLowerCase();
      if (counts[status] !== undefined) counts[status]++;
      else if (r.status === 'excused_absence' || r.status === 'excused') counts['Excused']++;
    });
    return Object.entries(counts)
      .filter(([, v]) => v > 0)
      .map(([name, value]) => ({ name, value }));
  };

  const getAttendanceTrend = () => {
    if (!attendanceData) return [];
    const records = attendanceData?.results || attendanceData || [];
    if (!Array.isArray(records) || records.length === 0) return [];

    // Group by date and calculate running attendance rate
    const sorted = [...records].sort((a, b) => new Date(a.date) - new Date(b.date));
    let present = 0;
    let total = 0;
    return sorted.map(r => {
      total++;
      if (r.status === 'present' || r.status === 'late') present++;
      return {
        date: new Date(r.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        rate: Math.round((present / total) * 100),
      };
    });
  };

  const getOverviewRadar = () => {
    const avgGrade = performanceData?.average_grade || 0;
    const totalCourses = performanceData?.total_courses || 0;
    const completedAssessments = performanceData?.completed_assessments || 0;
    
    const records = attendanceData?.results || attendanceData || [];
    let attendanceRate = 0;
    if (Array.isArray(records) && records.length > 0) {
      const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length;
      attendanceRate = Math.round((presentCount / records.length) * 100);
    }

    return [
      { subject: 'Avg Grade', value: Math.min(avgGrade, 100), fullMark: 100 },
      { subject: 'Attendance', value: attendanceRate, fullMark: 100 },
      { subject: 'Assessments', value: Math.min(completedAssessments * 10, 100), fullMark: 100 },
      { subject: 'Courses', value: Math.min(totalCourses * 20, 100), fullMark: 100 },
      { subject: 'Consistency', value: Math.min(avgGrade > 0 ? avgGrade - (performanceData?.at_risk_courses || 0) * 15 : 0, 100), fullMark: 100 },
    ];
  };

  const attendancePieColors = ['#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <LoadingSpinner size="large" text="Loading AI analytics..." />
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
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button onClick={fetchData} className="btn-primary">Try Again</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const gradeDistribution = getGradeDistribution();
  const gradeTrend = getGradeTrend();
  const coursePerformance = getCoursePerformance();
  const attendanceBreakdown = getAttendanceBreakdown();
  const attendanceTrend = getAttendanceTrend();
  const overviewRadar = getOverviewRadar();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
    { id: 'grades', label: 'Grades', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { id: 'attendance', label: 'Attendance', icon: 'M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
    { id: 'insights', label: 'AI Insights', icon: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Performance Analytics</h1>
              <p className="text-gray-600">
                Visual insights into your academic performance, powered by AI
              </p>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Average Grade</p>
                <p className="text-2xl font-bold text-gray-900">
                  {performanceData?.average_grade ? `${performanceData.average_grade.toFixed(1)}%` : 'N/A'}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                (performanceData?.average_grade || 0) >= 80 ? 'bg-green-100' : 
                (performanceData?.average_grade || 0) >= 60 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <svg className={`w-6 h-6 ${
                  (performanceData?.average_grade || 0) >= 80 ? 'text-green-600' : 
                  (performanceData?.average_grade || 0) >= 60 ? 'text-yellow-600' : 'text-red-600'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Enrolled Courses</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData?.total_courses || enrollments.length || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Assessments Done</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData?.completed_assessments || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">At-Risk Courses</p>
                <p className="text-2xl font-bold text-gray-900">{performanceData?.at_risk_courses || 0}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                (performanceData?.at_risk_courses || 0) > 0 ? 'bg-red-100' : 'bg-green-100'
              }`}>
                <svg className={`w-6 h-6 ${
                  (performanceData?.at_risk_courses || 0) > 0 ? 'text-red-600' : 'text-green-600'
                }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'border-purple-600 text-purple-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                  </svg>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Radar Chart */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Overview</h3>
                  {overviewRadar.some(d => d.value > 0) ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={overviewRadar}>
                        <PolarGrid stroke="#e5e7eb" />
                        <PolarAngleAxis dataKey="subject" tick={{ fontSize: 12, fill: '#6b7280' }} />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
                        <Radar
                          name="Score"
                          dataKey="value"
                          stroke="#8b5cf6"
                          fill="#8b5cf6"
                          fillOpacity={0.3}
                          strokeWidth={2}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                      <p>No data available yet</p>
                    </div>
                  )}
                </div>

                {/* Course Performance Bar Chart */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Course</h3>
                  {coursePerformance.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={coursePerformance} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11 }} />
                        <Tooltip
                          formatter={(value, name) => [`${value}%`, name === 'average' ? 'Average Grade' : name]}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        />
                        <Bar dataKey="average" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                      <p>No course grades yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Grades Tab */}
            {activeTab === 'grades' && (
              <div className="space-y-8">
                {/* Grade Trend */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Trend</h3>
                  {gradeTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={gradeTrend}>
                        <defs>
                          <linearGradient id="gradeGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value) => [`${value}%`, 'Grade']}
                          labelFormatter={(label) => `Assessment: ${label}`}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        />
                        <Area
                          type="monotone"
                          dataKey="grade"
                          stroke="#8b5cf6"
                          fill="url(#gradeGradient)"
                          strokeWidth={2}
                          dot={{ fill: '#8b5cf6', r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                      <p>No grade data available</p>
                    </div>
                  )}
                </div>

                {/* Grade Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
                    {gradeDistribution.some(d => d.value > 0) ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={gradeDistribution.filter(d => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {gradeDistribution.filter(d => d.value > 0).map((_, i) => (
                              <Cell key={i} fill={COLORS[i % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Assessments']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[280px] flex items-center justify-center text-gray-400">
                        <p>No grades to distribute</p>
                      </div>
                    )}
                  </div>

                  {/* Recent Grades Table */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Grades</h3>
                    {performanceData?.recent_grades?.length > 0 ? (
                      <div className="space-y-3 max-h-[280px] overflow-y-auto">
                        {performanceData.recent_grades.map((grade, i) => (
                          <div key={i} className="flex items-center justify-between bg-white rounded-lg p-3 border border-gray-100">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{grade.assessment}</p>
                              <p className="text-xs text-gray-500">{grade.course}</p>
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                                grade.percentage >= 90 ? 'bg-green-100 text-green-800' :
                                grade.percentage >= 80 ? 'bg-blue-100 text-blue-800' :
                                grade.percentage >= 70 ? 'bg-yellow-100 text-yellow-800' :
                                grade.percentage >= 60 ? 'bg-orange-100 text-orange-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {grade.percentage?.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-[280px] flex items-center justify-center text-gray-400">
                        <p>No recent grades</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Tab */}
            {activeTab === 'attendance' && (
              <div className="space-y-8">
                {/* Attendance Rate Trend */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Rate Over Time</h3>
                  {attendanceTrend.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={attendanceTrend}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value) => [`${value}%`, 'Attendance Rate']}
                          contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="rate"
                          stroke="#10b981"
                          strokeWidth={2}
                          dot={{ fill: '#10b981', r: 3 }}
                          activeDot={{ r: 5 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-400">
                      <p>No attendance data available</p>
                    </div>
                  )}
                </div>

                {/* Attendance Breakdown Pie */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Breakdown</h3>
                    {attendanceBreakdown.length > 0 ? (
                      <ResponsiveContainer width="100%" height={280}>
                        <PieChart>
                          <Pie
                            data={attendanceBreakdown}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={3}
                            dataKey="value"
                          >
                            {attendanceBreakdown.map((_, i) => (
                              <Cell key={i} fill={attendancePieColors[i % attendancePieColors.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [value, 'Days']} />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[280px] flex items-center justify-center text-gray-400">
                        <p>No attendance records</p>
                      </div>
                    )}
                  </div>

                  {/* Attendance Summary */}
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Summary</h3>
                    {attendanceBreakdown.length > 0 ? (
                      <div className="space-y-4">
                        {attendanceBreakdown.map((item, i) => {
                          const total = attendanceBreakdown.reduce((sum, d) => sum + d.value, 0);
                          const pct = total > 0 ? Math.round((item.value / total) * 100) : 0;
                          return (
                            <div key={i}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-medium text-gray-700">{item.name}</span>
                                <span className="text-gray-500">{item.value} days ({pct}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div
                                  className="h-2.5 rounded-full transition-all"
                                  style={{
                                    width: `${pct}%`,
                                    backgroundColor: attendancePieColors[i % attendancePieColors.length]
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="h-[280px] flex items-center justify-center text-gray-400">
                        <p>No attendance data</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* AI Insights Tab */}
            {activeTab === 'insights' && (
              <div className="space-y-6">
                {/* AI-generated insights based on the data */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6 border border-purple-100">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-purple-900">AI-Powered Insights</h3>
                      <p className="text-sm text-purple-700 mt-1">
                        Based on your performance data, here's what we've identified. Use the AI chat button in the bottom-right corner for personalized advice.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Generated Insight Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Academic Standing */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className={`w-3 h-3 rounded-full ${
                        (performanceData?.average_grade || 0) >= 80 ? 'bg-green-500' :
                        (performanceData?.average_grade || 0) >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}></div>
                      <h4 className="font-semibold text-gray-900">Academic Standing</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {(performanceData?.average_grade || 0) >= 80
                        ? "You're performing well! Your grades are above average. Keep up the consistency and aim for excellence."
                        : (performanceData?.average_grade || 0) >= 60
                        ? "Your performance is satisfactory, but there's room for improvement. Consider reviewing areas where you scored lower."
                        : performanceData?.average_grade
                        ? "Your grades need attention. Focus on understanding core concepts and consider seeking help from instructors."
                        : "No grades recorded yet. Complete your assessments to see insights here."}
                    </p>
                  </div>

                  {/* Risk Assessment */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className={`w-3 h-3 rounded-full ${
                        (performanceData?.at_risk_courses || 0) > 0 ? 'bg-red-500' : 'bg-green-500'
                      }`}></div>
                      <h4 className="font-semibold text-gray-900">Risk Assessment</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {(performanceData?.at_risk_courses || 0) > 0
                        ? `You have ${performanceData.at_risk_courses} course${performanceData.at_risk_courses > 1 ? 's' : ''} flagged as at-risk. Focus extra effort on these subjects to improve your predicted outcomes.`
                        : "No at-risk courses detected. You're on track across all your enrolled courses."}
                    </p>
                  </div>

                  {/* Attendance Impact */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className={`w-3 h-3 rounded-full ${
                        attendanceBreakdown.length > 0 ? 'bg-blue-500' : 'bg-gray-400'
                      }`}></div>
                      <h4 className="font-semibold text-gray-900">Attendance Impact</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      {(() => {
                        const records = attendanceData?.results || attendanceData || [];
                        if (!Array.isArray(records) || records.length === 0) {
                          return "No attendance data available yet. Regular attendance is strongly correlated with better grades.";
                        }
                        const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length;
                        const rate = Math.round((presentCount / records.length) * 100);
                        if (rate >= 90) return `Your attendance rate is ${rate}%—excellent! Studies show that consistent attendance leads to 15-20% higher grades.`;
                        if (rate >= 75) return `Your attendance rate is ${rate}%. Try to improve it above 90% to maximize your academic potential.`;
                        return `Your attendance rate is ${rate}%, which is below recommended levels. Improving attendance could significantly boost your grades.`;
                      })()}
                    </p>
                  </div>

                  {/* Study Goals */}
                  <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      <h4 className="font-semibold text-gray-900">Recommendations</h4>
                    </div>
                    <ul className="text-sm text-gray-600 space-y-2">
                      {performanceData?.active_goals?.length > 0 ? (
                        performanceData.active_goals.map((goal, i) => (
                          <li key={i} className="flex items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>{goal.title} — {goal.progress || 0}% complete</span>
                          </li>
                        ))
                      ) : (
                        <>
                          <li className="flex items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>Use the AI chat to get personalized study recommendations</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>Review your weakest subjects and allocate more study time</span>
                          </li>
                          <li className="flex items-start">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 mr-2 flex-shrink-0"></span>
                            <span>Maintain consistent attendance for better outcomes</span>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>

                {/* CTA to AI Chat */}
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 text-white text-center">
                  <svg className="w-12 h-12 mx-auto mb-3 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="text-xl font-bold mb-2">Want Deeper Insights?</h3>
                  <p className="text-purple-200 mb-4">
                    Click the AI chat button in the bottom-right corner to ask questions about your performance,
                    get study tips, and receive personalized improvement strategies.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Chat Floating Button */}
      {user?.role === 'student' && <PerformanceAIChat />}
    </div>
  );
}

export default AIAnalytics;
