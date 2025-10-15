import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Calendar, FileDown } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { toast } from "sonner";
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CSVLink } from 'react-csv';

// Sample report data with additional content
const reports = [
  { 
    id: 1, 
    name: "Weekly Operations Report", 
    type: "Operations", 
    date: "2025-10-08", 
    status: "Available",
    content: "Weekly operations summary including fleet movements, deliveries, and key performance indicators.",
    metrics: {
      totalTrips: 42,
      onTimeRate: "92%",
      issuesReported: 3
    }
  },
  { 
    id: 2, 
    name: "Cost Analysis - September", 
    type: "Financial", 
    date: "2025-10-01", 
    status: "Available",
    content: "Detailed cost breakdown for September including transportation, labor, and material costs.",
    metrics: {
      totalCost: "$938,500",
      costSavings: "$42,300",
      budgetVariance: "+2.3%"
    }
  },
  { 
    id: 3, 
    name: "CMO Performance Review", 
    type: "Performance", 
    date: "2025-09-28", 
    status: "Available",
    content: "Performance metrics and analysis for all CMO locations.",
    metrics: {
      avgEfficiency: "87%",
      topPerformer: "CMO North",
      improvementNeeded: 2
    }
  },
  { 
    id: 4, 
    name: "SLA Compliance Report", 
    type: "Compliance", 
    date: "2025-10-05", 
    status: "Available",
    content: "Service Level Agreement compliance metrics and analysis.",
    metrics: {
      complianceRate: "95.7%",
      breaches: 4,
      avgResponseTime: "2.3h"
    }
  },
  { 
    id: 5, 
    name: "Predictive Analysis - Q4", 
    type: "Prediction", 
    date: "2025-10-10", 
    status: "Generating",
    content: "Predictive analysis for Q4 operations and resource allocation.",
    metrics: {
      expectedGrowth: "12.5%",
      riskLevel: "Medium",
      keyFocus: "Inventory Management"
    }
  },
];

const costData = [
  { category: "Transport", amount: 285000 },
  { category: "Labor", amount: 125000 },
  { category: "Materials", amount: 450000 },
  { category: "Maintenance", amount: 78000 },
];

// Sample order history data for CSV export
const orderHistory = [
  { id: "ORD-001", date: "2025-10-01", customer: "ABC Corp", amount: 12500, status: "Delivered" },
  { id: "ORD-002", date: "2025-10-02", customer: "XYZ Ltd", amount: 18750, status: "In Transit" },
  { id: "ORD-003", date: "2025-10-03", customer: "Acme Inc", amount: 9300, status: "Processing" },
  { id: "ORD-004", date: "2025-10-04", customer: "Globex", amount: 25600, status: "Delivered" },
  { id: "ORD-005", date: "2025-10-05", customer: "Initech", amount: 15400, status: "Delivered" },
];

