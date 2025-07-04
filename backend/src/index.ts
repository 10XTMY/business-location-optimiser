import express from 'express';
import optimiseRoute from './routes/optimise';
import cors from 'cors';
import uploadPopulationRoute from './routes/upload-population';
import uploadCompetitorRoute from './routes/upload-competitors';
import compareCompetitorsRoute from './routes/compare-competitors';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use('/api', uploadPopulationRoute);
app.use('/api', uploadCompetitorRoute);
app.use('/api', optimiseRoute);
app.use('/api', compareCompetitorsRoute);

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
