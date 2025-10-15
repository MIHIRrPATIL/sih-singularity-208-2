import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPICard } from "@/components/shared/KPICard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, TrendingUp, TrendingDown, Percent, Package } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const orderCosts = [
  { id: "ORD-001", material: "Steel", revenue: 450000, cost: 385000, profit: 65000, margin: 14.4 },
  { id: "ORD-002", material: "Iron Ore", revenue: 320000, cost: 298000, profit: 22000, margin: 6.9 },
  { id: "ORD-003", material: "Coal", revenue: 280000, cost: 245000, profit: 35000, margin: 12.5 },
];

const rakeCosts = [
  { id: "RAKE-001", cost: 145000, revenue: 178000, profit: 33000 },
  { id: "RAKE-002", cost: 98000, revenue: 115000, profit: 17000 },
];

const cmoCosts = [
  { name: "Bhilai", value: 185000 },
  { name: "Rourkela", value: 142000 },
  { name: "Bokaro", value: 158000 },
];

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--success))'];

const CostDashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Cost Dashboard</h1>
        <p className="text-muted-foreground mt-1">Financial analytics and cost optimization</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Profit"
          value="₹172K"
          icon={DollarSign}
          trend="+18% vs last week"
          trendUp={true}
          variant="success"
        />
        <KPICard
          title="Avg Margin"
          value="11.3%"
          icon={Percent}
          trend="+2.1% improvement"
          trendUp={true}
        />
        <KPICard
          title="Cost Efficiency"
          value="87%"
          icon={TrendingUp}
          trend="Above target (85%)"
          trendUp={true}
          variant="success"
        />
        <KPICard
          title="SLA Compliance"
          value="94%"
          icon={Package}
          trend="On track"
          trendUp={true}
        />
      </div>

      {/* Filters */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Filter by CMO" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All CMOs</SelectItem>
                <SelectItem value="cmo1">Bhilai Steel Plant</SelectItem>
                <SelectItem value="cmo2">Rourkela Steel Plant</SelectItem>
                <SelectItem value="cmo3">Bokaro Steel Plant</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Route" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Routes</SelectItem>
                <SelectItem value="r1">Bhilai → Kolkata</SelectItem>
                <SelectItem value="r2">Rourkela → Mumbai</SelectItem>
                <SelectItem value="r3">Bokaro → Delhi</SelectItem>
              </SelectContent>
            </Select>
            
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Filter by Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Order-wise Profit/Loss</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={orderCosts}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="id" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Bar dataKey="profit" fill="hsl(var(--success))" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {orderCosts.map(order => (
                <div key={order.id} className="flex items-center justify-between text-sm p-2 hover:bg-muted/50 rounded cursor-pointer">
                  <span className="font-medium">{order.id}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-muted-foreground">₹{order.profit.toLocaleString()}</span>
                    <span className="text-success">{order.margin.toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>CMO Cost Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={cmoCosts}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cmoCosts.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {cmoCosts.map((cmo, idx) => (
                <div key={cmo.name} className="flex items-center justify-between text-sm p-2 hover:bg-muted/50 rounded cursor-pointer">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx] }} />
                    <span className="font-medium">{cmo.name}</span>
                  </div>
                  <span className="text-muted-foreground">₹{cmo.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Improvement Suggestions */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Cost Improvement Suggestions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
            <TrendingDown className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Consolidate partial wagon loads</p>
              <p className="text-xs text-muted-foreground mt-1">Potential savings: ₹18,500</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
            <TrendingDown className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Switch ORD-002 to CMO-3 for lower path cost</p>
              <p className="text-xs text-muted-foreground mt-1">Potential savings: ₹12,000</p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-success/10 rounded-lg">
            <TrendingDown className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Optimize rake formation timing to avoid peak tariffs</p>
              <p className="text-xs text-muted-foreground mt-1">Potential savings: ₹8,200</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CostDashboard;
