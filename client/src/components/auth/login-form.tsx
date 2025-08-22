import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LoginFormProps {
  type: 'password' | 'magic-link';
}

export function LoginForm({ type }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, sendMagicLink, isLoginLoading, isMagicLinkLoading } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'password') {
      login({ email, password });
    } else {
      sendMagicLink(email);
    }
  };

  const isLoading = isLoginLoading || isMagicLinkLoading;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          required
          data-testid="input-email"
        />
      </div>
      
      {type === 'password' && (
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            required
            data-testid="input-password"
          />
        </div>
      )}

      {type === 'magic-link' && (
        <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-md">
          We'll send you a secure login link to your email address.
        </div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
        data-testid={type === 'password' ? 'button-login' : 'button-magic-link'}
      >
        {isLoading ? 'Please wait...' : 
         type === 'password' ? 'Sign In' : 'Send Magic Link'}
      </Button>
    </form>
  );
}
