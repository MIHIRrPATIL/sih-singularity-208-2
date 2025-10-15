import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Download, FileDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { CSVLink } from 'react-csv';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Sample data
const historicalOrders = [
  { id: "ORD-098", date: "2025-09-15", material: "Steel", quantity: 450, status: "Delivered" },
  { id: "ORD-099", date: "2025-09-18", material: "Coal", quantity: 800, status: "Delivered" },
  { id: "ORD-100", date: "2025-09-22", material: "Iron Ore", quantity: 600, status: "Delivered" },
];

const cmoHistory = [
  { id: "CMO-1", name: "Bhilai", totalDeliveries: 45, avgCost: 42000, efficiency: 89 },
  { id: "CMO-2", name: "Rourkela", totalDeliveries: 38, avgCost: 38500, efficiency: 92 },
  { id: "CMO-3", name: "Bokaro", totalDeliveries: 51, avgCost: 45000, efficiency: 87 },
];

const trendData = [
  { month: "Apr", orders: 118, cost: 4200000 },
  { month: "May", orders: 132, cost: 4680000 },
  { month: "Jun", orders: 125, cost: 4450000 },
  { month: "Jul", orders: 145, cost: 5100000 },
  { month: "Aug", orders: 138, cost: 4920000 },
  { month: "Sep", orders: 142, cost: 5050000 },
];

const HistoricalData = () => {
  const handleRefresh = () => {
    toast.success("Data refreshed from database");
  };

  // Export chart as image
  const exportChart = () => {
    const chartElement = document.querySelector('.recharts-wrapper');
    if (!chartElement) return;
    
    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(chartElement as HTMLElement).then(canvas => {
        const link = document.createElement('a');
        link.download = 'order_trend_chart.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('Chart exported as image');
      });
    });
  };

  // Generate PDF for CMO Performance
  const generateCmoPdf = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(40, 62, 80);
    doc.text("CMO Performance Report", 14, 22);
    
    // Add report details
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 35);
    
    // Add CMO Performance table
    autoTable(doc, {
      startY: 50,
      head: [['CMO ID', 'Name', 'Total Deliveries', 'Avg Cost', 'Efficiency']],
      body: cmoHistory.map(cmo => [
        cmo.id,
        cmo.name,
        cmo.totalDeliveries.toString(),
        `₹${cmo.avgCost.toLocaleString()}`,
        `${cmo.efficiency}%`
      ]),
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] },
      margin: { top: 10 }
    });
    
    // Add footer
    const pageCount = doc.internal.pages.length;
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(150);
      doc.text(
        `Page ${i} of ${pageCount} • Generated on ${new Date().toLocaleDateString()}`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    doc.save('CMO_Performance_Report.pdf');
    toast.success('Successfully exported CMO Performance Report');
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Historical Data</h1>
          <p className="text-muted-foreground mt-1">Past records and trend analysis</p>
        </div>
        <div className="flex gap-3">
          <Button onClick={handleRefresh} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh Data</span>
          </Button>
        </div>
      </div>

      {/* Trend Chart */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl">6-Month Order Trend</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={exportChart}
              className="self-start sm:self-center"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Chart
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%" className="recharts-wrapper">
              <LineChart 
                data={trendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  stroke="#64748b"
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  stroke="#64748b"
                  tick={{ fill: '#64748b' }}
                />
                <Tooltip
                  formatter={(value, name) => [value, name === 'orders' ? 'Orders' : 'Cost (₹)']}
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                    padding: "0.75rem"
                  }}
                  itemStyle={{
                    color: '#1e293b',
                    fontSize: '0.875rem',
                    padding: '0.25rem 0'
                  }}
                  labelStyle={{
                    fontWeight: 600,
                    color: '#334155',
                    marginBottom: '0.5rem',
                    borderBottom: '1px solid #e2e8f0',
                    paddingBottom: '0.5rem'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="orders" 
                  stroke="#3b82f6" 
                  strokeWidth={3} 
                  dot={{ r: 4 }}
                  activeDot={{ r: 6, stroke: '#2563eb', strokeWidth: 2 }}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Historical Orders */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Past Orders</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Historical order records</p>
            </div>
            <CSVLink 
              data={historicalOrders} 
              filename={"historical_orders_" + new Date().toISOString().split('T')[0] + ".csv"}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 py-2 text-sm"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export as CSV
            </CSVLink>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-3">Order ID</TableHead>
                  <TableHead className="px-6 py-3">Date</TableHead>
                  <TableHead className="px-6 py-3">Material</TableHead>
                  <TableHead className="px-6 py-3">Quantity</TableHead>
                  <TableHead className="px-6 py-3">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {historicalOrders.map(order => (
                  <TableRow key={order.id} className="hover:bg-gray-50">
                    <TableCell className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {order.id}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {new Date(order.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {order.material}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {order.quantity.toLocaleString()}t
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="default" className="text-xs">
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* CMO Performance History */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">CMO Performance History</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Performance metrics by CMO</p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={generateCmoPdf}
                className="gap-2"
              >
                <FileDown className="h-4 w-4" />
                <span>PDF</span>
              </Button>
              <CSVLink 
                data={cmoHistory.map(cmo => ({
                  ...cmo,
                  avgCost: `₹${cmo.avgCost.toLocaleString()}`,
                  efficiency: `${cmo.efficiency}%`
                }))} 
                filename={"cmo_performance_" + new Date().toISOString().split('T')[0] + ".csv"}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 py-2 text-sm"
              >
                <FileDown className="h-4 w-4 mr-2" />
                CSV
              </CSVLink>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-6 py-3">CMO ID</TableHead>
                  <TableHead className="px-6 py-3">Name</TableHead>
                  <TableHead className="px-6 py-3 text-right">Total Deliveries</TableHead>
                  <TableHead className="px-6 py-3 text-right">Avg Cost</TableHead>
                  <TableHead className="px-6 py-3">Efficiency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cmoHistory.map(cmo => (
                  <TableRow key={cmo.id} className="hover:bg-gray-50">
                    <TableCell className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                      {cmo.id}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-gray-900 font-medium">
                      {cmo.name}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-gray-500 text-right">
                      {cmo.totalDeliveries.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-6 py-4 whitespace-nowrap text-gray-500 text-right">
                      ₹{cmo.avgCost.toLocaleString()}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 bg-gray-100 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
                            style={{ width: `${cmo.efficiency}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-700 w-10">
                          {cmo.efficiency}%
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Historical Orders</p>
                <p className="text-2xl font-bold mt-2">834</p>
                <p className="text-xs text-green-600 mt-1">+12% vs previous period</p>
              </div>
              <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Delivery Time</p>
                <p className="text-2xl font-bold mt-2">16.8h</p>
                <p className="text-xs text-green-600 mt-1">-1.2h improvement</p>
              </div>
              <div className="p-2 rounded-lg bg-green-50 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Historical SLA Rate</p>
                <p className="text-2xl font-bold mt-2">92.5%</p>
                <p className="text-xs text-gray-500 mt-1">Consistent performance</p>
              </div>
              <div className="p-2 rounded-lg bg-purple-50 text-purple-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HistoricalData;