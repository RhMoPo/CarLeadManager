import { toast } from "@/hooks/use-toast";

export function getAuthHeaders(): Record<string, string> {
  // Session cookies are automatically included
  return {
    'Content-Type': 'application/json',
  };
}

export function handleAuthError(error: any) {
  if (error.status === 401) {
    toast({
      title: "Session expired",
      description: "Please log in again",
      variant: "destructive",
    });
    // Force page reload to redirect to login
    window.location.href = '/login';
  } else if (error.status === 403) {
    toast({
      title: "Access denied",
      description: "You don't have permission to perform this action",
      variant: "destructive",
    });
  }
}
