import { Response } from 'express';
import { Product, Category } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { ProductInput, UpdateProductInput, ProductCategory } from '../schemas/validation.js';

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, featured, hot, combo } = req.query;
    
    const filter: Record<string, unknown> = {};
    if (category) filter.category = category;
    if (featured === 'true') filter.isFeatured = true;
    if (hot === 'true') filter.isHot = true;
    if (combo === 'true') filter.isCombo = true;

    const products = await Product.find(filter);
    res.json(products.map(p => ({ ...p.toObject(), id: p._id.toString() })));
  } catch (error) {
    console.error('GetProducts error:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    
    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    res.json({ ...product.toObject(), id: product._id.toString() });
  } catch (error) {
    console.error('GetProductById error:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body as ProductInput;
    
    const product = await Product.create({
      name: data.name,
      description: data.description,
      price: data.price,
      category: data.category,
      image: data.image,
      isFeatured: data.isFeatured,
      isHot: data.isHot,
      isCombo: data.isCombo,
      stock: data.stock
    });

    const productObj = product.toObject();
    res.status(201).json({ ...productObj, id: product._id.toString() });
  } catch (error) {
    console.error('CreateProduct error:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateProductInput;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.image !== undefined) updateData.image = data.image;
    if (data.isFeatured !== undefined) updateData.isFeatured = data.isFeatured;
    if (data.isHot !== undefined) updateData.isHot = data.isHot;
    if (data.isCombo !== undefined) updateData.isCombo = data.isCombo;
    if (data.stock !== undefined) updateData.stock = data.stock;

    const product = await Product.findByIdAndUpdate(id, updateData, { new: true });
    
    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    res.json({ ...product.toObject(), id: product._id.toString() });
  } catch (error) {
    console.error('UpdateProduct error:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    
    if (!product) {
      res.status(404).json({ error: 'Producto no encontrado' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('DeleteProduct error:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};

export const getCategories = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await Category.find();
    res.json(categories.map(c => ({ ...c.toObject(), id: c.id })));
  } catch (error) {
    console.error('GetCategories error:', error);
    res.status(500).json({ error: 'Error al obtener categorías' });
  }
};

export const createCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id, name, description, image } = req.body as { id: ProductCategory; name: string; description: string; image: string };
    
    const existing = await Category.findOne({ id });
    if (existing) {
      res.status(400).json({ error: 'La categoría ya existe' });
      return;
    }

    const category = await Category.create({ id, name, description, image });
    res.status(201).json({ ...category.toObject(), id: category.id });
  } catch (error) {
    console.error('CreateCategory error:', error);
    res.status(500).json({ error: 'Error al crear categoría' });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description, image } = req.body;

    const category = await Category.findOneAndUpdate(
      { id },
      { ...(name && { name }), ...(description && { description }), ...(image && { image }) },
      { new: true }
    );
    
    if (!category) {
      res.status(404).json({ error: 'Categoría no encontrada' });
      return;
    }

    res.json({ ...category.toObject(), id: category.id });
  } catch (error) {
    console.error('UpdateCategory error:', error);
    res.status(500).json({ error: 'Error al actualizar categoría' });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const category = await Category.findOneAndDelete({ id });
    
    if (!category) {
      res.status(404).json({ error: 'Categoría no encontrada' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('DeleteCategory error:', error);
    res.status(500).json({ error: 'Error al eliminar categoría' });
  }
};
