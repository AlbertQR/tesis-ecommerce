import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { config } from '../config/index.js';
import { RegisterInput, LoginInput } from '../schemas/validation.js';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body as RegisterInput;

    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      res.status(400).json({ error: 'El email ya está registrado' });
      return;
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await User.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
      phone: data.phone,
      role: 'user'
    });

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    const { password: _, ...userWithoutPassword } = user.toObject();
    // Convert _id to id for frontend compatibility
    const responseUser = { ...userWithoutPassword, id: user._id.toString() };
    
    res.status(201).json({ user: responseUser, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Error al registrar usuario' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body as LoginInput;

    const user = await User.findOne({ email: data.email });
    if (!user) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const isValidPassword = await bcrypt.compare(data.password, user.password);
    if (!isValidPassword) {
      res.status(401).json({ error: 'Credenciales inválidas' });
      return;
    }

    const token = jwt.sign(
      { id: user._id.toString(), email: user.email, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    const { password: _, ...userWithoutPassword } = user.toObject();
    const responseUser = { ...userWithoutPassword, id: user._id.toString() };
    
    res.json({ user: responseUser, token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const authReq = req as import('../middleware/auth.js').AuthRequest;
    const user = await User.findById(authReq.user?.id).select('-password');
    
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const userObj = user.toObject();
    res.json({ ...userObj, id: user._id.toString() });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};
