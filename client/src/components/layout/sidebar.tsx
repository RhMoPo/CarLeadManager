import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  Car,
  Users,
  Settings,
  LogOut,
  User,
  GraduationCap,
  Menu,
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
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (!user) return null;

  const visibleNavigation = navigation.filter(item => 
    item.roles.includes(user.role)
  );

  return (
    <div 
      className={cn(
        "bg-white shadow-sm border-r border-slate-200 flex flex-col transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )} 
      data-testid="sidebar"
    >
      {/* Logo */}
      <div className={cn("border-b border-slate-200", isCollapsed ? "p-3" : "p-6")}>
        <div className={cn("flex items-center", isCollapsed ? "flex-col space-y-3" : "justify-between")}>
          <div className={cn("flex items-center", isCollapsed ? "justify-center" : "space-x-3")}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="w-5 h-5 text-white" />
            </div>
            {!isCollapsed && (
              <h1 className="text-lg font-semibold text-slate-900">Lead Manager</h1>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="w-8 h-8 p-0 flex-shrink-0"
            data-testid="button-toggle-sidebar"
          >
            <Menu className="w-4 h-4" />
          </Button>
        </div>
        {!isCollapsed && (
          <div className="mt-3 text-xs text-slate-500" data-testid="user-role">
            {user.role === 'SUPERADMIN' ? 'Super Admin' : 
             user.role === 'MANAGER' ? 'Manager Dashboard' : 
             'VA Dashboard'}
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className={cn("flex-1 space-y-2", isCollapsed ? "p-2" : "p-4")}>
        {visibleNavigation.map((item) => {
          const isActive = location === item.href || 
            (item.href === '/leads' && location === '/');
          
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={cn(
                "flex items-center text-sm font-medium rounded-md transition-colors relative group",
                isCollapsed 
                  ? "justify-center p-3 mx-1" 
                  : "space-x-3 px-3 py-2",
                isActive
                  ? "text-blue-600 bg-blue-50"
                  : "text-slate-700 hover:text-slate-900 hover:bg-slate-100"
              )}
              data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span>{item.name}</span>}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className={cn("border-t border-slate-200", isCollapsed ? "p-2" : "p-4")}>
        {!isCollapsed && (
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
        )}
        
        <Button
          onClick={() => logout()}
          variant="ghost"
          size="sm"
          className={cn(
            isCollapsed 
              ? "w-full h-12 p-0 flex justify-center relative group" 
              : "w-full justify-start"
          )}
          data-testid="button-logout"
        >
          <LogOut className={cn("w-5 h-5", !isCollapsed && "mr-2")} />
          {!isCollapsed && "Sign Out"}
          
          {/* Tooltip for collapsed state */}
          {isCollapsed && (
            <div className="absolute left-full ml-3 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              Sign Out
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
