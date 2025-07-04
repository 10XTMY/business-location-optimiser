import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const uploadDir = path.resolve(__dirname, '../data');
const upload = multer({ dest: uploadDir });

router.post('/upload-population', upload.single('file'), (req, res) => {
    const file = req.file;

    if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }

    const newPath = path.join(uploadDir, 'population.csv');

    try {
        fs.renameSync(file.path, newPath);
        console.log(`New population CSV uploaded: ${newPath}`);
        res.status(200).json({ message: 'Upload successful. Ready to re-optimise.' });
    } catch (err: any) {
        console.error('Population file upload failed:', err.message);
        res.status(500).json({ error: 'Upload failed' });
    }
});

export default router;
