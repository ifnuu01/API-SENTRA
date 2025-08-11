import express from 'express';
import { validateLogin, validateResendCode, validateVerifyEmail, validateRegister, validateUpdateProfile, validateUpdatePassword, validateForgetPassword, validateNewPassword, validateVerifyForgetPassword } from '../middlewares/validation.js';
import { deleteAccount, forgetPassword, getMe, loginUser, newPassword, registerUser, resendVerificationCode, updatePassword, updateProfile, verifyEmail, verifyForgetPassword } from '../controllers/authController.js';
import { verifyToken } from '../middlewares/verifyToken.js' 

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.post('/verify-email', validateVerifyEmail, verifyEmail);
router.post('/resend-code', validateResendCode, resendVerificationCode);
router.get('/me', verifyToken, getMe);
router.put('/me/update-name', verifyToken, validateUpdateProfile, updateProfile);
router.put('/me/update-password', verifyToken, validateUpdatePassword, updatePassword);
router.delete('/me/delete', verifyToken, deleteAccount);
router.post('/forget-password', validateForgetPassword, forgetPassword);
router.post('/forget-password/verify', validateVerifyForgetPassword,verifyForgetPassword);
router.post('/forget-password/new-password', verifyToken, validateNewPassword, newPassword);

export default router;