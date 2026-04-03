import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useNotification } from '../utils/NotificationContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import PublicLayout from '../layouts/PublicLayout';

function Register() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    password_confirm: '',
    first_name: '',
    last_name: '',
    role: 'student',
  });
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (formData.password !== formData.password_confirm) {
      addNotification('Passwords do not match.', 'error');
      setLoading(false);
      return;
    }

    try {
      await register(formData);
      addNotification('Registration successful. Check your email for verification.', 'success');
      navigate('/verify-email', { state: { email: formData.email } });
    } catch (error) {
      addNotification(error.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicLayout>
      <div className="mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-2xl items-center px-4 py-10">
        <Card className="w-full">
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold text-neutral-900">Create Your Account</h1>
            <p className="mt-2 text-sm text-neutral-600">Join BrightPath as a student, teacher, or admin.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="First Name"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="First name"
                required
              />
              <Input
                label="Last Name"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Last name"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Choose a username"
                required
              />
              <Select label="Role" name="role" value={formData.role} onChange={handleChange}>
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Administrator</option>
              </Select>
            </div>

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
            />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <Input
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                required
              />
              <Input
                label="Confirm Password"
                name="password_confirm"
                type="password"
                value={formData.password_confirm}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-neutral-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary-700 hover:text-primary-800">
              Sign in
            </Link>
          </p>
        </Card>
      </div>
    </PublicLayout>
  );
}

export default Register;
