import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, TrendingUp, TrendingDown, AlertCircle, AlertTriangle, Clock, DollarSign, Activity, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { dataService } from "@/services/dataService";

const AIInsights = () => {
  const navigate = useNavigate();
  const allInsights = dataService.getAllInsights();

  const getIcon = (type: string) => {
    switch (type) {
      case "alternative": return Lightbulb;
      case "anomaly": return AlertCircle;
      case "deadline": return Clock;
      case "optimization": return TrendingUp;
      case "optimization": return TrendingDown;
      case "forecast": return TrendingUp;
      case "profitloss": return DollarSign;
      default: return Lightbulb;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case "success": return "default";
      case "warning": return "secondary";
      case "danger": return "destructive";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Insights & Suggestions</h1>
        <p className="text-muted-foreground mt-1">AI-powered recommendations and anomaly detection</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md border-accent/30 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Lightbulb className="h-8 w-8 text-accent" />
              <div>
                <p className="text-sm text-muted-foreground">Active Insights</p>
                <p className="text-2xl font-bold">{allInsights.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-success/30 bg-success/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Potential Savings</p>
                <p className="text-2xl font-bold">₹30.5K</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-warning/30 bg-warning/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Pending Alerts</p>
                <p className="text-2xl font-bold">2</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-primary/30 bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Upcoming Deadlines</p>
                <p className="text-2xl font-bold">3</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {allInsights.map(insight => {
          const Icon = getIcon(insight.type);
          
          return (
            <Card key={insight.id} className="shadow-md hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`
                      p-2 rounded-lg 
                      ${insight.severity === 'success' ? 'bg-success/10' : ''}
                      ${insight.severity === 'warning' ? 'bg-warning/10' : ''}
                      ${insight.severity === 'danger' ? 'bg-danger/10' : ''}
                      ${insight.severity === 'info' ? 'bg-accent/10' : ''}
                    `}>
                      <Icon className={`
                        h-5 w-5
                        ${insight.severity === 'success' ? 'text-success' : ''}
                        ${insight.severity === 'warning' ? 'text-warning' : ''}
                        ${insight.severity === 'danger' ? 'text-danger' : ''}
                        ${insight.severity === 'info' ? 'text-accent' : ''}
                      `} />
                    </div>
                    <div>
                      <CardTitle className="text-base">{insight.title}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                    </div>
                  </div>
                  <Badge variant={getSeverityVariant(insight.severity)} className="capitalize">
                    {insight.type}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Impact:</span>
                  <span className={`font-medium ${
                    insight.impact.includes('Cost') || insight.impact.includes('Savings') ? 'text-success' :
                    insight.impact.includes('Risk') || insight.impact.includes('Delay') ? 'text-warning' :
                    'text-foreground'
                  }`}>
                    {insight.impact}
                  </span>
                </div>
                
                {insight.affectedItems.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Affected Items:</p>
                    <div className="flex flex-wrap gap-2">
                      {insight.affectedItems.map(item => (
                        <Badge key={item} variant="outline" className="text-xs">
                          {item}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => navigate(insight.action)}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recommendations */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>AI Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-gradient-surface rounded-lg">
            <Lightbulb className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Optimize rake formation for next week</p>
              <p className="text-xs text-muted-foreground mt-1">
                Based on forecast, pre-allocate 2 additional rakes for steel routes to avoid delays
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gradient-surface rounded-lg">
            <Lightbulb className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Labor scheduling optimization</p>
              <p className="text-xs text-muted-foreground mt-1">
                Shift 3 workers from SIDING-C to SIDING-B during peak hours (14:00-18:00)
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-gradient-surface rounded-lg">
            <Lightbulb className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-sm">Route diversification opportunity</p>
              <p className="text-xs text-muted-foreground mt-1">
                Alternative route via Nagpur reduces transit time by 2.5 hours for coal shipments
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIInsights;
