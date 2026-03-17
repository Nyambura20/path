import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNotification } from '../utils/NotificationContext';
import apiClient from '../services/api';

function VerifyEmail() {
  const location = useLocation();
  const email = location.state?.email || '';
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);
  const { addNotification } = useNotification();

  const handleResend = async () => {
    if (!email) {
      addNotification('No email address found. Please register again.', 'error');
      return;
    }
    setResendLoading(true);
    try {
      await apiClient.resendVerification(email);
      setResendSent(true);
      addNotification('Verification email resent! Please check your inbox.', 'success');
    } catch (error) {
      addNotification(error.message || 'Failed to resend. Please try again.', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Check your email</h2>
          <p className="text-gray-600">
            We sent a verification link to
          </p>
          {email && (
            <p className="text-primary-600 font-semibold mt-1">{email}</p>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              Click the link in the email to verify your account and start using BrightPath.
              The link will expire in <span className="font-semibold">24 hours</span>.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 text-center">Didn't receive the email?</p>

            {resendSent ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                <p className="text-sm text-green-800 font-medium">
                  ✓ Verification email resent successfully!
                </p>
              </div>
            ) : (
              <button
                onClick={handleResend}
                disabled={resendLoading}
                className="w-full btn-secondary flex items-center justify-center gap-2"
              >
                {resendLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Resend verification email'
                )}
              </button>
            )}
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>
              Already verified?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
            <p className="mt-2">
              Wrong email?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Register again
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default VerifyEmail;
