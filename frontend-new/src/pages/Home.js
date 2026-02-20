import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

function Home() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      emoji: '📚',
      title: 'Course Management',
      description: 'Browse, enroll & track all your courses in one cozy place. Never miss a lesson again!',
      gradient: 'from-pink-500 to-rose-600',
      bg: 'bg-gradient-to-br from-pink-50 to-rose-100',
      border: 'border-pink-200',
      shadow: 'hover:shadow-pink-200/50',
    },
    {
      emoji: '🧠',
      title: 'Performance Prediction',
      description: 'Our ML models predict your future grades and flag at-risk areas before they become problems!',
      gradient: 'from-violet-500 to-purple-600',
      bg: 'bg-gradient-to-br from-violet-50 to-purple-100',
      border: 'border-violet-200',
      shadow: 'hover:shadow-violet-200/50',
    },
    {
      emoji: '📋',
      title: 'Attendance Tracking',
      description: 'Automatic attendance with real-time alerts. Stay on top of your presence effortlessly!',
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-100',
      border: 'border-emerald-200',
      shadow: 'hover:shadow-emerald-200/50',
    },
    {
      emoji: '💬',
      title: 'AI Performance Assistant',
      description: 'Chat with your personal AI advisor about your grades, identify weak areas & get actionable improvement tips!',
      gradient: 'from-amber-500 to-orange-600',
      bg: 'bg-gradient-to-br from-amber-50 to-orange-100',
      border: 'border-amber-200',
      shadow: 'hover:shadow-amber-200/50',
    },
  ];

  const stats = [
    { label: 'Active Students', value: '1,200+', emoji: '🎓', color: 'text-pink-600' },
    { label: 'Courses Available', value: '50+', emoji: '📖', color: 'text-violet-600' },
    { label: 'Expert Teachers', value: '25+', emoji: '👩‍🏫', color: 'text-emerald-600' },
    { label: 'Success Rate', value: '95%', emoji: '✨', color: 'text-amber-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-violet-50 overflow-hidden">

      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="relative min-h-[90vh] flex items-center">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-10 -left-10 w-72 h-72 bg-pink-200/40 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/3 -right-20 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-amber-200/25 rounded-full blur-3xl animate-float-slow" />

          {/* Decorative sparkles */}
          <span className="absolute top-20 left-[15%] text-3xl animate-sparkle select-none">✦</span>
          <span className="absolute top-40 right-[20%] text-2xl animate-sparkle select-none" style={{ animationDelay: '0.6s' }}>✧</span>
          <span className="absolute bottom-32 left-[10%] text-2xl animate-sparkle select-none" style={{ animationDelay: '1.2s' }}>✦</span>
          <span className="absolute top-60 left-[60%] text-xl animate-sparkle select-none" style={{ animationDelay: '0.3s' }}>❋</span>
          <span className="absolute bottom-48 right-[15%] text-3xl animate-sparkle select-none" style={{ animationDelay: '0.9s' }}>✧</span>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left - Text */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-pink-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
                <span className="text-sm">🌸</span>
                <span className="text-sm font-medium text-primary-600">AI-Powered Performance Prediction</span>
              </div>

              <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
                <span className="text-gray-900">Predict.</span>{' '}
                <span className="bg-gradient-to-r from-primary-600 to-pink-500 bg-clip-text text-transparent">Improve.</span>
                <br />
                <span className="text-gray-900">Shine with</span>{' '}
                <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">BrightPath</span>
                <span className="inline-block animate-wiggle ml-2">✨</span>
              </h1>

              <p className="text-lg md:text-xl text-gray-600 max-w-xl mb-10 leading-relaxed">
                An AI-powered platform that predicts student performance, identifies 
                at-risk learners, and provides personalized guidance. Track grades, 
                attendance &amp; get intelligent insights, all in one place!
              </p>

              {isAuthenticated ? (
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    to="/dashboard"
                    className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <span>Go to Dashboard</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                  </Link>
                  <Link
                    to="/courses"
                    className="inline-flex items-center justify-center gap-2 bg-white border-2 border-primary-200 text-primary-700 font-bold py-4 px-8 rounded-2xl hover:bg-primary-50 hover:border-primary-300 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    📖 Browse Courses
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <Link
                    to="/register"
                    className="group relative inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40 transition-all duration-300 transform hover:-translate-y-0.5"
                  >
                    <span>Get Started Free</span>
                  </Link>
                  <Link
                    to="/about"
                    className="inline-flex items-center justify-center gap-2 bg-white border-2 border-violet-200 text-violet-700 font-bold py-4 px-8 rounded-2xl hover:bg-violet-50 hover:border-violet-300 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                  >
                    ✨ Learn More
                  </Link>
                </div>
              )}
            </div>

            {/* Right - Anime-inspired illustration card */}
            <div className="relative flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                {/* Main card */}
                <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-100 p-8 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                  <div className="text-center mb-6">
                    <div className="text-7xl mb-4 animate-float">📊</div>
                    <h3 className="text-2xl font-bold text-gray-900">Performance Hub</h3>
                    <p className="text-gray-500 mt-1">AI-driven predictions & insights</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: '📊', label: 'Grade Predictions', tag: 'AI-Powered', tagColor: 'bg-pink-100 text-pink-700' },
                      { icon: '🤖', label: 'AI Performance Chat', tag: 'Smart', tagColor: 'bg-violet-100 text-violet-700' },
                      { icon: '📅', label: 'Attendance Tracking', tag: 'Auto', tagColor: 'bg-emerald-100 text-emerald-700' },
                      { icon: '⚠️', label: 'Risk Detection', tag: 'Predictive', tagColor: 'bg-amber-100 text-amber-700' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-4 py-3 hover:bg-gray-100 transition-colors">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="font-medium text-gray-800 flex-1">{item.label}</span>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${item.tagColor}`}>{item.tag}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating mini-cards */}
                <div className="absolute -top-6 -left-6 bg-white rounded-2xl shadow-lg border border-pink-100 px-4 py-3 animate-float">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">💯</span>
                    <div>
                      <p className="text-xs text-gray-500">Average</p>
                      <p className="font-bold text-primary-600">A+</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -bottom-4 -right-4 bg-white rounded-2xl shadow-lg border border-violet-100 px-4 py-3 animate-float-delayed">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🔥</span>
                    <div>
                      <p className="text-xs text-gray-500">Streak</p>
                      <p className="font-bold text-violet-600">15 days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS SECTION ═══════════ */}
      <section className="relative py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200 shadow-xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, i) => (
                <div key={i} className="text-center group">
                  <div className="text-4xl mb-2 group-hover:scale-125 transition-transform duration-300">{stat.emoji}</div>
                  <div className={`text-3xl md:text-4xl font-extrabold ${stat.color} mb-1`}>{stat.value}</div>
                  <div className="text-gray-500 text-sm font-medium">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES SECTION ═══════════ */}
      <section className="py-20 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <span className="absolute top-10 right-[10%] text-2xl animate-sparkle select-none" style={{ animationDelay: '0.5s' }}>✦</span>
          <span className="absolute bottom-20 left-[8%] text-xl animate-sparkle select-none" style={{ animationDelay: '1s' }}>✧</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-100 rounded-full px-4 py-1.5 mb-4">
              <span>⚡</span>
              <span className="text-sm font-semibold text-violet-700">Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Powered by AI to Help You{' '}
              <span className="bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">Succeed</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Smart tools that predict performance, detect risks early &amp; give actionable insights ♡
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className={`${f.bg} border ${f.border} rounded-3xl p-8 hover:shadow-2xl ${f.shadow} transition-all duration-300 transform hover:-translate-y-1 group`}
              >
                <div className="flex items-start gap-5">
                  <div className={`w-16 h-16 bg-gradient-to-br ${f.gradient} rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 flex-shrink-0`}>
                    {f.emoji}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{f.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-pink-300/10 rounded-full blur-3xl" />
          <span className="absolute top-16 right-[12%] text-white/20 text-3xl animate-sparkle select-none">✦</span>
          <span className="absolute bottom-16 left-[12%] text-white/20 text-2xl animate-sparkle select-none" style={{ animationDelay: '0.7s' }}>✧</span>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 border border-white/20">
              <span>🗺️</span>
              <span className="text-sm font-semibold text-white/90">How It Works</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Three Simple Steps ✨
            </h2>
            <p className="text-lg text-primary-200 max-w-2xl mx-auto">
              Getting started is as easy as 1-2-3. Your journey to better grades begins here!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', emoji: '📝', title: 'Sign Up', desc: 'Create your account in seconds. Pick your role as student, teacher, or admin.', color: 'from-pink-400 to-rose-500' },
              { step: '2', emoji: '🔍', title: 'Track & Predict', desc: 'Enter your grades and attendance, then let our AI predict your future performance.', color: 'from-violet-400 to-purple-500' },
              { step: '3', emoji: '🏆', title: 'Improve', desc: 'Get AI-powered insights on weak areas and personalized advice to boost your grades!', color: 'from-amber-400 to-orange-500' },
            ].map((s, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 text-center hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 group">
                <div className={`w-20 h-20 bg-gradient-to-br ${s.color} rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl group-hover:scale-110 transition-transform`}>
                  <span className="text-4xl">{s.emoji}</span>
                </div>
                <div className="text-sm font-bold text-white/60 mb-2">STEP {s.step}</div>
                <h3 className="text-2xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-primary-200 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA SECTION ═══════════ */}
      {!isAuthenticated && (
        <section className="py-24 relative">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-pink-100 to-violet-100 rounded-full blur-3xl opacity-60" />
            <span className="absolute top-12 left-[20%] text-3xl animate-sparkle select-none">✦</span>
            <span className="absolute bottom-12 right-[20%] text-2xl animate-sparkle select-none" style={{ animationDelay: '0.5s' }}>✧</span>
          </div>

          <div className="relative max-w-4xl mx-auto px-4 text-center">
            <div className="text-6xl mb-6 animate-float">🌟</div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
              Ready to Start Your{' '}
              <span className="bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">Journey</span>?
            </h2>
            <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of students and educators who are already using BrightPath 
              to predict, track &amp; improve academic performance. Start your journey today! 🎉
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40 transition-all duration-300 transform hover:-translate-y-1"
              >
                <span>Get Started Free</span>
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 font-bold py-4 px-10 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1"
              >
                Learn More ✨
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
