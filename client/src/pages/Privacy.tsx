import { useLocation } from "wouter";
import { ChevronLeft, Shield } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";

const SECTIONS = [
  {
    title: "1. Information We Collect",
    body: "We collect information you provide directly: full name, username, password (encrypted), Aadhaar number (for verification only — not stored after verification), vehicle registration number, driving licence number, profile photo, and your current city/location at sign-up.",
  },
  {
    title: "2. How We Use Your Information",
    body: "We use your information to: create and manage your account, verify your identity through Aadhaar OTP, match you with vehicle owners or travelers, process payments, send booking confirmations and notifications, provide customer support, and improve our platform.",
  },
  {
    title: "3. Aadhaar Data Handling",
    body: "Aadhaar numbers are used solely for OTP-based identity verification via UIDAI. We do not store your full Aadhaar number on our servers. Only the last 4 digits and your verification status are retained. We comply with UIDAI guidelines and the Aadhaar (Targeted Delivery of Financial and Other Subsidies, Benefits and Services) Act, 2016.",
  },
  {
    title: "4. Location Data",
    body: "We collect your location at registration (city/area). During active trips, location may be shared between the vehicle owner and traveler for coordination. You can control location permissions through your device settings. We do not track your location continuously.",
  },
  {
    title: "5. Payment Data",
    body: "All payment information is processed by Stripe and is subject to Stripe's Privacy Policy. We do not store full card numbers or CVV codes. We retain transaction records (amount, date, booking ID) for accounting and dispute resolution purposes.",
  },
  {
    title: "6. Data Sharing",
    body: "We share limited information between vehicle owners and travelers to facilitate bookings (name, vehicle details, contact). We do not sell your personal data to third parties. We may share data with law enforcement when required by law.",
  },
  {
    title: "7. Data Security",
    body: "We use industry-standard encryption (TLS/HTTPS) for data in transit and AES-256 encryption for data at rest. Passwords are hashed using bcrypt. We conduct regular security audits. Despite our best efforts, no online platform can guarantee 100% security.",
  },
  {
    title: "8. Your Rights",
    body: "You have the right to: access your personal data, correct inaccurate data, request deletion of your account and data, withdraw consent at any time, and receive your data in a portable format. Contact us at privacy@shiftzygo.in to exercise these rights.",
  },
  {
    title: "9. Cookies",
    body: "We use essential cookies to keep you logged in and maintain app functionality. We do not use advertising or tracking cookies. You can clear cookies through your browser settings, which will log you out of the app.",
  },
  {
    title: "10. Children's Privacy",
    body: "Shiftzy Go is not intended for users under 18 years of age. We do not knowingly collect personal information from minors. If we discover that a minor has registered, we will immediately delete their account.",
  },
  {
    title: "11. Changes to This Policy",
    body: "We may update this Privacy Policy from time to time. We will notify you of significant changes through the app. Continued use after changes constitutes your acceptance of the updated policy.",
  },
  {
    title: "12. Contact Us",
    body: "For privacy-related queries, contact our Data Protection Officer at: privacy@shiftzygo.in or write to: Shiftzy Go Technologies Pvt. Ltd., Chennai, Tamil Nadu — 600001.",
  },
];

export default function Privacy() {
  const [, navigate] = useLocation();

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 pt-12 pb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1 as any)} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="font-bold text-lg">Privacy Policy</h1>
            <p className="text-blue-200 text-xs">Last updated: June 2026</p>
          </div>
        </div>
      </div>

      {/* Intro */}
      <div className="mx-4 mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-3">
        <Shield className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-800">
          Your privacy is important to us. This policy explains what data we collect, why we collect it, and how we protect it.
        </p>
      </div>

      {/* Sections */}
      <div className="px-4 mt-4 space-y-5 pb-6">
        {SECTIONS.map((s) => (
          <div key={s.title}>
            <h3 className="font-bold text-sm text-blue-700 mb-1.5">{s.title}</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">{s.body}</p>
          </div>
        ))}
        <div className="bg-orange-50 rounded-xl p-4 text-center">
          <p className="text-xs text-orange-700 font-medium">Need help with your data?</p>
          <button onClick={() => navigate("/help")} className="mt-2 text-sm font-bold text-orange-600 underline">
            Contact Support
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
