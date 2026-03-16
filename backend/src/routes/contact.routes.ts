import { Router } from 'express';
import type { Request, Response } from 'express';
import { submitContactForm } from '../controllers/contact.controller.js';

const router = Router();

router.post('/contact', (req: Request, res: Response) => {
  submitContactForm(req, res);
});

export default router;
