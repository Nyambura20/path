import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../utils/AuthContext';
import apiClient from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PerformanceAIChat from '../components/PerformanceAIChat';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const COLORS = ['#7f1d35', '#a74a5f', '#c17484', '#6a7280', '#4b5563'];

function AIAnalytics() {
  const { user } = useAuth();
  const [performanceData, setPerformanceData] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [perfData, attData] = await Promise.all([
        apiClient.getPerformanceSummary().catch(() => null),
        apiClient.getAttendanceRecords().catch(() => null),
      ]);
      setPerformanceData(perfData);
      setAttendanceData(attData);
    } catch (err) {
      setError(err.message || 'Failed to load analytics data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const gradeTrend = useMemo(() => {
    const grades = performanceData?.recent_grades || [];
    return [...grades].reverse().map((g, i) => ({
      name: g.assessment || `Assessment ${i + 1}`,
      grade: Math.round(g.percentage || 0),
    }));
  }, [performanceData]);

  const coursePerformance = useMemo(() => {
    const grades = performanceData?.recent_grades || [];
    const byCourse = {};

    grades.forEach((g) => {
      const key = g.course || 'Unknown';
      if (!byCourse[key]) byCourse[key] = { total: 0, count: 0 };
      byCourse[key].total += g.percentage || 0;
      byCourse[key].count += 1;
    });

    return Object.entries(byCourse).map(([name, value]) => ({
      name,
      average: Math.round(value.total / value.count),
    }));
  }, [performanceData]);

  const attendanceBreakdown = useMemo(() => {
    const records = attendanceData?.results || attendanceData || [];
    const counts = { Present: 0, Late: 0, Absent: 0 };

    if (!Array.isArray(records)) return [];

    records.forEach((r) => {
      if (r.status === 'present') counts.Present += 1;
      else if (r.status === 'late') counts.Late += 1;
      else counts.Absent += 1;
    });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [attendanceData]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'grades', label: 'Grades' },
    { id: 'attendance', label: 'Attendance' },
  ];

  if (loading) {
    return (
      <DashboardLayout title="AI Analytics" subtitle="Loading AI analytics and trend insights.">
        <div className="py-12 text-center">
          <LoadingSpinner size="large" text="Loading AI analytics..." />
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout title="AI Analytics" subtitle="An error occurred while loading analytics.">
        <Card className="max-w-xl">
          <p className="text-sm text-red-700">{error}</p>
          <div className="mt-4">
            <Button onClick={fetchData}>Try Again</Button>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <>
      <DashboardLayout
        title="AI Performance Analytics"
        subtitle="Visualize performance and attendance trends through a consistent dashboard interface."
        actions={<Button variant="secondary" onClick={fetchData}>Refresh</Button>}
      >
        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-live="polite">
          <Card>
            <p className="text-sm text-neutral-500">Average Grade</p>
            <p className="mt-2 text-3xl font-bold text-primary-700">{performanceData?.average_grade ? `${performanceData.average_grade.toFixed(1)}%` : 'N/A'}</p>
          </Card>
          <Card>
            <p className="text-sm text-neutral-500">Courses</p>
            <p className="mt-2 text-3xl font-bold text-primary-700">{performanceData?.total_courses || 0}</p>
          </Card>
          <Card>
            <p className="text-sm text-neutral-500">Assessments</p>
            <p className="mt-2 text-3xl font-bold text-primary-700">{performanceData?.completed_assessments || 0}</p>
          </Card>
          <Card>
            <p className="text-sm text-neutral-500">At-Risk Courses</p>
            <p className="mt-2 text-3xl font-bold text-red-700">{performanceData?.at_risk_courses || 0}</p>
          </Card>
        </div>

        <div className="mb-6 rounded-2xl border border-neutral-300 bg-neutral-50 p-2" role="tablist" aria-label="Analytics tabs">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`analytics-panel-${tab.id}`}
                id={`analytics-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  activeTab === tab.id ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-700 hover:bg-primary-50 hover:text-primary-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeTab === 'overview' && (
          <div id="analytics-panel-overview" role="tabpanel" aria-labelledby="analytics-tab-overview" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <Card title="Course Performance">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={coursePerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d2d6db" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="average" fill="#7f1d35" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card title="Attendance Breakdown">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={attendanceBreakdown} dataKey="value" nameKey="name" outerRadius={110}>
                      {attendanceBreakdown.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'grades' && (
          <div id="analytics-panel-grades" role="tabpanel" aria-labelledby="analytics-tab-grades">
            <Card title="Grade Trend">
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={gradeTrend}>
                    <defs>
                      <linearGradient id="gradeArea" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7f1d35" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#7f1d35" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d2d6db" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Area type="monotone" dataKey="grade" stroke="#7f1d35" fill="url(#gradeArea)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div id="analytics-panel-attendance" role="tabpanel" aria-labelledby="analytics-tab-attendance">
            <Card title="Attendance Distribution">
              <p className="mb-4 text-sm text-neutral-600">Attendance status distribution helps identify consistency trends across periods.</p>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#d2d6db" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#a74a5f" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}
      </DashboardLayout>

      {user?.role === 'student' && <PerformanceAIChat />}
    </>
  );
}

export default AIAnalytics;
