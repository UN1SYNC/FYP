import React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation"; // Import useRouter
import { useToast } from "@/hooks/use-toast";
import { signup } from "@/app/utils/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { useDispatch } from "react-redux";

const SignUpForm = ({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) => {

    const [email, setEmail] = useState<string | null>(null);
    const [password, setPassword] = useState<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false); // State to track login process
    const router = useRouter(); // Use useRouter to get the router
    const { toast } = useToast(); // Use useToast to get the toast
    const dispatch = useDispatch();

      // HANDLE LOGIN SUBMIT FUNCTION
  const handleSignUpButton = async () => {
    // Check if email or password is empty
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Email and password are required.",
        className: "bg-red-500 border-red-500 text-white",
        duration: 1000,
      });
      return; // Stop further execution if fields are empty
    }
    setIsLoggingIn(true); // Start spinning logo
    try {
      await signup(email, password, router, toast, dispatch); // Perform login
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoggingIn(false); // Stop spinning logo after login attempt
    }
  };

  // RETURN TSX  
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="pb-8">
        <CardHeader>
          <CardTitle className="text-2xl">
            <div className="flex flex-col justify-center items-center">
              <div className="">
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  width={80}
                  height={80}
                  className={isLoggingIn ? "animate-spin" : ""} // Conditionally apply rotation
                />
              </div>
              <div>
                <p> Unisync </p>
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            Enter your email and password to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <div className="flex flex-col gap-6">
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
                  autoComplete="password"
                  id="password"
                  type="password"
                  required
                />
              </div>
              <Button onClick={handleSignUpButton} className="w-full">
              SignUp
            </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpForm;
