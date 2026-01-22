import { Resend } from "resend";

const getResend = () => {
  if (!process.env.RESEND_API_KEY) {
    return null;
  }
  return new Resend(process.env.RESEND_API_KEY);
};

const FROM_EMAIL = process.env.FROM_EMAIL ?? "SimpBB <noreply@resend.dev>";

export type SendEmailOptions = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
};

export type SendEmailResult = {
  success: boolean;
  id?: string;
  error?: string;
};

export async function sendEmail(
  options: SendEmailOptions
): Promise<SendEmailResult> {
  const resend = getResend();

  if (!resend) {
    console.warn("RESEND_API_KEY not configured, skipping email send");
    return { success: false, error: "Email not configured" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });

    if (error) {
      console.error("Failed to send email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Email sending exception:", message);
    return { success: false, error: message };
  }
}

export function sendVerificationEmail(
  email: string,
  url: string,
  name?: string
): Promise<SendEmailResult> {
  const userName = name ?? email.split("@")[0];

  return sendEmail({
    to: email,
    subject: "Verifikasi Email Anda - SimpBB",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">SimpBB</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Halo ${userName}!</h2>
            <p>Terima kasih telah mendaftar di SimpBB. Silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Verifikasi Email
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Atau salin dan tempel link berikut di browser Anda:</p>
            <p style="background: #f5f5f5; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #666;">
              ${url}
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Link ini akan kedaluwarsa dalam 24 jam.<br>
              Jika Anda tidak mendaftar di SimpBB, abaikan email ini.
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            &copy; ${new Date().getFullYear()} SimpBB. All rights reserved.
          </div>
        </body>
      </html>
    `,
    text: `Halo ${userName}!\n\nTerima kasih telah mendaftar di SimpBB.\n\nVerifikasi email Anda dengan mengunjungi link berikut:\n${url}\n\nLink ini akan kedaluwarsa dalam 24 jam.\n\nJika Anda tidak mendaftar di SimpBB, abaikan email ini.`,
  });
}

export function sendPasswordResetEmail(
  email: string,
  url: string,
  name?: string
): Promise<SendEmailResult> {
  const userName = name ?? email.split("@")[0];

  return sendEmail({
    to: email,
    subject: "Reset Password - SimpBB",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">SimpBB</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Halo ${userName}!</h2>
            <p>Kami menerima permintaan untuk mereset password akun Anda. Klik tombol di bawah untuk membuat password baru:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${url}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p style="color: #666; font-size: 14px;">Atau salin dan tempel link berikut di browser Anda:</p>
            <p style="background: #f5f5f5; padding: 12px; border-radius: 4px; word-break: break-all; font-size: 12px; color: #666;">
              ${url}
            </p>
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Link ini akan kedaluwarsa dalam 1 jam.<br>
              Jika Anda tidak meminta reset password, abaikan email ini.
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            &copy; ${new Date().getFullYear()} SimpBB. All rights reserved.
          </div>
        </body>
      </html>
    `,
    text: `Halo ${userName}!\n\nKami menerima permintaan untuk mereset password akun Anda.\n\nReset password Anda dengan mengunjungi link berikut:\n${url}\n\nLink ini akan kedaluwarsa dalam 1 jam.\n\nJika Anda tidak meminta reset password, abaikan email ini.`,
  });
}

export function sendTestEmail(
  to: string,
  message?: string
): Promise<SendEmailResult> {
  return sendEmail({
    to,
    subject: "Test Email - SimpBB",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; text-align: center;">SimpBB</h1>
          </div>
          <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
            <h2 style="color: #333;">Test Email Berhasil!</h2>
            <p>Ini adalah email test dari SimpBB. Jika Anda menerima email ini, konfigurasi email sudah benar.</p>
            ${message ? `<p style="background: #f5f5f5; padding: 12px; border-radius: 4px; color: #666;">${message}</p>` : ""}
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              Dikirim pada: ${new Date().toLocaleString("id-ID")}
            </p>
          </div>
          <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
            &copy; ${new Date().getFullYear()} SimpBB. All rights reserved.
          </div>
        </body>
      </html>
    `,
    text: `Test Email Berhasil!\n\nIni adalah email test dari SimpBB.\n\n${message ?? ""}\n\nDikirim pada: ${new Date().toLocaleString("id-ID")}`,
  });
}
