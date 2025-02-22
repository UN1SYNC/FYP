import { createClient } from "@/utils/supabase/client";
import { loginAction, logoutAction } from "../../lib/features/auth/authSlice";

// LOGIN BUTTON FUNCTIONALITY
export const login = async (
  email: string,
  password: string,
  router: any,
  toast: any,
  dispatch: any // Pass dispatch as an argument
) => {
  const supabase = createClient();

  const credentialsData = {
    email: email,
    password: password,
  };
 
  const { data, error } = await supabase.auth.signInWithPassword(credentialsData);

  if (error) {
    toast({
      title: "Unable to Signin",
      description: error.message,
      className: "bg-red-500 border-red-500 text-white",
      duration: 1000,
    });
    return;
  }

  // Dispatch user details to Redux store if login is successful
  if (data?.user) {
    dispatch(loginAction({ id: data.user.id, email: data.user.email }));
    toast({
      title: "Login Successful",
      description: "Redirecting to dashboard",
      className: "bg-green-500 border-green-500 text-white",
      duration: 1000,
    });

    router.push("/dashboard");
  }
};

// LOGOUT BUTTON FUNCTIONALITY
export const logout = async (router: any, toast: any, dispatch: any) => {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error logging out:", error.message);
    return;
  }

  // Dispatch logout action to clear user data from Redux
  dispatch(logoutAction());
  toast({
    title: "Logout Successful",
    description: "Redirecting to homepage",
    className: "bg-green-500 border-green-500 text-white",
    duration: 1000,
  });

  router.push("/"); // Redirect to the homepage
};

// SIGNUP BUTTON FUNCTIONALITY
export const signup = async (
  email: string,
  password: string,
  router: any,
  toast: any
) => {
  const supabase = createClient();

  const credentialsData = {
    email: email,
    password: password,
  };

  const { data, error } = await supabase.auth.signUp(credentialsData);

  if (error) {
    toast({
      title: "Signup Failed",
      description: error.message,
      className: "bg-red-500 border-red-500 text-white",
      duration: 1000,
    });
    return;
  }

  // Show success message without auto-login
  toast({
    title: "Signup Successful",
    description: "Please check your email to verify your account.",
    className: "bg-green-500 border-green-500 text-white",
    duration: 1000,
  });

  // router.push("/login");
};