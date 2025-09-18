import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';

function Home() {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      title: 'Course Management',
      description: 'Comprehensive course creation, enrollment, and tracking system for educational institutions.',
      gradient: 'from-blue-500 to-indigo-500',
      bgGradient: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-100'
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Performance Analytics',
      description: 'AI-powered insights and predictions to help students and teachers track academic progress.',
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
      borderColor: 'border-purple-100'
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      title: 'Attendance Tracking',
      description: 'Automated attendance management with real-time alerts and comprehensive reporting.',
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-100'
    },
    {
      icon: (
        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      title: 'User Management',
      description: 'Centralized management for students, teachers, and administrators with role-based access.',
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
      borderColor: 'border-orange-100'
    },
  ];

  const stats = [
    { label: 'Active Students', value: '1,200+', icon: '👨‍🎓', gradient: 'from-blue-600 to-indigo-600' },
    { label: 'Courses Available', value: '50+', icon: '📚', gradient: 'from-purple-600 to-pink-600' },
    { label: 'Expert Teachers', value: '25+', icon: '👩‍🏫', gradient: 'from-green-600 to-emerald-600' },
    { label: 'Success Rate', value: '95%', icon: '🎯', gradient: 'from-orange-600 to-red-600' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23667eea' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              {/* Floating elements for visual appeal */}
              <div className="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
              <div className="absolute top-32 right-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
              <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/10 rounded-full blur-lg animate-pulse delay-500"></div>
              
              <div className="relative z-10">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
                  Welcome to{' '}
                  <span className="block bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                    BrightPath
                  </span>
                </h1>
                <p className="text-xl md:text-2xl text-blue-100 max-w-4xl mx-auto mb-10 leading-relaxed">
                  A comprehensive educational management platform that empowers students, 
                  teachers, and administrators with intelligent tools for academic success.
                </p>
                
                {isAuthenticated ? (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                      to="/dashboard" 
                      className="bg-white text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
                    >
                      Go to Dashboard
                    </Link>
                    <Link 
                      to="/courses" 
                      className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-xl transition-all duration-300 backdrop-blur-sm"
                    >
                      Browse Courses
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link 
                      to="/register" 
                      className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 hover:from-yellow-300 hover:to-orange-300 font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
                    >
                      Get Started Free
                    </Link>
                    <Link 
                      to="/about" 
                      className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-xl transition-all duration-300 backdrop-blur-sm"
                    >
                      Learn More
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
                <div className="text-center">
                  <div className="text-4xl mb-3">{stat.icon}</div>
                  <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                    {stat.value}
                  </div>
                  <div className="text-gray-600 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Powerful Features for Modern Education
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Everything you need to manage, track, and enhance educational experiences 
              in one integrated platform.
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

      {/* How it Works Section */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
              How BrightPath Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Get started with our platform in three simple steps and unlock your educational potential.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Sign Up',
                description: 'Create your account as a student, teacher, or administrator to get started with our comprehensive platform.',
                gradient: 'from-blue-500 to-indigo-500',
                bgGradient: 'from-blue-50 to-indigo-50'
              },
              {
                step: '2',
                title: 'Explore',
                description: 'Browse courses, access your personalized dashboard, and explore all the powerful features available to you.',
                gradient: 'from-purple-500 to-pink-500',
                bgGradient: 'from-purple-50 to-pink-50'
              },
              {
                step: '3',
                title: 'Achieve',
                description: 'Track your progress, manage courses effectively, and achieve your educational goals with data-driven insights.',
                gradient: 'from-green-500 to-emerald-500',
                bgGradient: 'from-green-50 to-emerald-50'
              }
            ].map((step, index) => (
              <div key={index} className={`bg-gradient-to-br ${step.bgGradient} rounded-2xl p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:scale-105`}>
                <div className={`w-20 h-20 bg-gradient-to-r ${step.gradient} rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg`}>
                  <span className="text-white text-3xl font-bold">{step.step}</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{step.title}</h3>
                <p className="text-gray-700 leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
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
              Ready to Start Your Educational Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Join thousands of students and educators who are already using BrightPath 
              to achieve their academic goals and transform their learning experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-yellow-400 to-orange-400 text-gray-900 hover:from-yellow-300 hover:to-orange-300 font-bold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:scale-105"
              >
                Get Started Free
              </Link>
              <Link 
                to="/about" 
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 font-bold py-4 px-8 rounded-xl transition-all duration-300 backdrop-blur-sm"
              >
                Learn More
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default Home;
