import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import colorRoutes from './routes/colorRoutes.js';

dotenv.config();

const app = express();

app.use(cors({
    origin: [
        'http://localhost:8081',
        'https://frontendkamu.onrender.com'
    ],
    optionsSuccessStatus: 200,
}));

app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const PORT = process.env.PORT || 3001;
const HOST = '0.0.0.0';

app.use('/api/auth', authRoutes);
app.use('/api/colors', colorRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'WELCOME TO API SENTRA', });
});

app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl
    });
});

connectDB().then(() => {
    app.listen(PORT, HOST, () => {
        console.log(`Server SENTRA Running on http://${HOST}:${PORT}`);
    });
});
