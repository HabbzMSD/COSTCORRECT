"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from "@clerk/nextjs";
import UploadZone from "@/components/UploadZone";
import BOQTable, { BOQData } from "@/components/BOQTable";

type AppState = "idle" | "uploading" | "done" | "error";

const API = process.env.NEXT_PUBLIC_API_URL || "";

export default function EstimatorPage() {
    const { getToken, isSignedIn } = useAuth();
    const [state, setState] = useState<AppState>("idle");
    const [file, setFile] = useState<File | null>(null);
    const [boq, setBOQ] = useState<BOQData | null>(null);
    const [error, setError] = useState<string>("");
    const [theme, setTheme] = useState<"light" | "dark">("light");
    const [tier, setTier] = useState<string>("free");

    // Assumption state
    const [floors, setFloors] = useState<number>(1);
    const [estimatePrices, setEstimatePrices] = useState<boolean>(false);
    const [brickType, setBrickType] = useState<string>("stock");
    const [wallHeight, setWallHeight] = useState<number>(2.7);
    const [wastagePercent, setWastagePercent] = useState<number>(10);
    const [openingsArea, setOpeningsArea] = useState<number>(0);
    const [openingsLintels, setOpeningsLintels] = useState<number>(0);
    const [includeVat, setIncludeVat] = useState<boolean>(false);

    useEffect(() => {
        const stored = localStorage.getItem("theme");
        if (stored === "dark" || (!stored && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
            setTheme("dark");
            document.documentElement.setAttribute("data-theme", "dark");
        }
    }, []);

    useEffect(() => {
        const fetchTier = async () => {
            if (isSignedIn) {
                try {
                    const token = await getToken();
                    const res = await fetch(`${API}/api/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setTier(data.tier || "free");
                    }
                } catch (e) {
                    console.error("Failed to fetch tier", e);
                }
            } else {
                setTier("free");
            }
        };
        fetchTier();
    }, [isSignedIn, getToken]);

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

    const handleFileSelected = useCallback((f: File) => { setFile(f); setError(""); }, []);

    const handleUpload = useCallback(async () => {
        if (!file) return;
        setState("uploading");
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", file);
            formData.append("floors", floors.toString());
            formData.append("estimate_prices", estimatePrices.toString());
            formData.append("brick_type", brickType);
            formData.append("wall_height_m", wallHeight.toString());
            formData.append("wastage_percent", wastagePercent.toString());
            formData.append("openings_area_sqm", openingsArea.toString());
            formData.append("openings_wider_than_600mm", openingsLintels.toString());
            formData.append("include_vat", includeVat.toString());

            const headers: Record<string, string> = {};
            if (isSignedIn) {
                const token = await getToken();
                if (token) headers["Authorization"] = `Bearer ${token}`;
            }

            const res = await fetch(`${API}/api/upload`, { method: "POST", headers, body: formData });

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
    }, [file, floors, estimatePrices, brickType, wallHeight, wastagePercent, openingsArea, openingsLintels, includeVat, isSignedIn, getToken]);

    const handleReset = useCallback(() => { setFile(null); setBOQ(null); setError(""); setState("idle"); }, []);

    return (
        <div className="app-container">
            <div className="top-nav-controls">
                <button className="theme-toggle top-nav-item" onClick={toggleTheme} aria-label="Toggle theme">
                    {theme === "light" ? "🌙" : "☀️"}
                </button>
                <div className="top-nav-item auth-buttons">
                    <SignedIn><UserButton afterSignOutUrl="/" /></SignedIn>
                    <SignedOut>
                        <SignInButton mode="modal">
                            <button className="btn-signin">Sign In</button>
                        </SignInButton>
                    </SignedOut>
                </div>
            </div>

            <motion.header
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="app-header"
            >
                <h1>CostCorrect</h1>
                <p>
                    Upload your architectural plan and get a South African Bill of
                    Quantities — bricks, cement, and sand — in seconds.
                </p>
            </motion.header>

            <main className="main-content">
                <motion.div layout transition={{ duration: 0.4, ease: "easeInOut" }} className="glass-card">
                    <AnimatePresence mode="wait">
                        {(state === "idle" || state === "error") && (
                            <motion.div
                                key="upload-view"
                                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }} transition={{ duration: 0.3 }}
                            >
                                <UploadZone
                                    onFileSelected={handleFileSelected}
                                    floors={floors} setFloors={setFloors}
                                    estimatePrices={estimatePrices} setEstimatePrices={setEstimatePrices}
                                    brickType={brickType} setBrickType={setBrickType}
                                    wallHeight={wallHeight} setWallHeight={setWallHeight}
                                    wastagePercent={wastagePercent} setWastagePercent={setWastagePercent}
                                    openingsArea={openingsArea} setOpeningsArea={setOpeningsArea}
                                    openingsLintels={openingsLintels} setOpeningsLintels={setOpeningsLintels}
                                    includeVat={includeVat} setIncludeVat={setIncludeVat}
                                    disabled={false}
                                    tier={tier}
                                />

                                {error && <div className="error-banner" id="error-banner">{error}</div>}

                                <motion.button
                                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    className="btn-primary" onClick={handleUpload} disabled={!file} id="analyse-button"
                                >
                                    🔍 Analyse Plan
                                </motion.button>
                            </motion.div>
                        )}

                        {state === "uploading" && (
                            <motion.div
                                key="loading-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }} className="loading-overlay" id="loading-overlay"
                            >
                                <div className="spinner" />
                                <div className="loading-text">
                                    <strong>Please wait while we carefully analyse your plan…</strong>
                                    Detecting walls, measuring lengths, and calculating materials.
                                </div>
                            </motion.div>
                        )}

                        {state === "done" && boq && (
                            <motion.div key="boq-view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                <BOQTable data={boq} onReset={handleReset} tier={tier} />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </main>
        </div>
    );
}
