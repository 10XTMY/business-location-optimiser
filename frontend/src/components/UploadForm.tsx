import React, { useRef, useState } from 'react';
import axios from 'axios';

type Props = {
    label: string;
    endpoint: string;
    onUploadSuccess: () => void;
};

const UploadForm: React.FC<Props> = ({ label, endpoint, onUploadSuccess }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleUpload = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) {
            setError('Please select a file.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploading(true);
            setError(null);
            setSuccess(false);

            await axios.post(`http://localhost:3000/api/${endpoint}`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSuccess(true);
            onUploadSuccess(); // re-fetch optimisation
        } catch (err: any) {
            setError('Upload failed. Please check the file format.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-card">
            <h2 className="upload-title">{label}</h2>
            <input type="file" ref={fileInputRef} accept=".csv" className="upload-input" />
            <button
                onClick={handleUpload}
                disabled={uploading}
                className="upload-button"
            >
                {uploading ? 'Uploading...' : 'Upload & Recalculate'}
            </button>
            {error && <p className="upload-error">{error}</p>}
            {success && <p className="upload-success">Upload successful. Recalculating...</p>}
        </div>
    );
};

export default UploadForm;