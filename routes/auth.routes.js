import express from 'express';
import {
  signup,
  login,
  forgotPassword,
  verifyToken
} from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/verify-token', verifyToken);

export default router;
