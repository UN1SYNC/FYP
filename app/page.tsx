import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10 bg-gradient-to-r from-teal-400 to-blue-500">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  ); 
}
