import sgMail from '@sendgrid/mail';
import { config } from '../config';
import type { InterviewSession, EvaluationMatrix } from '../types';
import { pdfService } from './pdfService';

export class EmailService {
  private initialized = false;

  constructor() {
    // Initialize SendGrid only if API key is available
    if (config.sendgridApiKey) {
      sgMail.setApiKey(config.sendgridApiKey);
      this.initialized = true;
    }
  }

  async sendFeedbackEmail(
    session: InterviewSession,
    matrix: EvaluationMatrix,
    recipientEmail: string,
    recipientName?: string
  ): Promise<{ success: boolean; message: string }> {
    if (!this.initialized) {
      return {
        success: false,
        message: 'Email service not configured. Please set SENDGRID_API_KEY in environment variables.'
      };
    }

    if (!recipientEmail || !this.isValidEmail(recipientEmail)) {
      return {
        success: false,
        message: 'Invalid recipient email address.'
      };
    }

    try {
      const htmlContent = pdfService.generateFeedbackHTML(session, matrix);
      const candidateName = recipientName || session.candidateName;
      
      const msg = {
        to: recipientEmail,
        from: config.senderEmail || 'noreply@interviewcopilot.com',
        subject: `Interview Feedback - ${session.role} Position`,
        text: this.generatePlainTextFeedback(session),
        html: this.wrapEmailHTML(htmlContent, candidateName),
      };

      await sgMail.send(msg);

      return {
        success: true,
        message: `Feedback email sent successfully to ${recipientEmail}`
      };
    } catch (error: any) {
      console.error('Error sending email:', error);
      const statusCode = error?.code || error?.response?.statusCode;
      let userMessage = `Failed to send email: ${error.message || 'Unknown error'}`;
      if (statusCode === 403) {
        userMessage = 'Email sending failed: Sender email is not verified in SendGrid. Please verify your sender email at SendGrid → Settings → Sender Authentication.';
      } else if (statusCode === 401) {
        userMessage = 'Email sending failed: Invalid SendGrid API key. Please check your SENDGRID_API_KEY in backend .env.';
      }
      return {
        success: false,
        message: userMessage
      };
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generatePlainTextFeedback(session: InterviewSession): string {
    const date = new Date(session.startTime).toLocaleDateString();
    const score = (session.interviewerOverallScore ?? session.overallScore ?? 0).toFixed(1);
    const recommendation = (session.interviewerRecommendation ?? session.recommendation ?? 'maybe').replace(/_/g, ' ').toUpperCase();

    return `
Interview Feedback Report

Candidate: ${session.candidateName}
Role: ${session.role}
Company: ${session.company}
Date: ${date}

Overall Score: ${score} / 5.0
Recommendation: ${recommendation}

Thank you for interviewing with us. Please find your detailed feedback in the HTML version of this email.

Best regards,
${session.company} Hiring Team
    `.trim();
  }

  private wrapEmailHTML(feedbackHTML: string, candidateName: string): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f3f4f6; font-family: Arial, sans-serif;">
  <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
      <h1 style="color: white; margin: 0; font-size: 24px;">Interview Feedback</h1>
      <p style="color: #dbeafe; margin: 10px 0 0 0;">Thank you for your time, ${candidateName}</p>
    </div>
    
    <!-- Content -->
    <div style="background: white; padding: 30px; border-radius: 0 0 8px 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
      <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
        Dear ${candidateName},
      </p>
      <p style="color: #374151; line-height: 1.6; margin-bottom: 20px;">
        Thank you for taking the time to interview with us. We appreciate your interest in our company and the effort you put into the interview process.
      </p>
      <p style="color: #374151; line-height: 1.6; margin-bottom: 30px;">
        Please find your detailed interview feedback below:
      </p>
      
      ${feedbackHTML}
      
      <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb;">
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6;">
          If you have any questions about this feedback, please don't hesitate to reach out to our HR team.
        </p>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin-top: 20px;">
          Best regards,<br>
          The Hiring Team
        </p>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
      <p style="margin: 0;">This is an automated message. Please do not reply to this email.</p>
      <p style="margin: 10px 0 0 0;">© ${new Date().getFullYear()} Interview Copilot. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
    `.trim();
  }
}

export const emailService = new EmailService();
