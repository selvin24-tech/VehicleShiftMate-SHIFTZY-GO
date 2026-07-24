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
import { Eye, EyeOff, Lock, User, Phone, CheckCircle2, ArrowLeft, UserPlus, LogIn, MapPin, Smartphone } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BrandName from "@/components/branding/BrandName";

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

const mobileSchema = z.object({
  mobileNumber: z
    .string()
    .min(10, "Mobile number must be 10 digits")
    .max(10, "Mobile number must be 10 digits")
    .regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
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
type MobileData = z.infer<typeof mobileSchema>;
type OtpData = z.infer<typeof otpSchema>;

type Mode = "signIn" | "signUp" | "forgot";
type Step = "form" | "mobile" | "otp";

const SIMULATED_OTP = "123456";

export default function Login() {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("signIn");
  const [step, setStep] = useState<Step>("form");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [maskedPhone, setMaskedPhone] = useState("");
  const [countdown, setCountdown] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [forgotPhone, setForgotPhone] = useState("");
  const [forgotOtpSent, setForgotOtpSent] = useState(false);
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPwd, setForgotNewPwd] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { username: "", password: "" },
  });

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", username: "", password: "", confirmPassword: "" },
  });

  const mobileForm = useForm<MobileData>({
    resolver: zodResolver(mobileSchema),
    defaultValues: { mobileNumber: "", loginPlace: "" },
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
    mobileForm.reset();
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

  // ── Sign Up: new users → Mobile OTP → home ──────────────────────────────
  const handleSignUp = (data: SignUpData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      localStorage.setItem("userType", "customer");
      localStorage.setItem("username", data.username);
      localStorage.setItem("displayName", `${data.firstName} ${data.lastName}`);
      localStorage.setItem("isFirstLogin", "true");
      setStep("mobile");
    }, 800);
  };

  const handleSendOtp = (data: MobileData) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const last4 = data.mobileNumber.slice(-4);
      setMaskedPhone(`+91 XXXXXX${last4}`);
      localStorage.setItem("loginPlace", data.loginPlace);
      startCountdown();
      setStep("otp");
      toast({
        title: "OTP Sent!",
        description: `A 6-digit OTP has been sent to your mobile number ending in ${last4}.`,
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
  const verifySteps = ["Sign Up", "Phone OTP", "Verify"];
  const verifyIdx = step === "mobile" ? 1 : step === "otp" ? 2 : 0;

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
          <p className="text-neutral-600 mt-1 text-sm font-medium">India's Smart Vehicle Shifting &amp; Travel Platform</p>
          <p className="text-neutral-400 text-xs tracking-wide mt-0.5">Safe Shift. Joyful Journey.</p>
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
          {step === "form" && mode !== "forgot" && (
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

                    <div className="text-center">
                      <button type="button" onClick={() => { setMode("forgot"); setForgotPhone(""); setForgotOtpSent(false); setForgotOtp(""); setForgotNewPwd(""); setForgotSuccess(false); }}
                        className="text-sm text-blue-600 font-semibold hover:underline">
                        Forgot Password?
                      </button>
                    </div>
                  </form>
                </Form>

                {/* Prominent Sign Up nudge */}
                <div className="mt-5 p-4 bg-orange-50 border border-orange-200 rounded-xl text-center">
                  <p className="text-sm text-orange-800 font-medium mb-2">New to <BrandName go />?</p>
                  <button
                    onClick={() => switchMode("signUp")}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold text-sm active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-4 h-4" /> Create Your Account
                  </button>
                </div>
              </>
            )}

            {/* ── FORGOT PASSWORD ───────────────────────────────────────── */}
            {mode === "forgot" && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-7 h-7 text-blue-600" />
                  </div>
                  <h2 className="font-bold text-lg">Reset Password</h2>
                  <p className="text-sm text-neutral-500 mt-1">
                    {forgotSuccess ? "Password reset successfully!" : forgotOtpSent ? "Enter the OTP sent to your phone" : "Enter your registered phone number"}
                  </p>
                </div>

                {forgotSuccess ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-9 h-9 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-700 font-medium">Your password has been reset. You can now sign in.</p>
                    <Button onClick={() => setMode("signIn")} className="w-full bg-blue-600 hover:bg-blue-700 h-11">Sign In Now</Button>
                  </div>
                ) : !forgotOtpSent ? (
                  <>
                    <div>
                      <label className="text-sm font-medium text-neutral-700">Registered Phone Number</label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          type="tel" placeholder="+91 98765 43210" value={forgotPhone}
                          onChange={e => setForgotPhone(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>
                    <Button onClick={() => { if (forgotPhone.length >= 10) { setForgotOtpSent(true); toast({ title: "OTP Sent", description: "A 6-digit OTP has been sent to your phone." }); } }}
                      disabled={forgotPhone.length < 10} className="w-full bg-blue-600 hover:bg-blue-700 h-11">
                      Send OTP
                    </Button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium text-neutral-700">Enter OTP (use 123456)</label>
                      <input type="text" maxLength={6} placeholder="6-digit OTP" value={forgotOtp}
                        onChange={e => setForgotOtp(e.target.value.replace(/\D/, ""))}
                        className="w-full border border-neutral-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400 mt-1 tracking-widest text-center text-lg font-bold"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-neutral-700">New Password</label>
                      <div className="relative mt-1">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input type="password" placeholder="New password (min. 6 chars)" value={forgotNewPwd}
                          onChange={e => setForgotNewPwd(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-400"
                        />
                      </div>
                    </div>
                    <Button onClick={() => {
                      if (forgotOtp === "123456" && forgotNewPwd.length >= 6) {
                        setForgotSuccess(true);
                      } else if (forgotOtp !== "123456") {
                        toast({ title: "Wrong OTP", description: "Incorrect OTP. Try again.", variant: "destructive" });
                      } else {
                        toast({ title: "Password too short", description: "Minimum 6 characters required.", variant: "destructive" });
                      }
                    }} disabled={forgotOtp.length < 6 || forgotNewPwd.length < 6}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white h-11">
                      Reset Password
                    </Button>
                  </>
                )}

                {!forgotSuccess && (
                  <button onClick={() => setMode("signIn")} className="w-full flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mt-2">
                    <ArrowLeft className="w-4 h-4" /> Back to Sign In
                  </button>
                )}
              </div>
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

            {/* ── SIGN UP — Mobile OTP step ─────────────────────────────── */}
            {mode === "signUp" && step === "mobile" && (
              <>
                <div className="text-center mb-5">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <Smartphone className="w-7 h-7 text-blue-600" />
                  </div>
                  <h2 className="font-bold text-lg">Verify Your Mobile</h2>
                  <p className="text-sm text-neutral-500 mt-1">We'll send a one-time password to confirm your number</p>
                </div>
                <Form {...mobileForm}>
                  <form onSubmit={mobileForm.handleSubmit(handleSendOtp)} className="space-y-4" autoComplete="off">
                    <FormField control={mobileForm.control} name="mobileNumber" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                            <span className="absolute left-9 top-1/2 -translate-y-1/2 text-neutral-400 text-sm font-medium border-r border-neutral-200 pr-2">+91</span>
                            <Input
                              {...field}
                              placeholder="98765 43210"
                              className="pl-[4.5rem] tracking-wider"
                              maxLength={10}
                              inputMode="numeric"
                              autoComplete="tel"
                              onChange={e => field.onChange(e.target.value.replace(/\D/g, ""))}
                            />
                          </div>
                        </FormControl>
                        <p className="text-xs text-neutral-400 mt-1">10-digit number starting with 6, 7, 8, or 9</p>
                        <FormMessage />
                      </FormItem>
                    )} />

                    <FormField control={mobileForm.control} name="loginPlace" render={({ field }) => (
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
                      <p className="text-xs text-blue-700">A 6-digit OTP will be sent to the mobile number you enter above.</p>
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
                  OTP sent to mobile <strong>{maskedPhone}</strong>
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

                    <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-700 h-11 font-semibold" disabled={isLoading}>
                      {isLoading ? "Verifying..." : "Verify & Create Account"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setStep("mobile")} className="w-full text-neutral-500">
                      <ArrowLeft className="h-4 w-4 mr-1" /> Change Mobile Number
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
