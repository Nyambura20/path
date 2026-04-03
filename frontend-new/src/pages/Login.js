import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useNotification } from '../utils/NotificationContext';
import apiClient from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import PublicLayout from '../layouts/PublicLayout';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const { login } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (e.target.name === 'email') {
      setUnverifiedEmail('');
      setResendSent(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      addNotification('Please enter both email and password.', 'error');
      return;
    }

    setLoading(true);
    setUnverifiedEmail('');

    try {
      await login(formData);
      addNotification('Login successful.', 'success');
      navigate('/dashboard');
    } catch (error) {
      if (error.code === 'email_not_verified' || error.message?.includes('verify your email')) {
        setUnverifiedEmail(formData.email);
      } else {
        const fallbackMessage = 'Invalid email or password. Please try again.';
        const shouldUseFallback =
          !error?.message ||
          error.message.includes('Request failed') ||
          /^Error:\s*\d+/.test(error.message);
        addNotification(shouldUseFallback ? fallbackMessage : error.message, 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await apiClient.resendVerification(unverifiedEmail);
      setResendSent(true);
      addNotification('Verification email resent. Check your inbox.', 'success');
    } catch (error) {
      addNotification(error.message || 'Failed to resend. Please try again.', 'error');
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-md items-center px-4 py-10">
        <Card className="w-full">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-neutral-900">Welcome Back</h1>
            <p className="mt-2 text-sm text-neutral-600">Sign in to continue to your dashboard.</p>
          </div>

          {unverifiedEmail && (
            <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-sm font-semibold text-amber-800">Email not verified</p>
              <p className="mt-1 text-sm text-amber-700">Please verify your email before signing in.</p>
              {resendSent ? (
                <p className="mt-2 text-sm font-medium text-emerald-700">Verification email sent to {unverifiedEmail}</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading}
                  className="mt-2 text-sm font-medium text-amber-700 underline hover:text-amber-900 disabled:opacity-60"
                >
                  {resendLoading ? 'Sending...' : 'Resend verification email'}
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
            />

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Do not have an account?{' '}
            <Link to="/register" className="font-semibold text-primary-700 hover:text-primary-800">
              Create one
            </Link>
          </p>
        </Card>
      </div>
    </PublicLayout>
  );
}

export default Login;
