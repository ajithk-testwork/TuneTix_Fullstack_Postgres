import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2, X, Lock, Armchair, Ticket, ZoomIn, ZoomOut, Maximize, Map } from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/userAPI";

interface Seat {
  id: string;
  seatCode: string;
  row: string;
  number: number;
  isBooked: boolean;
  isLocked: boolean;
}

interface SeatCategory {
  id: string;
  name: string;
  price: number;
  color: string;
  rowLetter: string;
  totalSeats: number;
  seats: Seat[];
}





const SeatSelection = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<SeatCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSeats, setSelectedSeats] = useState<
    { seat: Seat; category: SeatCategory }[]
  >([]);

  // Zoom & Pan State for Mobile Friendly View
  const [zoom, setZoom] = useState(1);
  const [showMiniMap, setShowMiniMap] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchSeats = async () => {
      try {
        const res = await API.get(`/seat-category/${id}`);
        setCategories(res.data.data || []);
      } catch (error: any) {
        toast.error("Failed to load live seat map", {
          style: { background: "#0F172A", color: "#F8FAFC", border: "1px solid rgba(244, 63, 94, 0.4)", borderRadius: "12px", boxShadow: "0 0 15px rgba(244, 63, 94, 0.2)" }
        });
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchSeats();
  }, [id]);

  const toggleSeatSelection = (seat: Seat, category: SeatCategory) => {
    if (seat.isBooked || seat.isLocked) {
      if (seat.isLocked)
        toast.error("Seat is currently being viewed by another fan.", {
          style: { background: "#0F172A", color: "#F8FAFC", border: "1px solid rgba(245, 158, 11, 0.4)", borderRadius: "12px" },
          icon: '👀',
        });
      return;
    }

    setSelectedSeats((prev) => {
      const isSelected = prev.some((s) => s.seat.id === seat.id);
      if (isSelected) {
        return prev.filter((s) => s.seat.id !== seat.id);
      } else {
        if (prev.length >= 10) {
          toast.error("Maximum 10 seats allowed per transaction.", {
            style: { background: "#0F172A", color: "#F8FAFC", border: "1px solid rgba(244, 63, 94, 0.4)", borderRadius: "12px", boxShadow: "0 0 15px rgba(244, 63, 94, 0.2)" },
          });
          return prev;
        }
        return [...prev, { seat, category }];
      }
    });
  };

  const handleCheckout = async () => {
    try {
      const bookingRes = await API.post("/booking", {
        eventId: id,
        seatIds: selectedSeats.map((seat) => seat.seat.id),
      });

      const bookingId = bookingRes.data.bookingId;

      const paymentRes = await API.post(
        "/payment/create-checkout-session",
        { bookingId }
      );

      window.location.href = paymentRes.data.checkoutUrl;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Checkout Failed", {
        style: { background: "#0F172A", color: "#F8FAFC", border: "1px solid rgba(244, 63, 94, 0.4)", borderRadius: "12px" }
      });
    }
  };

  const totalPrice = selectedSeats.reduce(
    (total, item) => total + item.category.price,
    0
  );

  // Zoom Handlers
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 2));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.4));
  const handleZoomReset = () => setZoom(1);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center flex-col gap-4 font-sans">
        <Loader2 className="w-10 h-10 text-[#6C5CE7] animate-spin drop-shadow-[0_0_10px_rgba(108,92,231,0.5)]" />
        <p className="text-[#94A3B8] text-sm tracking-[0.2em] uppercase font-weight-[800] animate-pulse">
          Syncing Live Arena Map...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#020617] text-[#F8FAFC] font-sans pb-48 overflow-x-hidden relative selection:bg-[#6C5CE7]/30 selection:text-white">
      
      {/* Deep Ambient Background Glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#6C5CE7]/10 rounded-full blur-[150px] pointer-events-none z-0" />
      <div className="fixed bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-[#00B4D8]/10 rounded-full blur-[150px] pointer-events-none z-0" />

      {/* Mini-Map / Stadium Overview Modal */}
      <AnimatePresence>
        {showMiniMap && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020617]/90 backdrop-blur-md p-4" 
            onClick={() => setShowMiniMap(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-[#0F172A] border border-[#1E293B] rounded-[2rem] p-6 max-w-lg w-full relative shadow-[0_0_50px_rgba(108,92,231,0.2)]" 
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowMiniMap(false)} className="absolute top-4 right-4 p-2 bg-[#1E293B] hover:bg-[#334155] rounded-full text-[#94A3B8] hover:text-white transition-colors">
                <X className="w-5 h-5"/>
              </button>
              <h3 className="text-xl font-[900] text-white mb-6 flex items-center gap-2">
                <Map className="w-5 h-5 text-[#00B4D8]" /> Arena Overview
              </h3>
              {/* Dummy Stadium Layout Image (Replace with your actual layout map image) */}
              <div className="w-full bg-[#1E293B]/50 rounded-2xl border border-[#334155] p-2">
                <img src="https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=800&q=80" alt="Arena Map" className="w-full h-auto rounded-xl opacity-80" />
              </div>
              <p className="text-xs font-[600] text-[#64748B] mt-5 text-center tracking-wide uppercase">
                Use the zoom controls on the main screen to navigate and select specific seats.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Header - Dark Frosted Glass */}
      <header className="sticky top-0 z-50 bg-[#0F172A]/80 backdrop-blur-xl border-b border-[#1E293B] px-6 py-4 flex items-center gap-4 shadow-md">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 bg-[#1E293B]/50 border border-[#334155] hover:border-[#6C5CE7]/60 hover:bg-[#1E293B] rounded-full flex items-center justify-center text-[#94A3B8] hover:text-[#F8FAFC] transition-all shadow-sm"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-lg font-[800] text-[#F8FAFC] tracking-tight drop-shadow-sm">
            Select Your Seats
          </h1>
          <p className="text-[10px] text-[#00B4D8] font-[800] uppercase tracking-widest flex items-center gap-1.5 mt-0.5 animate-pulse">
            <span className="w-1.5 h-1.5 bg-[#00B4D8] rounded-full block shadow-[0_0_8px_rgba(0,180,216,0.8)]" /> 
            Real-time arena map active
          </p>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 pt-10">
        
        {/* Status Legend */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mb-8 bg-[#0F172A] border border-[#1E293B] rounded-full py-3 px-6 w-fit mx-auto shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-md border border-[#334155] bg-[#1E293B] shadow-inner"></div>
            <span className="text-[10px] text-[#94A3B8] font-[800] uppercase tracking-wider">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-md bg-[#6C5CE7] shadow-[0_0_10px_rgba(108,92,231,0.6)] border border-[#8B78FF]"></div>
            <span className="text-[10px] text-[#F8FAFC] font-[800] uppercase tracking-wider">Selected</span>
          </div>
          <div className="flex items-center gap-2" title="Someone else is looking at this seat">
            <div className="w-3.5 h-3.5 rounded-md bg-amber-500/20 border border-amber-500/50 flex items-center justify-center animate-pulse">
              <Lock className="w-2.5 h-2.5 text-amber-500" />
            </div>
            <span className="text-[10px] text-amber-500 font-[800] uppercase tracking-wider drop-shadow-[0_0_5px_rgba(245,158,11,0.5)]">Locked</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-md bg-[#020617] border border-[#1E293B] flex items-center justify-center shadow-inner">
              <X className="w-2.5 h-2.5 text-[#334155]" />
            </div>
            <span className="text-[10px] text-[#64748B] font-[800] uppercase tracking-wider">Sold Out</span>
          </div>
        </div>

        {/* Dynamic Stadium Layout Map with Interactive Zoom Area */}
        {categories.length === 0 ? (
          <div className="text-center py-20 text-[#64748B] flex flex-col items-center bg-[#0F172A] border border-[#1E293B] rounded-[2rem] shadow-sm max-w-2xl mx-auto">
            <Armchair className="w-12 h-12 mb-4 text-[#334155]" />
            <p className="text-lg font-[800] text-[#F8FAFC] mb-1">Arena map is currently unavailable.</p>
            <p className="text-sm font-[500] text-[#94A3B8]">Please check back later.</p>
          </div>
        ) : (
          <div className="relative w-full bg-[#0F172A]/40 border border-[#1E293B] rounded-[2rem] sm:rounded-[3rem] overflow-hidden shadow-inner mb-10">
            
            {/* ================= FLOATING ZOOM & MAP CONTROLS (Top Right) ================= */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex flex-col gap-2 bg-[#020617]/80 backdrop-blur-md border border-[#334155] p-2 rounded-2xl shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <button
                onClick={() => setShowMiniMap(true)}
                className="w-10 h-10 bg-[#1E293B] hover:bg-[#6C5CE7]/20 border border-transparent hover:border-[#6C5CE7]/50 rounded-xl flex items-center justify-center text-[#00B4D8] transition-all"
                title="View Arena Overview"
              >
                <Map className="w-5 h-5" />
              </button>
              <div className="w-6 h-px bg-[#334155] mx-auto my-1"></div>
              <button
                onClick={handleZoomIn}
                className="w-10 h-10 bg-[#1E293B] hover:bg-[#334155] rounded-xl flex items-center justify-center text-[#F8FAFC] transition-all"
                title="Zoom In"
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                onClick={handleZoomReset}
                className="w-10 h-10 bg-[#1E293B] hover:bg-[#334155] rounded-xl flex items-center justify-center text-[#94A3B8] transition-all"
                title="Reset View"
              >
                <Maximize className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomOut}
                className="w-10 h-10 bg-[#1E293B] hover:bg-[#334155] rounded-xl flex items-center justify-center text-[#F8FAFC] transition-all"
                title="Zoom Out"
              >
                <ZoomOut className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable & Zoomable Arena Container */}
            {/* Added touch-pan-x and touch-pan-y to allow dragging on mobile */}
            <div className="w-full h-[60vh] sm:h-[70vh] overflow-auto hide-scrollbar touch-pan-x touch-pan-y relative">
              <div 
                className="w-full min-w-[800px] flex flex-col items-center pt-10 pb-32 origin-top center transition-transform duration-300 ease-out"
                style={{ transform: `scale(${zoom})` }}
              >
                {/* Premium Stage UI Inside the map */}
                <div className="w-full max-w-2xl mx-auto mb-16 relative">
                  <div className="relative h-20 bg-gradient-to-b from-[#6C5CE7]/20 via-[#6C5CE7]/5 to-transparent border-t-[4px] border-[#6C5CE7] rounded-t-[140px] flex flex-col items-center justify-start pt-4 shadow-[0_-15px_50px_rgba(108,92,231,0.4)]">
                    <span className="text-[#6C5CE7] font-[900] tracking-[0.4em] text-sm uppercase drop-shadow-[0_0_10px_rgba(108,92,231,0.8)]">
                      Main Stage
                    </span>
                  </div>
                </div>

                {categories.map((category, index) => {
                  // Simulating an arena wedge
                  const widthClass =
                    index === 0 ? "max-w-xl" :
                    index === 1 ? "max-w-2xl" :
                    index === 2 ? "max-w-4xl" : "max-w-full";

                  return (
                    <motion.div
                      key={category.id}
                    
                      className={`w-full ${widthClass} mb-12 px-4`}
                    >
                      {/* Category Header Card */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 px-6 py-4 bg-[#0F172A] border border-[#1E293B] rounded-2xl shadow-sm">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full shadow-[0_0_10px_currentColor]"
                            style={{ backgroundColor: category.color || "#6C5CE7", color: category.color || "#6C5CE7" }}
                          />
                          <h3 className="text-sm sm:text-base font-[900] text-[#F8FAFC] tracking-wider uppercase">
                            {category.name} <span className="text-[#64748B] font-[800] normal-case ml-2">| Row {category.rowLetter}</span>
                          </h3>
                        </div>
                        <div className="flex items-center gap-4 mt-3 sm:mt-0">
                          <span className="text-[10px] sm:text-xs text-[#94A3B8] font-[800] uppercase tracking-widest">
                            {category.seats.length} Seats
                          </span>
                          <span
                            className="text-sm font-[800] px-4 py-1.5 rounded-xl border bg-opacity-10 backdrop-blur-sm"
                            style={{ 
                              color: category.color || "#6C5CE7",
                              backgroundColor: `${category.color}20` || "rgba(108,92,231,0.2)",
                              borderColor: `${category.color}40` || "rgba(108,92,231,0.4)",
                              boxShadow: `0 0 15px ${category.color}30`
                            }}
                          >
                            ₹{category.price}
                          </span>
                        </div>
                      </div>

                      {/* High-Fidelity Seat Grid */}
                      <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3 px-2">
                        {category.seats?.map((seat) => {
                          const isSelected = selectedSeats.some((s) => s.seat.id === seat.id);

                          return (
                            <button
                              key={seat.id}
                              disabled={seat.isBooked}
                              onClick={() => toggleSeatSelection(seat, category)}
                              title={`Row ${seat.row} Seat ${seat.number} - ₹${category.price}`}
                              style={
                                isSelected
                                  ? {
                                      backgroundColor: category.color,
                                      borderColor: category.color,
                                      boxShadow: `0 0 20px ${category.color}80, inset 0 0 10px rgba(255,255,255,0.4)`,
                                      color: "#FFFFFF",
                                      textShadow: "0 1px 2px rgba(0,0,0,0.5)"
                                    }
                                  : {}
                              }
                              className={`
                                relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl text-[10px] sm:text-xs font-[800] flex items-center justify-center transition-all duration-300
                                ${
                                  seat.isBooked
                                    ? "bg-[#020617] text-[#334155] border border-[#1E293B] cursor-not-allowed shadow-inner opacity-60"
                                    : seat.isLocked && !isSelected
                                      ? "bg-amber-500/10 border border-amber-500/40 text-amber-500 cursor-not-allowed animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                                      : isSelected
                                        ? "scale-110 z-10 border-2"
                                        : "bg-[#1E293B] border border-[#334155] text-[#94A3B8] hover:border-[#6C5CE7] hover:text-[#F8FAFC] hover:shadow-[0_0_15px_rgba(108,92,231,0.4)] hover:bg-[#6C5CE7]/20 hover:-translate-y-1"
                                }
                              `}
                            >
                              {seat.isBooked ? (
                                <X className="w-4 h-4 opacity-50" />
                              ) : seat.isLocked && !isSelected ? (
                                <Lock className="w-3.5 h-3.5 opacity-80" />
                              ) : (
                                seat.number
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Checkout Drawer */}
      <AnimatePresence>
        {selectedSeats.length > 0 && (
          <motion.div
            initial={{ y: 150, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 150, opacity: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="fixed bottom-6 left-4 right-4 md:left-1/2 md:-translate-x-1/2 md:w-[90%] max-w-5xl bg-[#0F172A]/90 backdrop-blur-3xl border border-[#1E293B] rounded-[2rem] p-4 sm:p-6 z-50 shadow-[0_10px_50px_rgba(0,0,0,0.8)]"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div className="w-full md:w-[65%]">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-[#F8FAFC] font-[800] flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-[#00B4D8]" />
                    Selected Passes
                    <span className="text-[#64748B] font-[700] ml-1 text-xs uppercase tracking-wider">
                      ({selectedSeats.length}/10 max)
                    </span>
                  </p>
                </div>

                {/* Horizontal scroll for Mini-Tickets */}
                <div className="flex gap-3 overflow-x-auto pb-2 w-full hide-scrollbar snap-x">
                  {selectedSeats.map((item) => (
                    <div
                      key={item.seat.id}
                      className="snap-start flex flex-col bg-[#1E293B]/60 backdrop-blur-md border border-[#334155] rounded-xl px-4 py-2 shrink-0 relative overflow-hidden shadow-sm"
                    >
                      <div
                        className="absolute left-0 top-0 w-1 h-full shadow-[0_0_10px_currentColor]"
                        style={{ backgroundColor: item.category.color, color: item.category.color }}
                      />
                      <span className="text-[9px] uppercase tracking-widest font-[800] text-[#94A3B8] mb-0.5">
                        {item.category.name}
                      </span>
                      <span className="text-sm font-[900] text-[#F8FAFC] drop-shadow-sm">
                        {item.seat.seatCode}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between w-full md:w-auto gap-6 md:gap-8 pt-4 md:pt-0 border-t border-[#1E293B] md:border-none">
                <div className="text-left md:text-right">
                  <p className="text-[9px] text-[#00B4D8] uppercase tracking-[0.2em] font-[800] mb-1">
                    Subtotal
                  </p>
                  <p className="text-3xl font-[900] text-[#F8FAFC] tracking-tight drop-shadow-md">
                    ₹{totalPrice}
                  </p>
                </div>
                <button
                  onClick={handleCheckout}
                  className="bg-gradient-to-r from-[#6C5CE7] to-[#8B78FF] hover:from-[#5A4BCF] hover:to-[#6C5CE7] text-white px-8 py-4 rounded-xl font-[800] uppercase tracking-wider transition-all active:scale-95 shadow-[0_0_20px_rgba(108,92,231,0.4)] hover:shadow-[0_0_30px_rgba(108,92,231,0.6)] flex items-center gap-2 border border-[#8B78FF]/50"
                >
                  Checkout <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SeatSelection;