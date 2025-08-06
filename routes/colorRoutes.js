import express from 'express';
import { upload } from '../middlewares/upload.js';
import { deleteDetectColor, detectColor, getDetectColor, getDetectColorById } from '../controllers/colorController.js';
import { verifyToken } from '../middlewares/verifyToken.js';
import { chatWithGemini } from '../controllers/chatBotController.js';

const router = express.Router();

router.get('/history', verifyToken, getDetectColor)
router.post('/detect-color', verifyToken, upload.single('image'), detectColor);
router.get('/history/:id', verifyToken, getDetectColorById);
router.delete('/history/:id', verifyToken, deleteDetectColor);
router.post('/chat-bot', verifyToken, chatWithGemini)

export default router;