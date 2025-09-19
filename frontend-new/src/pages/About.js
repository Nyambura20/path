import React from 'react';
import { Link } from 'react-router-dom';

function About() {
  const features = [
    {
      title: 'Intelligent Course Management',
      description: 'Advanced course creation, enrollment tracking, and curriculum management with automated prerequisites and scheduling.',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
  gradient: 'from-green-500 to-emerald-500',
  bgGradient: 'from-green-50 to-emerald-50',
  borderColor: 'border-green-100'
    },
    {
      title: 'AI-Powered Performance Analytics',
      description: 'Machine learning algorithms analyze student performance patterns to provide predictive insights and personalized recommendations.',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-100'
    },
    {
      title: 'Real-Time Attendance Monitoring',
      description: 'Automated attendance tracking with instant alerts for absenteeism and comprehensive reporting for parents and administrators.',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-100'
    },
    {
      title: 'Comprehensive User Management',
      description: 'Role-based access control for students, teachers, and administrators with detailed profile management and communication tools.',
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-100'
    },
  ];

  const benefits = [
    {
      title: 'For Students',
      items: [
        'Track academic progress in real-time',
        'Receive personalized learning recommendations',
        'Access course materials and schedules',
        'Monitor attendance and performance metrics',
        'Set and track study goals',
      ],
  gradient: 'from-green-500 to-emerald-500',
  bgGradient: 'from-green-50 to-emerald-50',
      emoji: '👨‍🎓'
    },
    {
      title: 'For Teachers',
      items: [
        'Manage courses and student enrollments',
        'Create assessments and track grades',
        'Monitor class attendance automatically',
        'Generate detailed performance reports',
        'Identify at-risk students early',
      ],
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      emoji: '👩‍🏫'
    },
    {
      title: 'For Administrators',
      items: [
        'Oversee institution-wide operations',
        'Generate comprehensive analytics',
        'Manage user accounts and permissions',
        'Track institutional performance metrics',
        'Export data for reporting and compliance',
      ],
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      emoji: '👨‍💼'
    },
  ];

  const techFeatures = [
    {
      title: 'Secure',
      description: 'Enterprise-grade security with data encryption and secure access controls.',
      icon: '🔒',
  gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Fast',
      description: 'Optimized performance with modern web technologies and cloud infrastructure.',
      icon: '⚡',
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      title: 'Scalable',
      description: 'Built to grow with your institution, from small schools to large universities.',
      icon: '📈',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      title: 'Mobile-First',
      description: 'Responsive design that works perfectly on all devices and screen sizes.',
      icon: '📱',
      gradient: 'from-purple-500 to-pink-500'
    },
  ];

  return (
  <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23667eea' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
  <div className="relative bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              {/* Floating elements for visual appeal */}
              <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute top-32 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
              <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg animate-pulse delay-500"></div>
              
              <div className="relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  About{' '}
                  <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    BrightPath
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-green-100 mb-8 leading-relaxed">
                  BrightPath is a comprehensive educational management platform designed to 
                  streamline academic operations, enhance learning outcomes, and provide 
                  data-driven insights for educational institutions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We believe that technology should enhance education, not complicate it. 
                BrightPath was created to bridge the gap between traditional educational 
                methods and modern digital solutions.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our platform empowers educators with intelligent tools, provides students 
                with personalized learning experiences, and gives administrators the 
                insights they need to make informed decisions.
              </p>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105 inline-block"
              >
                Join Our Community
              </Link>
            </div>
            <div className="bg-gradient-to-br from-green-600 via-emerald-600 to-green-700 rounded-2xl p-8 text-white shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 flex items-center">
                <span className="text-3xl mr-3">✨</span>
                Platform Highlights
              </h3>
              <ul className="space-y-4">
                {[
                  'AI-powered performance predictions',
                  'Real-time attendance monitoring',
                  'Comprehensive grade management',
                  'Role-based access control'
                ].map((highlight, index) => (
                  <li key={index} className="flex items-start">
                    <div className="flex-shrink-0 w-6 h-6 bg-white/20 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-green-100">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              Cutting-Edge Features
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Discover the powerful capabilities that make BrightPath the ideal 
              choice for modern educational institutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className={`bg-gradient-to-br ${feature.bgGradient} border ${feature.borderColor} rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
                <div className="flex items-start space-x-4">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.gradient} rounded-xl flex items-center justify-center text-white flex-shrink-0`}>
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-700 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-6">
              Benefits for Everyone
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              BrightPath is designed to serve the unique needs of all stakeholders 
              in the educational ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className={`bg-gradient-to-br ${benefit.bgGradient} rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
                <div className="text-center mb-6">
                  <div className="text-6xl mb-4">{benefit.emoji}</div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {benefit.title}
                  </h3>
                </div>
                <ul className="space-y-3">
                  {benefit.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start">
                      <div className={`flex-shrink-0 w-5 h-5 bg-gradient-to-r ${benefit.gradient} rounded-full flex items-center justify-center mr-3 mt-0.5`}>
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700 font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              BrightPath leverages cutting-edge technologies to deliver a fast, 
              secure, and reliable educational platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {techFeatures.map((tech, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 text-center">
                <div className="text-6xl mb-4">{tech.icon}</div>
                <h3 className={`text-xl font-bold bg-gradient-to-r ${tech.gradient} bg-clip-text text-transparent mb-3`}>
                  {tech.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {tech.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700"></div>
        
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        {/* Floating elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Educational Experience?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join the growing community of educators and students who are already 
            experiencing the benefits of BrightPath and transforming their educational journey.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 hover:from-yellow-300 hover:to-orange-300 font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
            >
              Get Started Today
            </Link>
            <Link 
              to="/courses" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-xl transition-all duration-300 backdrop-blur-sm"
            >
              Explore Courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;
