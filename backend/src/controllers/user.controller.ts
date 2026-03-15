import { Response } from 'express';
import mongoose from 'mongoose';
import { User, Address, Order } from '../models/index.js';
import { AuthRequest } from '../middleware/auth.js';
import { UpdateUserInput, AddressInput, UpdateAddressInput } from '../schemas/validation.js';

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const addresses = await Address.find({ userId: user._id });
    const userObj = user.toObject();
    
    res.json({ 
      user: { ...userObj, id: user._id.toString() }, 
      addresses: addresses.map(a => ({ ...a.toObject(), id: a._id.toString() })) 
    });
  } catch (error) {
    console.error('GetProfile error:', error);
    res.status(500).json({ error: 'Error al obtener perfil' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body as UpdateUserInput;
    
    const user = await User.findByIdAndUpdate(
      req.user?.id,
      { 
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone }),
        ...(data.avatar && { avatar: data.avatar }),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const userObj = user.toObject();
    res.json({ ...userObj, id: user._id.toString() });
  } catch (error) {
    console.error('UpdateProfile error:', error);
    res.status(500).json({ error: 'Error al actualizar perfil' });
  }
};

export const getAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const addresses = await Address.find({ userId: new mongoose.Types.ObjectId(req.user?.id) });
    res.json(addresses.map(a => ({ ...a.toObject(), id: a._id.toString() })));
  } catch (error) {
    console.error('GetAddresses error:', error);
    res.status(500).json({ error: 'Error al obtener direcciones' });
  }
};

export const createAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = req.body as AddressInput;
    
    if (data.isDefault) {
      await Address.updateMany(
        { userId: new mongoose.Types.ObjectId(req.user?.id) },
        { isDefault: false }
      );
    }

    const address = await Address.create({
      userId: new mongoose.Types.ObjectId(req.user?.id),
      label: data.label,
      street: data.street,
      number: data.number,
      city: data.city,
      neighborhood: data.neighborhood,
      instructions: data.instructions,
      isDefault: data.isDefault
    });

    const addressObj = address.toObject();
    res.status(201).json({ ...addressObj, id: address._id.toString() });
  } catch (error) {
    console.error('CreateAddress error:', error);
    res.status(500).json({ error: 'Error al crear dirección' });
  }
};

export const updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateAddressInput;

    if (data.isDefault) {
      await Address.updateMany(
        { userId: new mongoose.Types.ObjectId(req.user?.id) },
        { isDefault: false }
      );
    }

    const address = await Address.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), userId: new mongoose.Types.ObjectId(req.user?.id) },
      {
        ...(data.label && { label: data.label }),
        ...(data.street && { street: data.street }),
        ...(data.number && { number: data.number }),
        ...(data.city && { city: data.city }),
        ...(data.neighborhood && { neighborhood: data.neighborhood }),
        ...(data.instructions !== undefined && { instructions: data.instructions }),
        ...(data.isDefault !== undefined && { isDefault: data.isDefault }),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!address) {
      res.status(404).json({ error: 'Dirección no encontrada' });
      return;
    }

    const addressObj = address.toObject();
    res.json({ ...addressObj, id: address._id.toString() });
  } catch (error) {
    console.error('UpdateAddress error:', error);
    res.status(500).json({ error: 'Error al actualizar dirección' });
  }
};

export const deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const address = await Address.findOne({ _id: new mongoose.Types.ObjectId(id), userId: new mongoose.Types.ObjectId(req.user?.id) });
    
    if (!address) {
      res.status(404).json({ error: 'Dirección no encontrada' });
      return;
    }

    if (address.isDefault) {
      const remaining = await Address.find({ 
        userId: new mongoose.Types.ObjectId(req.user?.id),
        _id: { $ne: address._id }
      });
      if (remaining.length > 0) {
        await Address.findByIdAndUpdate(remaining[0]._id, { isDefault: true });
      }
    }

    await Address.findByIdAndDelete(id);
    res.status(204).send();
  } catch (error) {
    console.error('DeleteAddress error:', error);
    res.status(500).json({ error: 'Error al eliminar dirección' });
  }
};

export const setDefaultAddress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    await Address.updateMany(
      { userId: new mongoose.Types.ObjectId(req.user?.id) },
      { isDefault: false }
    );

    const address = await Address.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), userId: new mongoose.Types.ObjectId(req.user?.id) },
      { isDefault: true, updatedAt: new Date() },
      { new: true }
    );
    
    if (!address) {
      res.status(404).json({ error: 'Dirección no encontrada' });
      return;
    }

    const addressObj = address.toObject();
    res.json({ ...addressObj, id: address._id.toString() });
  } catch (error) {
    console.error('SetDefaultAddress error:', error);
    res.status(500).json({ error: 'Error al establecer dirección por defecto' });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await User.find().select('-password');
    res.json(users.map(u => ({ ...u.toObject(), id: u._id.toString() })));
  } catch (error) {
    console.error('GetAllUsers error:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

export const updateUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateUserInput;
    
    const user = await User.findByIdAndUpdate(
      id,
      {
        ...(data.name && { name: data.name }),
        ...(data.phone && { phone: data.phone }),
        ...(data.avatar && { avatar: data.avatar }),
        ...(data.email && { email: data.email }),
        updatedAt: new Date()
      },
      { new: true }
    );
    
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const userObj = user.toObject();
    res.json({ ...userObj, id: user._id.toString() });
  } catch (error) {
    console.error('UpdateUser error:', error);
    res.status(500).json({ error: 'Error al actualizar usuario' });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    const user = await User.findByIdAndDelete(id);
    if (!user) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    await Address.deleteMany({ userId: new mongoose.Types.ObjectId(id) });
    await Order.deleteMany({ userId: new mongoose.Types.ObjectId(id) });
    
    res.status(204).send();
  } catch (error) {
    console.error('DeleteUser error:', error);
    res.status(500).json({ error: 'Error al eliminar usuario' });
  }
};
