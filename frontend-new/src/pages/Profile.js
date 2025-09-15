import React, { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext';
import { useNotification } from '../utils/NotificationContext';
import apiClient from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';

function Profile() {
  const { user, updateUser } = useAuth();
  const { addNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    bio: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        bio: user.bio || '',
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedUser = await apiClient.updateProfile(formData);
      updateUser(updatedUser);
      addNotification('Profile updated successfully!', 'success');
      setEditing(false);
    } catch (err) {
      addNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        first_name: user.first_name || '',
        last_name: user.last_name || '',
        email: user.email || '',
        phone_number: user.phone_number || '',
        bio: user.bio || '',
      });
    }
    setEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <LoadingSpinner size="large" text="Loading profile..." />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your personal information and account settings</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Profile Header */}
          <div className="bg-gradient-primary p-8 text-white">
            <div className="flex items-center">
              <div className="h-20 w-20 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-6">
                <span className="text-2xl font-bold text-white">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  {user.first_name} {user.last_name}
                </h2>
                <p className="text-primary-100 capitalize">{user.role}</p>
                <p className="text-primary-200 text-sm">{user.email}</p>
              </div>
            </div>
          </div>

          {/* Profile Content */}
          <div className="p-8">
            {!editing ? (
              // View Mode
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                  <button
                    onClick={() => setEditing(true)}
                    className="btn-primary"
                  >
                    Edit Profile
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                      {user.first_name || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                      {user.last_name || 'Not provided'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                      {user.email}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                      {user.phone_number || 'Not provided'}
                    </p>
                  </div>
                </div>

                {(user.bio || user.role === 'student' || user.role === 'teacher') && (
                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {user.role === 'teacher' ? 'Bio/Specialization' : 'Bio'}
                    </label>
                    <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                      {user.bio || 'No bio provided'}
                    </p>
                  </div>
                )}

                {/* Additional Info */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <h4 className="text-md font-medium text-gray-900 mb-4">Account Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md capitalize">
                        {user.role}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                        {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'Unknown'}
                      </p>
                    </div>

                    {user.student_id && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                          {user.student_id}
                        </p>
                      </div>
                    )}

                    {user.employee_id && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                        <p className="text-gray-900 bg-gray-50 p-3 rounded-md">
                          {user.employee_id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // Edit Mode
              <form onSubmit={handleSubmit}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Edit Personal Information</h3>
                  <div className="space-x-2">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="btn-primary"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="first_name"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="last_name"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      id="phone_number"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                    {user.role === 'teacher' ? 'Bio/Specialization' : 'Bio'}
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder={user.role === 'teacher' ? 'Tell us about your teaching experience and specializations...' : 'Tell us a bit about yourself...'}
                  />
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
