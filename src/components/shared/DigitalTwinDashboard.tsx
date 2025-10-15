import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, ArrowUp, ArrowDown, Settings, RefreshCw, Download as DownloadIcon } from "lucide-react";
import { useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

type CMOMetrics = {
  id: string;
  name: string;
  status: 'operational' | 'degraded' | 'failed';
  efficiency: number;
  lastMaintenance: string;
  nextMaintenance: string;
};

type OrderMetrics = {
  totalOrders: number;
  surgePercentage: number;
  highPriority: number;
  mediumPriority: number;
  lowPriority: number;
};

type Constraint = {
  id: string;
  name: string;
  currentValue: number;
  minValue: number;
  maxValue: number;
  unit: string;
  description: string;
};

const DigitalTwinDashboard: React.FC = () => {
  const [cmoMetrics, setCmoMetrics] = useState<CMOMetrics[]>([
    {
      id: 'cmo1',
      name: 'CMO East',
      status: 'degraded',
      efficiency: 65,
      lastMaintenance: '2023-10-01',
      nextMaintenance: '2023-12-15'
    },
    {
      id: 'cmo2',
      name: 'CMO West',
      status: 'operational',
      efficiency: 92,
      lastMaintenance: '2023-09-15',
      nextMaintenance: '2023-12-01'
    },
    {
      id: 'cmo3',
      name: 'CMO North',
      status: 'failed',
      efficiency: 15,
      lastMaintenance: '2023-08-20',
      nextMaintenance: '2023-11-30'
    }
  ]);

  const [orderMetrics, setOrderMetrics] = useState<OrderMetrics>({
    totalOrders: 248,
    surgePercentage: 42,
    highPriority: 68,
    mediumPriority: 95,
    lowPriority: 85
  });

  const [constraints, setConstraints] = useState<Constraint[]>([
    {
      id: 'const1',
      name: 'Max Wagon Load',
      currentValue: 75,
      minValue: 0,
      maxValue: 100,
      unit: 'tons',
      description: 'Maximum weight capacity per wagon'
    },
    {
      id: 'const2',
      name: 'Max Speed',
      currentValue: 80,
      minValue: 50,
      maxValue: 100,
      unit: 'km/h',
      description: 'Maximum allowed speed for the route'
    },
    {
      id: 'const3',
      name: 'Min Maintenance Interval',
      currentValue: 30,
      minValue: 7,
      maxValue: 60,
      unit: 'days',
      description: 'Minimum days between maintenance'
    }
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const dashboardRef = useRef<HTMLDivElement>(null);

  const handleDownloadPDF = async () => {
    if (!dashboardRef.current) return;
    
    setIsGeneratingPdf(true);
    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        logging: true,
        scrollY: -window.scrollY,
        windowWidth: document.documentElement.scrollWidth,
        windowHeight: document.documentElement.scrollHeight,
        width: dashboardRef.current.scrollWidth,
        height: dashboardRef.current.scrollHeight,
        x: 0,
        y: 0
      } as any);
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save('digital-twin-dashboard.pdf');
      
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const refreshData = () => {
    setIsRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const updateConstraint = (id: string, value: number) => {
    setConstraints(prev => 
      prev.map(constraint => 
        constraint.id === id 
          ? { ...constraint, currentValue: value }
          : constraint
      )
    );
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'operational':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">Operational</Badge>;
      case 'degraded':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">Degraded</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200">Failed</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6" ref={dashboardRef}>
      <div className="flex justify-end mb-4">
        <Button 
          onClick={handleDownloadPDF} 
          disabled={isGeneratingPdf}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isGeneratingPdf ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating PDF...
            </>
          ) : (
            <>
              <DownloadIcon className="h-4 w-4 mr-2" />
              Export as PDF
            </>
          )}
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Digital Twin Dashboard</h2>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshData}
          disabled={isRefreshing}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </div>

      {/* CMO Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            CMO Status & Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cmoMetrics.map((cmo) => (
            <div key={cmo.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{cmo.name}</h3>
                {getStatusBadge(cmo.status)}
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Efficiency</span>
                    <span className="font-medium">{cmo.efficiency}%</span>
                  </div>
                  <Progress value={cmo.efficiency} className="h-2" />
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Last Maintenance: {cmo.lastMaintenance}</p>
                  <p>Next Maintenance: {cmo.nextMaintenance}</p>
                </div>
                {cmo.status === 'failed' && (
                  <Alert variant="destructive" className="mt-2">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Maintenance Required</AlertTitle>
                    <AlertDescription>
                      Immediate attention needed. Efficiency critically low.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Order Surge */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <ArrowUp className="h-5 w-5 text-orange-500" />
            Order Surge Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Order Volume</h3>
                <div className="flex items-center">
                  <ArrowUp className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-sm font-medium text-red-500">
                    {orderMetrics.surgePercentage}% Surge
                  </span>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">High Priority</span>
                    <span className="font-medium">{orderMetrics.highPriority} orders</span>
                  </div>
                  <Progress value={(orderMetrics.highPriority / orderMetrics.totalOrders) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Medium Priority</span>
                    <span className="font-medium">{orderMetrics.mediumPriority} orders</span>
                  </div>
                  <Progress value={(orderMetrics.mediumPriority / orderMetrics.totalOrders) * 100} className="h-2" />
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Low Priority</span>
                    <span className="font-medium">{orderMetrics.lowPriority} orders</span>
                  </div>
                  <Progress value={(orderMetrics.lowPriority / orderMetrics.totalOrders) * 100} className="h-2" />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Surge Impact</h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-yellow-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Increased demand may affect delivery timelines</span>
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>Consider allocating additional resources</span>
                  </li>
                  <li className="flex items-start">
                    <AlertCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>High priority orders being prioritized</span>
                  </li>
                </ul>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h4 className="font-medium mb-2 text-blue-800">Recommendations</h4>
                <ul className="space-y-2 text-sm text-blue-700">
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Activate 2 additional wagons for high-priority routes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Extend working hours for CMO East to handle increased load</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2">•</span>
                    <span>Prioritize maintenance for CMO North to restore full capacity</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Constraint Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Constraint Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {constraints.map((constraint) => (
            <div key={constraint.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">{constraint.name}</h3>
                  <p className="text-sm text-muted-foreground">{constraint.description}</p>
                </div>
                <div className="text-lg font-bold">
                  {constraint.currentValue} {constraint.unit}
                </div>
              </div>
              <div className="pl-2">
                <Slider
                  value={[constraint.currentValue]}
                  min={constraint.minValue}
                  max={constraint.maxValue}
                  step={1}
                  onValueChange={(value) => updateConstraint(constraint.id, value[0])}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{constraint.minValue} {constraint.unit}</span>
                  <span>Current: {constraint.currentValue} {constraint.unit}</span>
                  <span>{constraint.maxValue} {constraint.unit}</span>
                </div>
              </div>
            </div>
          ))}
          <div className="pt-4 border-t">
            <Button variant="outline" className="w-full">
              Save Constraint Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DigitalTwinDashboard;
