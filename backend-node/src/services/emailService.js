const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const Handlebars = require('handlebars');
const { transporter } = require('../config/mailer');
const config = require('../config/env');
const logger = require('../utils/logger');

/**
 * Email Service.
 * Uses Nodemailer + Handlebars (replaces Spring Mail + Thymeleaf).
 * All email methods are async — fire-and-forget, non-blocking.
 */

const templatesDir = path.join(__dirname, '../emails/templates');

// ─── Template Loader ─────────────────────────────────────────────────────────

function loadTemplate(name) {
  const filePath = path.join(templatesDir, `${name}.hbs`);
  if (!fs.existsSync(filePath)) {
    logger.warn(`Email template not found: ${filePath}`);
    return null;
  }
  const source = fs.readFileSync(filePath, 'utf-8');
  return Handlebars.compile(source);
}

async function sendEmail(to, subject, html) {
  try {
    await transporter.sendMail({
      from: `"${config.mail.fromName}" <${config.mail.fromAddress}>`,
      to,
      subject,
      html,
    });
    logger.info(`Email sent to: ${to} — Subject: ${subject}`);
  } catch (err) {
    logger.error(`Email sending failed to ${to}: ${err.message}`);
  }
}

// ─── Email Methods ────────────────────────────────────────────────────────────

async function sendPasswordResetEmail(to, firstName, resetToken) {
  const template = loadTemplate('password-reset');
  if (!template) return;

  const resetUrl = `${config.app.frontendUrl}/reset-password?token=${resetToken}`;
  const html = template({ firstName, resetUrl, appName: config.app.name });
  await sendEmail(to, 'Reset Your Password', html);
}

async function sendAssetAssignmentEmail(to, employeeName, assetName, assetTag) {
  const template = loadTemplate('asset-assignment');
  if (!template) return;
  const html = template({ employeeName, assetName, assetTag, appName: config.app.name });
  await sendEmail(to, `Asset Assigned: ${assetName} (${assetTag})`, html);
}

async function sendWarrantyExpiryEmail(to, recipientName, assetName, assetTag, daysLeft) {
  const template = loadTemplate('warranty-expiry');
  if (!template) return;
  const html = template({ recipientName, assetName, assetTag, daysLeft, appName: config.app.name });
  const urgency = daysLeft <= 7 ? 'URGENT: ' : '';
  await sendEmail(to, `${urgency}Warranty Expiring: ${assetName} (${daysLeft} days)`, html);
}

async function sendMaintenanceCompleteEmail(to, recipientName, assetName, requestNumber) {
  const template = loadTemplate('maintenance-complete');
  if (!template) return;
  const html = template({ recipientName, assetName, requestNumber, appName: config.app.name });
  await sendEmail(to, `Maintenance Completed: ${requestNumber}`, html);
}

async function sendGenericNotificationEmail(to, recipientName, title, message) {
  const template = loadTemplate('generic-notification');
  if (!template) return;
  const html = template({ recipientName, title, message, appName: config.app.name });
  await sendEmail(to, title, html);
}

module.exports = {
  sendPasswordResetEmail,
  sendAssetAssignmentEmail,
  sendWarrantyExpiryEmail,
  sendMaintenanceCompleteEmail,
  sendGenericNotificationEmail,
};
