"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, DollarSign, TrendingUp, LogOut, FileText, Calculator, BarChart3 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
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
} from "recharts"

export default function DashboardPage() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  const isAdmin = user.role === "admin"

  // Mock data for charts
  const revenueData = [
    { month: "Jan", revenue: 12500, costs: 8200, profit: 4300 },
    { month: "Feb", revenue: 15800, costs: 9100, profit: 6700 },
    { month: "Mar", revenue: 18200, costs: 10500, profit: 7700 },
    { month: "Apr", revenue: 22100, costs: 12200, profit: 9900 },
    { month: "May", revenue: 25400, costs: 13800, profit: 11600 },
    { month: "Jun", revenue: 28900, costs: 15200, profit: 13700 },
  ]

  const projectData = [
    { name: "Residential", value: 45, color: "#E31E24" },
    { name: "Commercial", value: 30, color: "#1E3A5F" },
    { name: "Industrial", value: 15, color: "#10b981" },
    { name: "Renovations", value: 10, color: "#f59e0b" },
  ]

  const userActivityData = [
    { day: "Mon", estimates: 45, conversions: 12 },
    { day: "Tue", estimates: 52, conversions: 15 },
    { day: "Wed", estimates: 48, conversions: 14 },
    { day: "Thu", estimates: 61, conversions: 18 },
    { day: "Fri", estimates: 55, conversions: 16 },
    { day: "Sat", estimates: 32, conversions: 9 },
    { day: "Sun", estimates: 28, conversions: 7 },
  ]

  const customers = [
    {
      id: 1,
      name: "ABC Construction",
      email: "contact@abc.co.za",
      plan: "Professional",
      mrr: 599,
      status: "Active",
      projects: 12,
    },
    {
      id: 2,
      name: "BuildRight Co",
      email: "info@buildright.co.za",
      plan: "Enterprise",
      mrr: 1499,
      status: "Active",
      projects: 24,
    },
    {
      id: 3,
      name: "Premier Homes",
      email: "hello@premier.co.za",
      plan: "Starter",
      mrr: 99,
      status: "Active",
      projects: 5,
    },
    {
      id: 4,
      name: "Urban Developers",
      email: "team@urban.co.za",
      plan: "Professional",
      mrr: 599,
      status: "Trial",
      projects: 8,
    },
  ]

  const recentEstimates = [
    {
      id: 1,
      project: "2 Bedroom House",
      client: "John Smith",
      value: "R 245,000",
      date: "2024-12-20",
      status: "Completed",
    },
    {
      id: 2,
      project: "Office Building",
      client: "ABC Construction",
      value: "R 1,250,000",
      date: "2024-12-19",
      status: "In Progress",
    },
    {
      id: 3,
      project: "Kitchen Renovation",
      client: "Mary Johnson",
      value: "R 85,000",
      date: "2024-12-18",
      status: "Completed",
    },
    {
      id: 4,
      project: "Shopping Center",
      client: "BuildRight Co",
      value: "R 3,500,000",
      date: "2024-12-17",
      status: "Pending",
    },
  ]

  const metrics = {
    totalRevenue: "R 123,000",
    monthlyGrowth: "+23.5%",
    activeUsers: "847",
    conversionRate: "28.4%",
    totalEstimates: "2,341",
    avgProjectValue: "R 185,000",
    customerSat: "94%",
    churnRate: "2.1%",
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="COSTCORRECT Logo" width={32} height={32} className="h-8 w-8 object-contain" />
              <span className="text-xl font-bold text-primary">COSTCORRECT</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user.username}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="border-accent text-accent hover:bg-accent/10 bg-transparent"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.username}! Here's your overview.</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Overview
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger
                value="crm"
                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
              >
                CRM
              </TabsTrigger>
            )}
            <TabsTrigger
              value="estimates"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Estimates
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger
                value="analytics"
                className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
              >
                Analytics
              </TabsTrigger>
            )}
            <TabsTrigger
              value="tools"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
            >
              Tools
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-accent/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  <DollarSign className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalRevenue}</div>
                  <p className="text-xs text-green-600 font-medium">{metrics.monthlyGrowth} from last month</p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                  <Users className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">Across all plans</p>
                </CardContent>
              </Card>

              <Card className="border-accent/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Estimates</CardTitle>
                  <Calculator className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.totalEstimates}</div>
                  <p className="text-xs text-muted-foreground">This month</p>
                </CardContent>
              </Card>

              <Card className="border-primary/20">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{metrics.conversionRate}</div>
                  <p className="text-xs text-green-600 font-medium">+2.1% from last week</p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue Overview</CardTitle>
                  <CardDescription>Monthly revenue, costs, and profit</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stackId="1"
                        stroke="#1E3A5F"
                        fill="#1E3A5F"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="costs"
                        stackId="2"
                        stroke="#E31E24"
                        fill="#E31E24"
                        fillOpacity={0.6}
                      />
                      <Area
                        type="monotone"
                        dataKey="profit"
                        stackId="3"
                        stroke="#10b981"
                        fill="#10b981"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Project Distribution</CardTitle>
                  <CardDescription>By project type</CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Estimates</CardTitle>
                <CardDescription>Latest project estimates from your team</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEstimates.map((estimate) => (
                    <div key={estimate.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div className="flex-1">
                        <p className="font-medium">{estimate.project}</p>
                        <p className="text-sm text-muted-foreground">{estimate.client}</p>
                      </div>
                      <div className="text-right mr-6">
                        <p className="font-semibold">{estimate.value}</p>
                        <p className="text-xs text-muted-foreground">{estimate.date}</p>
                      </div>
                      <div>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            estimate.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : estimate.status === "In Progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {estimate.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* CRM Tab */}
          {isAdmin && (
            <TabsContent value="crm" className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="border-accent/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">MRR</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">R 38,764</div>
                    <p className="text-xs text-green-600">+12.3% growth</p>
                  </CardContent>
                </Card>
                <Card className="border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">847</div>
                    <p className="text-xs text-muted-foreground">42 new this month</p>
                  </CardContent>
                </Card>
                <Card className="border-accent/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.churnRate}</div>
                    <p className="text-xs text-green-600">Below industry avg</p>
                  </CardContent>
                </Card>
                <Card className="border-primary/20">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Customer Satisfaction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.customerSat}</div>
                    <p className="text-xs text-muted-foreground">Based on 523 reviews</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Database</CardTitle>
                  <CardDescription>Manage and track all customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b">
                        <tr className="text-left">
                          <th className="pb-3 font-medium">Company</th>
                          <th className="pb-3 font-medium">Contact</th>
                          <th className="pb-3 font-medium">Plan</th>
                          <th className="pb-3 font-medium">MRR</th>
                          <th className="pb-3 font-medium">Projects</th>
                          <th className="pb-3 font-medium">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {customers.map((customer) => (
                          <tr key={customer.id} className="border-b last:border-0">
                            <td className="py-3 font-medium">{customer.name}</td>
                            <td className="py-3 text-sm text-muted-foreground">{customer.email}</td>
                            <td className="py-3">
                              <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                                {customer.plan}
                              </span>
                            </td>
                            <td className="py-3 font-semibold">R {customer.mrr}</td>
                            <td className="py-3">{customer.projects}</td>
                            <td className="py-3">
                              <span
                                className={`px-2 py-1 text-xs rounded ${
                                  customer.status === "Active"
                                    ? "bg-green-100 text-green-700"
                                    : "bg-yellow-100 text-yellow-700"
                                }`}
                              >
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

          {/* Estimates Tab */}
          <TabsContent value="estimates" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold">Your Estimates</h2>
                <p className="text-muted-foreground">View and manage all project estimates</p>
              </div>
              <Button className="bg-accent hover:bg-accent/90" asChild>
                <Link href="/estimator">
                  <Calculator className="h-4 w-4 mr-2" />
                  New Estimate
                </Link>
              </Button>
            </div>

            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {recentEstimates.map((estimate) => (
                    <div
                      key={estimate.id}
                      className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{estimate.project}</p>
                          <p className="text-sm text-muted-foreground">
                            {estimate.client} • {estimate.date}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{estimate.value}</p>
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            estimate.status === "Completed"
                              ? "bg-green-100 text-green-700"
                              : estimate.status === "In Progress"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {estimate.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          {isAdmin && (
            <TabsContent value="analytics" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Activity Trends</CardTitle>
                  <CardDescription>Estimates created and conversion rates</CardDescription>
                </CardHeader>
                <CardContent>
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
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Cost-Benefit Analysis</CardTitle>
                    <CardDescription>Platform performance metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Customer Acquisition Cost</span>
                          <span className="text-sm font-bold">R 450</span>
                        </div>
                        <div className="text-xs text-muted-foreground">30% below target</div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Lifetime Value</span>
                          <span className="text-sm font-bold">R 12,500</span>
                        </div>
                        <div className="text-xs text-muted-foreground">27.8x CAC ratio</div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">Break-even Point</span>
                          <span className="text-sm font-bold">45 days</span>
                        </div>
                        <div className="text-xs text-muted-foreground">15 days ahead of projection</div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">ROI</span>
                          <span className="text-sm font-bold text-green-600">+285%</span>
                        </div>
                        <div className="text-xs text-muted-foreground">Annualized return</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Key Performance Indicators</CardTitle>
                    <CardDescription>Real-time business metrics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Monthly Recurring Revenue</span>
                          <span className="text-sm font-bold text-accent">R 38,764</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: "78%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">User Engagement</span>
                          <span className="text-sm font-bold text-primary">94%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: "94%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Feature Adoption</span>
                          <span className="text-sm font-bold text-accent">87%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-accent" style={{ width: "87%" }}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm">Support Satisfaction</span>
                          <span className="text-sm font-bold text-primary">96%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: "96%" }}></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Tools Tab */}
          <TabsContent value="tools" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Quick Access Tools</h2>
              <p className="text-muted-foreground">Jump to your most-used features</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="group hover:shadow-lg transition-all hover:border-accent cursor-pointer" asChild>
                <Link href="/estimator">
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                      <Calculator className="h-6 w-6" />
                    </div>
                    <CardTitle>Material Estimator</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Calculate construction materials with AI assistance</p>
                  </CardContent>
                </Link>
              </Card>

              <Card className="group hover:shadow-lg transition-all hover:border-primary cursor-pointer" asChild>
                <Link href="/material-pricing">
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <CardTitle>Price Comparison</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Compare suppliers and find optimal pricing</p>
                  </CardContent>
                </Link>
              </Card>

              <Card className="group hover:shadow-lg transition-all hover:border-accent cursor-pointer" asChild>
                <Link href="/conversions">
                  <CardHeader>
                    <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                      <BarChart3 className="h-6 w-6" />
                    </div>
                    <CardTitle>Conversion Tools</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Unit converters and construction calculators</p>
                  </CardContent>
                </Link>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
