"use client";

import React, { useCallback, useRef, useState, DragEvent } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

interface UploadZoneProps {
    onFileSelected: (file: File) => void;
    floors: number;
    setFloors: (val: number) => void;
    estimatePrices: boolean;
    setEstimatePrices: (val: boolean) => void;
    // New assumption props
    brickType: string;
    setBrickType: (val: string) => void;
    wallHeight: number;
    setWallHeight: (val: number) => void;
    wastagePercent: number;
    setWastagePercent: (val: number) => void;
    openingsArea: number;
    setOpeningsArea: (val: number) => void;
    openingsLintels: number;
    setOpeningsLintels: (val: number) => void;
    includeVat: boolean;
    setIncludeVat: (val: boolean) => void;
    disabled?: boolean;
    tier: string;
}

const ACCEPTED = ".pdf,.png,.jpg,.jpeg";

function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
    return (
        <label className="toggle-switch">
            <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} disabled={disabled} />
            <span className="slider" />
        </label>
    );
}

export default function UploadZone({
    onFileSelected, floors, setFloors, estimatePrices, setEstimatePrices,
    brickType, setBrickType, wallHeight, setWallHeight, wastagePercent, setWastagePercent,
    openingsArea, setOpeningsArea, openingsLintels, setOpeningsLintels,
    includeVat, setIncludeVat, disabled, tier,
}: UploadZoneProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [dragOver, setDragOver] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const isPro = tier !== "free";

    const handleFile = useCallback((file: File) => { setSelectedFile(file); onFileSelected(file); }, [onFileSelected]);
    const onDrop = useCallback((e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragOver(false); const file = e.dataTransfer.files?.[0]; if (file) handleFile(file); }, [handleFile]);
    const onDragOver = (e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragOver(true); };
    const onDragLeave = () => setDragOver(false);
    const onClick = () => inputRef.current?.click();
    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { const file = e.target.files?.[0]; if (file) handleFile(file); };

    return (
        <div className="upload-section-wrapper">
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                id="upload-zone"
                className={`upload-zone ${dragOver ? "drag-over" : ""}`}
                onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave} onClick={onClick}
                role="button" tabIndex={0} aria-label="Upload architectural plan"
            >
                <input ref={inputRef} type="file" accept={ACCEPTED} onChange={onInputChange} disabled={disabled} style={{ display: "none" }} />
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
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
                className="config-panel"
            >
                <p style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                    Calculation Assumptions
                </p>

                {/* Brick Type */}
                <div className="config-group">
                    <label className="config-label">Brick Type (SA Standard)</label>
                    <select className="config-select" value={brickType} onChange={e => setBrickType(e.target.value)} disabled={disabled}>
                        <option value="stock">Stock Brick  (222×106×73mm)</option>
                        <option value="maxi">Maxi Brick (290×140×90mm)</option>
                    </select>
                </div>

                {/* Wall Height */}
                <div className="config-group">
                    <label className="config-label">Wall Height: <strong>{wallHeight} m</strong></label>
                    <input
                        type="range" min="2.1" max="4.5" step="0.1" value={wallHeight}
                        onChange={e => setWallHeight(parseFloat(e.target.value))}
                        disabled={disabled}
                        style={{ width: "100%", accentColor: "var(--accent)" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <span>2.1 m</span><span>4.5 m</span>
                    </div>
                </div>

                {/* Wastage % */}
                <div className="config-group">
                    <label className="config-label">Waste Factor: <strong>{wastagePercent}%</strong></label>
                    <input
                        type="range" min="5" max="20" step="1" value={wastagePercent}
                        onChange={e => setWastagePercent(parseInt(e.target.value))}
                        disabled={disabled}
                        style={{ width: "100%", accentColor: "var(--accent)" }}
                    />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        <span>5%</span><span>20%</span>
                    </div>
                </div>

                {/* Openings */}
                <div className="config-group">
                    <label className="config-label">Total Openings Area (doors + windows): <strong>{openingsArea} m²</strong></label>
                    <input
                        type="number" min="0" step="0.5" value={openingsArea}
                        onChange={e => setOpeningsArea(parseFloat(e.target.value) || 0)}
                        disabled={disabled}
                        className="config-select"
                        placeholder="0.0"
                    />
                </div>

                {/* Lintels */}
                <div className="config-group">
                    <label className="config-label">Openings &gt; 600mm wide (require lintels): <strong>{openingsLintels}</strong></label>
                    <input
                        type="number" min="0" step="1" value={openingsLintels}
                        onChange={e => setOpeningsLintels(parseInt(e.target.value) || 0)}
                        disabled={disabled}
                        className="config-select"
                        placeholder="0"
                    />
                </div>

                {/* Floors (Pro) */}
                <div className="config-group">
                    <label className="config-label">
                        Number of Floors {!isPro && <span className="pro-badge">PRO</span>}
                    </label>
                    <select className="config-select" value={floors} onChange={e => setFloors(Number(e.target.value))} disabled={disabled || !isPro}>
                        {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Floor{n > 1 ? "s" : ""}</option>)}
                    </select>
                </div>

                {/* Estimate Prices (Pro) */}
                <div className="config-group">
                    <div className="toggle-switch-wrapper">
                        <label className="config-label" style={{ marginBottom: 0 }}>
                            Cost Estimates (ZAR) {!isPro && <span className="pro-badge">PRO</span>}
                        </label>
                        <Toggle checked={estimatePrices} onChange={setEstimatePrices} disabled={disabled || !isPro} />
                    </div>
                </div>

                {/* VAT toggle (Pro, only if estimating prices) */}
                {estimatePrices && (
                    <div className="config-group">
                        <div className="toggle-switch-wrapper">
                            <label className="config-label" style={{ marginBottom: 0 }}>
                                Include VAT (15%)
                            </label>
                            <Toggle checked={includeVat} onChange={setIncludeVat} disabled={disabled || !isPro} />
                        </div>
                    </div>
                )}

                {!isPro && (
                    <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                        <Link href="/pricing" style={{ color: "var(--accent)" }}>Upgrade to Pro</Link> for multi-floor, cost estimates, and VAT.
                    </p>
                )}
            </motion.div>
        </div>
    );
}
