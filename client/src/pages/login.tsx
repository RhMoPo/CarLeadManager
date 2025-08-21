import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { LoginForm } from "@/components/auth/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Car } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { user, consumeMagicLink } = useAuth();
  const [searchParams] = useState(() => new URLSearchParams(window.location.search));
  const magicToken = searchParams.get('token');

  useEffect(() => {
    if (magicToken) {
      consumeMagicLink(magicToken);
    }
  }, [magicToken, consumeMagicLink]);

  useEffect(() => {
    if (user) {
      setLocation('/dashboard');
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" data-testid="login-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <Car className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Lead Manager</h1>
          <p className="text-slate-600">Sign in to your account</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs defaultValue="admin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="admin" data-testid="tab-admin">Admin Login</TabsTrigger>
                <TabsTrigger value="va" data-testid="tab-va">VA Magic Link</TabsTrigger>
              </TabsList>
              
              <TabsContent value="admin">
                <CardHeader className="px-0 pt-4">
                  <CardTitle>Admin Login</CardTitle>
                  <CardDescription>
                    Sign in with your email and password
                  </CardDescription>
                </CardHeader>
                <LoginForm type="password" />
              </TabsContent>
              
              <TabsContent value="va">
                <CardHeader className="px-0 pt-4">
                  <CardTitle>VA Magic Link</CardTitle>
                  <CardDescription>
                    We'll send you a secure login link to your email address
                  </CardDescription>
                </CardHeader>
                <LoginForm type="magic-link" />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
