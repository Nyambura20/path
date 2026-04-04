import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PublicLayout from '../layouts/PublicLayout';

const features = [
  {
    title: 'Performance Prediction',
    description: 'Use machine learning insights to detect risk early and improve outcomes.',
  },
  {
    title: 'Attendance Tracking',
    description: 'Monitor attendance trends with structured records and actionable alerts.',
  },
  {
    title: 'Role-Based Dashboards',
    description: 'Students, teachers, and admins each get focused workflows and reporting.',
  },
  {
    title: 'AI Performance Chat',
    description: 'Ask targeted questions and receive personalized guidance based on your data.',
  },
];

function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <PublicLayout>
      <section className="relative overflow-hidden border-b border-neutral-200 bg-white dark:border-[var(--bp-border)] dark:bg-[var(--bp-bg)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(127,29,53,0.09),_transparent_50%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(167,74,95,0.08),_transparent_50%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div className="animate-fade-in">
            <p className="mb-4 inline-flex rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700 dark:border-primary-900/30 dark:bg-primary-950/30 dark:text-primary-400">
              Smart Academic Platform
            </p>
            <h1 className="text-5xl font-bold leading-tight text-neutral-900 dark:text-white">
              Predict. Act Early. Improve Outcomes.
            </h1>
            <p className="mt-5 max-w-xl text-base text-neutral-600 dark:text-[var(--bp-text-muted)]">
              BrightPath provides a structured dashboard experience for academic performance, attendance, and risk insights with a clear, maintainable workflow.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {isAuthenticated ? (
                <Link to="/dashboard">
                  <Button>Go to Dashboard</Button>
                </Link>
              ) : (
                <Link to="/register">
                  <Button>Create Account</Button>
                </Link>
              )}
              <Link to="/about">
                <Button variant="secondary">Learn More</Button>
              </Link>
            </div>
          </div>

          <Card className="animate-slide-up border-primary-100 dark:border-primary-900/30">
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Platform Snapshot</h2>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="panel p-4 text-center dark:bg-[var(--bp-surface-soft)]">
                <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">1200+</p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-[var(--bp-text-subtle)]">Active Students</p>
              </div>
              <div className="panel p-4 text-center dark:bg-[var(--bp-surface-soft)]">
                <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">50+</p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-[var(--bp-text-subtle)]">Available Courses</p>
              </div>
              <div className="panel p-4 text-center dark:bg-[var(--bp-surface-soft)]">
                <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">95%</p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-[var(--bp-text-subtle)]">Success Rate</p>
              </div>
              <div className="panel p-4 text-center dark:bg-[var(--bp-surface-soft)]">
                <p className="text-2xl font-bold text-primary-700 dark:text-primary-400">24/7</p>
                <p className="mt-1 text-sm text-neutral-500 dark:text-[var(--bp-text-subtle)]">Insight Access</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-900 dark:text-white">Built for Clarity and Action</h2>
          <p className="mt-2 text-sm text-neutral-600 dark:text-[var(--bp-text-muted)]">
            Every experience is designed around readable data, fast decisions, and smooth workflows.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:border-primary-200 dark:hover:border-primary-600/50">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-[var(--bp-text-muted)]">{feature.description}</p>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}

export default Home;
