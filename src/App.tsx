import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import OrderCreation from "./pages/OrderCreation";
import CMOMatching from "./pages/CMOMatching";
import WagonAllocation from "./pages/WagonAllocation";
import RakeFormation from "./pages/RakeFormation";
import YardManagement from "./pages/YardManagement";
import LiveTracking from "./pages/LiveTracking";
import AIInsights from "./pages/AIInsights";
import DigitalTwin from "./pages/DigitalTwin";
import CostDashboard from "./pages/CostDashboard";
import HistoricalData from "./pages/HistoricalData";
import Reports from "./pages/Reports";
import ManualConfig from "./pages/ManualConfig";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout><Dashboard /></AppLayout>} />
          <Route path="/orders" element={<AppLayout><OrderCreation /></AppLayout>} />
          <Route path="/cmo-matching" element={<AppLayout><CMOMatching /></AppLayout>} />
          <Route path="/wagon-allocation" element={<AppLayout><WagonAllocation /></AppLayout>} />
          <Route path="/rake-formation" element={<AppLayout><RakeFormation /></AppLayout>} />
          <Route path="/yard-management" element={<AppLayout><YardManagement /></AppLayout>} />
          <Route path="/live-tracking" element={<AppLayout><LiveTracking /></AppLayout>} />
          <Route path="/ai-insights" element={<AppLayout><AIInsights /></AppLayout>} />
          <Route path="/digital-twin" element={<AppLayout><DigitalTwin /></AppLayout>} />
          <Route path="/cost-dashboard" element={<AppLayout><CostDashboard /></AppLayout>} />
          <Route path="/historical-data" element={<AppLayout><HistoricalData /></AppLayout>} />
          <Route path="/reports" element={<AppLayout><Reports /></AppLayout>} />
          <Route path="/manual-config" element={<AppLayout><ManualConfig /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
