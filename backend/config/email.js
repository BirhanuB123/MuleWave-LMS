const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create reusable transporter
const createTransporter = () => {
  // For development, use ethereal.email (fake SMTP service)
  // For production, use a real email service (Gmail, SendGrid, AWS SES, etc.)
  
  if (process.env.NODE_ENV === 'production') {
    // Production email configuration
    return nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  } else {
    // Development email configuration (using ethereal for testing)
    // In development, emails will be logged but not actually sent
    return nodemailer.createTransporter({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER || 'test@test.com',
        pass: process.env.EMAIL_PASSWORD || 'testpassword'
      }
    });
  }
};

// Send email function
const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'MuleWave LMS'}" <${process.env.EMAIL_FROM || 'noreply@mulewave.com'}>`,
      to,
      subject,
      text,
      html,
      attachments
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`Email sent: ${info.messageId}`);
    
    // Preview URL (for ethereal.email in development)
    if (process.env.NODE_ENV !== 'production') {
      logger.info(`Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
    }

    return {
      success: true,
      messageId: info.messageId
    };
  } catch (error) {
    logger.error(`Email send error: ${error.message}`);
    throw new Error(`Email could not be sent: ${error.message}`);
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to MuleWave LMS!';
  const text = `Hello ${user.firstName},\n\nWelcome to MuleWave LMS! We're excited to have you on board.\n\nStart exploring our courses and begin your learning journey today!\n\nBest regards,\nThe MuleWave Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Welcome to MuleWave LMS!</h2>
      <p>Hello ${user.firstName},</p>
      <p>Welcome to MuleWave LMS! We're excited to have you on board.</p>
      <p>Start exploring our courses and begin your learning journey today!</p>
      <a href="${process.env.FRONTEND_URL}/courses" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">Browse Courses</a>
      <p style="margin-top: 24px;">Best regards,<br>The MuleWave Team</p>
    </div>
  `;

  return sendEmail({ to: user.email, subject, text, html });
};

// Send enrollment confirmation
const sendEnrollmentEmail = async (user, course) => {
  const subject = `Enrolled: ${course.title}`;
  const text = `Hello ${user.firstName},\n\nYou have successfully enrolled in "${course.title}".\n\nStart learning now!\n\nBest regards,\nThe MuleWave Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Enrollment Confirmed!</h2>
      <p>Hello ${user.firstName},</p>
      <p>You have successfully enrolled in <strong>${course.title}</strong>.</p>
      <p>You can now access all course materials and start learning!</p>
      <a href="${process.env.FRONTEND_URL}/my-courses" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">Go to My Courses</a>
      <p style="margin-top: 24px;">Best regards,<br>The MuleWave Team</p>
    </div>
  `;

  return sendEmail({ to: user.email, subject, text, html });
};

// Send assignment notification
const sendAssignmentNotification = async (user, course, assignment) => {
  const subject = `New Assignment: ${assignment.title}`;
  const text = `Hello ${user.firstName},\n\nA new assignment "${assignment.title}" has been posted in "${course.title}".\n\nDue Date: ${new Date(assignment.dueDate).toLocaleDateString()}\n\nBest regards,\nThe MuleWave Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">New Assignment Posted</h2>
      <p>Hello ${user.firstName},</p>
      <p>A new assignment <strong>"${assignment.title}"</strong> has been posted in your course <strong>"${course.title}"</strong>.</p>
      <p><strong>Due Date:</strong> ${new Date(assignment.dueDate).toLocaleDateString()}</p>
      <p><strong>Max Points:</strong> ${assignment.maxPoints}</p>
      <a href="${process.env.FRONTEND_URL}/courses/${course._id}/play" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Assignment</a>
      <p style="margin-top: 24px;">Best regards,<br>The MuleWave Team</p>
    </div>
  `;

  return sendEmail({ to: user.email, subject, text, html });
};

// Send announcement notification
const sendAnnouncementEmail = async (user, course, announcement) => {
  const subject = `[${course.title}] ${announcement.title}`;
  const text = `Hello ${user.firstName},\n\n${announcement.content}\n\nBest regards,\n${course.instructor}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: ${announcement.priority === 'urgent' ? '#ef4444' : '#6366f1'}; color: white; padding: 16px; border-radius: 6px 6px 0 0;">
        <h2 style="margin: 0;">${announcement.title}</h2>
        <p style="margin: 8px 0 0 0; opacity: 0.9;">Course: ${course.title}</p>
      </div>
      <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 6px 6px;">
        <p>Hello ${user.firstName},</p>
        <div style="margin: 16px 0;">${announcement.content}</div>
        <a href="${process.env.FRONTEND_URL}/courses/${course._id}/play" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Course</a>
        <p style="margin-top: 24px;">Best regards,<br>Your Instructor</p>
      </div>
    </div>
  `;

  return sendEmail({ to: user.email, subject, text, html });
};

// Send grade notification
const sendGradeNotification = async (user, course, assignment, grade) => {
  const subject = `Graded: ${assignment.title}`;
  const percentage = (grade.points / assignment.maxPoints * 100).toFixed(1);
  const text = `Hello ${user.firstName},\n\nYour assignment "${assignment.title}" in "${course.title}" has been graded.\n\nScore: ${grade.points}/${assignment.maxPoints} (${percentage}%)\n\nFeedback: ${grade.feedback || 'No feedback provided'}\n\nBest regards,\nThe MuleWave Team`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #6366f1;">Assignment Graded</h2>
      <p>Hello ${user.firstName},</p>
      <p>Your assignment <strong>"${assignment.title}"</strong> in <strong>"${course.title}"</strong> has been graded.</p>
      <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin: 16px 0;">
        <p style="margin: 0;"><strong>Score:</strong> ${grade.points}/${assignment.maxPoints} (${percentage}%)</p>
        ${grade.feedback ? `<p style="margin: 12px 0 0 0;"><strong>Feedback:</strong> ${grade.feedback}</p>` : ''}
      </div>
      <a href="${process.env.FRONTEND_URL}/courses/${course._id}/play" style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">View Details</a>
      <p style="margin-top: 24px;">Best regards,<br>The MuleWave Team</p>
    </div>
  `;

  return sendEmail({ to: user.email, subject, text, html });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendEnrollmentEmail,
  sendAssignmentNotification,
  sendAnnouncementEmail,
  sendGradeNotification
};