const Reports = () => {
  // Generate PDF for a single report
  const generatePdf = (report: typeof reports[0]) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.setTextColor(40, 62, 80);
    doc.text(report.name, 14, 22);
    
    // Add report details
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text(`Type: ${report.type}`, 14, 35);
    doc.text(`Date: ${report.date}`, 14, 42);
    doc.text(`Status: ${report.status}`, 14, 49);
    
    // Add content
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    const splitText = doc.splitTextToSize(report.content, 180);
    doc.text(splitText, 14, 65);
    
    // Add metrics table
    autoTable(doc, {
      startY: 90,
      head: [['Metric', 'Value']],
      body: Object.entries(report.metrics).map(([key, value]) => [key, String(value)]),
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
    
    // Save the PDF
    doc.save(`${report.name.replace(/\s+/g, '_')}.pdf`);
    toast.success(`Successfully downloaded ${report.name}`);
  };

  // Export chart as image
  const exportChart = () => {
    const chartElement = document.querySelector('.recharts-wrapper');
    if (!chartElement) return;
    
    import('html2canvas').then(({ default: html2canvas }) => {
      html2canvas(chartElement as HTMLElement).then(canvas => {
        const link = document.createElement('a');
        link.download = 'cost_analysis_chart.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast.success('Chart exported as image');
      });
    });
  };

  const handleGenerate = () => {
    toast.info("Generating new report...", {
      description: "This may take a few minutes"
    });
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">Generated reports and analytics</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <CSVLink 
            data={orderHistory} 
            filename={"order_history_" + new Date().toISOString().split('T')[0] + ".csv"}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Export Order History (CSV)
          </CSVLink>
          <Button 
            onClick={handleGenerate} 
            className="bg-gradient-primary hover:opacity-90"
          >
            <FileText className="h-4 w-4 mr-2" />
            Generate New Report
          </Button>
        </div>
      </div>

      {/* Report List */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl">Available Reports</CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>Showing {reports.length} reports</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {reports.map(report => (
              <div
                key={report.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-start gap-4 w-full sm:w-auto">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{report.name}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs font-normal">{report.type}</Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(report.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <Badge 
                        variant={report.status === "Available" ? "default" : "secondary"}
                        className="text-xs font-normal"
                      >
                        {report.status}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="mt-3 sm:mt-0 sm:ml-4 flex-shrink-0">
                  {report.status === "Available" ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generatePdf(report)}
                        className="group-hover:bg-blue-50 group-hover:border-blue-100"
                      >
                        <Download className="h-4 w-4 mr-2 text-blue-600" />
                        <span className="text-blue-700">PDF</span>
                      </Button>
                      <CSVLink 
                        data={[{
                          reportName: report.name,
                          type: report.type,
                          date: report.date,
                          status: report.status,
                          ...report.metrics
                        }]} 
                        filename={`${report.name.replace(/\s+/g, '_')}.csv`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-gray-50 hover:text-accent-foreground h-9 px-3 py-2 text-sm"
                      >
                        CSV
                      </CSVLink>
                    </div>
                  ) : (
                    <Button variant="ghost" size="sm" disabled>
                      Generating...
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cost Analysis Chart */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <CardTitle className="text-xl">Cost Breakdown Analysis</CardTitle>
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
        <CardContent className="pt-6">
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%" className="recharts-wrapper">
              <BarChart 
                data={costData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis 
                  dataKey="category" 
                  stroke="#64748b"
                  tick={{ fill: '#64748b' }}
                />
                <YAxis 
                  stroke="#64748b"
                  tick={{ fill: '#64748b' }}
                  tickFormatter={(value) => `$${value.toLocaleString()}`}
                />
                <Tooltip
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']}
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
                <Bar 
                  dataKey="amount" 
                  fill="#3b82f6" 
                  radius={[4, 4, 0, 0]}
                  name="Amount"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Data table for cost breakdown */}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Cost Breakdown</h3>
              <CSVLink 
                data={costData.map(item => ({
                  ...item,
                  amount: `$${item.amount.toLocaleString()}`
                }))}
                filename={"cost_breakdown_" + new Date().toISOString().split('T')[0] + ".csv"}
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 py-2 text-sm"
              >
                <FileDown className="h-4 w-4 mr-2" />
                Export as CSV
              </CSVLink>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {costData.map((item, index) => {
                    const total = costData.reduce((sum, curr) => sum + curr.amount, 0);
                    const percentage = ((item.amount / total) * 100).toFixed(1);
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.category}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                          ${item.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                          {percentage}%
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-gray-50 font-medium">
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">Total</td>
                    <td className="px-6 py-3 whitespace-nowrap text-sm text-right text-gray-900">
                      ${costData.reduce((sum, item) => sum + item.amount, 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order History */}
      <Card className="shadow-lg">
        <CardHeader className="border-b">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Recent Orders</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Latest order activities and status</p>
            </div>
            <CSVLink 
              data={orderHistory} 
              filename={"order_history_" + new Date().toISOString().split('T')[0] + ".csv"}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3 py-2 text-sm"
            >
              <FileDown className="h-4 w-4 mr-2" />
              Export as CSV
            </CSVLink>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orderHistory.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.customer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-500">
                      ${order.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Badge 
                        variant={
                          order.status === 'Delivered' ? 'default' : 
                          order.status === 'In Transit' ? 'secondary' : 'outline'
                        }
                        className="text-xs font-medium"
                      >
                        {order.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;