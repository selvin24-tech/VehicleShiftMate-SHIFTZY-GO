import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  MapPin, Shield, Star, Users, Car, Bike, CheckCircle2,
  ArrowRight, Phone, Mail, ChevronDown, Menu, X,
  Zap, Clock, IndianRupee, Award, ThumbsUp, Navigation,
  Smartphone, Globe, Lock, HeartHandshake, TrendingUp,
} from "lucide-react";
import logoPath from "@assets/file_00000000b280720988e7255eb04daace_1783322892934.png";

/* ──────────────────────────────────────────────────────── */
const NAV_LINKS = ["How It Works", "Vehicle Types", "Why Shiftzy", "Cities", "FAQs"];

const STATS = [
  { value: "4,370+", label: "Trusted Users", icon: Users },
  { value: "12,000+", label: "Shifts Completed", icon: Car },
  { value: "4.8★", label: "Avg Rating", icon: Star },
  { value: "15+", label: "Cities Served", icon: MapPin },
];

const HOW_IT_WORKS = [
  {
    step: "01", emoji: "📋", title: "Post or Find a Shift",
    desc: "Vehicle owners post their shift request with pickup, drop, and date. Travelers browse available vehicles on the same route.",
  },
  {
    step: "02", emoji: "🤝", title: "Match & Connect",
    desc: "Our smart matching pairs verified drivers with verified vehicles. Chat in-app to coordinate pickup details.",
  },
  {
    step: "03", emoji: "🚗", title: "Drive & Earn",
    desc: "The traveler drives your vehicle to the destination. You pay a fair fee — no empty trucks, no hassle.",
  },
  {
    step: "04", emoji: "⭐", title: "Review & Repeat",
    desc: "Both sides leave reviews. Ratings build trust. Great drivers get more bookings. Safe, simple, repeat.",
  },
];

const VEHICLE_TYPES = [
  { emoji: "🚗", label: "Car", desc: "Sedans & Hatchbacks", gradient: "from-sky-400 to-sky-600", examples: "Swift, City, Innova…", price: "From ₹8/km" },
  { emoji: "🏍️", label: "Bike", desc: "Scooters & Motorbikes", gradient: "from-blue-500 to-blue-700", examples: "Activa, Pulsar, RE…", price: "From ₹4/km" },
  { emoji: "🚙", label: "SUV", desc: "Big & Spacious", gradient: "from-emerald-500 to-emerald-700", examples: "Creta, Fortuner, XUV…", price: "From ₹12/km" },
  { emoji: "👑", label: "Premium", desc: "Luxury & Comfort", gradient: "from-purple-600 to-indigo-700", examples: "BMW, Audi, Mercedes…", price: "From ₹20/km" },
];

const WHY_SHIFTZY = [
  { icon: Shield, color: "text-blue-600", bg: "bg-blue-50", title: "Fully Verified Users", desc: "Every driver and owner is verified with DL, RC, and mobile OTP before their first booking." },
  { icon: Lock, color: "text-emerald-600", bg: "bg-emerald-50", title: "Secure Payments", desc: "Stripe-powered payments. Your money is held safely and released only after successful delivery." },
  { icon: Zap, color: "text-orange-600", bg: "bg-orange-50", title: "Real-time Tracking", desc: "Live GPS tracking so owners always know where their vehicle is during the entire journey." },
  { icon: HeartHandshake, color: "text-rose-600", bg: "bg-rose-50", title: "Insurance Covered", desc: "All shifts require valid insurance. In-app insurance add-on available for extra peace of mind." },
  { icon: Clock, color: "text-purple-600", bg: "bg-purple-50", title: "24×7 Support", desc: "Got a question? Our support team is available round the clock via chat, call, or email." },
  { icon: IndianRupee, color: "text-yellow-600", bg: "bg-yellow-50", title: "Fair & Transparent Pricing", desc: "No hidden charges. Distance-based pricing shown upfront before you confirm any booking." },
];

