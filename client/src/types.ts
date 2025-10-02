export interface User {
  id: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
}

export interface AnalyticsData {
  totalPosters: number;
  totalEvents: number;
  uniqueLogins: number;
  eventCTR: number;
  recentActivity: Array<{
    id: string;
    timestamp: string;
    eventType: string;
    userEmail?: string;
    eventTitle?: string;
  }>;
}
