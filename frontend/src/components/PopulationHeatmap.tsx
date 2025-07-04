import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import * as L from 'leaflet';
import 'leaflet.heat';

type Props = {
    points: Array<[number, number, number]>; // [lat, lon, intensity (0–1)]
};

const PopulationHeatmap: React.FC<Props> = ({ points }) => {
    const map = useMap();

    useEffect(() => {
        if (!points || points.length === 0) return;

        const heatLayer = (L as any).heatLayer(points, {
            radius: 30,
            blur: 25,
            minOpacity: 0.4,
            maxZoom: 12,
            gradient: {
                0.0: 'blue',
                0.4: 'lime',
                0.7: 'orange',
                1.0: 'red',
            },
        }).addTo(map);

        return () => {
            map.removeLayer(heatLayer);
        };
    }, [map, points]);

    return null;
};

export default PopulationHeatmap;
