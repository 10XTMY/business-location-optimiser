import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { setCompetitorCSVPath } from '../services/optimiser';

const router = express.Router();
const uploadDir = path.resolve(__dirname, '../data');
const upload = multer({ dest: uploadDir });

router.post('/upload-competitors', upload.single('file'), (req, res) => {
    const file = req.file;

    if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }

    const week1Path = path.join(uploadDir, 'week1.csv');
    const week2Path = path.join(uploadDir, 'week2.csv');

    try {
        // Move current week2.csv to week1.csv (if exists)
        if (fs.existsSync(week2Path)) {
            fs.copyFileSync(week2Path, week1Path);
            console.log('Archived current week2.csv to week1.csv');
        }

        // Save new upload as week2.csv
        fs.renameSync(file.path, week2Path);
        setCompetitorCSVPath(week2Path);

        console.log(`New competitor CSV uploaded: ${week2Path}`);
        res.status(200).json({ message: 'Upload successful. Ready to re-optimise.' });
    } catch (err: any) {
        console.error('Competitor file upload failed:', err.message);
        res.status(500).json({ error: 'Upload failed' });
    }
});

export default router;
