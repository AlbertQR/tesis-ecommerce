import nodemailer from 'nodemailer';
import { config } from '../config/index.js';

const transporter = nodemailer.createTransport({
  host: config.email.host,
  port: config.email.port,
  secure: config.email.secure,
  auth: config.email.auth
});

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: SendEmailOptions): Promise<void> => {
  if (!config.email.auth.user || !config.email.auth.pass) {
    console.log('Email not configured. Would send email to:', options.to);
    console.log('Subject:', options.subject);
    return;
  }

  try {
    await transporter.sendMail({
      from: config.email.from,
      to: options.to,
      subject: options.subject,
      html: options.html
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetToken: string
): Promise<void> => {
  const resetUrl = `${config.frontendUrl}/recuperar-contrasena?token=${resetToken}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #8B4513; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0;">Doña Yoli</h1>
      </div>
      <div style="padding: 20px; background-color: #f9f9f9;">
        <h2 style="color: #333;">Restablecer tu contraseña</h2>
        <p style="color: #666; line-height: 1.6;">
          Hola, hemos recibido una solicitud para restablecer tu contraseña.
          Haz clic en el botón de abajo para crear una nueva contraseña:
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}"
             style="background-color: #8B4513; color: white; padding: 15px 30px;
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Restablecer Contraseña
          </a>
        </div>
        <p style="color: #666; font-size: 14px;">
          Este enlace expirará en 1 hora.
        </p>
        <p style="color: #999; font-size: 12px;">
          Si no solicitaste este cambio, puedes ignorar este correo.
        </p>
      </div>
      <div style="background-color: #333; padding: 15px; text-align: center;">
        <p style="color: #999; font-size: 12px; margin: 0;">
          &copy; ${new Date().getFullYear()} Doña Yoli. Todos los derechos reservados.
        </p>
      </div>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Restablecer tu contraseña - Doña Yoli',
    html
  });
};
