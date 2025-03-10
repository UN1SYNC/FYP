"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation"; // Import useRouter
import { useToast } from "@/hooks/use-toast";
import { login } from "@/app/utils/auth";

export function LoginForm({
  className
}: React.ComponentPropsWithoutRef<"form">) {
  const [email, setEmail] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const router = useRouter(); // Use useRouter to get the router
  const { toast } = useToast(); // Use useToast to get the toast

  // HANDLE LOGIN SUBMIT FUNTION
  const handleLoginButton = async () => {
    if (email && password) {
      login(email, password, router, toast); // Call the login function
    }
  };

  // RETURN TSX
  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Login to your account</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Enter your username below to login to your account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            id="email"
            type="email"
            autoComplete="email"
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
          </div>
          <Input
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setPassword(e.target.value)
            }
            id="password"
            type="password"
            autoComplete="password"
            required
          />
        </div>
        <Button onClick={handleLoginButton} className="w-full">
          Login
        </Button>
      </div>
    </div>
  );
}
