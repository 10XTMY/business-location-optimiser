import express from 'express';
import { runOptimisation } from '../services/optimiser';

const router = express.Router();

router.get('/optimise', (req, res) => {
    console.log('>> /optimise route hit');
    try {
        const result = runOptimisation();
        res.json(result);
    } catch (err: any) {
        console.error('Failed to run optimisation:', err.message);
        res.status(500).json({ error: 'Optimisation failed' });
    }
});

export default router;
