import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Car,
  Users,
  Settings,
  LogOut,
  User,
  GraduationCap,
} from "lucide-react";

const navigation = [
  { name: "Leads", href: "/leads", icon: Car, roles: ["SUPERADMIN", "VA"] },
  { name: "Training", href: "/training", icon: GraduationCap, roles: ["SUPERADMIN", "VA"] },
  { name: "User Management", href: "/user-management", icon: Users, roles: ["SUPERADMIN"] },
  { name: "Settings", href: "/settings", icon: Settings, roles: ["SUPERADMIN"] },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  if (!user) return null;

  const visibleNavigation = navigation.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <div className="w-64 bg-white shadow-sm border-r border-slate-200 flex flex-col" data-testid="sidebar">
      {/* Logo */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Car className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900">Lead Manager</h1>
        </div>
        <div className="mt-3 text-xs text-slate-500" data-testid="user-role">
          {user.role === 'SUPERADMIN' ? 'Super Admin' : 
           user.role === 'MANAGER' ? 'Manager Dashboard' : 
           'VA Dashboard'}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {visibleNavigation.map((item) => {
          const isActive = location === item.href || 
            (item.href === '/leads' && location === '/');
          
          return (
            <Link key={item.name} href={item.href}>
              <a
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive
                    ? "text-blue-600 bg-blue-50"
                    : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
                )}
                data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </a>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-slate-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-slate-900 truncate" data-testid="user-email">
              {user.email}
            </div>
            <div className="text-xs text-slate-500">{user.role}</div>
          </div>
        </div>
        <Button
          onClick={() => logout()}
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          data-testid="button-logout"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
