import express from 'express';
import { validateLogin, validateResendCode, validateVerifyEmail, validateRegister } from '../middlewares/validation.js';
import { loginUser, registerUser, resendVerificationCode, verifyEmail } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/verify-email', validateVerifyEmail, verifyEmail);
router.post('/resend-code', validateResendCode, resendVerificationCode);

export default router;