const CITIES = [
  "Chennai", "Bangalore", "Coimbatore", "Madurai", "Pondicherry",
  "Trichy", "Mumbai", "Hyderabad", "Pune", "Delhi",
  "Salem", "Vellore", "Mysore", "Mangalore", "Kochi",
];

const TESTIMONIALS = [
  {
    name: "Selvin Raj", city: "Chennai", role: "Vehicle Owner", rating: 5, avatar: "S",
    text: "I needed to get my car from Chennai to Bangalore while I was flying. Shiftzy Go made it so easy — the driver was verified, professional, and my car arrived safely. Saved me ₹4,000 compared to a transport truck!",
  },
  {
    name: "Karthik Rajan", city: "Bangalore", role: "Frequent Traveler", rating: 5, avatar: "K",
    text: "As someone who travels frequently, I love that I can drive someone's vehicle instead of buying a bus/train ticket. It's free travel for me and I get to help an owner. Win-win!",
  },
  {
    name: "Priya Sharma", city: "Mumbai", role: "Both Owner & Driver", rating: 5, avatar: "P",
    text: "The app is clean and simple. Verification was fast, the RC upload took 2 minutes, and within a day I had my first booking. The rating system keeps everyone honest. Highly recommend!",
  },
];

const FAQS = [
  { q: "How is Shiftzy Go different from a car rental?", a: "We are a peer-to-peer platform. Instead of renting a commercial car, an owner who needs their vehicle transported connects with a traveler going the same way. The traveler drives the owner's car and gets free travel. The owner pays a small fee." },
  { q: "Is my vehicle safe?", a: "Yes. Every driver is verified (DL, mobile OTP). Insurance is mandatory. You can track your vehicle in real-time. Ratings and reviews keep both parties accountable. We have a dedicated dispute resolution team." },
  { q: "Who pays whom?", a: "The vehicle owner pays the traveler/driver a fee based on distance. We charge a small platform commission (included in the price shown). Payments are secure via Stripe and released after confirmation of delivery." },
  { q: "What documents do I need to sign up?", a: "As a vehicle owner: mobile OTP verification + vehicle RC upload. As a traveler/driver: mobile OTP + Driving Licence upload. Verification is quick and usually done within 2 hours." },
  { q: "Which cities are available?", a: "We currently serve Chennai, Bangalore, Coimbatore, Madurai, Pondicherry, and 10+ more cities. We're expanding rapidly. If your city isn't listed, sign up and we'll notify you when we launch there!" },
];

