import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not defined in environment variables');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

// Update this with your verified domain email
export const FROM_EMAIL = 'Sperm Health Tracker <onboarding@resend.dev>';

export type EmailType = 
  | 'welcome'
  | 'new_report'
  | 'weekly_summary'
  | 'new_recommendations'
  | 'health_milestone'
  | 'reminder'
  | 'share_link';

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  type?: EmailType;
}

export async function sendEmail({ to, subject, html, type = 'welcome' }: SendEmailParams) {
  try {
    const result = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });

    console.log(`Email sent successfully: ${type} to ${to}`, result);
    return { success: true, data: result };
  } catch (error) {
    console.error(`Failed to send ${type} email to ${to}:`, error);
    return { success: false, error };
  }
}
