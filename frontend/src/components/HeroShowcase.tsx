import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, MapPin, Loader2, AlertCircle, Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface TrendingEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  image: string;
}

interface HeroShowcaseProps {
  onSearch: (query: string) => void;
  fetchTrendingEvents: () => Promise<TrendingEvent[]>;
}



const HeroShowcase: React.FC<HeroShowcaseProps> = ({ onSearch, fetchTrendingEvents }) => {
  const shouldReduceMotion = useReducedMotion();

  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [events, setEvents] = useState<TrendingEvent[]>([]);
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'empty'>('loading');

  useEffect(() => {
    let isMounted = true;
    const loadEvents = async () => {
      try {
        setStatus('loading');
        const data = await fetchTrendingEvents();
        if (!isMounted) return;
        
        if (data.length === 0) {
          setStatus('empty');
        } else {
          setEvents(data);
          setStatus('success');
        }
      } catch (error) {
        if (isMounted) setStatus('error');
      }
    };
    loadEvents();
    return () => { isMounted = false; };
  }, [fetchTrendingEvents]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) onSearch(searchQuery);
  };

  return (
    <section 
      className="relative w-full min-h-screen flex items-center justify-center pt-28 pb-20 px-4 sm:px-6 lg:px-12 overflow-hidden bg-[#020617] font-sans"
    >
      {/* --- Ambient 3D Neon Glows --- */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[0%] left-[-5%] w-[45rem] h-[45rem] bg-[#6C5CE7]/20 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[35rem] h-[35rem] bg-[#00B4D8]/15 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] left-[40%] w-[30rem] h-[30rem] bg-[#F43F5E]/10 rounded-full blur-[150px]" />
      </div>

      <div className="max-w-[1400px] w-full mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
        
        {/* ================= LEFT COLUMN: HERO TEXT & SEARCH ================= */}
        <motion.div 
          className="lg:col-span-7 flex flex-col items-start"
          initial="hidden"
          animate="visible"
          
        >
          {/* Glassmorphism Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[#00B4D8] text-xs font-[800] uppercase tracking-widest mb-8 shadow-[0_0_20px_rgba(0,180,216,0.15)]">
            <Sparkles className="w-4 h-4 text-[#00B4D8] animate-pulse" />
            <span>Premium Live Music Platform</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="text-5xl sm:text-6xl lg:text-[5rem] font-[900] text-white tracking-tighter leading-[1.1] mb-6 drop-shadow-lg">
            Secure Tickets To <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C5CE7] via-[#9D8BFF] to-[#00B4D8] drop-shadow-[0_0_15px_rgba(108,92,231,0.4)]">
              Unforgettable Shows
            </span>
          </h1>
          
          <p className="text-[#94A3B8] font-[500] text-lg sm:text-xl max-w-2xl mb-12 leading-relaxed">
            Discover headline tours, exclusive artist performances, and epic festival lineups near you. The stage is set.
          </p>

          {/* New Sleek Search Bar */}
          <form 
            onSubmit={handleSearchSubmit}
            className="w-full max-w-2xl bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full p-2 flex flex-col sm:flex-row items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] focus-within:border-[#6C5CE7]/50 focus-within:bg-white/10 transition-all"
          >
            <div className="flex items-center gap-3 px-5 py-3 w-full">
              <Search className="w-5 h-5 text-[#94A3B8] shrink-0" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artists, venues, or cities..." 
                className="w-full bg-transparent text-white placeholder-[#64748B] font-[500] text-base outline-none"
              />
            </div>
            <button 
              type="submit"
              className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-[#6C5CE7] to-[#8B78FF] hover:from-[#5A4BCF] hover:to-[#6C5CE7] text-white font-[800] uppercase tracking-wider rounded-full shadow-[0_0_20px_rgba(108,92,231,0.4)] transition-all active:scale-95"
            >
              Search
            </button>
          </form>
        </motion.div>

        {/* ================= RIGHT COLUMN: GLASS TRENDING PANEL ================= */}
        <motion.div 
          className="lg:col-span-5 relative"
          initial="hidden"
          animate="visible"
         
          transition={{ delay: shouldReduceMotion ? 0 : 0.2 }}
        >
          {/* Frosted Glass Panel */}
          <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden">
            
            {/* Subtle inner glow */}
            <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <div className="flex items-center justify-between mb-8 relative z-10">
              <h2 className="text-xl font-[900] text-white flex items-center gap-3 tracking-tight">
                <span className="relative flex h-3.5 w-3.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#10B981] shadow-[0_0_10px_rgba(16,185,129,0.8)]"></span>
                </span>
                Trending Now
              </h2>
            </div>

            <div className="min-h-[320px] flex flex-col gap-4 relative z-10">
              <AnimatePresence mode="wait">
                
                {status === 'loading' && (
                  <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-16">
                    <Loader2 className="w-10 h-10 text-[#00B4D8] animate-spin mb-4" />
                    <p className="text-sm font-[600] text-[#94A3B8]">Curating top events...</p>
                  </motion.div>
                )}

                {status === 'error' && (
                  <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-16 text-center">
                    <AlertCircle className="w-12 h-12 text-[#F43F5E] mb-4" />
                    <p className="text-base font-[800] text-white mb-1">Failed to load trends</p>
                  </motion.div>
                )}

                {status === 'empty' && (
                  <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-16 text-center">
                    <Calendar className="w-12 h-12 text-[#334155] mb-4" />
                    <p className="text-base font-[800] text-white mb-1">No trending events</p>
                  </motion.div>
                )}

                {status === 'success' && (
                  <motion.div key="success" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-4">
                    {events.slice(0, 3).map((event) => (
                      <div 
                        key={event.id}
                        onClick={() => navigate(`/event/${event.id}`)}
                        className="group flex items-center gap-5 bg-black/20 hover:bg-white/10 p-3.5 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-300 cursor-pointer"
                      >
                        <div className="w-20 h-20 shrink-0 rounded-[1rem] overflow-hidden bg-[#020617] relative">
                          <img 
                            src={event.image} 
                            alt={event.title} 
                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-out"
                          />
                          {/* Image inner shadow */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        </div>
                        
                        <div className="flex flex-col flex-1 overflow-hidden pr-2">
                          <h3 className="font-[800] text-base text-white truncate group-hover:text-[#6C5CE7] transition-colors mb-1.5 drop-shadow-md">
                            {event.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs font-[600] text-[#94A3B8]">
                            <MapPin className="w-3.5 h-3.5 text-[#00B4D8]" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        </div>

                        {/* Arrow indicator on hover */}
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 transition-all duration-300 mr-2">
                          <ArrowRight className="w-4 h-4 text-white" />
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default HeroShowcase;