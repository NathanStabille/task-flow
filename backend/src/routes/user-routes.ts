import { Router } from 'express';
import {
  createUser,
  deleteUser,
  getUser,
  listUsers,
  updateUser,
} from '../controllers/user-controller.js';
import { requireRole } from '../middleware/require-role.js';

export const userRouter = Router();

userRouter.get('/', listUsers);
userRouter.get('/:id', requireRole('ADMIN'), getUser);
userRouter.post('/', requireRole('ADMIN'), createUser);
userRouter.put('/:id', requireRole('ADMIN'), updateUser);
userRouter.delete('/:id', requireRole('ADMIN'), deleteUser);
