import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type StatusType = "success" | "warning" | "danger" | "info" | "neutral";

interface StatusBadgeProps {
  status: StatusType;
  label: string;
  className?: string;
}

export const StatusBadge = ({ status, label, className }: StatusBadgeProps) => {
  const statusStyles: Record<StatusType, string> = {
    success: "bg-success text-success-foreground",
    warning: "bg-warning text-warning-foreground",
    danger: "bg-danger text-danger-foreground",
    info: "bg-accent text-accent-foreground",
    neutral: "bg-secondary text-secondary-foreground",
  };

  return (
    <Badge className={cn(statusStyles[status], "shadow-sm", className)}>
      {label}
    </Badge>
  );
};
