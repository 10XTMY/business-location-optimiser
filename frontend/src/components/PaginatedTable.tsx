import React, { useState } from 'react';
import { OutputArea } from '../types';

type Props = {
    locations: OutputArea[];
};

const PaginatedTable: React.FC<Props> = ({ locations }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 20;

    const totalPages = Math.ceil(locations.length / pageSize);
    const start = (currentPage - 1) * pageSize;
    const currentItems = locations.slice(start, start + pageSize);

    const nextPage = () => {
        if (currentPage < totalPages) setCurrentPage((prev) => prev + 1);
    };

    const prevPage = () => {
        if (currentPage > 1) setCurrentPage((prev) => prev - 1);
    };

    return (
        <div>
            <table className="location-table">
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Lat</th>
                    <th>Lon</th>
                    <th>Population</th>
                    <th>Score</th>
                </tr>
                </thead>
                <tbody>
                {currentItems.map((loc) => (
                    <tr key={loc.id}>
                        <td>{loc.id}</td>
                        <td>{loc.lat.toFixed(5)}</td>
                        <td>{loc.lon.toFixed(5)}</td>
                        <td>{loc.population}</td>
                        <td>{loc.score?.toFixed(2)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button onClick={prevPage} disabled={currentPage === 1}>
                    ← Prev
                </button>
                <span style={{ margin: '0 1rem' }}>
          Page {currentPage} of {totalPages}
        </span>
                <button onClick={nextPage} disabled={currentPage === totalPages}>
                    Next →
                </button>
            </div>
        </div>
    );
};

export default PaginatedTable;
