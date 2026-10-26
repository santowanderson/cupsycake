import { Router } from 'express';
import {
  getProfile,
  login,
  logout,
  register,
} from '../controllers/auth.controller';
import { isAuthenticated } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', isAuthenticated, logout);
router.get('/profile', getProfile);

export default router;
