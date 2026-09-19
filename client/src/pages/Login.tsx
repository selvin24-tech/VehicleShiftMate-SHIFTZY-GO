import { useState } from "react";
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
import { Eye, EyeOff, Lock, User, Phone, CheckCircle2, ArrowLeft, UserPlus, LogIn, Shield, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import BrandName from "@/components/branding/BrandName";
import { useIsDesktop } from "@/hooks/use-desktop";
import { returnAfterLoginPath } from "@/lib/auth";

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

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

type Mode = "signIn" | "signUp" | "forgot";

export default function Login() {
  const { toast } = useToast();
  const [mode, setMode] = useState<Mode>("signIn");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSubmitted, setForgotSubmitted] = useState(false);
  const [forgotError, setForgotError] = useState("");

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { username: "", password: "" },
  });

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { firstName: "", lastName: "", username: "", password: "", confirmPassword: "" },
  });

  const switchMode = (m: Mode) => {
    setMode(m);
    signInForm.reset();
    signUpForm.reset();
    setForgotSubmitted(false);
    setForgotError("");
  };

  // Any protected action (submit a shift request, pay, open My Rides, etc.)
  // can redirect here with ?next=<path>; after auth, send the user back.
  const goAfterAuth = () => {
    window.location.href = returnAfterLoginPath();
  };

  // ── Sign In: real email+password login against the server session ───────
  const handleSignIn = async (data: SignInData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: data.username, password: data.password }),
      });
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        signInForm.setError("password", { message: body.message || "Invalid username or password" });
        setIsLoading(false);
        return;
      }

      goAfterAuth();
    } catch {
      setIsLoading(false);
      toast({ title: "Couldn't sign in", description: "Please check your connection and try again.", variant: "destructive" });
    }
  };

  // ── Sign Up: create the real account (session starts immediately) → home ──
  // Real phone/OTP verification is a V2 item; we never simulate one here.
  const handleSignUp = async (data: SignUpData) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: `${data.firstName} ${data.lastName}`,
          email: data.username,
          password: data.password,
        }),
      });
      const body = await res.json().catch(() => ({}));
      setIsLoading(false);

      if (!res.ok) {
        signUpForm.setError("username", { message: body.message || "Could not create account with that username" });
        return;
      }

      goAfterAuth();
    } catch {
      setIsLoading(false);
      toast({ title: "Couldn't create account", description: "Please check your connection and try again.", variant: "destructive" });
    }
  };

  // ── Forgot password: real email flow — POST /api/user/forgot-password ────
  const handleForgotSubmit = async () => {
    if (!forgotEmail.includes("@")) {
      setForgotError("Enter a valid email address.");
      return;
    }
    setForgotError("");
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const body = await res.json().catch(() => ({}));
      setIsLoading(false);
      if (!res.ok) {
        setForgotError(body.message || "Couldn't send the reset email right now.");
        return;
      }
      setForgotSubmitted(true);
    } catch {
      setIsLoading(false);
      setForgotError("Check your connection and try again.");
    }
  };

  const isDesktop = useIsDesktop();

  const tabSwitcher = mode !== "forgot" && (
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
  );

  const authBody = (
    <>
            {/* ── SIGN IN ──────────────────────────────────────────────── */}
            {mode === "signIn" && (
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
                      <button type="button" onClick={() => { setMode("forgot"); setForgotEmail(""); setForgotSubmitted(false); setForgotError(""); }}
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

            {/* ── FORGOT PASSWORD — real email flow ───────────────────── */}
            {mode === "forgot" && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
                    <Lock className="w-7 h-7 text-blue-600" />
                  </div>
                  <h2 className="font-bold text-lg">Reset Password</h2>
                  <p className="text-sm text-neutral-500 mt-1">
                    {forgotSubmitted
                      ? "Check your email for a reset link."
                      : "Enter your account email — we'll send you a link to set a new password."}
                  </p>
                </div>

                {forgotSubmitted ? (
                  <div className="text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-9 h-9 text-blue-600" />
                    </div>
                    <p className="text-sm text-blue-700 font-medium">
                      If {forgotEmail} is registered, a password reset link is on its way.
                    </p>
                    <Button onClick={() => setMode("signIn")} className="w-full bg-blue-600 hover:bg-blue-700 h-11">Back to Sign In</Button>
                  </div>
                ) : (
                  <>
                    <div>
                      <label className="text-sm font-medium text-neutral-700">Account Email</label>
                      <div className="relative mt-1">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                        <input
                          type="email" placeholder="you@example.com" value={forgotEmail}
                          onChange={e => setForgotEmail(e.target.value)}
                          className="w-full border border-neutral-200 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-400"
                        />
                      </div>
                      {forgotError && <p className="text-xs text-red-600 mt-1">{forgotError}</p>}
                    </div>
                    <Button onClick={handleForgotSubmit} disabled={isLoading || !forgotEmail} className="w-full bg-blue-600 hover:bg-blue-700 h-11">
                      {isLoading ? "Sending…" : "Send Reset Link"}
                    </Button>
                    <button onClick={() => setMode("signIn")} className="w-full flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mt-2">
                      <ArrowLeft className="w-4 h-4" /> Back to Sign In
                    </button>
                  </>
                )}
              </div>
            )}

            {/* ── SIGN UP — form ───────────────────────────────────────── */}
            {mode === "signUp" && (
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

    </>
  );

  if (isDesktop === undefined) {
    return <div className="min-h-screen bg-white dark:bg-neutral-950" />;
  }

  // ── Desktop/laptop: dedicated split-screen layout ───────────────────────
  if (isDesktop) {
    return (
      <div className="h-screen grid grid-cols-[1fr_460px] bg-white">
        {/* Left — brand & trust panel */}
        <div className="relative flex flex-col justify-between overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 px-12 py-10 h-screen">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-blue-900/30 rounded-full -translate-x-1/2 translate-y-1/3" />
            <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/30 rounded-full" />
            <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-orange-400/40 rounded-full" />
          </div>

          <div className="relative">
            <a href="/" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to website
            </a>
          </div>

          <div className="relative max-w-sm">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                <span className="text-blue-600 text-lg font-black">S</span>
              </div>
              <span className="text-2xl font-black text-white">
                Shift<span className="text-orange-400">zy</span> Go
              </span>
            </div>

            <h1 className="text-4xl font-black text-white leading-tight mb-4">
              Safe Shift.<br />Joyful Journey.
            </h1>
            <p className="text-white/80 text-base leading-relaxed mb-10">
              India's smart, peer-to-peer platform for moving vehicles and travelling free — verified drivers, secure payments, real-time tracking.
            </p>

            <div className="space-y-4">
              {[
                { icon: Shield, text: "Every driver & owner verified" },
                { icon: Lock, text: "Secure, escrow-style payments" },
                { icon: Zap, text: "Live GPS tracking on every trip" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-white/90 text-sm font-medium">{text}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="relative text-white/50 text-xs">© {new Date().getFullYear()} Shiftzy Go. Made in India.</p>
        </div>

        {/* Right — auth card */}
        <div className="h-screen overflow-y-auto flex items-center justify-center px-10 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
              {tabSwitcher}
              <div className="p-8">{authBody}</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Mobile: existing hand-tuned layout, unchanged ────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Back to website */}
        <div className="flex justify-start mb-4">
          <a href="/" className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-blue-600 transition-colors font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to website
          </a>
        </div>

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

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {tabSwitcher}
          <div className="p-6">{authBody}</div>
        </div>
      </div>
    </div>
  );
}
