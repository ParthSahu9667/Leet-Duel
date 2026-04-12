import dotenv from 'dotenv';
import path from 'path';
// Load environment variables from the frontend directory where the .env is located
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db.config';
import { compareUsers } from './controllers/compare.controller';
import leetcodeRoutes from './routes/leetcode.route';
import authRoutes from './routes/auth.route';
import friendRoutes from './routes/friend.route';

// Connect to MongoDB
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true // Crucial for accepting HTTP-only cookies from the frontend
}));

app.use(express.json());
app.use(cookieParser()); // Middleware to parse cookies

app.get('/api/health', (req, res) => {
    res.json({ message: 'Running' });
});

app.get('/api/compare', compareUsers);

// Mount the authentication routes
app.use('/api/auth', authRoutes);

// Mount the friend routes
app.use('/api/friends', friendRoutes);

// Mount the comprehensive LeetCode API routes
app.use('/api/leetcode', leetcodeRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
