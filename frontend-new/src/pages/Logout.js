import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useNotification } from '../utils/NotificationContext';
import LoadingSpinner from '../components/LoadingSpinner';

function Logout() {
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('Logging you out...');
  const { logout, isAuthenticated } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      try {
        if (isAuthenticated) {
          await logout();
          setMessage('You have been logged out successfully!');
          addNotification('You have been logged out successfully!', 'success');
          
          // Redirect to home page after a short delay
          setTimeout(() => {
            navigate('/');
          }, 2000);
        } else {
          // User is already logged out
          setMessage('You are already logged out.');
          setTimeout(() => {
            navigate('/');
          }, 1500);
        }
      } catch (error) {
        console.error('Logout error:', error);
        setMessage('There was an error logging you out. Please try again.');
        addNotification('Logout failed. Please try again.', 'error');
        
        // Redirect anyway after delay
        setTimeout(() => {
          navigate('/');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    performLogout();
  }, [logout, isAuthenticated, navigate, addNotification]);

  return (
    <div className="min-h-screen bg-darkbg-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="h-16 w-16 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">B</span>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-100 mb-6">
            {loading ? 'Logging Out' : 'Logout Complete'}
          </h2>
          
          {loading ? (
            <div className="flex flex-col items-center space-y-4">
              <LoadingSpinner />
              <p className="text-gray-400 text-lg">{message}</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg 
                    className="h-6 w-6 text-green-600" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M5 13l4 4L19 7" 
                    />
                  </svg>
                </div>
                <p className="text-gray-300 text-lg">{message}</p>
                <p className="text-gray-500 text-sm mt-2">
                  Redirecting you to the home page...
                </p>
              </div>
              
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => navigate('/')}
                  className="btn-primary w-full"
                >
                  Go to Home Page
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="btn-outline w-full"
                >
                  Login Again
                </button>
              </div>
            </div>
          )}
        </div>
        
        {/* Thank you message */}
        {!loading && (
          <div className="bg-darkbg-800 rounded-lg p-6 border border-darkbg-700">
            <h3 className="text-lg font-semibold text-gray-100 mb-2">
              Thank you for using BrightPath!
            </h3>
            <p className="text-gray-400 text-sm">
              We hope to see you again soon. Your learning journey continues when you're ready.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Logout;
