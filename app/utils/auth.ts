
import { createClient } from "@/utils/supabase/client";

// LOGIN BUTTON FUNCTIONALITY
export const login = async (email: string, password: string, router: any, toast:any) => {
  
  const supabase = createClient();
  
  const data = {
    email: email,
    password: password,
  }
  
  const { error } = await supabase.auth.signInWithPassword(data);
  
  if (error) {
    toast({
      title:"Unable to Signin",
      description:error.message,
      className:"bg-red-500 border-red-500 text-white",
      duration: 1000
    });
    return;
  }
  
  toast({
    title:"Login Successful",
    description:"Redirecting to dashboard",
    className:"bg-green-500 border-green-500 text-white",
    duration: 1000
  });
  
  router.push("/dashboard");
  return;
};


// LOGOUT BUTTON FUNCTIONALITY
export const logout = async (router: any, toast: any) => {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error logging out:", error.message);
    return;
  }
  toast({
    title:"Logout Successful",
    description:"Redirecting to homepage",
    className:"bg-green-500 border-green-500 text-white",
    duration: 1000
  });
  router.push("/"); // Redirect to the homepage or desired page
};
