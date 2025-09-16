import React from 'react';
import { useAuth } from '../utils/AuthContext';
import NotificationsPanel from '../components/NotificationsPanel';

function Notifications() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900">Please Log In</h2>
            <p className="text-gray-600 mt-2">You need to be logged in to view notifications.</p>
          </div>
        </div>
      </div>
    );
  }

  return <NotificationsPanel isStandalone={true} />;
}

export default Notifications;
