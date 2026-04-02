import { Router } from 'express';
import {
  addFavorite,
  createAddress,
  deleteAddress,
  deleteUser,
  getAddresses,
  getAllUsers,
  getFavorites,
  getProfile,
  removeFavorite,
  setDefaultAddress,
  updateAddress,
  updateProfile,
  updateUser
} from '../controllers/user.controller.js';
import { authenticate, authorizeAdmin } from '../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.route('/profile')
  .get(getProfile)
  .put(updateProfile);

router.route('/addresses')
  .get(getAddresses)
  .post(createAddress);
router.route('/addresses/:id')
  .put(updateAddress)
  .delete(deleteAddress);
router.put('/addresses/:id/default', setDefaultAddress);

router.route('/favorites')
  .get(getFavorites)
  .post(addFavorite);
router.delete('/favorites/:productId', removeFavorite);

router.get('/admin/users', authorizeAdmin, getAllUsers);
router.route('/admin/users/:id')
  .put(authorizeAdmin, updateUser)
  .delete(authorizeAdmin, deleteUser);

export default router;
