import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, Clock, UserPlus, TrendingUp, 
  Sun, Sunset, Moon, CheckCircle, AlertTriangle 
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

interface Shift {
  id: string;
  name: string;
  time: string;
  supervisor: string;
  totalWorkers: number;
  activeWorkers: number;
  onBreak: number;
  required: number;
  tasks: Array<{ rake: string; status: string; progress: number }>;
  avgTimePerRake: number;
  efficiency: number;
  icon: any;
}

const mockShifts: Shift[] = [
  {
    id: "morning",
    name: "Morning Shift",
    time: "6AM - 2PM",
    supervisor: "Rajesh Kumar",
    totalWorkers: 24,
    activeWorkers: 22,
    onBreak: 2,
    required: 20,
    tasks: [
      { rake: "RAKE-101", status: "In Progress", progress: 65 },
      { rake: "RAKE-102", status: "Completed", progress: 100 },
      { rake: "RAKE-103", status: "Queued", progress: 0 },
    ],
    avgTimePerRake: 2.3,
    efficiency: 92,
    icon: Sun,
  },
  {
    id: "afternoon",
    name: "Afternoon Shift",
    time: "2PM - 10PM",
    supervisor: "Priya Sharma",
    totalWorkers: 20,
    activeWorkers: 18,
    onBreak: 2,
    required: 22,
    tasks: [
      { rake: "RAKE-104", status: "In Progress", progress: 40 },
      { rake: "RAKE-105", status: "Queued", progress: 0 },
    ],
    avgTimePerRake: 2.5,
    efficiency: 87,
    icon: Sunset,
  },
  {
    id: "night",
    name: "Night Shift",
    time: "10PM - 6AM",
    supervisor: "Amit Patel",
    totalWorkers: 16,
    activeWorkers: 14,
    onBreak: 2,
    required: 15,
    tasks: [
      { rake: "RAKE-106", status: "Completed", progress: 100 },
    ],
    avgTimePerRake: 2.8,
    efficiency: 85,
    icon: Moon,
  },
];

const performanceData = [
  { shift: "Mon", morning: 18, afternoon: 16, night: 12 },
  { shift: "Tue", morning: 20, afternoon: 18, night: 14 },
  { shift: "Wed", morning: 19, afternoon: 17, night: 13 },
  { shift: "Thu", morning: 22, afternoon: 19, night: 15 },
  { shift: "Fri", morning: 21, afternoon: 20, night: 14 },
  { shift: "Sat", morning: 17, afternoon: 15, night: 11 },
  { shift: "Sun", morning: 15, afternoon: 14, night: 10 },
];

