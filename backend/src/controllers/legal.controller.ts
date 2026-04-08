import { Response } from 'express';
import { Legal, LegalType } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

// Sanitización básica de HTML para prevenir XSS
// Elimina scripts inline, event handlers y javascript: URLs
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove <script> tags
    .replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '') // Remove event handlers
    .replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '') // Remove bare event handlers
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/data:/gi, ''); // Remove data: URLs (potential XSS vector)
}

interface LegalInput {
  title: string;
  content: string;
  isActive?: boolean;
}

// Función helper para sanitizar respuesta
function sanitizeLegalDoc(doc: any) {
  const obj = doc.toObject ? doc.toObject() : doc;
  return {
    ...obj,
    id: obj._id.toString(),
    content: sanitizeHtml(obj.content)
  };
}

export const getLegalDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const documents = await Legal.find({ isActive: true });
    res.json(documents.map(sanitizeLegalDoc));
  } catch (error) {
    logger.error('GetLegalDocuments error:', error);
    res.status(500).json({ error: 'Error al obtener documentos legales' });
  }
};

export const getLegalDocumentByType = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.params;
    const document = await Legal.findOne({ type, isActive: true });
    
    if (!document) {
      res.status(404).json({ error: 'Documento no encontrado' });
      return;
    }

    res.json(sanitizeLegalDoc(document));
  } catch (error) {
    logger.error('GetLegalDocumentByType error:', error);
    res.status(500).json({ error: 'Error al obtener documento legal' });
  }
};

export const getAllLegalDocuments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const documents = await Legal.find();
    res.json(documents.map(sanitizeLegalDoc));
  } catch (error) {
    logger.error('GetAllLegalDocuments error:', error);
    res.status(500).json({ error: 'Error al obtener documentos legales' });
  }
};

export const createLegalDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body as LegalInput & { type: LegalType };
    
    const existing = await Legal.findOne({ type: data.type });
    if (existing) {
      res.status(400).json({ error: 'Ya existe un documento de este tipo' });
      return;
    }

    const document = await Legal.create({
      type: data.type,
      title: data.title,
      content: data.content,
      isActive: data.isActive ?? true
    });

    res.status(201).json({ ...document.toObject(), id: document._id.toString() });
  } catch (error) {
    logger.error('CreateLegalDocument error:', error);
    res.status(500).json({ error: 'Error al crear documento legal' });
  }
};

export const updateLegalDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.params;
    const data = req.body as Partial<LegalInput>;

    const document = await Legal.findOneAndUpdate(
      { type },
      {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.isActive !== undefined && { isActive: data.isActive }),
        updatedAt: new Date()
      },
      { returnDocument: 'after' }
    );

    if (!document) {
      res.status(404).json({ error: 'Documento no encontrado' });
      return;
    }

    res.json({ ...document.toObject(), id: document._id.toString() });
  } catch (error) {
    logger.error('UpdateLegalDocument error:', error);
    res.status(500).json({ error: 'Error al actualizar documento legal' });
  }
};

export const deleteLegalDocument = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type } = req.params;
    const document = await Legal.findOneAndDelete({ type });

    if (!document) {
      res.status(404).json({ error: 'Documento no encontrado' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    logger.error('DeleteLegalDocument error:', error);
    res.status(500).json({ error: 'Error al eliminar documento legal' });
  }
};
