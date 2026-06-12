import { useState, useRef, useEffect } from "react";
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
import { Eye, EyeOff, Lock, User, CreditCard, FileText, Phone, CheckCircle2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ── Step 1: Username + Password ──────────────────────────────────────────────
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// ── Step 2: Aadhaar number ───────────────────────────────────────────────────
const aadhaarSchema = z.object({
  aadhaarNumber: z
    .string()
    .min(12, "Aadhaar number must be 12 digits")
    .max(12, "Aadhaar number must be 12 digits")
    .regex(/^\d{12}$/, "Only digits allowed"),
});

// ── Step 3: OTP + RC + City ──────────────────────────────────────────────────
const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "Only digits allowed"),
  rcNumber: z.string().min(1, "RC Number is required"),
  city: z.string().min(1, "City is required"),
});

type LoginData = z.infer<typeof loginSchema>;
type AadhaarData = z.infer<typeof aadhaarSchema>;
type OtpData = z.infer<typeof otpSchema>;

type Step = "login" | "aadhaar" | "otp";

// Simulated OTP — in production this would be sent via SMS gateway
const SIMULATED_OTP = "123456";

export default function Login() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<Step>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [maskedAadhaar, setMaskedAadhaar] = useState("");
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loginForm = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const aadhaarForm = useForm<AadhaarData>({
    resolver: zodResolver(aadhaarSchema),
    defaultValues: { aadhaarNumber: "" },
  });

  const otpForm = useForm<OtpData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "", rcNumber: "", city: "" },
  });

  // Countdown timer for OTP resend
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  const startCountdown = () => {
    setCountdown(30);
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(countdownRef.current!);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  // ── Handlers ─────────────────────────────────────────────────────────────

  const handleLogin = (data: LoginData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (data.username === "admin_2025") {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userType", "admin");
        localStorage.setItem("isFirstLogin", "true");
        window.location.href = "/";
      } else {
        localStorage.setItem("userType", "customer");
        localStorage.setItem("username", data.username);
        if (data.username !== "selvin_1991") {
          localStorage.setItem("isFirstLogin", "true");
        }
        setStep("aadhaar");
      }
    }, 800);
  };

  const handleSendOtp = (data: AadhaarData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // Mask: XXXX XXXX 9012
      const last4 = data.aadhaarNumber.slice(-4);
      setMaskedAadhaar(`XXXX XXXX ${last4}`);
      setOtpSent(true);
      startCountdown();
      setStep("otp");
      toast({
        title: "OTP Sent!",
        description: `A 6-digit OTP has been sent to your mobile linked with Aadhaar ${last4 ? "ending in " + last4 : ""}.`,
      });
    }, 1000);
  };

  const handleResendOtp = () => {
    if (countdown > 0) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      startCountdown();
      toast({
        title: "OTP Resent",
        description: "A new OTP has been sent to your registered mobile number.",
      });
    }, 800);
  };

  const handleVerifyOtp = (data: OtpData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (data.otp !== SIMULATED_OTP) {
        otpForm.setError("otp", { message: "Incorrect OTP. Please try again." });
        return;
      }
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userType", "customer");
      window.location.href = "/";
    }, 1000);
  };

  // ── Step indicator ────────────────────────────────────────────────────────
  const steps = [
    { id: "login", label: "Login" },
    { id: "aadhaar", label: "Aadhaar" },
    { id: "otp", label: "OTP" },
  ];
  const currentStepIdx = steps.findIndex((s) => s.id === step);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">
            <span className="text-blue-600">Shift</span>
            <span className="text-orange-500">zy</span>
            <span className="text-blue-600"> Go</span>
          </h1>
          <p className="text-neutral-500 mt-1 text-sm">Your Vehicle Transportation Partner</p>
        </div>

        {/* Step bar — only show for verification steps */}
        {step !== "login" && (
          <div className="flex items-center justify-center gap-2 mb-5">
            {steps.map((s, idx) => (
              <div key={s.id} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 ${idx <= currentStepIdx ? "text-blue-600" : "text-neutral-400"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    idx < currentStepIdx
                      ? "bg-blue-600 border-blue-600 text-white"
                      : idx === currentStepIdx
                      ? "border-blue-600 text-blue-600"
                      : "border-neutral-300 text-neutral-400"
                  }`}>
                    {idx < currentStepIdx ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span className="text-xs font-medium">{s.label}</span>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`w-8 h-px ${idx < currentStepIdx ? "bg-blue-400" : "bg-neutral-200"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-xl">
              {step === "login" && "Welcome Back"}
              {step === "aadhaar" && "Verify Aadhaar"}
              {step === "otp" && "Enter OTP"}
            </CardTitle>
            <CardDescription className="text-sm">
              {step === "login" && "Sign in to your Shiftzy Go account"}
              {step === "aadhaar" && "Enter your 12-digit Aadhaar number to receive an OTP"}
              {step === "otp" && (
                <>OTP sent to mobile linked with Aadhaar <strong>{maskedAadhaar}</strong></>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* ── STEP 1: Login ─────────────────────────────────────────── */}
            {step === "login" && (
              <Form {...loginForm}>
                <form
                  onSubmit={loginForm.handleSubmit(handleLogin)}
                  className="space-y-4"
                  autoComplete="off"
                >
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                              {...field}
                              placeholder="e.g. rajesh_kumar"
                              className="pl-10"
                              autoComplete="off"
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
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="pl-10 pr-10"
                              autoComplete="new-password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
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
            )}

            {/* ── STEP 2: Aadhaar ───────────────────────────────────────── */}
            {step === "aadhaar" && (
              <Form {...aadhaarForm}>
                <form
                  onSubmit={aadhaarForm.handleSubmit(handleSendOtp)}
                  className="space-y-4"
                  autoComplete="off"
                >
                  <FormField
                    control={aadhaarForm.control}
                    name="aadhaarNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aadhaar Card Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                              {...field}
                              placeholder="e.g. 234567890123"
                              className="pl-10 tracking-widest"
                              maxLength={12}
                              inputMode="numeric"
                              autoComplete="off"
                              onChange={(e) => {
                                // Allow digits only
                                const val = e.target.value.replace(/\D/g, "");
                                field.onChange(val);
                              }}
                            />
                          </div>
                        </FormControl>
                        <p className="text-xs text-neutral-400 mt-1">
                          12-digit number printed on your Aadhaar card
                        </p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2">
                    <Phone className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-700">
                      An OTP will be sent to the mobile number registered with your Aadhaar (UIDAI).
                    </p>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                    disabled={isLoading}
                  >
                    {isLoading ? "Sending OTP..." : "Send OTP"}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("login")}
                    className="w-full text-neutral-500"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
                  </Button>
                </form>
              </Form>
            )}

            {/* ── STEP 3: OTP + RC + City ───────────────────────────────── */}
            {step === "otp" && (
              <Form {...otpForm}>
                <form
                  onSubmit={otpForm.handleSubmit(handleVerifyOtp)}
                  className="space-y-4"
                  autoComplete="off"
                >
                  {/* OTP field */}
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>One-Time Password (OTP)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                              {...field}
                              placeholder="e.g. 847291"
                              className="pl-10 tracking-[0.4em] text-center text-lg font-bold"
                              maxLength={6}
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, "");
                                field.onChange(val);
                              }}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Resend OTP */}
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">Didn't receive OTP?</span>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={countdown > 0 || isLoading}
                      className={`font-semibold transition-colors ${
                        countdown > 0 ? "text-neutral-300 cursor-not-allowed" : "text-blue-600 hover:text-blue-700"
                      }`}
                    >
                      {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                    </button>
                  </div>

                  <div className="border-t border-neutral-100 pt-3 space-y-4">
                    <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">
                      Vehicle Details
                    </p>

                    {/* RC Number */}
                    <FormField
                      control={otpForm.control}
                      name="rcNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RC Number</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                              <Input
                                {...field}
                                placeholder="e.g. TN09AB1234"
                                className="pl-10 uppercase"
                                autoComplete="off"
                                onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                              />
                            </div>
                          </FormControl>
                          <p className="text-xs text-neutral-400 mt-1">
                            Registration Certificate number on your RC book
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* City */}
                    <FormField
                      control={otpForm.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g. Chennai"
                              autoComplete="off"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify & Sign In"}
                  </Button>

                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setStep("aadhaar")}
                    className="w-full text-neutral-500"
                  >
                    <ArrowLeft className="h-4 w-4 mr-1" /> Change Aadhaar Number
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-5 text-sm text-neutral-500">
          <p>
            Don't have an account?{" "}
            <button className="text-blue-600 font-medium hover:underline">Sign up</button>
          </p>
        </div>

        {/* Dev hint — remove in production */}
        {step === "otp" && (
          <div className="mt-3 text-center text-xs text-neutral-300">
            Demo OTP: 123456
          </div>
        )}
      </div>
    </div>
  );
}
