import { useState } from "react";
import { useLocation } from "wouter";
import { ChevronLeft, Plus, ArrowDownLeft, ArrowUpRight, Gift, IndianRupee, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/layout/BottomNav";

type TxType = "all" | "credit" | "debit";

const TRANSACTIONS = [
  { id: 1, type: "credit", title: "Cashback Earned", desc: "Chennai → Bangalore trip", amount: 189, date: "Today, 10:32 AM", tag: "Cashback" },
  { id: 2, type: "debit", title: "Booking Payment", desc: "Trip BK-20481 · Honda City", amount: -2352, date: "Today, 09:15 AM", tag: "Booking" },
  { id: 3, type: "credit", title: "Refund Received", desc: "Cancelled booking BK-1023", amount: 499, date: "Yesterday", tag: "Refund" },
  { id: 4, type: "credit", title: "Welcome Bonus", desc: "New user sign-up reward", amount: 200, date: "12 Jun 2026", tag: "Bonus" },
  { id: 5, type: "debit", title: "Booking Payment", desc: "Trip BK-19832 · Maruti Swift", amount: -1620, date: "10 Jun 2026", tag: "Booking" },
  { id: 6, type: "credit", title: "Trip Completed Reward", desc: "You drove Chennai → Madurai", amount: 120, date: "08 Jun 2026", tag: "Reward" },
  { id: 7, type: "debit", title: "Insurance Add-on", desc: "Premium trip protection", amount: -149, date: "08 Jun 2026", tag: "Insurance" },
  { id: 8, type: "credit", title: "Referral Bonus", desc: "Friend Karthik signed up", amount: 250, date: "05 Jun 2026", tag: "Referral" },
];

const TAG_COLORS: Record<string, string> = {
  Cashback: "bg-green-100 text-green-700",
  Booking: "bg-blue-100 text-blue-700",
  Refund: "bg-yellow-100 text-yellow-700",
  Bonus: "bg-orange-100 text-orange-700",
  Reward: "bg-purple-100 text-purple-700",
  Insurance: "bg-red-100 text-red-700",
  Referral: "bg-pink-100 text-pink-700",
};

export default function Wallet() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [filter, setFilter] = useState<TxType>("all");

  const balance = TRANSACTIONS.reduce((sum, t) => sum + t.amount, 0);
  const filtered = filter === "all" ? TRANSACTIONS : TRANSACTIONS.filter(t => t.type === filter);

  const handleAddMoney = () => {
    toast({ title: "Add Money", description: "UPI / Card payment coming soon!" });
  };

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-900 px-4 pt-12 pb-20 relative overflow-hidden">
        <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-white/5 rounded-full" />
        <div className="flex items-center justify-between mb-6 relative">
          <button onClick={() => navigate("/")} className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="font-bold text-lg text-white">My Wallet</h1>
          <div className="w-9" />
        </div>
        <div className="text-center relative">
          <p className="text-blue-200 text-sm">Available Balance</p>
          <p className="text-5xl font-extrabold text-white mt-1">₹{Math.abs(balance).toLocaleString()}</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className="bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" /> 50 coins available
            </span>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="mx-4 -mt-8 bg-white rounded-2xl shadow-lg p-4 flex gap-3">
        <Button onClick={handleAddMoney} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white gap-2 h-11">
          <Plus className="w-4 h-4" /> Add Money
        </Button>
        <Button onClick={() => toast({ title: "Rewards", description: "Earn cashback on every trip!" })}
          variant="outline" className="flex-1 border-orange-300 text-orange-600 hover:bg-orange-50 gap-2 h-11">
          <Gift className="w-4 h-4" /> Rewards
        </Button>
      </div>

      {/* Stats */}
      <div className="mx-4 mt-4 grid grid-cols-3 gap-2">
        {[
          { label: "Total Earned", value: "₹" + TRANSACTIONS.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0).toLocaleString(), color: "text-green-600" },
          { label: "Total Spent", value: "₹" + Math.abs(TRANSACTIONS.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0)).toLocaleString(), color: "text-blue-600" },
          { label: "Cashback", value: "₹" + TRANSACTIONS.filter(t => t.tag === "Cashback" || t.tag === "Referral" || t.tag === "Bonus" || t.tag === "Reward").reduce((s, t) => s + t.amount, 0).toLocaleString(), color: "text-orange-600" },
        ].map(stat => (
          <div key={stat.label} className="bg-neutral-50 rounded-xl p-3 text-center">
            <p className={`font-bold text-sm ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Transactions */}
      <div className="px-4 mt-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-base">Transactions</h2>
          <div className="flex gap-1">
            {(["all", "credit", "debit"] as TxType[]).map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`text-xs font-semibold px-3 py-1 rounded-full border transition-all ${filter === f ? "bg-blue-600 text-white border-blue-600" : "border-neutral-200 text-neutral-500"}`}>
                {f === "all" ? "All" : f === "credit" ? "In" : "Out"}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {filtered.map(tx => (
            <div key={tx.id} className="flex items-center gap-3 bg-neutral-50 rounded-xl p-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === "credit" ? "bg-green-100" : "bg-red-50"}`}>
                {tx.type === "credit"
                  ? <ArrowDownLeft className="w-5 h-5 text-green-600" />
                  : <ArrowUpRight className="w-5 h-5 text-red-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm truncate">{tx.title}</p>
                  <p className={`font-bold text-sm shrink-0 ml-2 ${tx.type === "credit" ? "text-green-600" : "text-red-500"}`}>
                    {tx.type === "credit" ? "+" : ""}₹{Math.abs(tx.amount).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-neutral-400 truncate">{tx.desc}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${TAG_COLORS[tx.tag]}`}>{tx.tag}</span>
                </div>
                <p className="text-[10px] text-neutral-300 mt-0.5">{tx.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
