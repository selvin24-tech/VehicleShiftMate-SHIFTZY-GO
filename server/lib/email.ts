import nodemailer from "nodemailer";

/**
 * Thin wrapper around a standard SMTP transport, driven entirely by env vars
 * so the app stays portable (works with Gmail app passwords, SendGrid/Postmark
 * SMTP relays, or any other SMTP provider — no vendor lock-in):
 *   EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM
 *
 * When unconfigured, isConfigured() is false and callers return a clear
 * "not configured" error instead of pretending an email was sent — mirrors
 * the same honest pattern used for Stripe/Cashfree in this codebase.
 */

const HOST = process.env.EMAIL_HOST || "";
const PORT = Number(process.env.EMAIL_PORT || 587);
const USER = process.env.EMAIL_USER || "";
const PASS = process.env.EMAIL_PASS || "";
const FROM = process.env.EMAIL_FROM || USER;

export function isConfigured(): boolean {
  return Boolean(HOST && USER && PASS);
}

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: HOST,
      port: PORT,
      secure: PORT === 465,
      auth: { user: USER, pass: PASS },
    });
  }
  return transporter;
}

export async function sendMail(to: string, subject: string, html: string, text?: string) {
  if (!isConfigured()) throw new Error("Email service is not configured");
  await getTransporter().sendMail({ from: FROM, to, subject, html, text });
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await sendMail(
    to,
    "Reset your ShiftzyGo password",
    `<p>We received a request to reset your ShiftzyGo password.</p>
     <p><a href="${resetUrl}">Click here to choose a new password</a>. This link expires in 30 minutes.</p>
     <p>If you didn't request this, you can safely ignore this email.</p>`,
    `Reset your ShiftzyGo password: ${resetUrl} (expires in 30 minutes). If you didn't request this, ignore this email.`
  );
}
