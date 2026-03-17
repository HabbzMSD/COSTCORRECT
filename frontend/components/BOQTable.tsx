"use client";

import React, { useRef } from "react";
import { motion } from "framer-motion";
import { useReactToPrint } from "react-to-print";
import Link from "next/link";

interface MaterialLine {
    item: string;
    quantity: number;
    unit: string;
    unit_price?: number;
    estimated_cost?: number;
    note?: string;
}

interface Assumptions {
    brick_type: string;
    wall_height_m: number;
    wastage_percent: number;
    mortar_joint_mm: number;
    include_vat: boolean;
    floors: number;
    estimate_prices: boolean;
    openings_area_sqm: number;
    openings_wider_than_600mm: number;
}

export interface BOQData {
    filename: string;
    scale: string;
    assumptions: Assumptions;
    walls_230mm_linear_m: number;
    walls_110mm_linear_m: number;
    walls_230mm_area_sqm: number;
    walls_110mm_area_sqm: number;
    total_wall_area_sqm: number;
    openings_deducted_sqm: number;
    net_wall_area_sqm: number;
    bricks_230mm: number;
    bricks_110mm: number;
    total_bricks: number;
    cement_bags: number;
    sand_cubes: number;
    lintels: number;
    wastage_percent: number;
    materials: MaterialLine[];
    subtotal?: number;
    vat_amount?: number;
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
    return new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(amount);
}

const ICONS: Record<string, string> = {
    "brick": "🧱",
    "cement": "🏗️",
    "sand": "⏳",
    "lintel": "🔩",
};

function getIcon(item: string): string {
    const lower = item.toLowerCase();
    for (const [key, icon] of Object.entries(ICONS)) {
        if (lower.includes(key)) return icon;
    }
    return "📦";
}

