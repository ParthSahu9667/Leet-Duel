import express from 'express';
import cors from 'cors';
import { compareUsers } from './controllers/compareController';
import leetcodeRoutes from './routes/leetcodeRoutes';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ message: 'Running' });
});

app.get('/api/compare', compareUsers);

// Mount the comprehensive LeetCode API routes
app.use('/api/leetcode', leetcodeRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
