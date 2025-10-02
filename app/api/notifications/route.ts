import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import {
  sendWelcomeEmail,
  sendNewReportNotification,
  sendWeeklySummary,
  sendNewRecommendationsNotification,
} from '@/lib/email/notifications';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { type, data } = body;

    let result = false;

    switch (type) {
      case 'welcome':
        result = await sendWelcomeEmail(userId);
        break;

      case 'new_report':
        if (!data?.reportDate || !data?.currentScore) {
          return NextResponse.json(
            { error: 'Missing required fields: reportDate, currentScore' },
            { status: 400 }
          );
        }
        result = await sendNewReportNotification({
          userId,
          reportDate: data.reportDate,
          currentScore: data.currentScore,
          previousScore: data.previousScore,
        });
        break;

      case 'weekly_summary':
        if (!data?.weekStart || !data?.weekEnd || !data?.currentScore) {
          return NextResponse.json(
            { error: 'Missing required fields for weekly summary' },
            { status: 400 }
          );
        }
        result = await sendWeeklySummary({
          userId,
          ...data,
        });
        break;

      case 'new_recommendations':
        if (!data?.recommendations || !Array.isArray(data.recommendations)) {
          return NextResponse.json(
            { error: 'Missing or invalid recommendations array' },
            { status: 400 }
          );
        }
        result = await sendNewRecommendationsNotification({
          userId,
          recommendations: data.recommendations,
        });
        break;

      default:
        return NextResponse.json(
          { error: `Unknown notification type: ${type}` },
          { status: 400 }
        );
    }

    if (result) {
      return NextResponse.json({
        success: true,
        message: `${type} notification sent successfully`,
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          message: 'Notification not sent (user notifications disabled or error occurred)',
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

// GET endpoint to test email configuration
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      message: 'Notification API is working',
      availableTypes: [
        'welcome',
        'new_report',
        'weekly_summary',
        'new_recommendations',
      ],
      instructions: 'Send POST request with { type, data } in body',
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to check notification status' },
      { status: 500 }
    );
  }
}
