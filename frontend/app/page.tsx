"use client";

import React, { useState, useCallback } from "react";
import UploadZone from "@/components/UploadZone";
import BOQTable, { BOQData } from "@/components/BOQTable";

type AppState = "idle" | "uploading" | "done" | "error";

export default function HomePage() {
    const [state, setState] = useState<AppState>("idle");
    const [file, setFile] = useState<File | null>(null);
    const [boq, setBOQ] = useState<BOQData | null>(null);
    const [error, setError] = useState<string>("");

    const handleFileSelected = useCallback((f: File) => {
        setFile(f);
        setError("");
    }, []);

    const handleUpload = useCallback(async () => {
        if (!file) return;

        setState("uploading");
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("/api/upload", {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const detail = await res.json().catch(() => ({}));
                throw new Error(detail.detail || `Upload failed (${res.status})`);
            }

            const data: BOQData = await res.json();
            setBOQ(data);
            setState("done");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Something went wrong";
            setError(message);
            setState("error");
        }
    }, [file]);

    const handleReset = useCallback(() => {
        setFile(null);
        setBOQ(null);
        setError("");
        setState("idle");
    }, []);

    return (
        <div className="app-container">
            {/* ── Header ───────────────────────────────────────────────────── */}
            <header className="app-header">
                <h1>CostCorrect</h1>
                <p>
                    Upload your architectural plan and get a South African Bill of
                    Quantities — bricks, cement, and sand — in seconds.
                </p>
            </header>

            {/* ── Main Card ────────────────────────────────────────────────── */}
            <main className="main-content">
                <div className="glass-card">
                    {/* IDLE or ERROR → show upload zone */}
                    {(state === "idle" || state === "error") && (
                        <>
                            <UploadZone
                                onFileSelected={handleFileSelected}
                                disabled={false}
                            />

                            {error && (
                                <div className="error-banner" id="error-banner">
                                    {error}
                                </div>
                            )}

                            <button
                                className="btn-primary"
                                onClick={handleUpload}
                                disabled={!file}
                                id="analyse-button"
                            >
                                🔍 Analyse Plan
                            </button>
                        </>
                    )}

                    {/* UPLOADING → loading spinner */}
                    {state === "uploading" && (
                        <div className="loading-overlay" id="loading-overlay">
                            <div className="spinner" />
                            <div className="loading-text">
                                <strong>Analysing your plan with Gemini AI…</strong>
                                Detecting walls, measuring lengths, and calculating materials.
                            </div>
                        </div>
                    )}

                    {/* DONE → BOQ table */}
                    {state === "done" && boq && (
                        <BOQTable data={boq} onReset={handleReset} />
                    )}
                </div>
            </main>
        </div>
    );
}
