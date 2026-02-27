"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UploadZone from "@/components/UploadZone";
import BOQTable, { BOQData } from "@/components/BOQTable";

type AppState = "idle" | "uploading" | "done" | "error";

export default function HomePage() {
    const [state, setState] = useState<AppState>("idle");
    const [file, setFile] = useState<File | null>(null);
    const [floors, setFloors] = useState<number>(1);
    const [estimatePrices, setEstimatePrices] = useState<boolean>(false);
    const [boq, setBOQ] = useState<BOQData | null>(null);
    const [error, setError] = useState<string>("");
    const [theme, setTheme] = useState<"light" | "dark">("light");

    React.useEffect(() => {
        const stored = localStorage.getItem("theme");
        if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            setTheme("dark");
        }
    }, []);

    const toggleTheme = useCallback(() => {
        setTheme((prev) => {
            const next = prev === "light" ? "dark" : "light";
            if (next === "dark") {
                document.documentElement.setAttribute("data-theme", "dark");
            } else {
                document.documentElement.removeAttribute("data-theme");
            }
            localStorage.setItem("theme", next);
            return next;
        });
    }, []);

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
            formData.append("floors", floors.toString());
            formData.append("estimate_prices", estimatePrices.toString());

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
            <button
                className="theme-toggle"
                onClick={toggleTheme}
                aria-label="Toggle theme"
            >
                {theme === "light" ? "🌙" : "☀️"}
            </button>

            {/* ── Header ───────────────────────────────────────────────────── */}
            <motion.header
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="app-header"
            >
                <h1>CostCorrect</h1>
                <p>
                    Upload your architectural plan and get a South African Bill of
                    Quantities — bricks, cement, and sand — in seconds.
                </p>
            </motion.header>

            {/* ── Main Card ────────────────────────────────────────────────── */}
            <main className="main-content">
                <motion.div
                    layout
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="glass-card"
                >
                    <AnimatePresence mode="wait">
                        {/* IDLE or ERROR → show upload zone */}
                        {(state === "idle" || state === "error") && (
                            <motion.div
                                key="upload-view"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                <UploadZone
                                    onFileSelected={handleFileSelected}
                                    floors={floors}
                                    setFloors={setFloors}
                                    estimatePrices={estimatePrices}
                                    setEstimatePrices={setEstimatePrices}
                                    disabled={false}
                                />

                                {error && (
                                    <div className="error-banner" id="error-banner">
                                        {error}
                                    </div>
                                )}

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="btn-primary"
                                    onClick={handleUpload}
                                    disabled={!file}
                                    id="analyse-button"
                                >
                                    🔍 Analyse Plan
                                </motion.button>
                            </motion.div>
                        )}

                        {/* UPLOADING → loading spinner */}
                        {state === "uploading" && (
                            <motion.div
                                key="loading-view"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="loading-overlay"
                                id="loading-overlay"
                            >
                                <div className="spinner" />
                                <div className="loading-text">
                                    <strong>Analysing your plan with Gemini AI…</strong>
                                    Detecting walls, measuring lengths, and calculating materials.
                                </div>
                            </motion.div>
                        )}

                        {/* DONE → BOQ table */}
                        {state === "done" && boq && (
                            <motion.div
                                key="boq-view"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                            >
                                <BOQTable data={boq} onReset={handleReset} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
}
