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

  // console.log("00data",data)

  if (error) {
    toast({
      title: "Unable to Signin",
      description: error.message,
      className: "bg-red-500 border-red-500 text-white",
      duration: 1000,
    });
    return;
  }

  const { data:user_details, error:details_error } = await supabase.rpc('get_user_details', {
    user_id_param: data?.user?.id || ''
  })
  console.log("user_details",user_details)
  console.log("error:", details_error);
  
  if (details_error) {
    toast({
      title: "Error",
      description: "Failed to fetch user data",
      className: "bg-red-500 border-red-500 text-white",
      duration: 1000,
    });
    return;
  }

  user_details.lastSignIn = data?.user?.last_sign_in_at

  const userId = user_details?.id;
  if (user_details?.role === "super-admin") {
    
    const { data: modulesData, error: modulesError } = await supabase
      .from("modules")
      .select("*")
      .eq("university_id", user_details.university_id);
  
    if (modulesData && modulesData.length > 0) {
      const modules = modulesData[0]
      const moduleList = Object.keys(modules).filter((key) => key !== "id" && key !== "created_at" && key !== "university_id");
      const isAllFalse = moduleList.every((key) => modules[key] === false);
      if (isAllFalse) {
        toast({
          title:"Login Successful",
          description:"Redirecting to configuration page",
          className:"bg-green-500 border-green-500 text-white",
          duration: 1000
        });
        dispatch(loginAction({
          data: {
            user: user_details,
          },
        }));
        router.push("/onboarding");
        return;
      }
    }
  } else {
    // if the user university id has all modules as false, then redirect to error page
    const { data:modulesData, error:modulesError } = await supabase.from("modules").select("*").eq("university_id", user_details.data.user.university_id);
    if (modulesData && modulesData.length > 0) {
      const modules = modulesData[0]
      const moduleList = Object.keys(modules).filter((key) => key !== "id" && key !== "created_at" && key !== "university_id");
      const isAllFalse = moduleList.every((key) => modules[key] === false);
      if (isAllFalse) {
        toast({
          title:"Login Successful but configuration by admin is not complete",
          description:"Redirecting to error page",
          className:"bg-red-500 border-red-500 text-white",
          duration: 1000
        });
        router.push("/error");
        return;
      }
    }
  }
  
  toast({
    title:"Login Successful",
    description:"Redirecting to dashboard",
    className:"bg-green-500 border-green-500 text-white",
    duration: 1000
  });
  
  // Dispatch login action to store user data in Redux
  // dispatch(loginAction({
  //   email: email || "",
  //   id: userId || "",
  // }));
  dispatch(loginAction({
    data: {
      user: user_details,
    },
  }));
  router.push("/dashboard");
  return;
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
  formData: any,
  router: any,
  toast: any
) => {
  const supabase = createClient();

  
  // create entry for this user in university table
  const { data:universityData, error:universityError }:any = await supabase.from("university").insert({
    name: formData.email,
  }).select("id");
  if (universityError) {
    console.log("universityError",universityError)
  }
  const universityId = universityData[0].id;
  
  const credentialsData = {
    email: formData.email,
    password: formData.password,
    options: {
      data: {
        name: formData.firstName+" "+formData.lastName,
        address: formData.address,
        phone: formData.phoneNumber,
        role: "super-admin",
        university_id: universityId
      }
    }
  }

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

  console.log("data",data)

  
  // create entry for modules table
  const { data:modulesData, error:modulesError }:any = await supabase.from("modules").insert({
    university_id: universityId
  });
  if (modulesError) {
    console.log("modulesError",modulesError)
  }
  
  // Show success message without auto-login
  toast({
    title: "Signup Successful",
    description: "Please check your email to verify your account.",
    className: "bg-green-500 border-green-500 text-white",
    duration: 1000,
  });

  router.push("/");
};