async function downloadCSV(data: BOQData) {
    const API = process.env.NEXT_PUBLIC_API_URL || "";
    const res = await fetch(`${API}/api/export/csv`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    if (!res.ok) { alert("CSV export failed."); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `costcorrect_boq_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

export default function BOQTable({ data, onReset, tier = "free" }: BOQTableProps) {
    const componentRef = useRef<HTMLDivElement>(null);
    const isPro = tier !== "free";
    const handlePrint = useReactToPrint({
        contentRef: componentRef,
        documentTitle: `CostCorrect_BOQ_${data.filename}`,
    });
    const assumptions = data.assumptions || {};

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
                    AI-assisted suggested takeoff from <strong>{data.filename}</strong>
                    <br />
                    <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic" }}>
                        Verify all quantities on site before procurement.
                    </span>
                </p>

                {/* ── Assumptions Snapshot ─────────────────────────────────────── */}
                <div className="assumptions-panel">
                    <p className="assumptions-title">📋 Assumptions Used</p>
                    <div className="assumptions-grid">
                        <span><strong>Brick:</strong> {assumptions.brick_type === "maxi" ? "Maxi" : "Stock"}</span>
                        <span><strong>Wall Height:</strong> {assumptions.wall_height_m} m</span>
                        <span><strong>Waste:</strong> {assumptions.wastage_percent}%</span>
                        <span><strong>Floors:</strong> {assumptions.floors}</span>
                        <span><strong>Joint:</strong> {assumptions.mortar_joint_mm} mm</span>
                        <span><strong>Openings:</strong> {assumptions.openings_area_sqm} m² deducted</span>
                        {assumptions.openings_wider_than_600mm > 0 && (
                            <span><strong>Lintels:</strong> {assumptions.openings_wider_than_600mm} required</span>
                        )}
                        {assumptions.include_vat && <span><strong>VAT:</strong> 15% included</span>}
                    </div>
                </div>

                {/* ── Meta chips ──────────────────────────────────────────────── */}
                <div className="boq-meta">
                    <div className="meta-chip">
                        <span className="meta-label">Scale</span>
                        <span className="meta-value">{data.scale}</span>
                    </div>
                    <div className="meta-chip">
                        <span className="meta-label">230mm Walls</span>
                        <span className="meta-value">{fmtNum(data.walls_230mm_linear_m)} m</span>
                    </div>
                    <div className="meta-chip">
                        <span className="meta-label">110mm Walls</span>
                        <span className="meta-value">{fmtNum(data.walls_110mm_linear_m)} m</span>
                    </div>
                    <div className="meta-chip">
                        <span className="meta-label">Net Wall Area</span>
                        <span className="meta-value">{fmtNum(data.net_wall_area_sqm)} m²</span>
                    </div>
                    <div className="meta-chip">
                        <span className="meta-label">Total Bricks</span>
                        <span className="meta-value">{fmtNum(data.total_bricks)}</span>
                    </div>
                    {data.lintels > 0 && (
                        <div className="meta-chip">
                            <span className="meta-label">Lintels</span>
                            <span className="meta-value">{data.lintels}</span>
                        </div>
                    )}
                    {data.total_estimated_cost != null && (
                        <div className="meta-chip">
                            <span className="meta-label">Total Cost</span>
                            <span className="meta-value" style={{ color: "#10b981" }}>{fmtCurrency(data.total_estimated_cost)}</span>
                        </div>
                    )}
                </div>

                {/* ── Materials table ─────────────────────────────────────────── */}
                <table className="boq-table" id="boq-materials-table">
                    <thead>
                        <tr>
                            <th>Material</th>
                            <th style={{ textAlign: "right" }}>Quantity</th>
                            {data.assumptions?.estimate_prices && <th style={{ textAlign: "right" }}>Unit Price</th>}
                            {data.assumptions?.estimate_prices && <th style={{ textAlign: "right" }}>Est. Cost (ZAR)</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {data.materials.map((m, i) => (
                            <motion.tr
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.08 }}
                            >
                                <td>
                                    <span className="item-icon">{getIcon(m.item)}</span>
                                    {m.item}
                                    {m.note && <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block", marginTop: "2px" }}>{m.note}</span>}
                                </td>
                                <td style={{ textAlign: "right" }}>
                                    {fmtNum(m.quantity)} <span style={{ color: "var(--text-muted)" }}>{m.unit}</span>
                                </td>
                                {data.assumptions?.estimate_prices && (
                                    <td style={{ textAlign: "right", color: "var(--text-muted)" }}>
                                        {m.unit_price != null ? fmtCurrency(m.unit_price) : "—"}
                                    </td>
                                )}
                                {data.assumptions?.estimate_prices && (
                                    <td style={{ textAlign: "right" }}>
                                        {m.estimated_cost != null ? fmtCurrency(m.estimated_cost) : "—"}
                                    </td>
                                )}
                            </motion.tr>
                        ))}
                    </tbody>
                    {/* Totals footer */}
                    {data.subtotal != null && (
                        <tfoot>
                            <tr>
                                <td colSpan={data.assumptions?.estimate_prices ? 2 : 1} />
                                <td style={{ textAlign: "right", color: "var(--text-muted)", fontWeight: 500 }}>Subtotal</td>
                                <td style={{ textAlign: "right", fontWeight: 600 }}>{fmtCurrency(data.subtotal)}</td>
                            </tr>
                            {data.vat_amount != null && (
                                <tr>
                                    <td colSpan={data.assumptions?.estimate_prices ? 2 : 1} />
                                    <td style={{ textAlign: "right", color: "var(--text-muted)", fontWeight: 500 }}>VAT (15%)</td>
                                    <td style={{ textAlign: "right", fontWeight: 600 }}>{fmtCurrency(data.vat_amount)}</td>
                                </tr>
                            )}
                            <tr style={{ borderTop: "2px solid var(--border-accent)" }}>
                                <td colSpan={data.assumptions?.estimate_prices ? 2 : 1} />
                                <td style={{ textAlign: "right", fontWeight: 700 }}>TOTAL</td>
                                <td style={{ textAlign: "right", fontWeight: 800, color: "#10b981", fontSize: "1.05rem" }}>
                                    {fmtCurrency(data.total_estimated_cost!)}
                                </td>
                            </tr>
                        </tfoot>
                    )}
                </table>

                {/* ── Confidence note ─────────────────────────────────────────── */}
                {data.confidence_note && (
                    <div className="confidence-note">
                        <strong>⚠ AI Note:</strong> {data.confidence_note}
                    </div>
                )}

                <div className="disclaimer-note" style={{ marginTop: "1rem", fontSize: "0.75rem", color: "var(--text-muted)", borderTop: "1px solid var(--border-subtle)", paddingTop: "0.75rem" }}>
                    <strong>Disclaimer:</strong> This is an AI-assisted suggested takeoff. Quantities should be verified on site by a qualified quantity surveyor before procurement. CostCorrect (Pty) Ltd accepts no liability for errors.
                </div>
            </div>

            {/* ── Action Buttons ─────────────────────────────────────────────── */}
            <div className="action-buttons-row" style={{ marginTop: "1.5rem", flexWrap: "wrap" }}>
                <button className="btn-reset" onClick={onReset} id="reset-button">
                    ← Upload another plan
                </button>

                {/* PDF Export */}
                {tier === "free" ? (
                    <button className="btn-success" style={{ opacity: 0.6, cursor: "not-allowed" }}
                        onClick={() => alert("PDF Export is a Pro feature. Please upgrade your account.")}
                        id="download-pdf-button">
                        📄 PDF Report <span className="pro-badge">PRO</span>
                    </button>
                ) : (
                    <button className="btn-success" onClick={() => handlePrint()} id="download-pdf-button">
                        📄 PDF Report
                    </button>
                )}

                {/* CSV Export */}
                <button
                    className="btn-success"
                    style={{ background: "#1d3557", borderColor: "#142844" }}
                    onClick={() => downloadCSV(data)}
                    id="download-csv-button"
                >
                    📊 CSV / Excel
                </button>

                {/* Upgrade prompt for free users */}
                {tier === "free" && (
                    <Link href="/pricing" className="btn-signin" style={{ marginTop: 0 }}>
                        Upgrade for more →
                    </Link>
                )}
            </div>

            <style jsx>{`
                .assumptions-panel {
                    background: rgba(29,53,87,0.05);
                    border: 1px solid var(--border-subtle);
                    border-radius: var(--radius-sm);
                    padding: 0.75rem 1rem;
                    margin-bottom: 1.25rem;
                }
                .assumptions-title { font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--text-secondary); }
                .assumptions-grid { display: flex; flex-wrap: wrap; gap: 0.4rem 1.25rem; font-size: 0.8rem; color: var(--text-secondary); }
                tfoot tr td { padding: 0.5rem 1rem; font-size: 0.9rem; }
            `}</style>
        </motion.div>
    );
}
