import React from 'react';
import { useNotification } from '../utils/NotificationContext';

function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  if (notifications.length === 0) return null;

  const getNotificationStyles = (type) => {
    const baseStyles = 'group relative w-full max-w-md overflow-hidden rounded-2xl border p-4 shadow-2xl backdrop-blur-sm ring-1 ring-black/5 transition-all';
    
    switch (type) {
      case 'success':
        return `${baseStyles} bg-emerald-50/95 border-emerald-200 text-emerald-900 shadow-emerald-900/10 dark:bg-emerald-950/75 dark:border-emerald-700/60 dark:text-emerald-100 dark:ring-emerald-400/20`;
      case 'error':
        return `${baseStyles} bg-red-50/95 border-red-200 text-red-900 shadow-red-900/10 dark:bg-red-950/75 dark:border-red-700/60 dark:text-red-100 dark:ring-red-400/20`;
      case 'warning':
        return `${baseStyles} bg-amber-50/95 border-amber-200 text-amber-900 shadow-amber-900/10 dark:bg-amber-950/75 dark:border-amber-700/60 dark:text-amber-100 dark:ring-amber-400/20`;
      default:
        return `${baseStyles} bg-sky-50/95 border-sky-200 text-sky-900 shadow-sky-900/10 dark:bg-sky-950/75 dark:border-sky-700/60 dark:text-sky-100 dark:ring-sky-400/20`;
    }
  };

  const getIconWrapStyles = (type) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/55 dark:text-emerald-200 dark:ring-emerald-700/60';
      case 'error':
        return 'bg-red-100 text-red-700 ring-1 ring-red-200 dark:bg-red-900/55 dark:text-red-200 dark:ring-red-700/60';
      case 'warning':
        return 'bg-amber-100 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-900/55 dark:text-amber-200 dark:ring-amber-700/60';
      default:
        return 'bg-sky-100 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-900/55 dark:text-sky-200 dark:ring-sky-700/60';
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return (
          <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        );
      case 'error':
        return (
          <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.664-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  return (
    <div className="fixed right-4 top-4 z-[90] w-[min(92vw,28rem)] space-y-3">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getNotificationStyles(notification.type)} animate-slide-up`}
        >
          <div className="absolute inset-y-0 left-0 w-1.5 bg-current/20" aria-hidden="true" />
          <div className="flex items-start gap-3 pr-9">
            <div className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl ${getIconWrapStyles(notification.type)}`}>
              {getIcon(notification.type)}
            </div>
            <div className="flex-1">
              <p className="text-[0.95rem] font-semibold leading-snug">{notification.message}</p>
            </div>
          </div>
          <button
            onClick={() => removeNotification(notification.id)}
            className="absolute right-2.5 top-2.5 inline-flex h-7 w-7 items-center justify-center rounded-lg text-current/65 transition hover:bg-black/10 hover:text-current dark:hover:bg-white/10"
            aria-label="Dismiss notification"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}

export default NotificationContainer;
