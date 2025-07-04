import fs from 'fs';
import path from 'path';
import {parse} from 'csv-parse/sync';
import {getDistance} from 'geolib';

export type OutputArea = {
    id: string;
    lat: number;
    lon: number;
    population: number;
    score?: number;
};

export type LatLon = {
    lat: number;
    lon: number;
};

const DATA_DIR = path.resolve(__dirname, '../data');
const POPULATION_CSV = path.join(DATA_DIR, 'population.csv');
let COMPETITOR_CSV = path.join(DATA_DIR, 'week2.csv'); // default file

export function setCompetitorCSVPath(newPath: string) {
    COMPETITOR_CSV = newPath;
}

// NOTICE: Generating dummy lat/lon data until corrected population.csv is available
// TODO: Replace this logic with actual CSV parsing when correct lat/lon/population data is provided
function parsePopulationCSV(): OutputArea[] {
    const file = fs.readFileSync(POPULATION_CSV);
    const records = parse(file, {columns: true});

    const competitors = parseCompetitorCSV();
    const populationOAs: OutputArea[] = [];

    for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const comp = competitors[i % competitors.length];

        // Random offset within ±0.2 degrees (~22km)
        const offsetLat = (Math.random() - 0.5) * 0.4;
        const offsetLon = (Math.random() - 0.5) * 0.4;

        const lat = parseFloat((comp.lat + offsetLat).toFixed(6));
        const lon = parseFloat((comp.lon + offsetLon).toFixed(6));
        const pop = parseInt(row.Population) || 0;

        populationOAs.push({
            id: row.OA,
            lat,
            lon,
            population: pop
        });
    }

    return populationOAs;
}

function parseCompetitorCSV(): LatLon[] {
    const file = fs.readFileSync(COMPETITOR_CSV);
    const records = parse(file, {columns: true});

    return records.map((row: any) => ({
        lat: parseFloat(row.latitude),
        lon: parseFloat(row.longitude)
    }));
}

function computeScore(oa: OutputArea, competitors: LatLon[]): number {
    let minDist = Infinity;
    for (const comp of competitors) {
        const dist = getDistance(
            {latitude: oa.lat, longitude: oa.lon},
            {latitude: comp.lat, longitude: comp.lon}
        ) / 1000;

        if (dist < minDist) minDist = dist;
    }
    return oa.population * (1 + minDist);
}

export function runOptimisation(): {
    selectedLocations: OutputArea[];
    totalPopulationCovered: number;
} {
    console.log('Parsing population and competitors...');
    const oas = parsePopulationCSV().slice(0, 500); // limit for performance
    const competitors = parseCompetitorCSV().slice(0, 100);

    console.log(`Parsed ${oas.length} OAs and ${competitors.length} competitors`);
    console.log('Scoring OAs...');
    for (let i = 0; i < oas.length; i++) {
        if (i % 100 === 0) console.log(`Scoring OA ${i}/${oas.length}`);
        oas[i].score = computeScore(oas[i], competitors);
    }

    const topOAs = oas.sort((a, b) => (b.score! - a.score!)).slice(0, 500);
    console.log('Top 500 selected');

    console.log('Assigning OAs...');
    const assignedOAs = oas.map((oa, idx) => {
        if (idx % 100 === 0) console.log(`Assigning OA ${idx}/${oas.length}`);
        let closestBusinessDist = Infinity;
        let closestCompetitorDist = Infinity;

        for (const biz of topOAs) {
            const d = getDistance(
                {latitude: oa.lat, longitude: oa.lon},
                {latitude: biz.lat, longitude: biz.lon}
            );
            if (d < closestBusinessDist) closestBusinessDist = d;
        }

        for (const comp of competitors) {
            const d = getDistance(
                {latitude: oa.lat, longitude: oa.lon},
                {latitude: comp.lat, longitude: comp.lon}
            );
            if (d < closestCompetitorDist) closestCompetitorDist = d;
        }

        return {
            ...oa,
            servedByBusiness: closestBusinessDist < closestCompetitorDist
        };
    });

    console.log('Computing final population...');
    const totalPopulationCovered = assignedOAs
        .filter((oa) => oa.servedByBusiness)
        .reduce((sum, oa) => sum + oa.population, 0);

    console.log(`OAs served by business: ${assignedOAs.filter(o => o.servedByBusiness).length}/${assignedOAs.length}`);

    return {
        selectedLocations: topOAs,
        totalPopulationCovered
    };
}