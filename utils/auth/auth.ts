
import { createClient } from "@/utils/supabase/client";

// LOGIN BUTTON FUNCTIONALITY
export const loginButtonFunction = async (email: string, password: string, router: any) => {

    const supabase = createClient();

    const data = {
      email: email,
      password: password,
    }

    const { error } = await supabase.auth.signInWithPassword(data);

    if (error) {
      router.push("/error");
      return;
    }

    router.push("/dashboard");
    return;
  };


// LOGOUT BUTTON FUNCTIONALITY
export const logoutButtonFunction = async (router: any, setIsLoading: React.Dispatch<React.SetStateAction<boolean>>) => {
  setIsLoading(true); // Start loading

  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  setIsLoading(false); // Stop loading

  if (error) {
    router.push("/error");
    return;
  }

  router.push("/"); // Redirect to the homepage or desired page
};
