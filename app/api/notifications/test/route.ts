import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendWelcomeEmail } from '@/lib/email/notifications';

// Test endpoint to send a welcome email
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Sending test welcome email to user:', userId);
    const result = await sendWelcomeEmail(userId);

    if (result) {
      return NextResponse.json({
        success: true,
        message: 'Test email sent successfully! Check your inbox.',
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'Email not sent. Check if notifications are enabled in your settings or if the email service is configured correctly.',
      });
    }
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to send test email',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
