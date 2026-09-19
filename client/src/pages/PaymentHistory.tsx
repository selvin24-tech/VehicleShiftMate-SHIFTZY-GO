import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import DesktopTopNav from "@/components/layout/DesktopTopNav";
import { useIsDesktop } from "@/hooks/use-desktop";
import type { Payment } from "@shared/schema";
import {
  Wallet,
  Receipt,
  CreditCard,
  CalendarDays,
  Inbox,
} from "lucide-react";

const STATUS_STYLE: Record<string, string> = {
  paid: "bg-green-100 text-green-700",
  pending: "bg-amber-100 text-amber-700",
  created: "bg-amber-100 text-amber-700",
  failed: "bg-red-100 text-red-700",
  expired: "bg-red-100 text-red-700",
};

const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
  created: "Awaiting payment",
  failed: "Failed",
  expired: "Expired",
};

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function PaymentHistory() {
  const [, navigate] = useLocation();
  const { data: payments = [] } = useQuery<Payment[]>({ queryKey: ["/api/payments"] });

  const totalPaid = payments
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const txnCount = payments.length;

  const isDesktop = useIsDesktop();

  const summaryStrip = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
      className="grid grid-cols-2 gap-2"
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
    </motion.div>
  );

  const paymentList = payments.length === 0 ? (
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
        Once you pay for a priced trip, it will show up here.
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
          onClick={() => navigate(`/trip-payment/${p.tripId}`)}
          className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-4 shadow-sm cursor-pointer"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-neutral-900 dark:text-neutral-100 leading-tight">
                Trip #{p.tripId}
              </p>
              <p className="text-[11px] text-neutral-500 mt-1">
                Order {p.providerOrderId}
              </p>
            </div>
            <div className="text-right shrink-0">
              <p className="font-extrabold text-sm text-neutral-900 dark:text-neutral-100">
                {inr(Number(p.amount))}
              </p>
              <span
                className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLE[p.status] ?? "bg-neutral-100 text-neutral-600"}`}
              >
                {STATUS_LABEL[p.status] ?? p.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-3 pt-3 border-t border-dashed border-neutral-100 dark:border-neutral-800">
            {p.method && (
              <div className="flex items-center gap-1 text-[11px] text-neutral-400">
                <CreditCard className="w-3 h-3 shrink-0" />
                <span className="capitalize">{p.method}</span>
              </div>
            )}
            <div className="flex items-center gap-1 text-[11px] text-neutral-400">
              <CalendarDays className="w-3 h-3 shrink-0" />
              <span>{new Date(p.paidAt || p.createdAt || Date.now()).toLocaleDateString("en-IN")}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );

  if (isDesktop === undefined) return <div className="min-h-screen bg-white dark:bg-neutral-950" />;

  if (isDesktop) {
    return (
      <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
        <DesktopTopNav />
        <main className="max-w-3xl mx-auto px-6 py-8">
          <h1 className="text-2xl font-extrabold text-neutral-900 dark:text-neutral-100">Payment History</h1>
          <p className="text-sm text-neutral-500 mt-1 mb-5">Every real Cashfree payment on your account.</p>
          <div className="mb-6">{summaryStrip}</div>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">Recent payments</p>
          {paymentList}
        </main>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white min-h-screen pb-20">
      <Header title="Payment History" showBackButton showAnimation={false} />

      <div className="px-4 pt-4">
        <h1 className="text-xl font-extrabold text-neutral-900">Payment History</h1>
        <p className="text-sm text-neutral-500 mt-0.5">
          Every real Cashfree payment on your account.
        </p>
      </div>

      <div className="px-4 mt-4">{summaryStrip}</div>

      <div className="px-4 mt-6">
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-3">
          Recent payments
        </p>
        {paymentList}
      </div>

      <BottomNav />
    </div>
  );
}
