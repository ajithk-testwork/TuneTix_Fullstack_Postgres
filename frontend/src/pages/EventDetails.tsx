import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Ticket,
  Calendar,
  MapPin,
  Clock,
  Share2,
  Heart,
  Loader2,
  Sparkles,
  ShieldCheck,
  Info,
  Timer,
  Globe,
  UserCheck,
  Mic2,
  Building2
} from "lucide-react";
import API from "../api/userAPI";
import toast from "react-hot-toast";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchEventDetails = async () => {
      try {
        setIsLoading(true);
        const res = await API.get(`/event/${id}`);
        setEvent(res.data.data ? res.data.data : res.data.event);
      } catch (error: any) {
        toast.error(
          error.response?.data?.message || "Failed to load event details",
          {
            style: {
              background: "#0F172A",
              color: "#F8FAFC",
              border: "1px solid rgba(244, 63, 94, 0.4)",
              borderRadius: "16px",
              boxShadow: "0 0 20px rgba(244, 63, 94, 0.2)"
            },
          }
        );
        navigate("/");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchEventDetails();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center flex-col gap-4 font-sans">
        <Loader2 className="w-10 h-10 text-[#6C5CE7] animate-spin drop-shadow-[0_0_10px_rgba(108,92,231,0.5)]" />
        <p className="text-[#94A3B8] text-sm tracking-widest uppercase font-[800]">
          Loading Experience...
        </p>
      </div>
    );
  }

  if (!event) return null;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };


  // Pricing Logic based on Backend's seatCategories
  const getDisplayPrice = () => {
    if (event.seatCategories && event.seatCategories.length > 0) {
      const prices = event.seatCategories.map((cat: any) => Number(cat.price));
      const minPrice = Math.min(...prices);
      return minPrice === 0 || isNaN(minPrice) ? "Free" : `₹${minPrice}`;
    }
    
    // Fallback if seatCategories is missing but price exists
    const fallbackPrice = Number(event.price);
    if (!fallbackPrice || fallbackPrice === 0 || isNaN(fallbackPrice)) return "Free";
    return `₹${fallbackPrice}`;
  };

  const getPriceLabel = () => {
    if (event.seatCategories && event.seatCategories.length > 1) {
      return "Starting Price";
    }
    return event.seatCategories?.[0]?.name || "Economy Pass";
  };

  return (
    <div className="relative min-h-screen bg-[#020617] text-[#F8FAFC] font-sans selection:bg-[#6C5CE7]/40 selection:text-white overflow-x-hidden pb-24">
      
      {/* Deep Ambient Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#6C5CE7]/15 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00B4D8]/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Floating Back Button */}
      <div className="fixed top-24 left-6 md:left-10 z-50">
        <button
          onClick={() => navigate(-1)}
          className="w-12 h-12 bg-[#0F172A]/80 backdrop-blur-md border border-[#1E293B] hover:border-[#6C5CE7]/60 hover:bg-[#1E293B] hover:scale-105 rounded-full flex items-center justify-center text-[#F8FAFC] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)] group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        </button>
      </div>

      {/* Main Content Layout */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-32 pb-12">
        
        {/* Cinematic Banner Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full h-[350px] sm:h-[450px] md:h-[550px] rounded-[2.5rem] overflow-hidden relative mb-12 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-[#1E293B] group"
        >
          <img
            src={
              event.image ||
              "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2000&auto=format&fit=crop"
            }
            alt={event.title}
            className="w-full h-full object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105 opacity-80 group-hover:opacity-100"
          />
          {/* Gradient Overlay to blend with the dark background */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/30 to-transparent" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN: DETAILS ================= */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="lg:col-span-8 flex flex-col gap-8"
          >
            {/* Header Card */}
            <motion.div
              
              className="bg-[#0F172A]/80 backdrop-blur-xl border border-[#1E293B] rounded-[2.5rem] p-8 sm:p-10 shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
            >
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 text-[#6C5CE7] text-xs font-[800] uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(108,92,231,0.2)]">
                  <Sparkles className="w-3.5 h-3.5" />
                  {event.category || "Premium Access"}
                </span>
                <span className="bg-[#00B4D8]/10 border border-[#00B4D8]/30 text-[#00B4D8] text-xs font-[800] uppercase tracking-widest px-4 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_0_15px_rgba(0,180,216,0.2)]">
                  <Mic2 className="w-3.5 h-3.5" />
                  Live Concert
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-[900] text-[#F8FAFC] tracking-tight leading-[1.1] drop-shadow-md">
                {event.title}
              </h1>
            </motion.div>

            {/* Meta Grid (Dark Neon Cards) */}
            <motion.div
             
              className="grid grid-cols-2 md:grid-cols-4 gap-5"
            >
              <div className="bg-[#1E293B]/40 backdrop-blur-md border border-[#334155] rounded-3xl p-5 flex flex-col gap-3 hover:border-[#6C5CE7]/50 hover:bg-[#1E293B]/80 hover:shadow-[0_0_20px_rgba(108,92,231,0.15)] transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#020617] border border-[#1E293B] flex items-center justify-center text-[#6C5CE7] shadow-inner">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-[#64748B] font-[800] uppercase tracking-widest mb-1">Date</p>
                  <p className="text-sm font-[800] text-[#F8FAFC]">
                    {event.date
                      ? new Date(event.date).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "TBA"}
                  </p>
                </div>
              </div>

              <div className="bg-[#1E293B]/40 backdrop-blur-md border border-[#334155] rounded-3xl p-5 flex flex-col gap-3 hover:border-[#00B4D8]/50 hover:bg-[#1E293B]/80 hover:shadow-[0_0_20px_rgba(0,180,216,0.15)] transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#020617] border border-[#1E293B] flex items-center justify-center text-[#00B4D8] shadow-inner">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-[#64748B] font-[800] uppercase tracking-widest mb-1">Time</p>
                  <p className="text-sm font-[800] text-[#F8FAFC]">{event.time || "TBA"}</p>
                </div>
              </div>

              <div className="bg-[#1E293B]/40 backdrop-blur-md border border-[#334155] rounded-3xl p-5 flex flex-col gap-3 hover:border-[#6C5CE7]/50 hover:bg-[#1E293B]/80 hover:shadow-[0_0_20px_rgba(108,92,231,0.15)] transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#020617] border border-[#1E293B] flex items-center justify-center text-[#6C5CE7] shadow-inner">
                  <Timer className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-[#64748B] font-[800] uppercase tracking-widest mb-1">Duration</p>
                  <p className="text-sm font-[800] text-[#F8FAFC]">
                    {event.duration ? `${event.duration} Mins` : "TBA"}
                  </p>
                </div>
              </div>

              <div className="bg-[#1E293B]/40 backdrop-blur-md border border-[#334155] rounded-3xl p-5 flex flex-col gap-3 hover:border-[#00B4D8]/50 hover:bg-[#1E293B]/80 hover:shadow-[0_0_20px_rgba(0,180,216,0.15)] transition-all">
                <div className="w-10 h-10 rounded-xl bg-[#020617] border border-[#1E293B] flex items-center justify-center text-[#00B4D8] shadow-inner">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] text-[#64748B] font-[800] uppercase tracking-widest mb-1">Language</p>
                  <p className="text-sm font-[800] text-[#F8FAFC]">{event.language || "TBA"}</p>
                </div>
              </div>

              {/* Full Width Venue Card */}
              <div className="col-span-2 md:col-span-4 bg-[#1E293B]/40 backdrop-blur-md border border-[#334155] rounded-3xl p-5 flex items-center gap-4 hover:border-[#F43F5E]/50 hover:bg-[#1E293B]/80 hover:shadow-[0_0_20px_rgba(244,63,94,0.15)] transition-all">
                <div className="w-12 h-12 rounded-xl bg-[#020617] border border-[#1E293B] flex items-center justify-center text-[#F43F5E] shrink-0 shadow-inner">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] text-[#64748B] font-[800] uppercase tracking-widest mb-1">Venue & Location</p>
                  <p className="text-base font-[800] text-[#F8FAFC]">
                    {event.venue}, {event.location}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Description & Policy */}
            <motion.div
             
              className="bg-[#0F172A]/80 backdrop-blur-xl border border-[#1E293B] rounded-[2.5rem] p-8 sm:p-10 flex flex-col gap-10 shadow-[0_10px_40px_rgba(0,0,0,0.3)]"
            >
              <div>
                <h3 className="text-2xl font-[900] text-[#F8FAFC] mb-5 flex items-center gap-3">
                  <Info className="w-6 h-6 text-[#00B4D8]" /> About Event
                </h3>
                <p className="text-[#94A3B8] text-sm md:text-base leading-relaxed whitespace-pre-wrap font-[500]">
                  {event.description}
                </p>
              </div>

              <div className="pt-8 border-t border-[#1E293B]">
                <h4 className="text-xl font-[900] text-[#F8FAFC] mb-5 flex items-center gap-3">
                  <ShieldCheck className="w-6 h-6 text-[#6C5CE7]" /> Access Policy
                </h4>
                <ul className="space-y-4">
                  <li className="flex items-start gap-4 text-[#94A3B8] font-[500] text-sm">
                    <UserCheck className="w-5 h-5 text-[#F43F5E] mt-0.5 shrink-0" />
                    Minimum age limit for this event is {event.minimumAge}+ years.
                  </li>
                  <li className="flex items-start gap-4 text-[#94A3B8] font-[500] text-sm">
                    <span className="w-2 h-2 rounded-full bg-[#6C5CE7] mt-2 ml-1.5 shrink-0 shadow-[0_0_8px_rgba(108,92,231,0.8)]" />
                    Tickets are strictly non-refundable and non-transferable under standard protocol.
                  </li>
                </ul>
              </div>
            </motion.div>
          </motion.div>

          {/* ================= RIGHT COLUMN: ADMISSION CTA ================= */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="lg:col-span-4 sticky top-28 flex flex-col gap-6"
          >
            {/* Ticket Booking Glass Card */}
            <div className="bg-[#0F172A]/90 backdrop-blur-2xl border border-[#1E293B] rounded-[2.5rem] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <div className="mb-8">
                <p className="text-[10px] text-[#00B4D8] font-[800] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-[#00B4D8] rounded-full animate-pulse" />
                  {getPriceLabel()}
                </p>
                <h2 className="text-5xl lg:text-6xl font-[900] text-[#F8FAFC] tracking-tighter mb-2 drop-shadow-md">
                  {getDisplayPrice()}
                </h2>
                <p className="text-sm font-[600] text-[#64748B]">
                  {event.availableTickets} Tickets Available
                </p>
              </div>

              {/* Glowing CTA Button */}
              <button
                onClick={() => navigate(`/event/${event.id}/book`)}
                className="w-full bg-gradient-to-r from-[#6C5CE7] to-[#8B78FF] hover:from-[#5A4BCF] hover:to-[#6C5CE7] text-white font-[800] text-base py-4 rounded-2xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 mb-5 shadow-[0_0_20px_rgba(108,92,231,0.4)] hover:shadow-[0_0_30px_rgba(108,92,231,0.6)] uppercase tracking-wider"
              >
                <Ticket className="w-5 h-5" />
                Claim Pass
              </button>

              <div className="flex gap-4 mt-2">
                <button className="flex-1 bg-[#1E293B]/50 hover:bg-[#1E293B] border border-[#334155] hover:border-[#6C5CE7]/50 text-[#F8FAFC] py-3.5 rounded-xl flex justify-center items-center gap-2 text-xs font-[800] uppercase tracking-wider transition-all">
                  <Heart className="w-4 h-4 text-[#F43F5E]" /> Save
                </button>
                <button className="flex-1 bg-[#1E293B]/50 hover:bg-[#1E293B] border border-[#334155] hover:border-[#00B4D8]/50 text-[#F8FAFC] py-3.5 rounded-xl flex justify-center items-center gap-2 text-xs font-[800] uppercase tracking-wider transition-all">
                  <Share2 className="w-4 h-4 text-[#00B4D8]" /> Share
                </button>
              </div>
            </div>

            {/* Organizer Widget */}
            <div className="bg-[#0F172A]/80 backdrop-blur-xl border border-[#1E293B] rounded-[2rem] p-6 shadow-md">
              <h4 className="font-[800] text-[#64748B] text-xs uppercase tracking-widest mb-5 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#00B4D8]" /> Event Organized By
              </h4>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#020617] border border-[#1E293B] rounded-full flex items-center justify-center text-[#6C5CE7] font-[900] text-xl shrink-0 shadow-inner">
                  {event.organizer ? event.organizer.charAt(0).toUpperCase() : "O"}
                </div>
                <div>
                  <p className="font-[800] text-[#F8FAFC] text-base tracking-wide">{event.organizer || "Official Organizer"}</p>
                  <p className="text-[10px] font-[800] text-[#10B981] flex items-center gap-1.5 mt-1.5 uppercase tracking-widest">
                    <ShieldCheck className="w-3.5 h-3.5" /> Verified Partner
                  </p>
                </div>
              </div>
            </div>

          </motion.div>
          
        </div>
      </main>
    </div>
  );
};

export default EventDetails;