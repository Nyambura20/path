import React from 'react';
import { Link } from 'react-router-dom';

function About() {
  const features = [
    {
      emoji: '📚',
      title: 'Smart Course Management',
      description: 'Advanced course creation, enrollment tracking & curriculum management with auto scheduling.',
      gradient: 'from-pink-500 to-rose-600',
      bg: 'bg-gradient-to-br from-pink-50 to-rose-100',
      border: 'border-pink-200',
    },
    {
      emoji: '🧠',
      title: 'AI Performance Prediction',
      description: 'Machine learning models predict future grades, detect at-risk students & provide actionable insights.',
      gradient: 'from-violet-500 to-purple-600',
      bg: 'bg-gradient-to-br from-violet-50 to-purple-100',
      border: 'border-violet-200',
    },
    {
      emoji: '📋',
      title: 'Real-Time Attendance',
      description: 'Automated tracking with instant alerts for absences and comprehensive visual reports.',
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-100',
      border: 'border-emerald-200',
    },
    {
      emoji: '👥',
      title: 'User Management',
      description: 'Role-based access for students, teachers & admins with detailed profiles & communication.',
      gradient: 'from-amber-500 to-orange-600',
      bg: 'bg-gradient-to-br from-amber-50 to-orange-100',
      border: 'border-amber-200',
    },
  ];

  const benefits = [
    {
      title: 'For Students',
      emoji: '🎓',
      gradient: 'from-pink-500 to-rose-600',
      bg: 'bg-gradient-to-br from-pink-50 to-rose-50',
      border: 'border-pink-200',
      items: [
        'Track academic progress in real-time',
        'Receive AI-powered performance predictions',
        'Access course materials & schedules',
        'Chat with AI about your grades & weak areas',
        'Get personalized improvement recommendations',
      ],
    },
    {
      title: 'For Teachers',
      emoji: '👩‍🏫',
      gradient: 'from-violet-500 to-purple-600',
      bg: 'bg-gradient-to-br from-violet-50 to-purple-50',
      border: 'border-violet-200',
      items: [
        'Manage courses & enrollments easily',
        'Create assessments & track grades',
        'Monitor class attendance automatically',
        'Generate detailed performance reports',
        'Identify at-risk students early with AI',
      ],
    },
    {
      title: 'For Admins',
      emoji: '🏢',
      gradient: 'from-emerald-500 to-teal-600',
      bg: 'bg-gradient-to-br from-emerald-50 to-teal-50',
      border: 'border-emerald-200',
      items: [
        'Oversee institution-wide operations',
        'Generate comprehensive analytics',
        'Manage user accounts & permissions',
        'Track institutional performance metrics',
        'Export data for reporting & compliance',
      ],
    },
  ];

  const techFeatures = [
    { title: 'Secure', description: 'Enterprise-grade security with encryption & role-based access.', emoji: '🔒', gradient: 'from-pink-500 to-rose-600' },
    { title: 'Fast', description: 'Optimized performance with modern tech & cloud infrastructure.', emoji: '⚡', gradient: 'from-amber-500 to-orange-600' },
    { title: 'Scalable', description: 'Built to grow, from small schools to large universities.', emoji: '📈', gradient: 'from-emerald-500 to-teal-600' },
    { title: 'Mobile-First', description: 'Responsive design that looks great on any device.', emoji: '📱', gradient: 'from-violet-500 to-purple-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-50 via-white to-pink-50 overflow-hidden">

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative py-24 overflow-hidden">
        {/* Background shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-violet-200/40 rounded-full blur-3xl animate-float" />
          <div className="absolute top-1/2 -left-20 w-72 h-72 bg-pink-200/30 rounded-full blur-3xl animate-float-delayed" />
          <span className="absolute top-16 left-[12%] text-3xl animate-sparkle select-none">✦</span>
          <span className="absolute top-32 right-[15%] text-2xl animate-sparkle select-none" style={{ animationDelay: '0.7s' }}>✧</span>
          <span className="absolute bottom-20 left-[50%] text-xl animate-sparkle select-none" style={{ animationDelay: '1.1s' }}>❋</span>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-violet-200 rounded-full px-4 py-1.5 mb-6 shadow-sm">
            <span>💜</span>
            <span className="text-sm font-medium text-violet-700">About Us</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6">
            <span className="text-gray-900">What is</span>{' '}
            <span className="bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">BrightPath</span>
            <span className="inline-block animate-wiggle ml-2">✨</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            BrightPath is a comprehensive performance prediction platform designed to 
            streamline academics, identify at-risk students early, and provide AI-driven 
            insights, all wrapped in a cute &amp; intuitive interface ♡
          </p>
        </div>
      </section>

      {/* ═══════════ MISSION ═══════════ */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left – Text */}
            <div>
              <div className="inline-flex items-center gap-2 bg-pink-100 rounded-full px-4 py-1.5 mb-4">
                <span>🎯</span>
                <span className="text-sm font-semibold text-pink-700">Our Mission</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
                Making Education{' '}
                <span className="bg-gradient-to-r from-primary-600 to-pink-500 bg-clip-text text-transparent">Better</span>
              </h2>
              <p className="text-lg text-gray-600 mb-5 leading-relaxed">
                We believe AI should enhance education, not complicate it. 
                BrightPath uses machine learning to predict student performance 
                and provide early interventions.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our platform empowers educators with predictive analytics, gives students 
                personalized AI guidance on their weak areas, and provides administrators the 
                insights they need, all in one beautiful place.
              </p>
              <Link
                to="/register"
                className="group inline-flex items-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary-600/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
              >
                <span>Join Our Community</span>
                <span className="group-hover:rotate-12 transition-transform">🌸</span>
              </Link>
            </div>

            {/* Right – Highlights card */}
            <div className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              {/* Background glow */}
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pink-400/15 rounded-full blur-2xl" />

              <div className="relative">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-3xl">⭐</span>
                  Platform Highlights
                </h3>
                <ul className="space-y-4">
                  {[
                    { text: 'ML-powered grade predictions', emoji: '🤖' },
                    { text: 'Real-time attendance monitoring', emoji: '📊' },
                    { text: 'At-risk student detection', emoji: '⚠️' },
                    { text: 'Personalized AI performance chat', emoji: '💬' },
                    { text: 'Beautiful & intuitive interface', emoji: '🎨' },
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/15 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span>{item.emoji}</span>
                      </div>
                      <span className="text-primary-100 font-medium">{item.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FEATURES ═══════════ */}
      <section className="py-20 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <span className="absolute top-10 right-[10%] text-2xl animate-sparkle select-none" style={{ animationDelay: '0.4s' }}>✦</span>
          <span className="absolute bottom-16 left-[8%] text-xl animate-sparkle select-none" style={{ animationDelay: '1s' }}>✧</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-violet-100 rounded-full px-4 py-1.5 mb-4">
              <span>✨</span>
              <span className="text-sm font-semibold text-violet-700">Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Cutting-Edge{' '}
              <span className="bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">Capabilities</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Discover the powerful features that make BrightPath the ideal choice for modern education ♡
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <div key={i} className={`${f.bg} border ${f.border} rounded-3xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group`}>
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

      {/* ═══════════ BENEFITS ═══════════ */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-pink-300/10 rounded-full blur-3xl" />
          <span className="absolute top-16 right-[10%] text-white/20 text-3xl animate-sparkle select-none">✦</span>
          <span className="absolute bottom-16 left-[10%] text-white/20 text-2xl animate-sparkle select-none" style={{ animationDelay: '0.7s' }}>✧</span>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-1.5 mb-4 border border-white/20">
              <span>💝</span>
              <span className="text-sm font-semibold text-white/90">Benefits</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Made for Everyone ✨
            </h2>
            <p className="text-lg text-primary-200 max-w-2xl mx-auto">
              BrightPath is designed to serve the unique needs of everyone in the educational ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((b, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-8 hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-3 group-hover:scale-110 transition-transform">{b.emoji}</div>
                  <h3 className="text-2xl font-bold text-white">{b.title}</h3>
                </div>
                <ul className="space-y-3">
                  {b.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <div className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-primary-100 font-medium text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TECHNOLOGY ═══════════ */}
      <section className="py-20 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <span className="absolute top-12 left-[15%] text-2xl animate-sparkle select-none">✦</span>
          <span className="absolute bottom-12 right-[15%] text-xl animate-sparkle select-none" style={{ animationDelay: '0.6s' }}>✧</span>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-amber-100 rounded-full px-4 py-1.5 mb-4">
              <span>🛠️</span>
              <span className="text-sm font-semibold text-amber-700">Technology</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Built with{' '}
              <span className="bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">Modern Tech</span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Powered by cutting-edge technologies for a fast, secure &amp; delightful experience.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {techFeatures.map((t, i) => (
              <div key={i} className="bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 text-center group">
                <div className="text-5xl mb-4 group-hover:scale-125 transition-transform duration-300">{t.emoji}</div>
                <h3 className={`text-lg font-bold bg-gradient-to-r ${t.gradient} bg-clip-text text-transparent mb-2`}>{t.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{t.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="py-24 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-violet-100 to-pink-100 rounded-full blur-3xl opacity-60" />
          <span className="absolute top-12 left-[20%] text-3xl animate-sparkle select-none">✦</span>
          <span className="absolute bottom-12 right-[20%] text-2xl animate-sparkle select-none" style={{ animationDelay: '0.5s' }}>✧</span>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <div className="text-6xl mb-6 animate-float">🚀</div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6">
            Ready to{' '}
            <span className="bg-gradient-to-r from-primary-600 to-violet-600 bg-clip-text text-transparent">Transform</span>{' '}
            Your Education?
          </h2>
          <p className="text-lg text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join the growing community of educators and students already experiencing 
            the magic of BrightPath. Your brighter academic future starts here! ✨
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="group inline-flex items-center justify-center gap-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white font-bold py-4 px-10 rounded-2xl shadow-lg shadow-primary-600/30 hover:shadow-xl hover:shadow-primary-600/40 transition-all duration-300 transform hover:-translate-y-1"
            >
              <span>Get Started Today</span>
              <span className="group-hover:rotate-12 transition-transform text-lg">💫</span>
            </Link>
            <Link
              to="/courses"
              className="inline-flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-700 font-bold py-4 px-10 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all duration-300 shadow-sm hover:shadow-md transform hover:-translate-y-1"
            >
              Explore Courses 📖
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
