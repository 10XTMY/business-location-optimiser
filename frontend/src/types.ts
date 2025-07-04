export interface OutputArea {
    id: string;
    lat: number;
    lon: number;
    population: number;
    score?: number;
}

export interface OptimiseResult {
    selectedLocations: OutputArea[];
    totalPopulationCovered: number;
}
