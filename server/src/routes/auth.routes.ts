import { Router } from 'express';
import { register, login, refresh, logout, me } from '../controllers/auth.controller';
import { verifyToken } from '../middleware/auth.middleware';

const router = Router();

// Public
router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

// Protected
router.get('/me', verifyToken, me);

export default router;
