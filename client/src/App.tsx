import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/use-auth";

// Pages
import LoginPage from "@/pages/login";
import LeadsPage from "@/pages/leads";
import LeadDetailPage from "@/pages/lead-detail";
import UserManagementPage from "@/pages/user-management";
import SettingsPage from "@/pages/settings";
import NotFound from "@/pages/not-found";

function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        {children}
      </div>
    </div>
  );
}

function Router() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <Switch>
        <Route path="/login" component={LoginPage} />
        <Route path="*" component={LoginPage} />
      </Switch>
    );
  }

  // Role-based routing
  const isVA = user.role === 'VA';
  const isManager = user.role === 'MANAGER';
  const isSuperAdmin = user.role === 'SUPERADMIN';

  return (
    <AuthenticatedLayout>
      <Switch>
        <Route path="/" component={LeadsPage} />
        <Route path="/leads" component={LeadsPage} />
        <Route path="/lead/:id" component={LeadDetailPage} />
        
        {!isVA && (
          <Route path="/settings" component={SettingsPage} />
        )}
        
        {isSuperAdmin && (
          <Route path="/user-management" component={UserManagementPage} />
        )}
        
        <Route component={NotFound} />
      </Switch>
    </AuthenticatedLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
