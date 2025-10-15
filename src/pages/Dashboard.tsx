import { KPICard } from "@/components/shared/KPICard";
import { Package, Truck, TrainFront, TrendingUp, AlertCircle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { dataService } from "@/services/dataService";

const kpiData = [
  { name: "Active Orders", value: "142", icon: Package, trend: "+12% from last week", trendUp: true },
  { name: "Allocated Wagons", value: "89", icon: Truck, trend: "73% utilization", trendUp: true },
  { name: "Active Rakes", value: "12", icon: TrainFront, trend: "On schedule", trendUp: true },
  { name: "Cost Efficiency", value: "₹2.3M", icon: TrendingUp, trend: "↓ 8% vs road", trendUp: true },
  { name: "SLA Compliance", value: "94%", icon: CheckCircle, trend: "+3% this month", trendUp: true, variant: "success" as const },
  { name: "Pending Alerts", value: "7", icon: AlertCircle, trend: "Requires attention", trendUp: false, variant: "warning" as const },
];

const weeklyData = [
  { day: "Mon", orders: 24, cost: 450000 },
  { day: "Tue", orders: 31, cost: 520000 },
  { day: "Wed", orders: 28, cost: 480000 },
  { day: "Thu", orders: 35, cost: 580000 },
  { day: "Fri", orders: 42, cost: 620000 },
  { day: "Sat", orders: 18, cost: 380000 },
  { day: "Sun", orders: 12, cost: 280000 },
];

const Dashboard = () => {
  // Get real-time data from service
  const totalOrders = dataService.getTotalOrders();
  const activeOrders = dataService.getTotalActiveOrders();
  const totalWagons = dataService.getTotalWagons();
  const availableWagons = dataService.getTotalAvailableWagons();
  const avgUtilization = dataService.getAverageWagonUtilization();
  const totalCost = dataService.getTotalCost();
  const avgSLA = dataService.getAverageSLACompliance();
  const allRakes = dataService.getAllRakes();
  const insights = dataService.getAllInsights();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of rake formation operations</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <KPICard
          title="Active Orders"
          value={activeOrders.toString()}
          trend={`+${((activeOrders / totalOrders) * 100).toFixed(0)}% active`}
          trendUp={true}
          icon={Package}
        />
        <KPICard
          title="Wagon Allocation"
          value={`${totalWagons - availableWagons}/${totalWagons}`}
          trend={`${(((totalWagons - availableWagons) / totalWagons) * 100).toFixed(0)}% utilized`}
          trendUp={true}
          icon={Truck}
        />
        <KPICard
          title="Rake Status"
          value={allRakes.length.toString()}
          trend={`${allRakes.filter(r => r.status === "Scheduled").length} scheduled`}
          trendUp={true}
          icon={TrainFront}
        />
        <KPICard
          title="Cost Efficiency"
          value={`₹${(totalCost / 1000000).toFixed(1)}M`}
          trend="8% below road cost"
          trendUp={true}
          icon={TrendingUp}
          variant="success"
        />
        <KPICard
          title="SLA Compliance"
          value={`${avgSLA.toFixed(0)}%`}
          trend="+3% this month"
          trendUp={true}
          icon={CheckCircle}
          variant="success"
        />
        <KPICard
          title="Alerts"
          value={insights.length.toString()}
          trend="Requires attention"
          trendUp={false}
          icon={AlertCircle}
          variant="warning"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Weekly Order Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="orders" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Cost Trend (₹)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line type="monotone" dataKey="cost" stroke="hsl(var(--accent))" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Package className="h-6 w-6" />
              <span>New Order</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Truck className="h-6 w-6" />
              <span>Allocate Wagon</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <TrainFront className="h-6 w-6" />
              <span>Form Rake</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <TrendingUp className="h-6 w-6" />
              <span>View Analytics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
