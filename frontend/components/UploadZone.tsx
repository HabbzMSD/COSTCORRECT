"use client";

import React, { useCallback, useRef, useState, DragEvent } from "react";

interface UploadZoneProps {
    onFileSelected: (file: File) => void;
    disabled?: boolean;
}

const ACCEPTED = ".pdf,.png,.jpg,.jpeg";

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone({ onFileSelected, disabled }: UploadZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFile = useCallback(
        (file: File) => {
            setSelectedFile(file);
            onFileSelected(file);
        },
        [onFileSelected]
    );

    const onDrop = useCallback(
        (e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile(file);
        },
        [handleFile]
    );

    const onDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true);
    };

    const onDragLeave = () => setDragOver(false);

    const onClick = () => inputRef.current?.click();

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) handleFile(file);
    };

    return (
        <div
            id="upload-zone"
            className={`upload-zone ${dragOver ? "drag-over" : ""}`}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onClick={onClick}
            role="button"
            tabIndex={0}
            aria-label="Upload architectural plan"
        >
            <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED}
                onChange={onInputChange}
                disabled={disabled}
                style={{ display: "none" }}
            />

            <div className="upload-icon">📐</div>
            <h3>Drop your architectural plan here</h3>
            <p>PDF, PNG, or JPG — max 20 MB</p>

            {selectedFile && (
                <div className="file-selected">
                    <span>📄</span>
                    <span className="file-name">{selectedFile.name}</span>
                    <span className="file-size">{formatSize(selectedFile.size)}</span>
                </div>
            )}
        </div>
    );
}
