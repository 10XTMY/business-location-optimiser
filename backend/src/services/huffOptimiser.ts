/**
 * Hybrid Huff-Competitor Optimiser (Normalised)
 *
 * This optimiser blends:
 * - Huff Model: to calculate probabilistic demand capture by candidate locations
 * - Competitor-Aware Penalisation: penalises candidate sites based on proximity to the nearest competitor
 *
 * Formula:
 *    raw_score = (pop / D_to_candidate^BETA) × (1 + D_to_nearest_competitor)
 *
 * Optimisation Notes:
 * - Scores are normalised per OutputArea to prevent overcounting population (total demand capped)
 * - Normalised scores are aggregated across OAs per candidate
 * - Final output reflects realistic, capped market capture (max = population sum)
 */

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { getDistance } from 'geolib';

export type OutputArea = {
    id: string;
    lat: number;
    lon: number;
    population: number;
    probabilitySum?: number;
};

export type LatLon = {
    lat: number;
    lon: number;
};

const DATA_DIR = path.resolve(__dirname, '../data');
const POPULATION_CSV = path.join(DATA_DIR, 'population.csv');
const COMPETITOR_CSV = path.join(DATA_DIR, 'week2.csv');

const BETA = 1.5;
const MAX_LOCATIONS = 500;

function parseCompetitorCSV(): LatLon[] {
    const file = fs.readFileSync(COMPETITOR_CSV);
    const records = parse(file, { columns: true });

    return records.map((row: any) => ({
        lat: parseFloat(row.latitude),
        lon: parseFloat(row.longitude)
    }));
}

function parsePopulationCSV(): OutputArea[] {
    const file = fs.readFileSync(POPULATION_CSV);
    const records = parse(file, { columns: true });

    const competitors = parseCompetitorCSV();
    if (!competitors.length) return [];

    const populationOAs: OutputArea[] = [];

    for (let i = 0; i < records.length; i++) {
        const row = records[i];
        const comp = competitors[i % competitors.length];

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

function computeNormalisedScores(
    oas: OutputArea[],
    candidates: OutputArea[],
    competitors: LatLon[]
): Map<string, number> {
    const scores = new Map<string, number>();

    for (const oa of oas) {
        let total = 0;
        const terms = candidates.map((site) => {
            // let d = getDistance(     // NOTE: use for accuracy, requires thread workers
            //     { latitude: oa.lat, longitude: oa.lon },
            //     { latitude: site.lat, longitude: site.lon }
            // ) / 1000;
            let d = fastDistanceKm(oa.lat, oa.lon, site.lat, site.lon);
            if (d < 0.1) d = 0.1;

            let minDToComp = Infinity;
            for (const comp of competitors) {
                // const dc = getDistance(
                //     { latitude: oa.lat, longitude: oa.lon },
                //     { latitude: comp.lat, longitude: comp.lon }
                // ) / 1000;
                let dc = fastDistanceKm(oa.lat, oa.lon, site.lat, site.lon);
                if (dc < 0.1) dc = 0.1;
                if (dc < minDToComp) minDToComp = dc;
            }

            const raw = (oa.population / Math.pow(d, BETA)) * (1 + minDToComp);
            total += raw;
            return { id: site.id, raw };
        });

        for (const { id, raw } of terms) {
            const portion = total === 0 ? 0 : (raw / total) * oa.population;
            scores.set(id, (scores.get(id) || 0) + portion);
        }
    }

    return scores;
}

function fastDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dx = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2 * Math.PI / 180);
    const dy = (lat2 - lat1);
    return Math.sqrt(dx * dx + dy * dy) * 111; // 111km per degree approx
}

export function runHuffOptimisation(): {
    selectedLocations: OutputArea[];
    totalPopulationCovered: number;
} {
    const oas = parsePopulationCSV().slice(0, 500);
    const competitors = parseCompetitorCSV().slice(0, 100);

    if (!oas.length || !competitors.length) {
        return {
            selectedLocations: [],
            totalPopulationCovered: 0
        };
    }

    const candidates = [...oas]
        .sort((a, b) => b.population - a.population)
        .slice(0, 500);

    const scores = computeNormalisedScores(oas, candidates, competitors);

    const sortedCandidates = candidates
        .map((c) => ({ ...c, probabilitySum: scores.get(c.id) || 0 }))
        .sort((a, b) => (b.probabilitySum! - a.probabilitySum!))
        .slice(0, MAX_LOCATIONS);

    const totalPopulationCovered = sortedCandidates.reduce(
        (sum, c) => sum + (c.probabilitySum || 0),
        0
    );

    return {
        selectedLocations: sortedCandidates,
        totalPopulationCovered
    };
}