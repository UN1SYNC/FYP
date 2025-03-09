import React from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
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

interface SignUpFormProps extends React.HTMLAttributes<HTMLDivElement> {}

const SignUpForm = ({ className, ...props }: SignUpFormProps) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    address: "",
    phoneNumber: "",
  });
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const router = useRouter();
  const { toast } = useToast();
  const dispatch = useDispatch();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  // HANDLE SIGNUP SUBMIT FUNCTION
  const handleSignUpButton = async () => {
    // Check if any required field is empty
    const requiredFields = ["email", "password", "firstName", "lastName", "phoneNumber"];
    const emptyFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);

    if (emptyFields.length > 0) {
      toast({
        title: "Error",
        description: `${emptyFields.join(", ")} ${emptyFields.length > 1 ? "are" : "is"} required.`,
        className: "bg-red-500 border-red-500 text-white",
        duration: 2000,
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        className: "bg-red-500 border-red-500 text-white",
        duration: 2000,
      });
      return;
    }

    // Validate phone number (assuming 10-digit format)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(formData.phoneNumber)) {
      toast({
        title: "Error",
        description: "Please enter a valid 10-digit phone number.",
        className: "bg-red-500 border-red-500 text-white",
        duration: 2000,
      });
      return;
    }

    setIsLoggingIn(true);
    try {
      await signup(formData, router, toast);
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to create account. Please try again.",
        className: "bg-red-500 border-red-500 text-white",
        duration: 2000,
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="pb-8">
        <CardHeader>
          <CardTitle className="text-2xl">
            <div className="flex flex-col justify-center items-center">
              <div>
                <Image
                  src="/logo.svg"
                  alt="Logo"
                  width={80}
                  height={80}
                  className={isLoggingIn ? "animate-spin" : ""}
                />
              </div>
              <div>
                <p>Unisync</p>
              </div>
            </div>
          </CardTitle>
          <CardDescription>
            Create your account by filling in the information below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Enter your first name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Enter your last name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleInputChange}
                autoComplete="email"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleInputChange}
                autoComplete="new-password"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                placeholder="Enter your address"
                value={formData.address}
                onChange={handleInputChange}
              />
            </div>

            <Button 
              onClick={handleSignUpButton}
              className="w-full"
              disabled={isLoggingIn}
            >
              {isLoggingIn ? "Creating Account..." : "Sign Up"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SignUpForm;