/* ──────────────────────────────────────────────────────── */
export default function Landing() {
  const [, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  const goLogin = () => navigate("/login");

  return (
    <div className="min-h-screen bg-white text-neutral-900 font-sans overflow-x-hidden">

      {/* ══ NAVBAR ══ */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight">
              <span className="text-blue-600">Shift</span><span className="text-orange-500">zy</span>
              <span className="text-neutral-800"> Go</span>
            </span>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(l => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/\s+/g, "-"))}
                className={`text-sm font-medium transition-colors hover:text-blue-600 ${scrolled ? "text-neutral-700" : "text-white/90"}`}>
                {l}
              </button>
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <button onClick={goLogin} className={`text-sm font-semibold px-4 py-2 rounded-xl transition-all hover:bg-white/10 ${scrolled ? "text-blue-600" : "text-white"}`}>
              Sign In
            </button>
            <button onClick={goLogin} className="text-sm font-bold px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200">
              Get Started Free →
            </button>
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2 rounded-lg" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className={`w-5 h-5 ${scrolled ? "text-neutral-800" : "text-white"}`} /> : <Menu className={`w-5 h-5 ${scrolled ? "text-neutral-800" : "text-white"}`} />}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden bg-white border-t border-neutral-100 px-4 pb-4 pt-2 shadow-lg">
            {NAV_LINKS.map(l => (
              <button key={l} onClick={() => scrollTo(l.toLowerCase().replace(/\s+/g, "-"))}
                className="block w-full text-left py-3 text-sm font-medium text-neutral-700 border-b border-neutral-50 last:border-0">
                {l}
              </button>
            ))}
            <div className="flex gap-3 mt-4">
              <button onClick={goLogin} className="flex-1 py-3 rounded-xl border border-blue-200 text-blue-600 font-semibold text-sm">Sign In</button>
              <button onClick={goLogin} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-bold text-sm">Get Started</button>
            </div>
          </div>
        )}
      </header>

      {/* ══ HERO ══ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-0 w-[600px] h-[600px] bg-white/5 rounded-full translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-900/30 rounded-full -translate-x-1/2 translate-y-1/3" />
          <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-white/30 rounded-full" />
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-orange-400/40 rounded-full" />
          <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-white/20 rounded-full" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 pt-24 pb-16 grid md:grid-cols-2 gap-12 items-center">
          {/* Left — copy */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm text-white text-xs font-bold px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              India's Smartest Vehicle Shifting Platform
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white leading-tight mb-6">
              Move Your Vehicle.<br />
              <span className="text-orange-400">Zero Empty Trucks.</span>
            </h1>

            <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-lg">
              Connect with verified travelers going your route. They drive your vehicle — you save money, they travel free. Peer-to-peer vehicle shifting, safe and simple.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 mb-10">
              <button onClick={goLogin}
                className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-2xl text-base shadow-xl shadow-orange-900/30 active:scale-95 transition-all">
                Post a Shift Request <ArrowRight className="w-5 h-5" />
              </button>
              <button onClick={goLogin}
                className="flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm text-white font-bold px-8 py-4 rounded-2xl text-base border border-white/30 active:scale-95 transition-all">
                Browse Vehicles
              </button>
            </div>

            {/* Mini trust bar */}
            <div className="flex flex-wrap gap-4">
              {["✅ Verified Drivers", "🔒 Secure Payments", "📍 Live Tracking"].map(t => (
                <span key={t} className="text-white/70 text-sm font-medium">{t}</span>
              ))}
            </div>
          </div>

          {/* Right — floating app card */}
          <div className="hidden md:flex justify-center items-center">
            <div className="relative">
              {/* Main card */}
              <div className="bg-white rounded-3xl shadow-2xl p-6 w-72">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
                    <Car className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Shift Request</p>
                    <p className="text-xs text-neutral-500">Chennai → Bangalore</p>
                  </div>
                  <span className="ml-auto text-[10px] font-bold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700">Active</span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm"><span className="text-neutral-500">Vehicle</span><strong>Honda City</strong></div>
                  <div className="flex justify-between text-sm"><span className="text-neutral-500">Date</span><strong>Tomorrow, 6 AM</strong></div>
                  <div className="flex justify-between text-sm"><span className="text-neutral-500">Distance</span><strong>350 km</strong></div>
                  <div className="flex justify-between text-sm"><span className="text-neutral-500">Amount</span><strong className="text-blue-600">₹2,800</strong></div>
                </div>
                <div className="bg-blue-600 text-white text-center text-sm font-bold py-3 rounded-xl">
                  View Matched Drivers →
                </div>
              </div>

              {/* Floating badges */}
              <div className="absolute -top-4 -right-8 bg-white rounded-2xl shadow-lg px-3 py-2 flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-bold">4.9</span>
                <span className="text-xs text-neutral-400">Driver Rating</span>
              </div>
              <div className="absolute -bottom-4 -left-8 bg-emerald-500 text-white rounded-2xl shadow-lg px-3 py-2 text-sm font-bold">
                ✓ RC Verified
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <button onClick={() => scrollTo("how-it-works")} className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 hover:text-white flex flex-col items-center gap-1 transition-colors">
          <span className="text-xs font-medium">How it works</span>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </button>
      </section>

      {/* ══ STATS BAR ══ */}
      <section className="bg-neutral-900 py-8">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(({ value, label, icon: Icon }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-2">
                <Icon className="w-5 h-5 text-orange-400" />
              </div>
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-sm text-neutral-400 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">Simple Process</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2 mb-3">How Shiftzy Go Works</h2>
            <p className="text-neutral-500 max-w-lg mx-auto">Four easy steps. No trucks. No stress. Just smart, peer-to-peer vehicle shifting.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />

            {HOW_IT_WORKS.map((step, i) => (
              <div key={i} className="relative text-center">
                <div className="relative inline-flex items-center justify-center w-24 h-24 bg-blue-50 rounded-3xl mb-4 mx-auto border-2 border-blue-100">
                  <span className="text-4xl">{step.emoji}</span>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-blue-600 text-white text-xs font-black rounded-full flex items-center justify-center">{step.step}</span>
                </div>
                <h3 className="font-bold text-base mb-2">{step.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button onClick={goLogin} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-blue-100 active:scale-95 transition-all">
              Start Your First Shift <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* ══ VEHICLE TYPES ══ */}
      <section id="vehicle-types" className="py-20 bg-neutral-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-orange-500 uppercase tracking-widest">All Segments</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2 mb-3">Every Vehicle Type, Covered</h2>
            <p className="text-neutral-500 max-w-lg mx-auto">Whether you own a hatchback or a BMW, we have verified drivers for every category.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {VEHICLE_TYPES.map((v, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-neutral-100 hover:shadow-md hover:-translate-y-1 transition-all group cursor-pointer" onClick={goLogin}>
                <div className={`bg-gradient-to-br ${v.gradient} h-28 flex items-center justify-center`}>
                  <span className="text-5xl group-hover:scale-110 transition-transform">{v.emoji}</span>
                </div>
                <div className="p-4">
                  <h3 className="font-black text-lg">{v.label}</h3>
                  <p className="text-xs text-neutral-500 mb-1">{v.desc}</p>
                  <p className="text-[11px] text-neutral-400 mb-2">{v.examples}</p>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{v.price}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ WHY SHIFTZY ══ */}
      <section id="why-shiftzy" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Why Choose Us</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2 mb-3">Built on Trust & Safety</h2>
            <p className="text-neutral-500 max-w-lg mx-auto">We don't cut corners. Every feature exists to protect you, your vehicle, and your money.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {WHY_SHIFTZY.map(({ icon: Icon, color, bg, title, desc }, i) => (
              <div key={i} className="bg-neutral-50 rounded-3xl p-6 hover:bg-white hover:shadow-md transition-all border border-neutral-100">
                <div className={`w-12 h-12 ${bg} rounded-2xl flex items-center justify-center mb-4`}>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <h3 className="font-bold text-base mb-2">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-indigo-700">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-blue-200 uppercase tracking-widest">Real Stories</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2 mb-3 text-white">What Our Users Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-6">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-white/90 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white font-bold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{t.name}</p>
                    <p className="text-white/60 text-xs">{t.role} · {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CITIES ══ */}
      <section id="cities" className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <span className="text-xs font-bold text-purple-600 uppercase tracking-widest">Pan India</span>
          <h2 className="text-3xl md:text-4xl font-black mt-2 mb-3">Where We Operate</h2>
          <p className="text-neutral-500 mb-10">Currently active in 15+ cities and expanding rapidly across India.</p>

          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {CITIES.map(city => (
              <span key={city} className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-full hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all cursor-default">
                <MapPin className="w-3.5 h-3.5 text-blue-500" /> {city}
              </span>
            ))}
            <span className="flex items-center gap-1.5 text-sm font-semibold px-4 py-2 bg-blue-600 text-white rounded-full">
              + Many more coming…
            </span>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-3xl p-6 max-w-lg mx-auto">
            <p className="text-sm text-blue-700 font-medium">Don't see your city?</p>
            <p className="text-xs text-blue-500 mt-1">Sign up and request your city. We'll notify you the moment we launch there.</p>
            <button onClick={goLogin} className="mt-4 bg-blue-600 text-white font-bold text-sm px-6 py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all">
              Request My City
            </button>
          </div>
        </div>
      </section>

      {/* ══ FAQs ══ */}
      <section id="faqs" className="py-20 bg-neutral-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Got Questions?</span>
            <h2 className="text-3xl md:text-4xl font-black mt-2 mb-3">Frequently Asked</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
                <button className="w-full text-left flex items-center justify-between gap-4 px-6 py-5" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  <span className="font-semibold text-sm leading-snug">{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-neutral-400 shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5">
                    <p className="text-sm text-neutral-600 leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA SECTION ══ */}
      <section className="py-20 bg-neutral-900">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            Ready to shift smarter?
          </h2>
          <p className="text-neutral-400 text-lg mb-10 max-w-xl mx-auto">
            Join 4,370+ verified users who are already saving money and travelling smart across India.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <button onClick={goLogin}
              className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-2xl text-base shadow-xl active:scale-95 transition-all">
              I'm a Vehicle Owner <ArrowRight className="w-5 h-5" />
            </button>
            <button onClick={goLogin}
              className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-10 py-4 rounded-2xl text-base active:scale-95 transition-all">
              I Want to Travel & Drive
            </button>
          </div>

          <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto">
            {[
              { icon: "🔒", label: "100% Secure" },
              { icon: "⚡", label: "Instant Match" },
              { icon: "💸", label: "Best Rates" },
            ].map(t => (
              <div key={t.label} className="text-center">
                <span className="text-2xl block mb-1">{t.icon}</span>
                <span className="text-xs text-neutral-400 font-medium">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="bg-neutral-950 py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="text-2xl font-black mb-3">
                <span className="text-blue-500">Shift</span><span className="text-orange-400">zy</span>
                <span className="text-white"> Go</span>
              </div>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-xs">
                India's smartest peer-to-peer vehicle shifting platform. Move vehicles safely, affordably, and sustainably.
              </p>
              <div className="flex gap-3 mt-4">
                <a href="tel:+918000000000" className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
                  <Phone className="w-3.5 h-3.5" /> +91 80000 00000
                </a>
                <a href="mailto:hello@shiftzygo.com" className="flex items-center gap-2 text-xs text-neutral-500 hover:text-neutral-300 transition-colors">
                  <Mail className="w-3.5 h-3.5" /> hello@shiftzygo.com
                </a>
              </div>
            </div>

            {/* Company */}
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Company</p>
              <div className="space-y-2">
                {["About Us", "Careers", "Blog", "Press"].map(l => (
                  <a key={l} href="#" className="block text-sm text-neutral-500 hover:text-neutral-300 transition-colors">{l}</a>
                ))}
              </div>
            </div>

            {/* Legal */}
            <div>
              <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest mb-4">Legal</p>
              <div className="space-y-2">
                <a href="/terms" className="block text-sm text-neutral-500 hover:text-neutral-300 transition-colors">Terms of Service</a>
                <a href="/privacy" className="block text-sm text-neutral-500 hover:text-neutral-300 transition-colors">Privacy Policy</a>
                <a href="#" className="block text-sm text-neutral-500 hover:text-neutral-300 transition-colors">Cookie Policy</a>
                <a href="#" className="block text-sm text-neutral-500 hover:text-neutral-300 transition-colors">Cancellation Policy</a>
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
            <p className="text-xs text-neutral-600">© 2025 Shiftzy Go. All rights reserved. Made with ❤️ in India.</p>
            <div className="flex items-center gap-4">
              <span className="text-xs text-neutral-600 flex items-center gap-1"><Shield className="w-3 h-3" /> SSL Secured</span>
              <span className="text-xs text-neutral-600 flex items-center gap-1"><Lock className="w-3 h-3" /> Stripe Payments</span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
