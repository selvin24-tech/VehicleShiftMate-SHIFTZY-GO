import { useState, useRef, useEffect } from "react";
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
import { Eye, EyeOff, Lock, User, CreditCard, Phone, CheckCircle2, ArrowLeft, UserPlus, LogIn, Car, MapPin } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ── Schemas ──────────────────────────────────────────────────────────────────
const signInSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine(d => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const aadhaarSchema = z.object({
  aadhaarNumber: z
    .string()
    .min(12, "Aadhaar number must be 12 digits")
    .max(12, "Aadhaar number must be 12 digits")
    .regex(/^\d{12}$/, "Only digits allowed"),
  vehicleNumber: z
    .string()
    .min(1, "Vehicle number is required")
    .regex(/^[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}$/, "Enter a valid vehicle number (e.g. TN09AB1234)"),
  loginPlace: z.string().min(2, "Please enter your current city or place"),
});

const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 digits")
    .max(6, "OTP must be 6 digits")
    .regex(/^\d{6}$/, "Only digits allowed"),
});

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;
type AadhaarData = z.infer<typeof aadhaarSchema>;
type OtpData = z.infer<typeof otpSchema>;

type Mode = "signIn" | "signUp";
type Step = "form" | "aadhaar" | "otp";

const SIMULATED_OTP = "123456";

