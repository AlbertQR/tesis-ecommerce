import { Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth.js';
import { config } from '../config/index.js';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp)'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export const uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    upload.single('image')(req, res, (err) => {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }

      if (!req.file) {
        res.status(400).json({ error: 'No se ha proporcionado ninguna imagen' });
        return;
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;
      res.json({ 
        url: imageUrl,
        filename: req.file.filename,
        originalName: req.file.originalname
      });
    });
  } catch (error) {
    console.error('UploadImage error:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
};

export const uploadMiddleware = upload.single('image');
