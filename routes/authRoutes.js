import express from 'express';
import { validateLogin, validateResendCode, validateVerifyEmail, validateRegister } from '../middlewares/validation.js';
import { getMe, loginUser, registerUser, resendVerificationCode, verifyEmail } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/verifyToken.js' 

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/verify-email', validateVerifyEmail, verifyEmail);
router.post('/resend-code', validateResendCode, resendVerificationCode);
router.get('/me', verifyToken, getMe)

export default router;