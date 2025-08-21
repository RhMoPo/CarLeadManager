import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";

export interface User {
  id: string;
  email: string;
  role: 'SUPERADMIN' | 'MANAGER' | 'VA';
}

export function useAuth() {
  const queryClient = useQueryClient();

  const { data: user, isLoading, error } = useQuery({
    queryKey: ["/api/user"],
    retry: false,
    queryFn: async () => {
      const res = await fetch("/api/user", { credentials: "include" });
      if (res.status === 401) {
        return null; // Return null for unauthenticated users instead of throwing
      }
      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      return res.json();
    },
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await apiRequest("POST", "/api/login-password", credentials);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    },
  });

  const magicLinkMutation = useMutation({
    mutationFn: async (email: string) => {
      const res = await apiRequest("POST", "/api/login-magic-request", { email });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Magic link sent",
        description: "Check your email for the login link",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send magic link",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const consumeMagicLinkMutation = useMutation({
    mutationFn: async (token: string) => {
      const res = await apiRequest("POST", "/api/login-magic-consume", { token });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Magic link failed",
        description: error.message || "Invalid or expired token",
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    },
  });

  return {
    user: user?.user as User | null,
    isLoading,
    error,
    login: loginMutation.mutate,
    sendMagicLink: magicLinkMutation.mutate,
    consumeMagicLink: consumeMagicLinkMutation.mutate,
    logout: logoutMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    isMagicLinkLoading: magicLinkMutation.isPending,
  };
}
