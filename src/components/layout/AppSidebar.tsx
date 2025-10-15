import {
  Package,
  Truck,
  TrainFront,
  TrendingUp,
  MapPin,
  Activity,
  Lightbulb,
  FlaskConical,
  BarChart3,
  Database,
  FileText,
  Settings,
  Home,
  Layers,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuSections = [
  {
    label: "Overview",
    items: [
      { title: "Dashboard", url: "/", icon: Home },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Order Creation", url: "/orders", icon: Package },
      { title: "CMO Matching", url: "/cmo-matching", icon: MapPin },
      { title: "Wagon Allocation", url: "/wagon-allocation", icon: Truck },
      { title: "Rake Formation", url: "/rake-formation", icon: TrainFront },
      { title: "Yard Management", url: "/yard-management", icon: Activity },
      { title: "Live Tracking", url: "/live-tracking", icon: Layers },
    ],
  },
  {
    label: "Analytics & Insights",
    items: [
      { title: "AI Insights", url: "/ai-insights", icon: Lightbulb },
      { title: "Digital Twin", url: "/digital-twin", icon: FlaskConical },
      { title: "Cost Dashboard", url: "/cost-dashboard", icon: TrendingUp },
      { title: "Historical Data", url: "/historical-data", icon: Database },
      { title: "Reports", url: "/reports", icon: FileText },
    ],
  },
  {
    label: "Configuration",
    items: [
      { title: "Manual Config", url: "/manual-config", icon: Settings },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar collapsible="icon" className={`${isCollapsed ? "w-16" : "w-72"} transition-all duration-300`}>
      <SidebarContent className="bg-gradient-to-b from-card to-card/95 border-r border-border/50 backdrop-blur-sm">
        {/* Header */}
        {!isCollapsed && (
          <div className="px-6 py-6 border-b border-border/50 bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
                <TrainFront className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  SAIL Rake DSS
                </h2>
                <p className="text-xs text-muted-foreground">Decision Support System</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Collapsed Header */}
        {isCollapsed && (
          <div className="px-3 py-6 border-b border-border/50 flex justify-center">
            <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-lg">
              <TrainFront className="h-6 w-6 text-white" />
            </div>
          </div>
        )}
        
        {/* Menu Sections */}
        <div className="py-4 space-y-6">
          {menuSections.map((section, sectionIndex) => (
            <SidebarGroup key={section.label} className="px-3">
              {!isCollapsed && (
                <SidebarGroupLabel className="px-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                  <span>{section.label}</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
                </SidebarGroupLabel>
              )}
              
              {isCollapsed && sectionIndex > 0 && (
                <div className="h-px bg-border/30 mb-3" />
              )}
              
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {section.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <NavLink
                          to={item.url}
                          end={item.url === "/"}
                          className={({ isActive }) =>
                            `group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 ease-out ${
                              isActive
                                ? "bg-gradient-to-r from-primary/10 to-accent/10 text-primary shadow-sm"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              {/* Active indicator */}
                              {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-primary to-accent rounded-r-full shadow-lg pointer-events-none" />
                              )}
                              
                              {/* Icon with animation */}
                              <div className={`relative z-10 transition-all duration-300 ${
                                isActive 
                                  ? "scale-110" 
                                  : "group-hover:scale-110 group-hover:rotate-3"
                              }`}>
                                <item.icon className={`h-5 w-5 transition-colors duration-300 ${
                                  isActive 
                                    ? "text-primary" 
                                    : "text-muted-foreground group-hover:text-primary"
                                }`} />
                              </div>
                              
                              {/* Text */}
                              {!isCollapsed && (
                                <span className={`relative z-10 text-sm font-medium transition-all duration-300 ${
                                  isActive 
                                    ? "font-semibold" 
                                    : "group-hover:translate-x-0.5"
                                }`}>
                                  {item.title}
                                </span>
                              )}
                              
                              {/* Active shine effect */}
                              {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none" />
                              )}
                            </>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-auto p-4 border-t border-border/50">
          {!isCollapsed ? (
            <div className="px-3 py-2 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-border/50">
              <p className="text-xs font-medium text-foreground">System Status</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <p className="text-xs text-muted-foreground">All systems operational</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
