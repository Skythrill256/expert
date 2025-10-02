// Email template styles
const baseStyles = `
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f5; }
    .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
    .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: bold; }
    .content { padding: 40px 30px; }
    .content h2 { color: #18181b; font-size: 24px; margin-bottom: 16px; }
    .content p { color: #52525b; line-height: 1.6; margin-bottom: 16px; }
    .stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 24px 0; }
    .stat-card { background: #f4f4f5; border-radius: 8px; padding: 20px; text-align: center; }
    .stat-value { font-size: 32px; font-weight: bold; color: #3b82f6; margin-bottom: 8px; }
    .stat-label { font-size: 14px; color: #71717a; }
    .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; }
    .footer { background-color: #f4f4f5; padding: 30px; text-align: center; color: #71717a; font-size: 14px; }
    .recommendation { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 16px 0; border-radius: 4px; }
    .recommendation-title { color: #92400e; font-weight: 600; margin-bottom: 8px; }
    .recommendation-desc { color: #78350f; font-size: 14px; }
  </style>
`;

interface WelcomeEmailParams {
  userName: string;
  dashboardUrl: string;
}

export function welcomeEmail({ userName, dashboardUrl }: WelcomeEmailParams): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>${baseStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Sperm Health Tracker!</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName}!</h2>
          <p>We're excited to have you on board. Your journey to better reproductive health starts now.</p>
          <p>With our platform, you can:</p>
          <ul style="color: #52525b; line-height: 1.8;">
            <li>📊 Track your sperm analysis reports over time</li>
            <li>📈 Monitor your health trends and improvements</li>
            <li>💡 Get personalized recommendations</li>
            <li>📝 Log your daily lifestyle habits</li>
            <li>📧 Receive weekly progress summaries</li>
          </ul>
          <center>
            <a href="${dashboardUrl}" class="button">Go to Dashboard</a>
          </center>
        </div>
        <div class="footer">
          <p>You're receiving this email because you signed up for Sperm Health Tracker.</p>
          <p>If you have any questions, feel free to reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

interface NewReportEmailParams {
  userName: string;
  reportDate: string;
  currentScore: number;
  previousScore?: number;
  dashboardUrl: string;
}

export function newReportEmail({ userName, reportDate, currentScore, previousScore, dashboardUrl }: NewReportEmailParams): string {
  const hasImproved = previousScore && currentScore > previousScore;
  const change = previousScore ? Math.round(((currentScore - previousScore) / previousScore) * 100) : 0;
  
  return `
    <!DOCTYPE html>
    <html>
    <head>${baseStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📋 New Report Added</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName}!</h2>
          <p>Your new sperm analysis report from <strong>${new Date(reportDate).toLocaleDateString()}</strong> has been processed.</p>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${currentScore}</div>
              <div class="stat-label">Current Score</div>
            </div>
            ${previousScore ? `
              <div class="stat-card">
                <div class="stat-value" style="color: ${hasImproved ? '#10b981' : '#ef4444'}">
                  ${change > 0 ? '+' : ''}${change}%
                </div>
                <div class="stat-label">Change</div>
              </div>
            ` : ''}
          </div>
          
          ${hasImproved ? 
            '<p style="color: #10b981; font-weight: 600;">🎉 Great job! Your score has improved!</p>' :
            '<p>Keep tracking your progress and following your recommendations for better results.</p>'
          }
          
          <center>
            <a href="${dashboardUrl}" class="button">View Full Report</a>
          </center>
        </div>
        <div class="footer">
          <p>Track your progress and get insights on your dashboard.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

interface WeeklySummaryEmailParams {
  userName: string;
  weekStart: string;
  weekEnd: string;
  currentScore: number;
  averageScore: number;
  reportsCount: number;
  healthStreak: number;
  lifestyleConsistency: number;
  dashboardUrl: string;
}

export function weeklySummaryEmail({
  userName,
  weekStart,
  weekEnd,
  currentScore,
  averageScore,
  reportsCount,
  healthStreak,
  lifestyleConsistency,
  dashboardUrl
}: WeeklySummaryEmailParams): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>${baseStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Your Weekly Health Summary</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName}!</h2>
          <p>Here's your health summary for ${new Date(weekStart).toLocaleDateString()} - ${new Date(weekEnd).toLocaleDateString()}</p>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-value">${currentScore}</div>
              <div class="stat-label">Current Score</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${averageScore}</div>
              <div class="stat-label">Average Score</div>
            </div>
            <div class="stat-card">
              <div class="stat-value">${reportsCount}</div>
              <div class="stat-label">Total Reports</div>
            </div>
            <div class="stat-card">
              <div class="stat-value" style="color: #f59e0b;">${healthStreak}</div>
              <div class="stat-label">🔥 Day Streak</div>
            </div>
          </div>
          
          <p><strong>Lifestyle Consistency:</strong> ${lifestyleConsistency}%</p>
          <p>Keep up the great work! Consistency is key to improving your reproductive health.</p>
          
          <center>
            <a href="${dashboardUrl}" class="button">View Full Dashboard</a>
          </center>
        </div>
        <div class="footer">
          <p>You're receiving this weekly summary because you enabled email notifications.</p>
          <p>You can manage your notification preferences in settings.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

interface NewRecommendationsEmailParams {
  userName: string;
  recommendations: Array<{
    title: string;
    description: string;
    priority: string;
  }>;
  dashboardUrl: string;
}

export function newRecommendationsEmail({ userName, recommendations, dashboardUrl }: NewRecommendationsEmailParams): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>${baseStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💡 New Health Recommendations</h1>
        </div>
        <div class="content">
          <h2>Hi ${userName}!</h2>
          <p>We've generated new personalized recommendations based on your latest data.</p>
          
          ${recommendations.map(rec => `
            <div class="recommendation">
              <div class="recommendation-title">${rec.title}</div>
              <div class="recommendation-desc">${rec.description}</div>
            </div>
          `).join('')}
          
          <p>Following these recommendations can help improve your reproductive health over time.</p>
          
          <center>
            <a href="${dashboardUrl}/recommendations" class="button">View All Recommendations</a>
          </center>
        </div>
        <div class="footer">
          <p>Stay committed to your health journey!</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

interface ShareLinkEmailParams {
  recipientName?: string;
  senderName: string;
  shareUrl: string;
  expiresAt?: Date;
}

export function shareLinkEmail({ recipientName, senderName, shareUrl, expiresAt }: ShareLinkEmailParams): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>${baseStyles}</head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔗 Health Report Shared With You</h1>
        </div>
        <div class="content">
          <h2>Hi${recipientName ? ` ${recipientName}` : ''}!</h2>
          <p><strong>${senderName}</strong> has shared their health report with you.</p>
          <p>Click the button below to view the shared report:</p>
          
          <center>
            <a href="${shareUrl}" class="button">View Shared Report</a>
          </center>
          
          ${expiresAt ? `<p style="color: #71717a; font-size: 14px;">This link will expire on ${expiresAt.toLocaleDateString()}.</p>` : ''}
        </div>
        <div class="footer">
          <p>This is a secure, read-only view of health data.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
