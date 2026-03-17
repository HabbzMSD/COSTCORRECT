"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Shield, Download, Trash2, Eye, Clock, Lock, AlertTriangle, CheckCircle } from "lucide-react";

export default function PrivacyPage() {
    const { getToken, isSignedIn } = useAuth();
    const [exportStatus, setExportStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
    const [deleteStatus, setDeleteStatus] = useState<"idle" | "confirm" | "loading" | "done" | "error">("idle");
    const [exportedData, setExportedData] = useState<any>(null);

    const API = process.env.NEXT_PUBLIC_API_URL;

    async function handleExport() {
        setExportStatus("loading");
        try {
            const token = await getToken();
            const res = await fetch(`${API}/api/popia/export`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Export failed");
            const data = await res.json();
            setExportedData(data);
            // Download as JSON file
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url; a.download = `costcorrect_my_data_${new Date().toISOString().slice(0, 10)}.json`;
            a.click(); URL.revokeObjectURL(url);
            setExportStatus("done");
        } catch {
            setExportStatus("error");
        }
    }

    async function handleDelete() {
        if (deleteStatus !== "confirm") { setDeleteStatus("confirm"); return; }
        setDeleteStatus("loading");
        try {
            const token = await getToken();
            const res = await fetch(`${API}/api/popia/delete-my-data`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Deletion failed");
            setDeleteStatus("done");
        } catch {
            setDeleteStatus("error");
        }
    }

    return (
        <div className="privacy-page">
            <header className="privacy-nav">
                <Link href="/" className="logo-text">COSTCORRECT</Link>
                <Link href="/" className="btn-signin">← Back</Link>
            </header>

            <div className="privacy-body">
                {/* Hero */}
                <div className="privacy-hero">
                    <div className="privacy-icon-wrap"><Shield size={32} /></div>
                    <h1>Privacy & Data Settings</h1>
                    <p>
                        CostCorrect is built to comply with the <strong>Protection of Personal Information Act (POPIA)</strong>.
                        You have full control over the personal data we hold.
                    </p>
                </div>

                {/* POPIA Rights */}
                <div className="rights-grid">
                    {[
                        { icon: <Eye size={20} />, title: "Right to Access (Section 23)", desc: "View and download all data we hold about you at any time. Export includes your profile, estimates, and activity logs." },
                        { icon: <Trash2 size={20} />, title: "Right to Deletion (Section 24)", desc: "Request deletion of your personal data. Anonymised audit logs are retained for 12 months for legal compliance, then deleted." },
                        { icon: <Clock size={20} />, title: "Data Retention", desc: "Uploaded plans are retained for the duration of your subscription. Free tier uploads are deleted after 30 days of inactivity." },
                        { icon: <Lock size={20} />, title: "Storage & Encryption", desc: "All files are stored in Google Cloud africa-south1 (Johannesburg) and encrypted at rest with AES-256. Access is via signed URLs only." },
                    ].map(({ icon, title, desc }) => (
                        <div key={title} className="glass-card right-card">
                            <div className="right-icon">{icon}</div>
                            <h3>{title}</h3>
                            <p>{desc}</p>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="actions-section">
                    <h2>Your Personal Data</h2>
                    <p className="section-subtitle">
                        Actions below apply to your account only. They are logged for audit purposes.
                    </p>

                    {!isSignedIn && (
                        <div className="error-banner" style={{ marginBottom: "1rem" }}>
                            <AlertTriangle size={16} style={{ display: "inline", marginRight: "0.4rem" }} />
                            You must be signed in to manage your data.{" "}
                            <Link href="/sign-in" style={{ color: "var(--accent)" }}>Sign in →</Link>
                        </div>
                    )}

                    <div className="action-cards">
                        {/* Export */}
                        <div className="glass-card action-card">
                            <div className="action-header">
                                <div className="action-icon export-icon"><Download size={20} /></div>
                                <div>
                                    <h3>Export My Data</h3>
                                    <p>Download a JSON file containing all data held for your account.</p>
                                </div>
                            </div>
                            <button
                                className={`btn-primary action-btn ${exportStatus === "loading" ? "loading" : ""}`}
                                onClick={handleExport}
                                disabled={!isSignedIn || exportStatus === "loading"}
                                style={{ marginTop: "1rem", width: "auto", display: "inline-flex" }}
                            >
                                <Download size={14} />
                                {exportStatus === "loading" ? "Exporting…" : exportStatus === "done" ? "Downloaded!" : "Export My Data"}
                            </button>
                            {exportStatus === "done" && (
                                <p className="action-success"><CheckCircle size={14} /> Your data has been downloaded.</p>
                            )}
                            {exportStatus === "error" && (
                                <p className="action-error"><AlertTriangle size={14} /> Export failed. Please try again.</p>
                            )}
                        </div>

                        {/* Delete */}
                        <div className="glass-card action-card delete-card">
                            <div className="action-header">
                                <div className="action-icon delete-icon"><Trash2 size={20} /></div>
                                <div>
                                    <h3>Delete My Account Data</h3>
                                    <p>Permanently delete your profile, projects, and estimates. This cannot be undone.</p>
                                </div>
                            </div>

                            {deleteStatus === "done" ? (
                                <p className="action-success" style={{ marginTop: "1rem" }}>
                                    <CheckCircle size={14} /> Your data has been deleted. Audit logs are retained for 12 months.
                                </p>
                            ) : (
                                <>
                                    {deleteStatus === "confirm" && (
                                        <div className="confirm-warning" style={{ marginTop: "1rem" }}>
                                            <AlertTriangle size={14} />
                                            <span>Are you absolutely sure? This is <strong>irreversible</strong>.</span>
                                        </div>
                                    )}
                                    <button
                                        className="btn-delete"
                                        onClick={handleDelete}
                                        disabled={!isSignedIn || deleteStatus === "loading"}
                                        style={{ marginTop: "0.75rem" }}
                                    >
                                        <Trash2 size={14} />
                                        {deleteStatus === "loading" ? "Deleting…"
                                            : deleteStatus === "confirm" ? "Yes, Delete All My Data"
                                                : "Request Data Deletion"}
                                    </button>
                                    {deleteStatus === "error" && (
                                        <p className="action-error"><AlertTriangle size={14} /> Deletion failed. Contact support@costcorrect.co.za</p>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Policy summary */}
                <div className="policy-summary glass-card">
                    <h2>Data We Collect</h2>
                    <table className="data-table" style={{ marginTop: "1rem" }}>
                        <thead>
                            <tr><th>Data Type</th><th>Purpose</th><th>Retained</th></tr>
                        </thead>
                        <tbody>
                            {[
                                ["Email address", "Account identification & login", "Duration of account"],
                                ["Uploaded PDF/image plans", "AI-assisted take-off analysis", "30 days (free) / subscription duration (pro)"],
                                ["BOQ calculation results", "History & re-export", "Duration of account"],
                                ["Activity logs", "POPIA audit trail", "12 months"],
                                ["Payment information", "Billing (held by Stripe, not CostCorrect)", "Stripe's policy"],
                            ].map(([type, purpose, retention]) => (
                                <tr key={type}>
                                    <td>{type}</td>
                                    <td style={{ color: "var(--text-secondary)", fontSize: "0.875rem" }}>{purpose}</td>
                                    <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{retention}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <p style={{ marginTop: "1.5rem", fontSize: "0.8rem", color: "var(--text-muted)" }}>
                        CostCorrect (Pty) Ltd acts as the Responsible Party under POPIA. For queries contact{" "}
                        <a href="mailto:privacy@costcorrect.co.za" style={{ color: "var(--accent)" }}>privacy@costcorrect.co.za</a>
                    </p>
                </div>
            </div>

            <style jsx>{`
        .privacy-page { min-height: 100vh; background: var(--bg-primary); }
        .privacy-nav { display: flex; align-items: center; justify-content: space-between; padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-subtle); }
        .privacy-body { max-width: 960px; margin: 0 auto; padding: 2.5rem 1.5rem; }
        .privacy-hero { text-align: center; margin-bottom: 3rem; }
        .privacy-icon-wrap { display: inline-flex; align-items: center; justify-content: center; width: 64px; height: 64px; border-radius: 50%; background: var(--accent-glow); color: var(--accent); margin-bottom: 1rem; }
        .privacy-hero h1 { font-size: 2rem; font-weight: 800; margin-bottom: 0.75rem; }
        .privacy-hero p { color: var(--text-secondary); max-width: 560px; margin: 0 auto; line-height: 1.7; }
        .rights-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1rem; margin-bottom: 3rem; }
        .right-card { display: flex; flex-direction: column; gap: 0.75rem; }
        .right-icon { width: 40px; height: 40px; border-radius: var(--radius-sm); background: var(--accent-glow); color: var(--accent); display: flex; align-items: center; justify-content: center; }
        .right-card h3 { font-size: 0.95rem; font-weight: 700; }
        .right-card p { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; }
        .actions-section { margin-bottom: 3rem; }
        .actions-section h2 { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.5rem; }
        .section-subtitle { color: var(--text-muted); font-size: 0.875rem; margin-bottom: 1.5rem; }
        .action-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1rem; }
        .action-card { }
        .delete-card { border-color: rgba(239,68,68,0.2) !important; }
        .action-header { display: flex; align-items: flex-start; gap: 1rem; }
        .action-icon { width: 44px; height: 44px; border-radius: var(--radius-sm); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .export-icon { background: rgba(16,185,129,0.1); color: #10b981; }
        .delete-icon { background: rgba(239,68,68,0.1); color: #ef4444; }
        .action-header h3 { font-size: 0.95rem; font-weight: 700; margin-bottom: 0.25rem; }
        .action-header p { font-size: 0.85rem; color: var(--text-secondary); }
        .action-success { display: flex; align-items: center; gap: 0.4rem; color: #10b981; font-size: 0.85rem; margin-top: 0.75rem; }
        .action-error { display: flex; align-items: center; gap: 0.4rem; color: var(--error); font-size: 0.85rem; margin-top: 0.75rem; }
        .confirm-warning { display: flex; align-items: center; gap: 0.5rem; color: #f59e0b; font-size: 0.875rem; }
        .btn-delete { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.625rem 1.25rem; background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); border-radius: var(--radius-sm); font-weight: 600; font-size: 0.875rem; cursor: pointer; font-family: inherit; transition: all 0.2s; }
        .btn-delete:hover:not(:disabled) { background: #ef4444; color: white; }
        .btn-delete:disabled { opacity: 0.5; cursor: not-allowed; }
        .policy-summary { }
        .policy-summary h2 { font-size: 1.25rem; font-weight: 700; }
      `}</style>
        </div>
    );
}