const ShiftManagement = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeShift, setActiveShift] = useState<string>("morning");

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now);
      
      const hour = now.getHours();
      if (hour >= 6 && hour < 14) setActiveShift("morning");
      else if (hour >= 14 && hour < 22) setActiveShift("afternoon");
      else setActiveShift("night");
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const getTimelinePosition = () => {
    const hour = currentTime.getHours();
    const minute = currentTime.getMinutes();
    return ((hour * 60 + minute) / (24 * 60)) * 100;
  };

  const getStatusColor = (assigned: number, required: number) => {
    const ratio = assigned / required;
    if (ratio >= 1) return "success";
    if (ratio >= 0.8) return "warning";
    return "danger";
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full md:w-auto grid-cols-2">
          <TabsTrigger value="current">Current Day</TabsTrigger>
          <TabsTrigger value="weekly">Weekly Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          {/* Shift Timeline */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                24-Hour Shift Timeline
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Current Time: {currentTime.toLocaleTimeString()}
              </p>
            </CardHeader>
            <CardContent>
              <div className="relative h-16 bg-gradient-surface rounded-lg overflow-hidden">
                {/* Shift segments */}
                <div className="absolute inset-0 flex">
                  <div className="flex-1 bg-amber-500/20 border-r-2 border-border flex items-center justify-center">
                    <span className="text-xs font-medium">Morning (6AM-2PM)</span>
                  </div>
                  <div className="flex-1 bg-orange-500/20 border-r-2 border-border flex items-center justify-center">
                    <span className="text-xs font-medium">Afternoon (2PM-10PM)</span>
                  </div>
                  <div className="flex-1 bg-indigo-500/20 flex items-center justify-center">
                    <span className="text-xs font-medium">Night (10PM-6AM)</span>
                  </div>
                </div>
                
                {/* Current time marker */}
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-primary shadow-lg z-10 transition-all duration-1000"
                  style={{ left: `${getTimelinePosition()}%` }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary animate-pulse" />
                </div>
              </div>

              {/* Handover points */}
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>6AM</span>
                <span>2PM</span>
                <span>10PM</span>
                <span>6AM</span>
              </div>
            </CardContent>
          </Card>

          {/* Shift Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockShifts.map((shift) => {
              const isActive = activeShift === shift.id;
              const statusColor = getStatusColor(shift.totalWorkers, shift.required);
              const allocationPct = (shift.totalWorkers / shift.required) * 100;
              const ShiftIcon = shift.icon;

              return (
                <Card 
                  key={shift.id} 
                  className={`shadow-md transition-all ${isActive ? 'ring-2 ring-primary shadow-lg' : ''}`}
                >
                  <CardHeader className={`${isActive ? 'bg-primary/10' : 'bg-gradient-surface'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <ShiftIcon className={`h-6 w-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                          <CardTitle className="text-base">{shift.name}</CardTitle>
                          <p className="text-sm text-muted-foreground">{shift.time}</p>
                        </div>
                      </div>
                      {isActive && (
                        <Badge variant="default" className="animate-pulse">
                          Active
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4 mt-4">
                    {/* Supervisor */}
                    <div>
                      <p className="text-xs text-muted-foreground">Supervisor</p>
                      <p className="font-medium text-sm">{shift.supervisor}</p>
                    </div>

                    {/* Labor Allocation */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Worker Allocation</span>
                        <span className={`font-medium text-${statusColor}`}>
                          {shift.totalWorkers}/{shift.required}
                        </span>
                      </div>
                      <Progress value={allocationPct} className="h-2" />
                    </div>

                    {/* Worker Status */}
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="text-center p-2 bg-gradient-surface rounded">
                        <p className="text-muted-foreground">Active</p>
                        <p className="font-bold text-success">{shift.activeWorkers}</p>
                      </div>
                      <div className="text-center p-2 bg-gradient-surface rounded">
                        <p className="text-muted-foreground">Break</p>
                        <p className="font-bold text-warning">{shift.onBreak}</p>
                      </div>
                      <div className="text-center p-2 bg-gradient-surface rounded">
                        <p className="text-muted-foreground">Total</p>
                        <p className="font-bold">{shift.totalWorkers}</p>
                      </div>
                    </div>

                    {/* Tasks */}
                    <div>
                      <p className="text-sm font-medium mb-2">Assigned Tasks</p>
                      <div className="space-y-2">
                        {shift.tasks.map((task) => (
                          <div key={task.rake} className="text-xs">
                            <div className="flex justify-between mb-1">
                              <span>{task.rake}</span>
                              <span className="text-muted-foreground">{task.progress}%</span>
                            </div>
                            <Progress value={task.progress} className="h-1" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4 pt-3 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Time/Rake</p>
                        <p className="font-medium text-sm">{shift.avgTimePerRake}h</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Efficiency</p>
                        <p className="font-medium text-sm flex items-center gap-1">
                          {shift.efficiency}%
                          {shift.efficiency >= 90 ? (
                            <CheckCircle className="h-3 w-3 text-success" />
                          ) : (
                            <AlertTriangle className="h-3 w-3 text-warning" />
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Alert if understaffed */}
                    {shift.totalWorkers < shift.required && (
                      <div className="flex items-center gap-2 text-xs text-warning bg-warning/10 p-2 rounded">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Understaffed by {shift.required - shift.totalWorkers} workers</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Action Buttons */}
          <Card className="shadow-md">
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-3">
                <Button className="bg-gradient-primary hover:opacity-90">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Request Additional Labor
                </Button>
                <Button variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Performance Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>Weekly Shift Performance</CardTitle>
              <p className="text-sm text-muted-foreground">Rakes handled per shift over the past week</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="shift" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="morning" fill="hsl(var(--success))" name="Morning" />
                  <Bar dataKey="afternoon" fill="hsl(var(--warning))" name="Afternoon" />
                  <Bar dataKey="night" fill="hsl(var(--primary))" name="Night" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly" className="space-y-6">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle>7-Day Shift Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Day</th>
                      <th className="text-center p-2">Morning (6AM-2PM)</th>
                      <th className="text-center p-2">Afternoon (2PM-10PM)</th>
                      <th className="text-center p-2">Night (10PM-6AM)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day, idx) => (
                      <tr key={day} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{day}</td>
                        <td className="p-2 text-center">
                          <Badge variant="outline">{20 + idx} workers</Badge>
                        </td>
                        <td className="p-2 text-center">
                          <Badge variant="outline">{18 + idx} workers</Badge>
                        </td>
                        <td className="p-2 text-center">
                          <Badge variant="outline">{14 + idx} workers</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShiftManagement;
