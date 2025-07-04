import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Circle, Tooltip } from 'react-leaflet';
import axios from 'axios';

interface Point {
    lat: number;
    lon: number;
}

interface ChangeData {
    added: Point[];
    removed: Point[];
}
interface Props {
    refreshTrigger?: number;
}

const CompetitorChangeMap: React.FC<Props> = ({ refreshTrigger }) => {
    const [changeData, setChangeData] = useState<ChangeData | null>(null);

    useEffect(() => {
        axios
            .get<ChangeData>('http://localhost:3000/api/compare-competitors')
            .then((res) => setChangeData(res.data))
            .catch((err) => {
                console.error('Failed to fetch competitor changes:', err);
                alert('Could not load competitor change data');
            });
    }, [refreshTrigger]);

    return (
        <div style={{ marginBottom: '2rem' }}>
            <h2>Competitor Change Visualisation</h2>
            <MapContainer center={[53.5, -1.5]} zoom={6} style={{ height: '500px', width: '100%' }}>
                <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                />

                {/* New competitors in Week 2 */}
                {changeData?.added.map((pt, idx) => (
                    <Circle
                        key={`added-${idx}`}
                        center={[pt.lat, pt.lon]}
                        radius={500}
                        pathOptions={{ color: 'green' }}
                    >
                        <Tooltip direction="top" offset={[0, -10]} permanent>
                            New this week
                        </Tooltip>
                    </Circle>
                ))}
                {changeData?.removed.map((pt, idx) => (
                    <Circle
                        key={`removed-${idx}`}
                        center={[pt.lat, pt.lon]}
                        radius={500}
                        pathOptions={{ color: 'red' }}
                    >
                        <Tooltip direction="top" offset={[0, -10]} permanent>
                            Last week (removed)
                        </Tooltip>
                    </Circle>
                ))}
            </MapContainer>
        </div>
    );
};

export default CompetitorChangeMap;
