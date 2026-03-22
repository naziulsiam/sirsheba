import { Resend } from 'resend'

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'noreply@sirsheba.app'

export async function sendOTPEmail(to: string, name: string, otp: string): Promise<boolean> {
    // In dev mode without API key, log to console
    if (!resend) {
        console.log(`\n📧 [SirSheba OTP - DEV MODE]\nTo: ${to}\nName: ${name}\nOTP: ${otp}\nExpires: 10 minutes\n`)
        return true
    }

    try {
        await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject: `SirSheba Verification Code - ${otp}`,
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:Inter,sans-serif;background:#f8fafc;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 20px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr><td style="background:#059669;padding:32px;text-align:center;">
          <p style="margin:0;font-size:28px;">🎓</p>
          <h1 style="margin:8px 0 0;color:#ffffff;font-size:24px;font-weight:700;">SirSheba</h1>
          <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;">আপনার টিউশন, স্মার্টভাবে</p>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:40px 32px;text-align:center;">
          <p style="margin:0 0 8px;color:#475569;font-size:16px;">Hello, <strong>${name}</strong></p>
          <p style="margin:0 0 32px;color:#64748b;font-size:14px;">Your verification code is:</p>
          <div style="background:#f0fdf4;border:2px solid #bbf7d0;border-radius:12px;padding:24px;margin:0 0 32px;">
            <p style="margin:0;font-size:48px;font-weight:800;letter-spacing:12px;color:#059669;">${otp}</p>
          </div>
          <p style="margin:0 0 8px;color:#64748b;font-size:14px;">⏰ This code expires in <strong>10 minutes</strong>.</p>
          <p style="margin:0;color:#94a3b8;font-size:12px;">If you didn't request this, please ignore this email.</p>
          <hr style="border:none;border-top:1px solid #e2e8f0;margin:32px 0;">
          <!-- Bangla Translation -->
          <p style="margin:0 0 8px;color:#475569;font-size:14px;" dir="ltr">আপনার ভেরিফিকেশন কোড উপরে দেওয়া আছে।</p>
          <p style="margin:0;color:#94a3b8;font-size:12px;">এই কোড ১০ মিনিটের মধ্যে মেয়াদ শেষ হয়ে যাবে।</p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="background:#f8fafc;padding:20px 32px;text-align:center;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#94a3b8;font-size:12px;">SirSheba • Solo Tutor Management • Bangladesh</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
      `,
        })
        return true
    } catch (err) {
        console.error('Email send failed:', err)
        return false
    }
}
