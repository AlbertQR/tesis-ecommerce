import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  getAllUsers,
  updateUser,
  deleteUser,
  getFavorites,
  addFavorite,
  removeFavorite
} from '../controllers/user.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);

router.get('/addresses', getAddresses);
router.post('/addresses', createAddress);
router.put('/addresses/:id', updateAddress);
router.delete('/addresses/:id', deleteAddress);
router.put('/addresses/:id/default', setDefaultAddress);

router.get('/favorites', getFavorites);
router.post('/favorites', addFavorite);
router.delete('/favorites/:productId', removeFavorite);

router.get('/admin/users', authorizeAdmin, getAllUsers);
router.put('/admin/users/:id', authorizeAdmin, updateUser);
router.delete('/admin/users/:id', authorizeAdmin, deleteUser);

export default router;