export default function Login() {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("signIn");
  const [step, setStep] = useState<Step>("form");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [maskedAadhaar, setMaskedAadhaar] = useState("");
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { username: "", password: "" },
  });

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", username: "", password: "", confirmPassword: "" },
  });

  const aadhaarForm = useForm<AadhaarData>({
    resolver: zodResolver(aadhaarSchema),
    defaultValues: { aadhaarNumber: "", vehicleNumber: "", loginPlace: "" },
  });

  const otpForm = useForm<OtpData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  });

  useEffect(() => {
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, []);

  const startCountdown = () => {
    setCountdown(30);
    countdownRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(countdownRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep("form");
    signInForm.reset();
    signUpForm.reset();
    aadhaarForm.reset();
    otpForm.reset();
  };

  // ── Sign In: existing users → straight to home ───────────────────────────
  const handleSignIn = (data: SignInData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (data.username === "admin_2025") {
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userType", "admin");
        window.location.href = "/";
      } else {
        // All existing customers skip verification and go straight to home
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userType", "customer");
        localStorage.setItem("username", data.username);
        window.location.href = "/";
      }
    }, 800);
  };

  // ── Sign Up: new users → Aadhaar → OTP → home ───────────────────────────
  const handleSignUp = (data: SignUpData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem("userType", "customer");
      localStorage.setItem("username", data.username);
      localStorage.setItem("displayName", `${data.firstName} ${data.lastName}`);
      localStorage.setItem("isFirstLogin", "true");
      setStep("aadhaar");
    }, 800);
  };

  const handleSendOtp = (data: AadhaarData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const last4 = data.aadhaarNumber.slice(-4);
      setMaskedAadhaar(`XXXX XXXX ${last4}`);
      // Save vehicle number and place for later use
      localStorage.setItem("vehicleNumber", data.vehicleNumber.toUpperCase());
      localStorage.setItem("loginPlace", data.loginPlace);
      startCountdown();
      setStep("otp");
      toast({
        title: "OTP Sent!",
        description: `A 6-digit OTP has been sent to the mobile linked with Aadhaar ending in ${last4}.`,
      });
    }, 1000);
  };

  const handleResendOtp = () => {
    if (countdown > 0) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      startCountdown();
      toast({ title: "OTP Resent", description: "A new OTP has been sent to your registered mobile." });
    }, 800);
  };

  const handleVerifyOtp = (data: OtpData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (data.otp !== SIMULATED_OTP) {
        otpForm.setError("otp", { message: "Incorrect OTP. Try again." });
        return;
      }
      localStorage.setItem("isAuthenticated", "true");
      localStorage.setItem("userType", "customer");
      window.location.href = "/";
    }, 1000);
  };

  // ── Step indicator (only during sign-up verification) ────────────────────
  const verifySteps = ["Sign Up", "Aadhaar", "OTP Verify"];
  const verifyIdx = step === "aadhaar" ? 1 : step === "otp" ? 2 : 0;

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

        {/* ── Sign-up verification steps ─────────────────────────────────── */}
        {mode === "signUp" && step !== "form" && (
          <div className="flex items-center justify-center gap-2 mb-5">
            {verifySteps.map((s, idx) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 ${idx <= verifyIdx ? "text-blue-600" : "text-neutral-400"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                    idx < verifyIdx ? "bg-blue-600 border-blue-600 text-white"
                    : idx === verifyIdx ? "border-blue-600 text-blue-600"
                    : "border-neutral-300 text-neutral-400"
                  }`}>
                    {idx < verifyIdx ? <CheckCircle2 className="w-3.5 h-3.5" /> : idx + 1}
                  </div>
                  <span className="text-xs font-medium hidden sm:inline">{s}</span>
                </div>
                {idx < verifySteps.length - 1 && (
                  <div className={`w-6 h-px ${idx < verifyIdx ? "bg-blue-400" : "bg-neutral-200"}`} />
                )}
              </div>
            ))}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

          {/* ── Tab switcher (Sign In / Sign Up) ─── only on form step ──── */}
          {step === "form" && (
            <div className="flex border-b border-neutral-100">
              <button
                onClick={() => switchMode("signIn")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-colors ${
                  mode === "signIn"
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <LogIn className="w-4 h-4" /> Sign In
              </button>
              <button
                onClick={() => switchMode("signUp")}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-colors ${
                  mode === "signUp"
                    ? "text-orange-600 border-b-2 border-orange-500 bg-orange-50"
                    : "text-neutral-400 hover:text-neutral-600"
                }`}
              >
                <UserPlus className="w-4 h-4" /> Sign Up
              </button>
            </div>
          )}

          <div className="p-6">

            {/* ── SIGN IN ──────────────────────────────────────────────── */}
            {mode === "signIn" && step === "form" && (
              <>
                <p className="text-neutral-500 text-sm mb-5 text-center">Welcome back! Sign in to continue.</p>
                <Form {...signInForm}>
                  <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4" autoComplete="off">
                    <FormField control={signInForm.control} name="username" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input {...field} placeholder="Enter your username" className="pl-10" autoComplete="off" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={signInForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input {...field} type={showPassword ? "text" : "password"} placeholder="Enter your password" className="pl-10 pr-10" autoComplete="new-password" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-11 font-semibold" disabled={isLoading}>
                      {isLoading ? "Signing In..." : "Sign In"}
                    </Button>
                  </form>
                </Form>

                {/* Prominent Sign Up nudge */}
                <div className="mt-5 p-4 bg-orange-50 border border-orange-200 rounded-xl text-center">
                  <p className="text-sm text-orange-800 font-medium mb-2">New to Shiftzy Go?</p>
                  <button
                    onClick={() => switchMode("signUp")}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" /> Create Your Account
                  </button>
                </div>
              </>
            )}

            {/* ── SIGN UP — form ───────────────────────────────────────── */}
            {mode === "signUp" && step === "form" && (
              <>
                <p className="text-neutral-500 text-sm mb-5 text-center">Create your account in seconds.</p>
                <Form {...signUpForm}>
                  <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4" autoComplete="off">
                    <div className="grid grid-cols-2 gap-3">
                      <FormField control={signUpForm.control} name="firstName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Rajesh" autoComplete="off" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={signUpForm.control} name="lastName" render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Kumar" autoComplete="off" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>

                    <FormField control={signUpForm.control} name="username" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input {...field} placeholder="e.g. rajesh_kumar" className="pl-10" autoComplete="off" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={signUpForm.control} name="password" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input {...field} type={showPassword ? "text" : "password"} placeholder="Min. 6 characters" className="pl-10 pr-10" autoComplete="new-password" />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={signUpForm.control} name="confirmPassword" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input {...field} type={showConfirm ? "text" : "password"} placeholder="Re-enter password" className="pl-10 pr-10" autoComplete="new-password" />
                            <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-11 font-semibold" disabled={isLoading}>
                      {isLoading ? "Creating Account..." : "Continue"}
                    </Button>
                  </form>
                </Form>
              </>
            )}

            {/* ── SIGN UP — Aadhaar step ───────────────────────────────── */}
            {mode === "signUp" && step === "aadhaar" && (
              <>
                <h2 className="font-bold text-lg text-center mb-1">Verify Aadhaar</h2>
                <p className="text-sm text-neutral-500 text-center mb-5">Enter your 12-digit Aadhaar number to receive an OTP</p>
                <Form {...aadhaarForm}>
                  <form onSubmit={aadhaarForm.handleSubmit(handleSendOtp)} className="space-y-4" autoComplete="off">
                    {/* Aadhaar Number */}
                    <FormField control={aadhaarForm.control} name="aadhaarNumber" render={({ field }) => (
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
                              onChange={e => field.onChange(e.target.value.replace(/\D/g, ""))}
                            />
                          </div>
                        </FormControl>
                        <p className="text-xs text-neutral-400 mt-1">12-digit number printed on your Aadhaar card</p>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Vehicle Number */}
                    <FormField control={aadhaarForm.control} name="vehicleNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vehicle Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Car className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                              {...field}
                              placeholder="e.g. TN09AB1234"
                              className="pl-10 uppercase tracking-wider"
                              autoComplete="off"
                              onChange={e => field.onChange(e.target.value.toUpperCase().replace(/\s/g, ""))}
                            />
                          </div>
                        </FormControl>
                        <p className="text-xs text-neutral-400 mt-1">Registration number from your RC book</p>
                        <FormMessage />
                      </FormItem>
                    )} />

                    {/* Login Place */}
                    <FormField control={aadhaarForm.control} name="loginPlace" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Your Current City / Place</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                              {...field}
                              placeholder="e.g. Chennai, Coimbatore"
                              className="pl-10"
                              autoComplete="off"
                            />
                          </div>
                        </FormControl>
                        <p className="text-xs text-neutral-400 mt-1">City or area you are currently signing up from</p>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 flex gap-2">
                      <Phone className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-700">An OTP will be sent to the mobile number registered with your Aadhaar (UIDAI).</p>
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 h-11 font-semibold" disabled={isLoading}>
                      {isLoading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setStep("form")} className="w-full text-neutral-500">
                      <ArrowLeft className="h-4 w-4 mr-1" /> Back
                    </Button>
                  </form>
                </Form>
              </>
            )}

            {/* ── SIGN UP — OTP step ───────────────────────────────────── */}
            {mode === "signUp" && step === "otp" && (
              <>
                <h2 className="font-bold text-lg text-center mb-1">Enter OTP</h2>
                <p className="text-sm text-neutral-500 text-center mb-5">
                  OTP sent to mobile linked with Aadhaar <strong>{maskedAadhaar}</strong>
                </p>
                <Form {...otpForm}>
                  <form onSubmit={otpForm.handleSubmit(handleVerifyOtp)} className="space-y-4" autoComplete="off">
                    <FormField control={otpForm.control} name="otp" render={({ field }) => (
                      <FormItem>
                        <FormLabel>One-Time Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <Input
                              {...field}
                              placeholder="e.g. 847291"
                              className="pl-10 tracking-[0.5em] text-center text-xl font-bold h-14"
                              maxLength={6}
                              inputMode="numeric"
                              autoComplete="one-time-code"
                              onChange={e => field.onChange(e.target.value.replace(/\D/g, ""))}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Didn't receive OTP?</span>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={countdown > 0}
                        className={`font-semibold ${countdown > 0 ? "text-neutral-300 cursor-not-allowed" : "text-blue-600"}`}
                      >
                        {countdown > 0 ? `Resend in ${countdown}s` : "Resend OTP"}
                      </button>
                    </div>

                    <Button type="submit" className="w-full bg-gradient-to-r from-green-600 to-green-700 h-11 font-semibold" disabled={isLoading}>
                      {isLoading ? "Verifying..." : "Verify & Create Account"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setStep("aadhaar")} className="w-full text-neutral-500">
                      <ArrowLeft className="h-4 w-4 mr-1" /> Change Aadhaar Number
                    </Button>
                  </form>
                </Form>
                <p className="text-center text-xs text-neutral-300 mt-3">Demo OTP: 123456</p>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
