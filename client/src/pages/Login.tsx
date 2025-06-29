import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff, Lock, User, CreditCard, FileText } from "lucide-react";

const loginSchema = z.object({
  username: z.string().optional(),
  password: z.string().optional(),
});

const verificationSchema = z.object({
  aadharNumber: z.string().optional(),
  rcNumber: z.string().optional(),
  city: z.string().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;
type VerificationFormData = z.infer<typeof verificationSchema>;

export default function Login() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"login" | "verification">("login");
  const [isLoading, setIsLoading] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      aadharNumber: "",
      rcNumber: "",
      city: "",
    },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    
    // Accept any credentials for development
    setTimeout(() => {
      console.log("Login successful:", data);
      setIsLoading(false);
      
      const username = data.username || "guest";
      
      // Check if admin credentials
      if (username === "admin_2025") {
        // Admin login - skip verification and go directly to admin dashboard
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userType", "admin");
        localStorage.setItem("isFirstLogin", "true");
        window.location.href = "/";
      } else if (username === "selvin_1991") {
        // Existing customer - proceed to verification but no tour
        localStorage.setItem("userType", "customer");
        localStorage.setItem("username", username);
        setStep("verification");
      } else {
        // New/dummy customer - proceed to verification with tour
        localStorage.setItem("userType", "customer");
        localStorage.setItem("username", username);
        localStorage.setItem("isFirstLogin", "true");
        setStep("verification");
      }
    }, 1000);
  };

  const handleVerification = async (data: VerificationFormData) => {
    setIsLoading(true);
    
    // Accept any input (or no input) as valid verification
    setTimeout(() => {
      console.log("Verification successful:", data);
      setIsLoading(false);
      
      // Set authentication status and user type for customer
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userType", "customer");
      
      // Force page reload to trigger authentication check
      window.location.href = "/";
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">
            <span className="text-blue-600">Shift</span>
            <span className="text-orange-500">zy</span>
            <span className="text-blue-600"> Go</span>
          </h1>
          <p className="text-neutral-600 mt-2">Your Vehicle Transportation Partner</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {step === "login" ? "Welcome Back" : "Verify Your Identity"}
            </CardTitle>
            <CardDescription>
              {step === "login" 
                ? "Enter any credentials or click Login to continue" 
                : "Click Continue to proceed - all fields are optional"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {step === "login" ? (
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                            <Input
                              {...field}
                              placeholder="Enter your username"
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="pl-10 pr-10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                            >
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    disabled={isLoading}
                  >
                    {isLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </Form>
            ) : (
              <Form {...verificationForm}>
                <form onSubmit={verificationForm.handleSubmit(handleVerification)} className="space-y-4">
                  <FormField
                    control={verificationForm.control}
                    name="aadharNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aadhar Number (Demo: any 12 digits)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                            <Input
                              {...field}
                              placeholder="123456789012"
                              className="pl-10"
                              maxLength={12}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={verificationForm.control}
                    name="rcNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>RC Number (Demo: any text)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
                            <Input
                              {...field}
                              placeholder="TN09AB1234"
                              className="pl-10"
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={verificationForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City (Demo: any city name)</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Chennai"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Your Aadhar and RC details will be verified for security. 
                      Make sure the city matches your registered address.
                    </p>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify & Continue"}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setStep("login")}
                    className="w-full"
                  >
                    Back to Login
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
        
        <div className="text-center mt-6 text-sm text-neutral-600">
          <p>Don't have an account? <button className="text-blue-600 hover:underline">Sign up</button></p>
        </div>
      </div>
    </div>
  );
}