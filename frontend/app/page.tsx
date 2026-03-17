"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, DollarSign, TrendingUp, LogOut, FileText, Calculator, BarChart3 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Area,
    AreaChart,
} from "recharts";

export default function DashboardPage() {
    const { isLoaded, isSignedIn, signOut } = useAuth();
    const router = useRouter();

    // Assuming user details are mocked for the dashboard UI since Clerk useAuth doesn't expose all user data synchronously without useUser
    const user = { username: "Admin", role: "admin" };
    const isAdmin = user.role === "admin";

    const revenueData = [
        { month: "Jan", revenue: 12500, costs: 8200, profit: 4300 },
        { month: "Feb", revenue: 15800, costs: 9100, profit: 6700 },
        { month: "Mar", revenue: 18200, costs: 10500, profit: 7700 },
        { month: "Apr", revenue: 22100, costs: 12200, profit: 9900 },
        { month: "May", revenue: 25400, costs: 13800, profit: 11600 },
        { month: "Jun", revenue: 28900, costs: 15200, profit: 13700 },
    ];

    const projectData = [
        { name: "Residential", value: 45, color: "#E31E24" },
        { name: "Commercial", value: 30, color: "#1E3A5F" },
        { name: "Industrial", value: 15, color: "#10b981" },
        { name: "Renovations", value: 10, color: "#f59e0b" },
    ];

    const userActivityData = [
        { day: "Mon", estimates: 45, conversions: 12 },
        { day: "Tue", estimates: 52, conversions: 15 },
        { day: "Wed", estimates: 48, conversions: 14 },
        { day: "Thu", estimates: 61, conversions: 18 },
        { day: "Fri", estimates: 55, conversions: 16 },
        { day: "Sat", estimates: 32, conversions: 9 },
        { day: "Sun", estimates: 28, conversions: 7 },
    ];

    const customers = [
        { id: 1, name: "ABC Construction", email: "contact@abc.co.za", plan: "Professional", mrr: 599, status: "Active", projects: 12 },
        { id: 2, name: "BuildRight Co", email: "info@buildright.co.za", plan: "Enterprise", mrr: 1499, status: "Active", projects: 24 },
        { id: 3, name: "Premier Homes", email: "hello@premier.co.za", plan: "Starter", mrr: 99, status: "Active", projects: 5 },
        { id: 4, name: "Urban Developers", email: "team@urban.co.za", plan: "Professional", mrr: 599, status: "Trial", projects: 8 },
    ];

    const recentEstimates = [
        { id: 1, project: "2 Bedroom House", client: "John Smith", value: "R 245,000", date: "2024-12-20", status: "Completed" },
        { id: 2, project: "Office Building", client: "ABC Construction", value: "R 1,250,000", date: "2024-12-19", status: "In Progress" },
        { id: 3, project: "Kitchen Renovation", client: "Mary Johnson", value: "R 85,000", date: "2024-12-18", status: "Completed" },
        { id: 4, project: "Shopping Center", client: "BuildRight Co", value: "R 3,500,000", date: "2024-12-17", status: "Pending" },
    ];

    const metrics = {
        totalRevenue: "R 123,000",
        monthlyGrowth: "+23.5%",
        activeUsers: "847",
        conversionRate: "28.4%",
        totalEstimates: "2,341",
        avgProjectValue: "R 185,000",
        customerSat: "94%",
        churnRate: "2.1%",
    };

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="dashboard-header-inner">
                    <Link href="/" className="logo-link">
                        <span className="logo-text">COSTCORRECT</span>
                    </Link>
                    <div className="header-actions">
                        <div className="user-info">
                            <p className="username">{user.username}</p>
                            <p className="user-role">{user.role}</p>
                        </div>
                        <button className="btn-logout" onClick={() => signOut()}>
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            </header>

            <div className="dashboard-content">
                <div className="dashboard-greeting">
                    <h1>Dashboard</h1>
                    <p>Welcome back, {user.username}! Here's your overview.</p>
                </div>

                <Tabs defaultValue="overview" className="dashboard-tabs">
                    <TabsList className="dashboard-tabs-list">
                        <TabsTrigger value="overview">Overview</TabsTrigger>
                        {isAdmin && <TabsTrigger value="crm">CRM</TabsTrigger>}
                        <TabsTrigger value="estimates">Estimates</TabsTrigger>
                        {isAdmin && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
                        <TabsTrigger value="tools">Tools</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <div className="metrics-grid">
                            <Card>
                                <CardHeader className="card-header-flex">
                                    <CardTitle>Total Revenue</CardTitle>
                                    <DollarSign size={16} className="text-accent" />
                                </CardHeader>
                                <CardContent>
                                    <div className="metric-value">{metrics.totalRevenue}</div>
                                    <p className="metric-subtitle pos">{metrics.monthlyGrowth} from last month</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="card-header-flex">
                                    <CardTitle>Active Users</CardTitle>
                                    <Users size={16} className="text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="metric-value">{metrics.activeUsers}</div>
                                    <p className="metric-subtitle">Across all plans</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="card-header-flex">
                                    <CardTitle>Total Estimates</CardTitle>
                                    <Calculator size={16} className="text-accent" />
                                </CardHeader>
                                <CardContent>
                                    <div className="metric-value">{metrics.totalEstimates}</div>
                                    <p className="metric-subtitle">This month</p>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="card-header-flex">
                                    <CardTitle>Conversion Rate</CardTitle>
                                    <TrendingUp size={16} className="text-primary" />
                                </CardHeader>
                                <CardContent>
                                    <div className="metric-value">{metrics.conversionRate}</div>
                                    <p className="metric-subtitle pos">+2.1% from last week</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="charts-grid">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Revenue Overview</CardTitle>
                                    <CardDescription>Monthly revenue, costs, and profit</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="chart-wrapper">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <AreaChart data={revenueData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="month" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Area type="monotone" dataKey="revenue" stackId="1" stroke="#1E3A5F" fill="#1E3A5F" fillOpacity={0.6} />
                                                <Area type="monotone" dataKey="costs" stackId="2" stroke="#E31E24" fill="#E31E24" fillOpacity={0.6} />
                                                <Area type="monotone" dataKey="profit" stackId="3" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Project Distribution</CardTitle>
                                    <CardDescription>By project type</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="chart-wrapper">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={projectData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {projectData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <Card className="mt-6">
                            <CardHeader>
                                <CardTitle>Recent Estimates</CardTitle>
                                <CardDescription>Latest project estimates from your team</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="estimates-list">
                                    {recentEstimates.map((estimate) => (
                                        <div key={estimate.id} className="estimate-item">
                                            <div className="estimate-info">
                                                <p className="estimate-name">{estimate.project}</p>
                                                <p className="estimate-client">{estimate.client}</p>
                                            </div>
                                            <div className="estimate-val-date">
                                                <p className="estimate-value">{estimate.value}</p>
                                                <p className="estimate-date">{estimate.date}</p>
                                            </div>
                                            <div className="estimate-status-wrapper">
                                                <span className={`status-badge status-${estimate.status.replace(" ", "-").toLowerCase()}`}>
                                                    {estimate.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {isAdmin && (
                        <TabsContent value="crm">
                            <div className="metrics-grid">
                                <Card>
                                    <CardHeader><CardTitle>MRR</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="metric-value">R 38,764</div>
                                        <p className="metric-subtitle pos">+12.3% growth</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle>Total Customers</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="metric-value">847</div>
                                        <p className="metric-subtitle">42 new this month</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle>Churn Rate</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="metric-value">{metrics.churnRate}</div>
                                        <p className="metric-subtitle pos">Below industry avg</p>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader><CardTitle>Customer Satisfaction</CardTitle></CardHeader>
                                    <CardContent>
                                        <div className="metric-value">{metrics.customerSat}</div>
                                        <p className="metric-subtitle">Based on 523 reviews</p>
                                    </CardContent>
                                </Card>
                            </div>

                            <Card className="mt-6">
                                <CardHeader>
                                    <CardTitle>Customer Database</CardTitle>
                                    <CardDescription>Manage and track all customers</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="table-responsive">
                                        <table className="data-table">
                                            <thead>
                                                <tr>
                                                    <th>Company</th>
                                                    <th>Contact</th>
                                                    <th>Plan</th>
                                                    <th>MRR</th>
                                                    <th>Projects</th>
                                                    <th>Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {customers.map((customer) => (
                                                    <tr key={customer.id}>
                                                        <td className="font-medium">{customer.name}</td>
                                                        <td className="text-muted">{customer.email}</td>
                                                        <td><span className="badge badge-plan">{customer.plan}</span></td>
                                                        <td className="font-bold">R {customer.mrr}</td>
                                                        <td>{customer.projects}</td>
                                                        <td>
                                                            <span className={`status-badge status-${customer.status.toLowerCase()}`}>
                                                                {customer.status}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    <TabsContent value="estimates">
                        <div className="tab-header">
                            <div>
                                <h2>Your Estimates</h2>
                                <p>View and manage all project estimates</p>
                            </div>
                            <Link href="/estimator" className="btn-primary" style={{ width: 'auto', marginTop: 0 }}>
                                <Calculator size={16} /> New Estimate
                            </Link>
                        </div>

                        <Card className="mt-6">
                            <CardContent className="pt-6">
                                <div className="estimates-list-large">
                                    {recentEstimates.map((estimate) => (
                                        <div key={estimate.id} className="estimate-card">
                                            <div className="flex items-center gap-4">
                                                <div className="estimate-icon">
                                                    <FileText size={20} />
                                                </div>
                                                <div>
                                                    <p className="estimate-name">{estimate.project}</p>
                                                    <p className="estimate-date">{estimate.client} • {estimate.date}</p>
                                                </div>
                                            </div>
                                            <div className="estimate-val-large">
                                                <p className="font-bold text-lg">{estimate.value}</p>
                                                <span className={`status-badge mt-2 status-${estimate.status.replace(" ", "-").toLowerCase()}`}>
                                                    {estimate.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {isAdmin && (
                        <TabsContent value="analytics">
                            <Card>
                                <CardHeader>
                                    <CardTitle>User Activity Trends</CardTitle>
                                    <CardDescription>Estimates created and conversion rates</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="chart-wrapper">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={userActivityData}>
                                                <CartesianGrid strokeDasharray="3 3" />
                                                <XAxis dataKey="day" />
                                                <YAxis />
                                                <Tooltip />
                                                <Legend />
                                                <Bar dataKey="estimates" fill="#1E3A5F" />
                                                <Bar dataKey="conversions" fill="#E31E24" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    )}

                    <TabsContent value="tools">
                        <div className="tab-header">
                            <div>
                                <h2>Quick Access Tools</h2>
                                <p>Jump to your most-used features</p>
                            </div>
                        </div>

                        <div className="tools-grid mt-6">
                            <Link href="/estimator" className="tool-card hover-glow">
                                <CardHeader>
                                    <div className="tool-icon bg-accent">
                                        <Calculator size={24} />
                                    </div>
                                    <CardTitle>Material Estimator</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="tool-desc">Calculate construction materials with AI assistance</p>
                                </CardContent>
                            </Link>

                            <Link href="/material-pricing" className="tool-card hover-glow">
                                <CardHeader>
                                    <div className="tool-icon bg-primary">
                                        <TrendingUp size={24} />
                                    </div>
                                    <CardTitle>Price Comparison</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="tool-desc">Compare suppliers and find optimal pricing</p>
                                </CardContent>
                            </Link>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
