import { db } from '@/db';
import { user, userSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendEmail } from './index';
import {
  welcomeEmail,
  newReportEmail,
  weeklySummaryEmail,
  newRecommendationsEmail,
  shareLinkEmail,
} from './templates';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface UserEmailData {
  email: string;
  name: string;
  emailNotificationsEnabled: boolean;
}

async function getUserEmailData(userId: string): Promise<UserEmailData | null> {
  try {
    const userData = await db
      .select({
        email: user.email,
        name: user.name,
        emailNotificationsEnabled: userSettings.emailNotifications,
      })
      .from(user)
      .leftJoin(userSettings, eq(user.id, userSettings.userId))
      .where(eq(user.id, userId))
      .limit(1);

    if (userData.length === 0) {
      console.warn(`User not found: ${userId}`);
      return null;
    }

    const data = userData[0];
    return {
      email: data.email,
      name: data.name,
      emailNotificationsEnabled: data.emailNotificationsEnabled ?? true,
    };
  } catch (error) {
    console.error('Error fetching user email data:', error);
    return null;
  }
}

export async function sendWelcomeEmail(userId: string): Promise<boolean> {
  const userData = await getUserEmailData(userId);
  
  if (!userData || !userData.emailNotificationsEnabled) {
    console.log(`Welcome email skipped for user ${userId} (notifications disabled or user not found)`);
    return false;
  }

  const html = welcomeEmail({
    userName: userData.name.split(' ')[0] || userData.name,
    dashboardUrl: `${BASE_URL}/dashboard`,
  });

  const result = await sendEmail({
    to: userData.email,
    subject: '🎉 Welcome to Sperm Health Tracker!',
    html,
    type: 'welcome',
  });

  return result.success;
}

interface NewReportNotificationParams {
  userId: string;
  reportDate: string;
  currentScore: number;
  previousScore?: number;
}

export async function sendNewReportNotification({
  userId,
  reportDate,
  currentScore,
  previousScore,
}: NewReportNotificationParams): Promise<boolean> {
  const userData = await getUserEmailData(userId);
  
  if (!userData || !userData.emailNotificationsEnabled) {
    return false;
  }

  const html = newReportEmail({
    userName: userData.name.split(' ')[0] || userData.name,
    reportDate,
    currentScore,
    previousScore,
    dashboardUrl: `${BASE_URL}/dashboard`,
  });

  const result = await sendEmail({
    to: userData.email,
    subject: '📋 New Health Report Processed',
    html,
    type: 'new_report',
  });

  return result.success;
}

interface WeeklySummaryParams {
  userId: string;
  weekStart: string;
  weekEnd: string;
  currentScore: number;
  averageScore: number;
  reportsCount: number;
  healthStreak: number;
  lifestyleConsistency: number;
}

export async function sendWeeklySummary(params: WeeklySummaryParams): Promise<boolean> {
  const userData = await getUserEmailData(params.userId);
  
  if (!userData || !userData.emailNotificationsEnabled) {
    return false;
  }

  // Check if user has weekly reports enabled
  const settings = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, params.userId))
    .limit(1);

  if (settings.length === 0 || !settings[0].weeklyReports) {
    console.log(`Weekly summary skipped for user ${params.userId} (weekly reports disabled)`);
    return false;
  }

  const html = weeklySummaryEmail({
    userName: userData.name.split(' ')[0] || userData.name,
    ...params,
    dashboardUrl: `${BASE_URL}/dashboard`,
  });

  const result = await sendEmail({
    to: userData.email,
    subject: '📊 Your Weekly Health Summary',
    html,
    type: 'weekly_summary',
  });

  return result.success;
}

interface NewRecommendationsParams {
  userId: string;
  recommendations: Array<{
    title: string;
    description: string;
    priority: string;
  }>;
}

export async function sendNewRecommendationsNotification({
  userId,
  recommendations,
}: NewRecommendationsParams): Promise<boolean> {
  const userData = await getUserEmailData(userId);
  
  if (!userData || !userData.emailNotificationsEnabled) {
    return false;
  }

  // Check if user has recommendations notifications enabled
  const settings = await db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, userId))
    .limit(1);

  if (settings.length === 0 || !settings[0].recommendationsNotifications) {
    return false;
  }

  const html = newRecommendationsEmail({
    userName: userData.name.split(' ')[0] || userData.name,
    recommendations,
    dashboardUrl: `${BASE_URL}/dashboard`,
  });

  const result = await sendEmail({
    to: userData.email,
    subject: '💡 New Personalized Recommendations',
    html,
    type: 'new_recommendations',
  });

  return result.success;
}

interface ShareLinkParams {
  recipientEmail: string;
  recipientName?: string;
  senderName: string;
  shareToken: string;
  expiresAt?: Date;
}

export async function sendShareLinkEmail({
  recipientEmail,
  recipientName,
  senderName,
  shareToken,
  expiresAt,
}: ShareLinkParams): Promise<boolean> {
  const html = shareLinkEmail({
    recipientName,
    senderName,
    shareUrl: `${BASE_URL}/shared/${shareToken}`,
    expiresAt,
  });

  const result = await sendEmail({
    to: recipientEmail,
    subject: `${senderName} shared their health report with you`,
    html,
    type: 'share_link',
  });

  return result.success;
}
