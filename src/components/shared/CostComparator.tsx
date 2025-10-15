import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingDown, TrendingUp } from "lucide-react";

interface CostComparatorProps {
  railCost: number;
  roadCost: number;
  railTime: number;
  roadTime: number;
}

export const CostComparator = ({ railCost, roadCost, railTime, roadTime }: CostComparatorProps) => {
  const costSavings = roadCost - railCost;
  const timeDiff = roadTime - railTime;
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle className="text-base">Rail vs Road Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium text-primary">Rail Transport</p>
            <p className="text-2xl font-bold">₹{railCost.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{railTime}h transit</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm font-medium text-secondary">Road Transport</p>
            <p className="text-2xl font-bold">₹{roadCost.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">{roadTime}h transit</p>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t space-y-2">
          <div className="flex items-center gap-2">
            {costSavings > 0 ? (
              <TrendingDown className="h-4 w-4 text-success" />
            ) : (
              <TrendingUp className="h-4 w-4 text-danger" />
            )}
            <p className="text-sm">
              <span className={costSavings > 0 ? "text-success" : "text-danger"}>
                {costSavings > 0 ? "Save" : "Extra"} ₹{Math.abs(costSavings).toLocaleString()}
              </span>
              {" "}vs road
            </p>
          </div>
          <p className="text-xs text-muted-foreground">
            Time difference: {timeDiff > 0 ? "+" : ""}{timeDiff}h
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
