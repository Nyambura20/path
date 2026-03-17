import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useNotification } from '../utils/NotificationContext';
import apiClient from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function EmailVerified() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { loginWithTokens } = useAuth();
  const { addNotification } = useNotification();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setErrorMessage('No verification token found in the URL.');
      setVerifying(false);
      return;
    }

    const verify = async () => {
      try {
        const data = await apiClient.verifyEmail(token);
        // Immediately log the user in using the returned tokens
        loginWithTokens(data);
        setSuccess(true);
        addNotification('Email verified! Welcome to BrightPath!', 'success');
        setTimeout(() => navigate('/dashboard'), 2000);
      } catch (error) {
        setErrorMessage(error.message || 'Verification failed. The link may have expired.');
      } finally {
        setVerifying(false);
      }
    };

    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="h-16 w-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">B</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Email Verification</h2>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 text-center space-y-6">
          {verifying && (
            <div className="space-y-4">
              <LoadingSpinner size="large" />
              <p className="text-gray-600">Verifying your email address…</p>
            </div>
          )}

          {!verifying && success && (
            <div className="space-y-4">
              <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Email Verified!</h3>
              <p className="text-gray-600">
                Your email has been verified successfully. Redirecting you to your dashboard…
              </p>
            </div>
          )}

          {!verifying && !success && (
            <div className="space-y-4">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Verification Failed</h3>
              <p className="text-red-600 text-sm">{errorMessage}</p>
              <div className="space-y-3 pt-2">
                <Link to="/login" className="block w-full btn-primary text-center">
                  Go to Login
                </Link>
                <Link to="/register" className="block w-full btn-secondary text-center">
                  Register a new account
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmailVerified;
