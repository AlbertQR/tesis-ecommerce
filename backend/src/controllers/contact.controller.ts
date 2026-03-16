import { Request, Response } from 'express';
import { Settings } from '../models/index.js';
import { config } from '../config/index.js';
import { sendEmail } from '../utils/email.service.js';

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}

export const submitContactForm = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, subject, message } = req.body as ContactFormData;

    if (!name || !email || !message) {
      res.status(400).json({ error: 'Nombre, email y mensaje son requeridos' });
      return;
    }

    const contactEmail = await Settings.findOne({ key: 'contact_email' });
    const adminEmail = contactEmail?.value || config.email.auth.user || 'admin@donaYoli.com';

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #8B4513; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">Doña Yoli - Nuevo Contacto</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <h2 style="color: #333;">Nueva mensaje de contacto</h2>
          
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; color: #666;">
                Nombre:
              </td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                ${name}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; color: #666;">
                Email:
              </td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                ${email}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; color: #666;">
                Teléfono:
              </td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                ${phone || 'No proporcionado'}
              </td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: bold; color: #666;">
                Asunto:
              </td>
              <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                ${subject || 'No especificado'}
              </td>
            </tr>
          </table>
          
          <div style="margin-top: 20px; padding: 15px; background-color: white; border-radius: 5px;">
            <h3 style="color: #333; margin-top: 0;">Mensaje:</h3>
            <p style="color: #666; line-height: 1.6; white-space: pre-wrap;">${message}</p>
          </div>
          
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            Enviado desde el formulario de contacto de Doña Yoli el ${new Date().toLocaleString('es-CO')}
          </p>
        </div>
        <div style="background-color: #333; padding: 15px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © ${new Date().getFullYear()} Doña Yoli. Todos los derechos reservados.
          </p>
        </div>
      </div>
    `;

    await sendEmail({
      to: adminEmail,
      subject: `Nuevo contacto de ${name} - ${subject || 'Sin asunto'}`,
      html
    });

    res.json({ message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('SubmitContactForm error:', error);
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
};
