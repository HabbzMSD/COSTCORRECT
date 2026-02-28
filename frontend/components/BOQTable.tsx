"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { useReactToPrint } from "react-to-print";

interface MaterialLine {
    item: string;
    quantity: number;
    unit: string;
    estimated_cost?: number;
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
    total_estimated_cost?: number;
    confidence_note?: string | null;
}

interface BOQTableProps {
    data: BOQData;
    onReset: () => void;
    tier?: string;
}

function fmtNum(n: number): string {
    return n.toLocaleString("en-ZA", { maximumFractionDigits: 2 });
}

function fmtCurrency(amount: number): string {
    return new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);
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

export default function BOQTable({ data, onReset, tier = "free" }: BOQTableProps) {
    const componentRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `CostCorrect_BOQ_${data.filename}`,
    });

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="boq-results"
            id="boq-results"
        >
            <div ref={componentRef} className="printable-area">
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
                    {data.total_estimated_cost !== undefined && data.total_estimated_cost !== null && (
                        <div className="meta-chip">
                            <span className="meta-label">Total Est. Cost</span>
                            <span className="meta-value" style={{ color: "var(--success)" }}>
                                {fmtCurrency(data.total_estimated_cost)}
                            </span>
                        </div>
                    )}
                </div>

                {/* ── Materials table ─────────────────────────────────────────── */}
                <table className="boq-table" id="boq-materials-table">
                    <thead>
                        <tr>
                            <th>Material</th>
                            <th style={{ textAlign: "right" }}>Quantity</th>
                            {data.total_estimated_cost !== undefined && (
                                <th style={{ textAlign: "right" }}>Est. Cost</th>
                            )}
                        </tr>
                    </thead>
                    <tbody>
                        {data.materials.map((m, i) => (
                            <motion.tr
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.1 }}
                            >
                                <td>
                                    <span className="item-icon">{getIcon(m.item)}</span>
                                    {m.item}
                                </td>
                                <td>
                                    {fmtNum(m.quantity)} <span style={{ color: "var(--text-muted)" }}>{m.unit}</span>
                                </td>
                                {data.total_estimated_cost !== undefined && (
                                    <td style={{ color: m.estimated_cost !== undefined ? "var(--text-primary)" : "var(--text-muted)" }}>
                                        {m.estimated_cost !== undefined ? fmtCurrency(m.estimated_cost) : "N/A"}
                                    </td>
                                )}
                            </motion.tr>
                        ))}
                    </tbody>
                </table>

                {/* ── Confidence note ─────────────────────────────────────────── */}
                {data.confidence_note && (
                    <div className="confidence-note">
                        <strong>⚠ AI Note:</strong> {data.confidence_note}
                    </div>
                )}
            </div>

            <div className="action-buttons-row">
                <button className="btn-reset" onClick={onReset} id="reset-button">
                    ← Upload another plan
                </button>
                {tier === "free" ? (
                    <button
                        className="btn-success"
                        style={{ opacity: 0.6, cursor: "not-allowed" }}
                        onClick={() => alert("PDF Export is a Pro feature! Please upgrade your account.")}
                        id="download-pdf-button"
                    >
                        📄 Download PDF <span className="pro-badge">PRO</span>
                    </button>
                ) : (
                    <button className="btn-success" onClick={() => handlePrint()} id="download-pdf-button">
                        📄 Download PDF
                    </button>
                )}
            </div>
        </motion.div >
    );
}
