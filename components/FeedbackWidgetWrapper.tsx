'use client';

import '@/lib/feedback-widget/index.css';
import { useAuth } from '@/lib/auth';
import { FeedbackWidget } from '@/lib/feedback-widget/index.mjs';

export default function FeedbackWidgetWrapper() {
  const { user } = useAuth();

  return (
    <FeedbackWidget
      projectId="pk_cc65b4b8b85dd706a20d61938e539e79bcd576f91bbbf1c5"
      apiBaseUrl="https://api.sassmaker.com"
      userEmail={user?.email}
      userName={user?.name}
    />
  );
}
