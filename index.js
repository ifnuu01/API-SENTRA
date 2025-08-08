import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import connectDB from './config/db.js';
import { fileURLToPath } from 'url';
import authRoutes from './routes/authRoutes.js'
import colorRoutes from './routes/colorRoutes.js'

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({
    origin: ['http://localhost:8081'],
    optionsSuccessStatus: 200,
}));

app.use(morgan('dev'));
app.use(express.json({limit : '10mb'}));
app.use(express.urlencoded({extended:true, limit: '10mb'}));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 3001;

app.use('/api/auth', authRoutes);
app.use('/api/colors', colorRoutes);

app.get('/', (req, res) => {
    res.json({message: 'WELCOME TO API SENTRA'})
})

app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl
    });
});

connectDB().then(() => {
    app.listen(PORT, '0.0.0.0', () => {
        console.log('Server SENTRA Running on http://192.168.1.17:' + PORT);
    });
});