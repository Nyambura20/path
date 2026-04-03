import React from 'react';
import { useAuth } from '../utils/AuthContext';
import NotificationsPanel from '../components/NotificationsPanel';
import DashboardLayout from '../layouts/DashboardLayout';
import Card from '../components/ui/Card';

function Notifications() {
  const { user } = useAuth();

  if (!user) {
    return (
      <DashboardLayout title="Notifications" subtitle="Please sign in to access your notifications.">
        <Card>
          <p className="text-sm text-neutral-700">You need to be logged in to view notifications.</p>
        </Card>
      </DashboardLayout>
    );
  }

  return <NotificationsPanel isStandalone={true} />;
}

export default Notifications;
