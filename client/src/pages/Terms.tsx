import { useLocation } from "wouter";
import { ChevronLeft, FileText, Truck, Car, CheckCircle2 } from "lucide-react";
import BottomNav from "@/components/layout/BottomNav";

const SHIFTER_ACK = [
  "My vehicle has valid registration (RC), comprehensive insurance, and is in roadworthy condition.",
  "I have shared accurate vehicle details, photos, and pickup/drop locations.",
  "I understand the traveler will document the vehicle's condition before the trip begins.",
  "I authorise a verified Shiftzy traveler to drive my vehicle for the agreed route only.",
  "I agree to the shared-cost model and that the platform (app) fee is collected by Shiftzy.",
];

const TRAVELER_ACK = [
  "I hold a valid driving licence and am at least 18 years of age.",
  "I will inspect the vehicle and document its condition with photos before starting.",
  "I will drive responsibly, follow traffic laws, and use the vehicle only for the agreed route.",
  "I am responsible for any damage, fines, or tolls incurred during the trip.",
  "I agree to the displayed trip cost, app fee, and GST before confirming payment.",
];

const SECTIONS = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using the Shiftzy Go platform, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services. These terms apply to all users including vehicle owners (Shifters) and travelers (Goers).",
  },
  {
    title: "2. Platform Role",
    body: "Shiftzy Go is a peer-to-peer vehicle relocation marketplace. We connect vehicle owners who need their vehicles transported with travelers who want a vehicle for their journey. We do not own, operate, or control any vehicles listed on our platform. We are not a transport company.",
  },
  {
    title: "3. User Eligibility",
    body: "You must be at least 18 years of age and hold a valid driving licence to register as a traveler. Vehicle owners must have valid vehicle registration (RC) and insurance. All users must provide accurate Aadhaar verification during registration.",
  },
  {
    title: "4. Shared Cost Model",
    body: "Trip costs (fuel, tolls, and platform fee) are shared equally between the vehicle owner and the traveler. The exact split is calculated dynamically based on distance, vehicle type, and current fuel prices. Both parties agree to the displayed cost before confirming.",
  },
  {
    title: "5. Payments & Refunds",
    body: "All payments are processed securely through Stripe. Refunds for cancellations made more than 24 hours before the scheduled pickup will be processed within 5–7 business days. Cancellations made within 24 hours may incur a cancellation fee of up to ₹500.",
  },
  {
    title: "6. Vehicle Condition",
    body: "Owners must ensure their vehicle is in roadworthy condition. Travelers must conduct a pre-trip inspection and document the vehicle condition with photos before starting the journey. Any damage caused during transit is the traveler's responsibility.",
  },
  {
    title: "7. Insurance",
    body: "Vehicle owners must maintain valid comprehensive insurance covering third-party liability. Shiftzy Go is not liable for any accidents, damages, or losses that occur during the trip. We strongly recommend additional travel insurance.",
  },
  {
    title: "8. Prohibited Activities",
    body: "Users may not use the platform for illegal activities, transport prohibited goods, sublease vehicles to unauthorised drivers, or provide false information. Any violation will result in immediate account suspension.",
  },
  {
    title: "9. Privacy & Data",
    body: "We collect and process personal data including Aadhaar details, vehicle information, and location data as described in our Privacy Policy. By using Shiftzy Go, you consent to this data processing for the purpose of providing our services.",
  },
  {
    title: "10. Limitation of Liability",
    body: "Shiftzy Go's liability is limited to the platform fee collected for the relevant transaction. We are not liable for indirect or consequential damages arising from use of our platform. Disputes between users must first be raised through our support system.",
  },
  {
    title: "11. Governing Law",
    body: "These Terms are governed by the laws of India. Any disputes arising from or related to these Terms shall be subject to the exclusive jurisdiction of the courts of Chennai, Tamil Nadu.",
  },
  {
    title: "12. Changes to Terms",
    body: "Shiftzy Go reserves the right to modify these Terms at any time. Continued use of the platform after changes constitutes your acceptance of the new Terms. We will notify registered users of significant changes via the app.",
  },
];

export default function Terms() {
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
            <h1 className="font-bold text-lg">Terms & Conditions</h1>
            <p className="text-blue-200 text-xs">Last updated: June 2026</p>
          </div>
        </div>
      </div>

      {/* Intro */}
      <div className="mx-4 mt-4 bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-3">
        <FileText className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
        <p className="text-sm text-orange-800">
          Please read these terms carefully before using Shiftzy Go. By creating an account, you agree to all the terms below.
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

        {/* ── Acknowledgments ── */}
        <div>
          <h3 className="font-bold text-base text-neutral-900 mb-1">Acknowledgments</h3>
          <p className="text-xs text-neutral-500 mb-3">
            Depending on your role, you will be asked to accept the relevant points below before a shift or a booking.
          </p>

          {/* Shifter */}
          <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 mb-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Truck className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-bold text-sm text-blue-800">For Shifters (Vehicle Owners)</h4>
            </div>
            <ul className="space-y-2">
              {SHIFTER_ACK.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-neutral-700">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Traveler */}
          <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-orange-500 flex items-center justify-center">
                <Car className="w-4 h-4 text-white" />
              </div>
              <h4 className="font-bold text-sm text-orange-800">For Travelers (Goers)</h4>
            </div>
            <ul className="space-y-2">
              {TRAVELER_ACK.map((item) => (
                <li key={item} className="flex gap-2 text-sm text-neutral-700">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-blue-50 rounded-xl p-4 text-center">
          <p className="text-xs text-blue-700 font-medium">Questions about our terms?</p>
          <button onClick={() => navigate("/help")} className="mt-2 text-sm font-bold text-blue-600 underline">
            Contact Support
          </button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
