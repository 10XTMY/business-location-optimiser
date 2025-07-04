import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { OutputArea } from '../types';
import PopulationHeatmap from './PopulationHeatmap';

type Props = {
    businessLocations: OutputArea[];
};

const MapView: React.FC<Props> = ({ businessLocations }) => {
    const validLocs = businessLocations.filter(
        (loc) =>
            typeof loc.lat === 'number' &&
            typeof loc.lon === 'number' &&
            !isNaN(loc.lat) &&
            !isNaN(loc.lon) &&
            typeof loc.population === 'number' &&
            loc.population > 0
    );

    const maxPop = Math.max(...validLocs.map((loc) => loc.population));

    const heatmapPoints: [number, number, number][] = validLocs.map((loc) => [
        loc.lat,
        loc.lon,
        Math.max(0.05, loc.population / maxPop)
    ]);

    const sortedScores = businessLocations.map(loc => loc.score || 0).sort((a, b) => a - b);

    function getPercentile(score: number | undefined): string {
        if (!score) return 'Unknown';
        const index = sortedScores.findIndex(s => score <= s);
        const percentile = 100 - (index / sortedScores.length) * 100;
        if (percentile >= 90) return 'Top 10%';
        if (percentile >= 75) return 'Top 25%';
        if (percentile >= 50) return 'Top 50%';
        return 'Lower 50%';
    }

    function getCircleColor(pop: number): string {
        const norm = pop / maxPop;
        if (norm >= 0.9) return 'red';
        if (norm >= 0.6) return 'orange';
        if (norm >= 0.3) return 'yellow';
        return 'green';
    }

    return (
        <MapContainer center={[53.5, -1.5]} zoom={6} style={{ height: '500px', width: '100%' }}>
            <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <PopulationHeatmap points={heatmapPoints} />

            {validLocs.map((loc) => (
                <Circle
                    key={`circle-${loc.id}`}
                    center={[loc.lat, loc.lon]}
                    radius={1000}
                    pathOptions={{ color: getCircleColor(loc.population), fillOpacity: 0.3 }}
                />
            ))}

            {validLocs.map((loc) => (
                <Marker key={loc.id} position={[loc.lat, loc.lon]}>
                    <Popup>
                        <strong>{loc.id}</strong><br />
                        Population: {loc.population}<br />
                        Score: {loc.score?.toFixed(2)}<br />
                        Ranking: {getPercentile(loc.score)}<br />
                        <small>
                            Score = Population × (1 + distance to nearest competitor in km)<br />
                            Higher score = more people & less competition nearby
                        </small>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};

export default MapView;