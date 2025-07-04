import express from 'express';
import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { getDistance } from 'geolib';

const router = express.Router();
const DATA_DIR = path.resolve(__dirname, '../data');

function loadCompetitors(file: string): { lat: number; lon: number }[] {
    const csvPath = path.join(DATA_DIR, file);
    const raw = fs.readFileSync(csvPath);
    const rows = parse(raw, { columns: true });
    return rows.map((row: any) => ({
        lat: parseFloat(row.latitude),
        lon: parseFloat(row.longitude)
    }));
}

// Points are considered equal if within 100m
function pointsAreEqual(p1: { lat: number; lon: number }, p2: { lat: number; lon: number }): boolean {
    const dist = getDistance(
        { latitude: p1.lat, longitude: p1.lon },
        { latitude: p2.lat, longitude: p2.lon }
    );
    return dist < 100;
}

router.get('/compare-competitors', (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string) || 100;
        const week1 = loadCompetitors('week1.csv').slice(0, limit);
        const week2 = loadCompetitors('week2.csv').slice(0, limit);

        const added = week2.filter(w2 => !week1.some(w1 => pointsAreEqual(w1, w2)));
        const removed = week1.filter(w1 => !week2.some(w2 => pointsAreEqual(w1, w2)));

        res.status(200).json({ added, removed });
    } catch (err: any) {
        console.error('Comparison error:', err.message);
        res.status(500).json({ error: 'Comparison failed' });
    }
});

export default router;
