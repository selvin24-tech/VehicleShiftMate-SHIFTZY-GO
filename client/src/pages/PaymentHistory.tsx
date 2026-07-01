import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import {
  usePayments,
  PAYMENT_STATUS_LABEL,
  type PaymentStatus,
} from "@/lib/appStore";
import {
  Wallet,
  Receipt,
  ArrowDownLeft,
  CreditCard,
  CalendarDays,
  MapPin,
  Inbox,
} from "lucide-react";

const STATUS_STYLE: Record<PaymentStatus, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  refunded: "bg-blue-100 text-blue-700",
  failed: "bg-red-100 text-red-700",
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function PaymentHistory() {
  const payments = usePayments();

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);
  const totalRefunded = payments
    .filter((p) => p.status === "refunded")
    .reduce((sum, p) => sum + p.amount, 0);
  const txnCount = payments.length;

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen pb-20">
      <Header title="Payment History" showBackButton showAnimation={false} />

      {/* ── Title ── */}
      <div className="px-4 pt-4">
        <h1 className="text-xl font-extrabold text-neutral-900">Payment History</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          All your payments and refunds in one place.
        </p>
      </div>

      {/* ── Summary strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="px-4 mt-4 grid grid-cols-3 gap-2"
      >
        <div className="bg-green-50 rounded-2xl p-3 text-center">
          <Wallet className="w-4 h-4 text-green-600 mx-auto mb-1" />
          <p className="text-sm font-extrabold text-neutral-900 leading-tight">
            {inr(totalPaid)}
          </p>
          <p className="text-[10px] text-neutral-500 mt-0.5">Total paid</p>
        </div>
        <div className="bg-blue-50 rounded-2xl p-3 text-center">
          <Receipt className="w-4 h-4 text-blue-600 mx-auto mb-1" />
          <p className="text-sm font-extrabold text-neutral-900 leading-tight">
            {txnCount}
          </p>
          <p className="text-[10px] text-neutral-500 mt-0.5">Transactions</p>
        </div>
        <div className="bg-orange-50 rounded-2xl p-3 text-center">
          <ArrowDownLeft className="w-4 h-4 text-orange-500 mx-auto mb-1" />
          <p className="text-sm font-extrabold text-neutral-900 leading-tight">
            {inr(totalRefunded)}
          </p>
          <p className="text-[10px] text-neutral-500 mt-0.5">Total refunded</p>
        </div>
      </motion.div>

      {/* ── Payment list ── */}
      <div className="px-4 mt-6">
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
          Recent payments
        </p>

        {payments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="bg-neutral-50 rounded-2xl p-8 text-center"
          >
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-3">
              <Inbox className="w-7 h-7 text-blue-600" />
            </div>
            <p className="font-bold text-neutral-800">No payments yet</p>
            <p className="text-sm text-neutral-500 mt-1">
              Once you book a shift or a ride, your payments will show up here.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {payments.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.35,
                  delay: Math.min(i * 0.05, 0.3),
                  ease: [0.4, 0, 0.2, 1],
                }}
                className="bg-white border border-neutral-100 rounded-2xl p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-neutral-900 leading-tight">
                      {p.description}
                    </p>
                    {p.route && (
                      <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-500 shrink-0" />
                        {p.route}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-extrabold text-sm text-neutral-900">
                      {inr(p.amount)}
                    </p>
                    <span
                      className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status]}`}
                    >
                      {PAYMENT_STATUS_LABEL[p.status]}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-dashed border-neutral-100">
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                    <CreditCard className="w-3 h-3 shrink-0" />
                    <span>{p.method}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                    <CalendarDays className="w-3 h-3 shrink-0" />
                    <span>{p.date}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
