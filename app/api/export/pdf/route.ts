import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { spermReports, lifestyleLogs, recommendations } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { getOrCreateUser } from "@/lib/auth";
import { eq, desc, gte } from "drizzle-orm";
import jsPDF from "jspdf";

// Generate PDF export of 30-day summary
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await getOrCreateUser(userId);

    // Get last 30 days of data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const thirtyDaysAgoStr = thirtyDaysAgo.toISOString().split('T')[0];

    // Fetch reports
    const reports = await db
      .select()
      .from(spermReports)
      .where(eq(spermReports.userId, userId))
      .orderBy(desc(spermReports.reportDate));

    // Fetch lifestyle logs
    const logs = await db
      .select()
      .from(lifestyleLogs)
      .where(eq(lifestyleLogs.userId, userId))
      .orderBy(desc(lifestyleLogs.logDate))
      .limit(30);

    // Fetch top recommendations
    const recs = await db
      .select()
      .from(recommendations)
      .where(eq(recommendations.userId, userId))
      .orderBy(desc(recommendations.createdAt))
      .limit(5);

    // Calculate stats
    const currentScore = reports[0]?.adjustedScore || 0;
    const averageScore = reports.length > 0
      ? Math.round(reports.reduce((sum, r) => sum + (r.adjustedScore || 0), 0) / reports.length)
      : 0;

    // Create PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPos = 20;

    // Title
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235); // Primary color
    doc.text('Sperm Health Summary', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;

    // Date range
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`30-Day Report • Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(20, yPos, pageWidth - 20, yPos);
    yPos += 10;

    // Stats Section
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Key Statistics', 20, yPos);
    yPos += 8;

    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    
    // Create stat boxes
    const boxWidth = (pageWidth - 50) / 4;
    const statBoxes = [
      { label: 'Current Score', value: currentScore.toString() },
      { label: 'Average Score', value: averageScore.toString() },
      { label: 'Total Reports', value: reports.length.toString() },
      { label: 'Days Tracked', value: logs.length.toString() },
    ];

    statBoxes.forEach((stat, index) => {
      const x = 20 + (index * (boxWidth + 5));
      
      // Draw box
      doc.setFillColor(240, 240, 250);
      doc.roundedRect(x, yPos, boxWidth, 20, 3, 3, 'F');
      
      // Value
      doc.setFontSize(14);
      doc.setTextColor(37, 99, 235);
      doc.text(stat.value, x + boxWidth / 2, yPos + 8, { align: 'center' });
      
      // Label
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(stat.label, x + boxWidth / 2, yPos + 15, { align: 'center' });
    });
    yPos += 30;

    // Score Trend Section
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Score Trend (Last 6 Reports)', 20, yPos);
    yPos += 8;

    if (reports.length > 0) {
      // Simple line chart
      const chartHeight = 40;
      const chartWidth = pageWidth - 40;
      const chartX = 20;
      const chartY = yPos;

      // Draw chart background
      doc.setFillColor(250, 250, 250);
      doc.rect(chartX, chartY, chartWidth, chartHeight, 'F');

      // Get last 6 reports for chart
      const chartReports = reports.slice(0, 6).reverse();
      
      if (chartReports.length > 1) {
        const maxScore = 100;
        const minScore = 0;
        const scoreRange = maxScore - minScore;

        // Draw grid lines
        doc.setDrawColor(220, 220, 220);
        for (let i = 0; i <= 4; i++) {
          const gridY = chartY + (chartHeight / 4) * i;
          doc.line(chartX, gridY, chartX + chartWidth, gridY);
        }

        // Draw line
        doc.setDrawColor(37, 99, 235);
        doc.setLineWidth(2);

        for (let i = 0; i < chartReports.length - 1; i++) {
          const x1 = chartX + (chartWidth / (chartReports.length - 1)) * i;
          const x2 = chartX + (chartWidth / (chartReports.length - 1)) * (i + 1);
          
          const score1 = chartReports[i].adjustedScore || 0;
          const score2 = chartReports[i + 1].adjustedScore || 0;
          
          const y1 = chartY + chartHeight - ((score1 - minScore) / scoreRange * chartHeight);
          const y2 = chartY + chartHeight - ((score2 - minScore) / scoreRange * chartHeight);
          
          doc.line(x1, y1, x2, y2);
          
          // Draw points
          doc.circle(x1, y1, 2, 'F');
          if (i === chartReports.length - 2) {
            doc.circle(x2, y2, 2, 'F');
          }
        }

        // Draw score labels
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        chartReports.forEach((report, index) => {
          const x = chartX + (chartWidth / (chartReports.length - 1)) * index;
          const score = report.adjustedScore || 0;
          doc.text(score.toString(), x, chartY + chartHeight + 5, { align: 'center' });
        });
      }

      yPos += chartHeight + 15;
    } else {
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('No reports available', 20, yPos);
      yPos += 15;
    }

    // Recent Reports Section
    doc.setFontSize(16);
    doc.setTextColor(0, 0, 0);
    doc.text('Recent Reports', 20, yPos);
    yPos += 8;

    if (reports.length > 0) {
      doc.setFontSize(9);
      
      // Table headers
      doc.setFillColor(240, 240, 250);
      doc.rect(20, yPos - 4, pageWidth - 40, 8, 'F');
      
      doc.setTextColor(60, 60, 60);
      doc.text('Date', 25, yPos);
      doc.text('Score', 80, yPos);
      doc.text('Concentration', 110, yPos);
      doc.text('Motility', 155, yPos);
      yPos += 8;

      // Table rows (max 5)
      doc.setTextColor(0, 0, 0);
      reports.slice(0, 5).forEach((report, index) => {
        if (yPos > pageHeight - 30) return; // Prevent overflow

        if (index % 2 === 0) {
          doc.setFillColor(250, 250, 250);
          doc.rect(20, yPos - 4, pageWidth - 40, 7, 'F');
        }

        doc.text(new Date(report.reportDate).toLocaleDateString(), 25, yPos);
        doc.text((report.adjustedScore || 0).toString(), 80, yPos);
        doc.text(report.concentration ? `${report.concentration} M/mL` : 'N/A', 110, yPos);
        doc.text(report.progressiveMotility ? `${report.progressiveMotility}%` : 'N/A', 155, yPos);
        yPos += 7;
      });
      yPos += 10;
    }

    // Top Recommendations Section
    if (yPos < pageHeight - 40 && recs.length > 0) {
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Top Recommendations', 20, yPos);
      yPos += 8;

      doc.setFontSize(10);
      recs.slice(0, 3).forEach((rec, index) => {
        if (yPos > pageHeight - 20) return;

        // Priority indicator
        const priorityColor = rec.priority === 'critical' ? [220, 38, 38] as [number, number, number] :
                             rec.priority === 'high' ? [249, 115, 22] as [number, number, number] :
                             [59, 130, 246] as [number, number, number];
        
        doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2]);
        doc.circle(25, yPos - 1, 2, 'F');

        doc.setTextColor(0, 0, 0);
        doc.text(`${index + 1}. ${rec.title}`, 30, yPos);
        yPos += 5;

        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        const descLines = doc.splitTextToSize(rec.description, pageWidth - 50);
        doc.text(descLines.slice(0, 2), 30, yPos);
        yPos += 12;
      });
    }

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      'This report is generated for informational purposes only. Consult with a healthcare professional for medical advice.',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    // Generate PDF buffer
    const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="sperm-health-summary-${new Date().toISOString().split('T')[0]}.pdf"`,
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
