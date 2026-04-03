import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import PublicLayout from '../layouts/PublicLayout';

const pillars = [
  {
    title: 'Predictive Insight',
    description: 'Academic trends and intervention signals generated from real data patterns.',
  },
  {
    title: 'Operational Simplicity',
    description: 'Unified workflows for courses, attendance, performance, and notifications.',
  },
  {
    title: 'Role Clarity',
    description: 'Dedicated experiences for students, teachers, and administrators.',
  },
  {
    title: 'Scalable Foundation',
    description: 'Built for institutions ranging from small cohorts to larger campuses.',
  },
];

const audiences = [
  {
    role: 'Students',
    points: ['Track grades and attendance', 'Get personalized guidance', 'Identify weak areas early'],
  },
  {
    role: 'Teachers',
    points: ['Manage classes and assessments', 'Monitor attendance quickly', 'Prioritize students needing support'],
  },
  {
    role: 'Admins',
    points: ['Monitor institutional metrics', 'Manage user access by role', 'Improve reporting confidence'],
  },
];

function About() {
  return (
    <PublicLayout>
      <section className="border-b border-neutral-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h1 className="text-5xl font-bold text-neutral-900">About BrightPath</h1>
          <p className="mt-5 max-w-3xl text-base text-neutral-600">
            BrightPath is an education platform focused on measurable improvement. We combine readable dashboards, structured workflows, and machine learning guidance to help institutions make faster and better decisions.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-neutral-900">Core Platform Pillars</h2>
          <p className="mt-2 text-sm text-neutral-600">Designed for maintainability, reliability, and day-to-day usability.</p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {pillars.map((pillar) => (
            <Card key={pillar.title} className="hover:border-primary-200">
              <h3 className="text-lg font-semibold text-neutral-900">{pillar.title}</h3>
              <p className="mt-2 text-sm text-neutral-600">{pillar.description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="panel grid grid-cols-1 gap-5 p-6 md:grid-cols-3">
          {audiences.map((audience) => (
            <div key={audience.role} className="rounded-xl border border-neutral-200 bg-white p-4">
              <h3 className="text-lg font-semibold text-neutral-900">For {audience.role}</h3>
              <ul className="mt-3 space-y-2 text-sm text-neutral-600">
                {audience.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-8 flex gap-3">
          <Link to="/register">
            <Button>Get Started</Button>
          </Link>
          <Link to="/courses">
            <Button variant="secondary">View Courses</Button>
          </Link>
        </div>
      </section>
    </PublicLayout>
  );
}

export default About;
