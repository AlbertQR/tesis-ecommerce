import { Response } from 'express';
import { Testimonial, Combo, Content } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { TestimonialInput, ComboInput, ContentInput } from '../schemas/validation.js';

export const getTestimonials = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const testimonials = await Testimonial.find();
    res.json(testimonials.map(t => ({ ...t.toObject(), id: t._id.toString() })));
  } catch (error) {
    console.error('GetTestimonials error:', error);
    res.status(500).json({ error: 'Error al obtener testimonios' });
  }
};

export const createTestimonial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body as TestimonialInput;
    
    const testimonial = await Testimonial.create({
      name: data.name,
      role: data.role,
      comment: data.comment,
      rating: data.rating,
      initials: data.initials
    });

    const testimonialObj = testimonial.toObject();
    res.status(201).json({ ...testimonialObj, id: testimonial._id.toString() });
  } catch (error) {
    console.error('CreateTestimonial error:', error);
    res.status(500).json({ error: 'Error al crear testimonio' });
  }
};

export const updateTestimonial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body as Partial<TestimonialInput>;

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      {
        ...(data.name && { name: data.name }),
        ...(data.role && { role: data.role }),
        ...(data.comment && { comment: data.comment }),
        ...(data.rating && { rating: data.rating }),
        ...(data.initials && { initials: data.initials })
      },
      { new: true }
    );
    
    if (!testimonial) {
      res.status(404).json({ error: 'Testimonio no encontrado' });
      return;
    }

    res.json({ ...testimonial.toObject(), id: testimonial._id.toString() });
  } catch (error) {
    console.error('UpdateTestimonial error:', error);
    res.status(500).json({ error: 'Error al actualizar testimonio' });
  }
};

export const deleteTestimonial = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const testimonial = await Testimonial.findByIdAndDelete(id);
    
    if (!testimonial) {
      res.status(404).json({ error: 'Testimonio no encontrado' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('DeleteTestimonial error:', error);
    res.status(500).json({ error: 'Error al eliminar testimonio' });
  }
};

export const getCombos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { featured } = req.query;
    
    const filter = featured === 'true' ? { isFeatured: true } : {};
    const combos = await Combo.find(filter);
    res.json(combos.map(c => ({ ...c.toObject(), id: c._id.toString() })));
  } catch (error) {
    console.error('GetCombos error:', error);
    res.status(500).json({ error: 'Error al obtener combos' });
  }
};

export const getComboById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const combo = await Combo.findById(id);
    
    if (!combo) {
      res.status(404).json({ error: 'Combo no encontrado' });
      return;
    }

    res.json({ ...combo.toObject(), id: combo._id.toString() });
  } catch (error) {
    console.error('GetComboById error:', error);
    res.status(500).json({ error: 'Error al obtener combo' });
  }
};

export const createCombo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body as ComboInput;
    
    const combo = await Combo.create({
      name: data.name,
      description: data.description,
      price: data.price,
      originalPrice: data.originalPrice,
      image: data.image,
      includes: data.includes,
      isFeatured: data.isFeatured,
      discount: data.discount
    });

    const comboObj = combo.toObject();
    res.status(201).json({ ...comboObj, id: combo._id.toString() });
  } catch (error) {
    console.error('CreateCombo error:', error);
    res.status(500).json({ error: 'Error al crear combo' });
  }
};

export const updateCombo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body as Partial<ComboInput>;

    const combo = await Combo.findByIdAndUpdate(
      id,
      {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.price && { price: data.price }),
        ...(data.originalPrice && { originalPrice: data.originalPrice }),
        ...(data.image && { image: data.image }),
        ...(data.includes && { includes: data.includes }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.discount && { discount: data.discount })
      },
      { new: true }
    );
    
    if (!combo) {
      res.status(404).json({ error: 'Combo no encontrado' });
      return;
    }

    res.json({ ...combo.toObject(), id: combo._id.toString() });
  } catch (error) {
    console.error('UpdateCombo error:', error);
    res.status(500).json({ error: 'Error al actualizar combo' });
  }
};

export const deleteCombo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const combo = await Combo.findByIdAndDelete(id);
    
    if (!combo) {
      res.status(404).json({ error: 'Combo no encontrado' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('DeleteCombo error:', error);
    res.status(500).json({ error: 'Error al eliminar combo' });
  }
};

export const getContents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.query;
    
    if (key) {
      const content = await Content.findOne({ key });
      if (!content) {
        res.status(404).json({ error: 'Contenido no encontrado' });
        return;
      }
      res.json({ ...content.toObject(), id: content._id.toString() });
      return;
    }

    const contents = await Content.find();
    res.json(contents.map(c => ({ ...c.toObject(), id: c._id.toString() })));
  } catch (error) {
    console.error('GetContents error:', error);
    res.status(500).json({ error: 'Error al obtener contenidos' });
  }
};

export const getContentByKey = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const content = await Content.findOne({ key });
    
    if (!content) {
      res.status(404).json({ error: 'Contenido no encontrado' });
      return;
    }

    res.json({ ...content.toObject(), id: content._id.toString() });
  } catch (error) {
    console.error('GetContentByKey error:', error);
    res.status(500).json({ error: 'Error al obtener contenido' });
  }
};

export const createContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body as ContentInput;
    
    const existing = await Content.findOne({ key: data.key });
    if (existing) {
      res.status(400).json({ error: 'La clave ya existe' });
      return;
    }

    const content = await Content.create({
      key: data.key,
      value: data.value,
      type: data.type
    });

    const contentObj = content.toObject();
    res.status(201).json({ ...contentObj, id: content._id.toString() });
  } catch (error) {
    console.error('CreateContent error:', error);
    res.status(500).json({ error: 'Error al crear contenido' });
  }
};

export const updateContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const data = req.body as Partial<ContentInput>;

    const content = await Content.findOneAndUpdate(
      { key },
      {
        ...(data.value && { value: data.value }),
        ...(data.type && { type: data.type }),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!content) {
      res.status(404).json({ error: 'Contenido no encontrado' });
      return;
    }

    res.json({ ...content.toObject(), id: content._id.toString() });
  } catch (error) {
    console.error('UpdateContent error:', error);
    res.status(500).json({ error: 'Error al actualizar contenido' });
  }
};

export const deleteContent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { key } = req.params;
    const content = await Content.findOneAndDelete({ key });
    
    if (!content) {
      res.status(404).json({ error: 'Contenido no encontrado' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('DeleteContent error:', error);
    res.status(500).json({ error: 'Error al eliminar contenido' });
  }
};
