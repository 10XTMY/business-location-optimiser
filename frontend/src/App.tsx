import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { OptimiseResult } from './types';
import MapView from './components/MapView';
import UploadForm from './components/UploadForm';
import CompetitorChangeMap from './components/CompetitorChangeMap';
import PaginatedTable from './components/PaginatedTable';

function App() {
    const [data, setData] = useState<OptimiseResult | null>(null);
    const [refreshCounter, setRefreshCounter] = useState(0);

    const fetchOptimisation = () => {
        axios
            .get('http://localhost:3000/api/optimise', { timeout: 60000 })
            .then((res) => setData(res.data))
            .catch((err) => {
                console.error('Failed to fetch optimise data:', err);
                alert('Backend failed to load data.');
            });
    };

    useEffect(() => {
        fetchOptimisation();
    }, []);

    return (
        <div className="app-container">
            <h1 className="app-title">Business Location Optimiser</h1>

            <div className="upload-section">
                <UploadForm
                    label="Upload New Competitor CSV"
                    endpoint="upload-competitors"
                    onUploadSuccess={() => {
                        fetchOptimisation();
                        setRefreshCounter(prev => prev + 1); // trigger refresh
                    }}
                />
                <UploadForm
                    label="Upload New Population CSV"
                    endpoint="upload-population"
                    onUploadSuccess={fetchOptimisation}
                />
            </div>

            {data?.selectedLocations ? (
                <>
                    <div className="coverage-summary">
                        <strong>Total population covered:</strong> {data.totalPopulationCovered
                        ? data.totalPopulationCovered.toLocaleString()
                        : '0'}
                    </div>

                    <MapView businessLocations={data.selectedLocations} />

                    <h2 style={{ marginTop: '2rem' }}>Selected Business Locations</h2>
                    <PaginatedTable locations={data.selectedLocations} />

                    <CompetitorChangeMap refreshTrigger={refreshCounter} />
                </>
            ) : (
                <p>Loading data...</p>
            )}
        </div>
    );

}

export default App;
