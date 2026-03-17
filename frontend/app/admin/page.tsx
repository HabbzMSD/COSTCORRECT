"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { Users, Activity, ChevronDown, Shield, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";

type User = { id: string; email: string; tier: string; created_at: string };
type AuditEntry = { id: string; user_id: string; action: string; resource: string; detail: string; created_at: string };

export default function AdminPage() {
    const { getToken } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updatingUser, setUpdatingUser] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"users" | "logs">("users");

    const API = process.env.NEXT_PUBLIC_API_URL;

    async function authHeaders() {
        const token = await getToken();
        return { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
    }

    async function loadData() {
        setLoading(true);
        setError(null);
        try {
            const headers = await authHeaders();
            const [uRes, lRes] = await Promise.all([
                fetch(`${API}/api/admin/users`, { headers }),
                fetch(`${API}/api/admin/audit-logs?limit=50`, { headers }),
            ]);
            if (uRes.status === 403) { setError("Access denied. Admin role required."); return; }
            setUsers(await uRes.json());
            setAuditLogs(await lRes.json());
        } catch (e) {
            setError("Failed to load admin data. Is the backend running?");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => { loadData(); }, []);

    async function updateTier(userId: string, newTier: string) {
        setUpdatingUser(userId);
        try {
            const headers = await authHeaders();
            await fetch(`${API}/api/admin/users/${userId}/tier`, {
                method: "PATCH",
                headers,
                body: JSON.stringify({ tier: newTier }),
            });
            setUsers(prev => prev.map(u => u.id === userId ? { ...u, tier: newTier } : u));
        } catch (e) {
            alert("Failed to update tier.");
        } finally {
            setUpdatingUser(null);
        }
    }

    const tierCounts = users.reduce((acc, u) => {
        acc[u.tier] = (acc[u.tier] || 0) + 1; return acc;
    }, {} as Record<string, number>);

    const tierColor: Record<string, string> = {
        free: "#64748b", pro: "#10b981", admin: "#e63946", enterprise: "#f59e0b",
    };

    return (
        <div className="admin-page">
            <header className="admin-header">
                <Link href="/" className="logo-text">COSTCORRECT</Link>
                <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                    <button onClick={loadData} className="btn-icon" title="Refresh"><RefreshCw size={16} /></button>
                    <Link href="/" className="btn-signin">← Dashboard</Link>
                </div>
            </header>

            <div className="admin-body">
                <div className="admin-title">
                    <Shield size={20} className="text-accent" />
                    <div>
                        <h1>Admin Dashboard</h1>
                        <p>Manage users, subscriptions, and audit logs</p>
                    </div>
                </div>

                {error && (
                    <div className="error-banner" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
                        <AlertTriangle size={16} /> {error}
                    </div>
                )}

                {/* Stats Row */}
                <div className="admin-stats">
                    {[
                        { label: "Total Users", value: users.length, icon: <Users size={16} /> },
                        { label: "Free", value: tierCounts.free || 0 },
                        { label: "Pro", value: tierCounts.pro || 0 },
                        { label: "Audit Entries", value: auditLogs.length, icon: <Activity size={16} /> },
                    ].map(({ label, value, icon }) => (
                        <div key={label} className="glass-card admin-stat">
                            <span className="stat-label">{icon}{label}</span>
                            <span className="stat-value">{loading ? "—" : value}</span>
                        </div>
                    ))}
                </div>

                {/* Tabs */}
                <div className="admin-tabs">
                    <button className={`admin-tab ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
                        <Users size={14} /> Users
                    </button>
                    <button className={`admin-tab ${activeTab === "logs" ? "active" : ""}`} onClick={() => setActiveTab("logs")}>
                        <Activity size={14} /> Audit Logs
                    </button>
                </div>

                {activeTab === "users" && (
                    <div className="glass-card" style={{ overflow: "auto" }}>
                        {loading ? (
                            <div style={{ padding: "2rem", textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>User ID</th>
                                        <th>Plan</th>
                                        <th>Joined</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u) => (
                                        <tr key={u.id}>
                                            <td>{u.email}</td>
                                            <td style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-muted)" }}>{u.id.slice(0, 20)}…</td>
                                            <td>
                                                <span className="tier-badge" style={{ background: tierColor[u.tier] || "#64748b" }}>
                                                    {u.tier}
                                                </span>
                                            </td>
                                            <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
                                                {new Date(u.created_at).toLocaleDateString("en-ZA")}
                                            </td>
                                            <td>
                                                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                                    <select
                                                        className="config-select"
                                                        defaultValue={u.tier}
                                                        onChange={(e) => updateTier(u.id, e.target.value)}
                                                        disabled={updatingUser === u.id}
                                                        style={{ padding: "0.3rem 0.5rem", fontSize: "0.8rem", width: "auto" }}
                                                    >
                                                        <option value="free">Free</option>
                                                        <option value="pro">Pro</option>
                                                        <option value="admin">Admin</option>
                                                        <option value="enterprise">Enterprise</option>
                                                    </select>
                                                    {updatingUser === u.id && <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}

                {activeTab === "logs" && (
                    <div className="glass-card" style={{ overflow: "auto" }}>
                        {loading ? (
                            <div style={{ padding: "2rem", textAlign: "center" }}><div className="spinner" style={{ margin: "0 auto" }} /></div>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Action</th>
                                        <th>User ID</th>
                                        <th>Resource</th>
                                        <th>Detail</th>
                                        <th>Timestamp</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {auditLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td><span className="action-badge">{log.action}</span></td>
                                            <td style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-muted)" }}>{log.user_id?.slice(0, 16)}…</td>
                                            <td style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>{log.resource || "—"}</td>
                                            <td style={{ fontSize: "0.8rem", maxWidth: 200 }}>{log.detail || "—"}</td>
                                            <td style={{ color: "var(--text-muted)", fontSize: "0.8rem", whiteSpace: "nowrap" }}>
                                                {new Date(log.created_at).toLocaleString("en-ZA")}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            <style jsx>{`
        .admin-page { min-height: 100vh; background: var(--bg-primary); }
        .admin-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 1.5rem 2rem; border-bottom: 1px solid var(--border-subtle);
          position: sticky; top: 0; background: var(--bg-primary); z-index: 100;
        }
        .admin-body { max-width: 1200px; margin: 0 auto; padding: 2rem 1.5rem; }
        .text-accent { color: var(--accent); }
        .admin-title { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 2rem; }
        .admin-title h1 { font-size: 1.5rem; font-weight: 700; margin: 0; }
        .admin-title p { font-size: 0.875rem; color: var(--text-muted); margin: 0; }
        .admin-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
        .admin-stat { padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 0.25rem; }
        .stat-label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: var(--text-muted); font-weight: 500; }
        .stat-value { font-size: 1.75rem; font-weight: 700; color: var(--text-primary); }
        .admin-tabs { display: flex; gap: 0.5rem; margin-bottom: 1rem; }
        .admin-tab {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.5rem 1rem; border-radius: var(--radius-sm);
          border: 1px solid var(--border-subtle); background: transparent;
          color: var(--text-secondary); font-weight: 600; font-size: 0.875rem;
          cursor: pointer; font-family: inherit; transition: all 0.2s;
        }
        .admin-tab.active { background: var(--accent); color: white; border-color: var(--accent); }
        .tier-badge { padding: 0.2rem 0.6rem; border-radius: 12px; color: white; font-size: 0.72rem; font-weight: 700; text-transform: uppercase; }
        .action-badge { padding: 0.2rem 0.5rem; border-radius: 6px; background: rgba(99,102,241,0.1); color: var(--text-secondary); font-size: 0.75rem; font-weight: 600; font-family: monospace; }
        .btn-icon { display: inline-flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; border: 1px solid var(--border-subtle); background: var(--bg-card); color: var(--text-secondary); cursor: pointer; transition: all 0.2s; }
        .btn-icon:hover { border-color: var(--accent); color: var(--accent); }
      `}</style>
        </div>
    );
}
