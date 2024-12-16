"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { logoutButtonFunction } from "@/utils/auth/auth"; // Import the function

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogoutButton = () => {
    logoutButtonFunction(router, setIsLoading); // Call the function with router and setIsLoading
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen w-screen">
      <h1>Welcome to Dashboard Page</h1>
      <Button onClick={handleLogoutButton} disabled={isLoading}>
        {isLoading ? "Logging out..." : "Logout"}
      </Button>
    </div>
  );
}
