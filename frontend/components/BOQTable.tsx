"use client";

import React from "react";

interface MaterialLine {
    item: string;
    quantity: number;
    unit: string;
}

export interface BOQData {
    filename: string;
    scale: string;
    wall_height_m: number;
    walls_230mm_linear_m: number;
    walls_110mm_linear_m: number;
    walls_230mm_area_sqm: number;
    walls_110mm_area_sqm: number;
    bricks_230mm: number;
    bricks_110mm: number;
    total_bricks: number;
    cement_bags: number;
    sand_cubes: number;
    wastage_percent: number;
    materials: MaterialLine[];
    confidence_note?: string | null;
}

interface BOQTableProps {
    data: BOQData;
    onReset: () => void;
}

function fmtNum(n: number): string {
    return n.toLocaleString("en-ZA", { maximumFractionDigits: 2 });
}

const ICONS: Record<string, string> = {
    "Bricks": "🧱",
    "Cement": "🏗️",
    "sand": "⏳",
};

function getIcon(item: string): string {
    for (const [key, icon] of Object.entries(ICONS)) {
        if (item.toLowerCase().includes(key.toLowerCase())) return icon;
    }
    return "📦";
}

export default function BOQTable({ data, onReset }: BOQTableProps) {
    return (
        <div className="boq-results" id="boq-results">
            <h2 className="section-title">Bill of Quantities</h2>
            <p className="section-subtitle">
                Generated from <strong>{data.filename}</strong>
            </p>

            {/* ── Meta chips ──────────────────────────────────────────────── */}
            <div className="boq-meta">
                <div className="meta-chip">
                    <span className="meta-label">Scale</span>
                    <span className="meta-value">{data.scale}</span>
                </div>
                <div className="meta-chip">
                    <span className="meta-label">Wall Height</span>
                    <span className="meta-value">{data.wall_height_m} m</span>
                </div>
                <div className="meta-chip">
                    <span className="meta-label">230 mm Walls</span>
                    <span className="meta-value">{fmtNum(data.walls_230mm_linear_m)} m</span>
                </div>
                <div className="meta-chip">
                    <span className="meta-label">110 mm Walls</span>
                    <span className="meta-value">{fmtNum(data.walls_110mm_linear_m)} m</span>
                </div>
                <div className="meta-chip">
                    <span className="meta-label">Total Bricks</span>
                    <span className="meta-value">{fmtNum(data.total_bricks)}</span>
                </div>
                <div className="meta-chip">
                    <span className="meta-label">Wastage</span>
                    <span className="meta-value">{data.wastage_percent}%</span>
                </div>
            </div>

            {/* ── Materials table ─────────────────────────────────────────── */}
            <table className="boq-table" id="boq-materials-table">
                <thead>
                    <tr>
                        <th>Material</th>
                        <th style={{ textAlign: "right" }}>Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    {data.materials.map((m, i) => (
                        <tr key={i}>
                            <td>
                                <span className="item-icon">{getIcon(m.item)}</span>
                                {m.item}
                            </td>
                            <td>
                                {fmtNum(m.quantity)} <span style={{ color: "var(--text-muted)" }}>{m.unit}</span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* ── Confidence note ─────────────────────────────────────────── */}
            {data.confidence_note && (
                <div className="confidence-note">
                    <strong>⚠ AI Note:</strong> {data.confidence_note}
                </div>
            )}

            <button className="btn-reset" onClick={onReset} id="reset-button">
                ← Upload another plan
            </button>
        </div>
    );
}
