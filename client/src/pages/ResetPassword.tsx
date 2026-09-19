import { useState } from "react";
import { Lock, CheckCircle2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useIsDesktop } from "@/hooks/use-desktop";

// Real, server-verified password reset — the token in the URL was emailed by
// POST /api/user/forgot-password and is single-use, expiring in 30 minutes.
export default function ResetPassword() {
  const { toast } = useToast();
  const isDesktop = useIsDesktop();
  const token = new URLSearchParams(window.location.search).get("token") || "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async () => {
    if (password.length < 6) {
      toast({ title: "Password too short", description: "Minimum 6 characters required.", variant: "destructive" });
      return;
    }
    if (password !== confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch("/api/user/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const body = await res.json().catch(() => ({}));
      setIsLoading(false);
      if (!res.ok) {
        toast({ title: "Couldn't reset password", description: body.message || "Try requesting a new link.", variant: "destructive" });
        return;
      }
      setDone(true);
    } catch {
      setIsLoading(false);
      toast({ title: "Couldn't reset password", description: "Check your connection and try again.", variant: "destructive" });
    }
  };

  if (isDesktop === undefined) return <div className="min-h-screen bg-white" />;

  const card = (
    <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden p-8">
      {!token ? (
        <div className="text-center space-y-3">
          <p className="text-sm text-red-600 font-medium">This reset link is missing its token.</p>
          <a href="/login" className="text-sm text-blue-600 font-semibold hover:underline">Back to Sign In</a>
        </div>
      ) : done ? (
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9 text-blue-600" />
          </div>
          <p className="text-sm text-blue-700 font-medium">Your password has been reset. You can now sign in.</p>
          <Button onClick={() => (window.location.href = "/login")} className="w-full bg-blue-600 hover:bg-blue-700 h-11">
            Sign In Now
          </Button>
        </div>
      ) : (
        <>
          <div className="text-center mb-5">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="font-bold text-lg">Choose a new password</h2>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="New password (min. 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg pl-10 pr-10 py-2.5 text-sm outline-none focus:border-blue-400"
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full border border-neutral-200 rounded-lg pl-10 pr-4 py-2.5 text-sm outline-none focus:border-blue-400"
              />
            </div>
            <Button onClick={handleSubmit} disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 h-11 font-semibold">
              {isLoading ? "Resetting…" : "Reset Password"}
            </Button>
            <a href="/login" className="w-full flex items-center justify-center gap-2 text-sm text-neutral-500 hover:text-neutral-700 mt-2">
              <ArrowLeft className="w-4 h-4" /> Back to Sign In
            </a>
          </div>
        </>
      )}
    </div>
  );

  if (isDesktop) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-orange-50 px-10">
        <div className="w-full max-w-md">{card}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">{card}</div>
    </div>
  );
}
