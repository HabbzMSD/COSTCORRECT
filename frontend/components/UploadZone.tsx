"use client";

import React, { useCallback, useRef, useState, DragEvent } from "react";
import { motion } from "framer-motion";

interface UploadZoneProps {
    onFileSelected: (file: File) => void;
    floors: number;
    setFloors: (val: number) => void;
    estimatePrices: boolean;
    setEstimatePrices: (val: boolean) => void;
    disabled?: boolean;
    tier: string;
}

const ACCEPTED = ".pdf,.png,.jpg,.jpeg";

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadZone({
    onFileSelected,
    floors,
    setFloors,
    estimatePrices,
    setEstimatePrices,
    disabled,
    tier
}: UploadZoneProps) {
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
        <div className="upload-section-wrapper">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
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
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                className="config-panel"
            >
                <div className="config-group">
                    <label className="config-label">
                        House Type {tier === "free" && <span className="pro-badge">PRO</span>}
                    </label>
                    <select
                        className="config-select"
                        value={floors}
                        onChange={(e) => setFloors(Number(e.target.value))}
                        disabled={disabled || tier === "free"}
                    >
                        <option value={1}>1 Floor (Single Storey)</option>
                        <option value={2}>2 Floors (Double Storey)</option>
                        <option value={3}>3 Floors</option>
                        <option value={4}>4 Floors</option>
                    </select>
                </div>

                <div className="config-group">
                    <div className="toggle-switch-wrapper">
                        <label className="config-label" style={{ marginBottom: 0 }}>
                            Generate results with price estimations {tier === "free" && <span className="pro-badge">PRO</span>}
                        </label>
                        <label className="toggle-switch">
                            <input
                                type="checkbox"
                                checked={estimatePrices}
                                onChange={(e) => setEstimatePrices(e.target.checked)}
                                disabled={disabled || tier === "free"}
                            />
                            <span className="slider"></span>
                        </label>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
