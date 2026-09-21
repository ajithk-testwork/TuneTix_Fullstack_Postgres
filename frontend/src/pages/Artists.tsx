import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Star, Music, X, Play, Calendar, TrendingUp, ChevronRight, Activity } from 'lucide-react';

// Using your exact image imports
import image1 from "../../public/Artist/image1.png";
import image2 from "../../public/Artist/image2.png";
import image3 from "../../public/Artist/image3.png";
import image4 from "../../public/Artist/image4.png";
import image5 from "../../public/Artist/image5.png";
import image6 from "../../public/Artist/image6.png";
import image7 from "../../public/Artist/image7.png";
import image8 from "../../public/Artist/image8.png";
import image9 from "../../public/Artist/image9.png";

const MOCK_ARTISTS = [
  { id: 1, name: "Anirudh Ravichander", genre: "Indian Pop / Electronic", followers: "15M+", tagline: "The rockstar architect of modern electronic dance music and chart-topping soundtracks.", image: image1, trending: true, upcomingShows: 4 },
  { id: 2, name: "A.R. Rahman", genre: "Classical / Fusion", followers: "22M+", tagline: "Legendary composer bridging traditional classical roots with global cinematic soundscapes.", image: image2, trending: true, upcomingShows: 2 },
  { id: 3, name: "Sid Sriram", genre: "Carnatic Pop", followers: "8M+", tagline: "Soul-stirring vocals creating hypnotic waves across contemporary carnatic pop anthems.", image: image3, trending: false, upcomingShows: 6 },
  { id: 4, name: "Jonita Gandhi", genre: "Pop / Playback", followers: "5M+", tagline: "Versatile powerhouse delivering high-energy pop hits and unforgettable live stage presence.", image: image4, trending: false, upcomingShows: 3 },
  { id: 5, name: "Thaman S", genre: "Tollywood / Electronic", followers: "6M+", tagline: "Master of thunderous brass arrangements and electrifying stadium beat drops.", image: image5, trending: true, upcomingShows: 1 },
  { id: 6, name: "Shreya Ghoshal", genre: "Classical / Pop", followers: "30M+", tagline: "The golden voice of melody, celebrated globally for unmatched vocal precision.", image: image6, trending: false, upcomingShows: 5 },
  { id: 7, name: "Yuvan Shankar Raja", genre: "Alternative / Indie", followers: "12M+", tagline: "Pioneer of alternative indie subcultures and timeless soulful melodies.", image: image7, trending: false, upcomingShows: 2 },
  { id: 8, name: "Arijit Singh", genre: "Bollywood / Acoustic", followers: "45M+", tagline: "The undisputed king of romantic playback singing and soul-piercing live performances.", image: image8, trending: true, upcomingShows: 8 },
  { id: 9, name: "Amit Trivedi", genre: "Alternative / Fusion", followers: "4M+", tagline: "Avant-garde composer blending raw folk instruments with hard-hitting contemporary beats.", image: image9, trending: false, upcomingShows: 3 },
];

const Artists = () => {
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedArtist, setSelectedArtist] = useState<any>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (selectedArtist) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [selectedArtist]);

  const filteredArtists = MOCK_ARTISTS.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          artist.genre.toLowerCase().includes(searchQuery.toLowerCase());
    if (filter === "trending") return matchesSearch && artist.trending;
    return matchesSearch;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

 

  return (
    // Base Dark Theme Container
    <div className="min-h-screen bg-[#020617] text-[#F8FAFC] font-sans selection:bg-[#6C5CE7]/30 selection:text-white">
      
      {/* Background Ambient Glows */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-[#6C5CE7]/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-[#00B4D8]/10 rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto px-6 lg:px-12 pt-32 pb-32 relative z-10">
        
        {/* ================= EDITORIAL HERO ================= */}
        <div className="mb-16 flex flex-col items-start">
          <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F43F5E]/10 border border-[#F43F5E]/20 mb-4 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
            <Activity className="w-4 h-4 text-[#F43F5E] animate-pulse" />
            <span className="text-[#F43F5E] text-xs font-[800] tracking-widest uppercase">Featured Roster</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-[900] tracking-tight leading-none mb-6 text-[#F8FAFC] drop-shadow-md">
            The Sound <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C5CE7] to-[#F43F5E] drop-shadow-[0_0_10px_rgba(244,63,94,0.3)]">Architects</span>
          </h1>
          <p className="text-[#94A3B8] text-lg md:text-xl max-w-2xl font-[500] leading-relaxed">
            Discover the maestros shaping global music. Dive into their discography and catch them live on their upcoming arena tours.
          </p>
        </div>

        {/* ================= UNIFIED CONTROL BAR ================= */}
        <div className="sticky top-24 z-40 mb-12 flex flex-col md:flex-row items-center justify-between gap-4 p-2 bg-[#0F172A]/80 border border-[#1E293B] backdrop-blur-xl rounded-[2rem] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          
          {/* Tabs */}
          <div className="flex items-center gap-1 w-full md:w-auto p-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-6 py-3 rounded-full text-sm font-[800] tracking-wider uppercase transition-all w-full md:w-auto ${
                filter === "all" 
                  ? 'bg-[#6C5CE7] text-white shadow-[0_0_15px_rgba(108,92,231,0.4)]' 
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/50 border border-transparent'
              }`}
            >
              All Artists
            </button>
            <button
              onClick={() => setFilter("trending")}
              className={`px-6 py-3 rounded-full text-sm font-[800] tracking-wider uppercase transition-all w-full md:w-auto flex items-center justify-center gap-2 ${
                filter === "trending" 
                  ? 'bg-[#F43F5E] text-white shadow-[0_0_15px_rgba(244,63,94,0.4)]' 
                  : 'text-[#94A3B8] hover:text-[#F8FAFC] hover:bg-[#1E293B]/50 border border-transparent'
              }`}
            >
              <TrendingUp className="w-4 h-4" /> Trending
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-[350px] mr-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search artists..." 
              className="w-full bg-[#020617] border border-[#1E293B] text-[#F8FAFC] placeholder-[#64748B] font-[500] rounded-full py-3 pl-11 pr-4 focus:outline-none focus:border-[#6C5CE7]/50 focus:ring-2 focus:ring-[#6C5CE7]/20 transition-all text-sm shadow-inner"
            />
          </div>
        </div>

        {/* ================= POSTER GRID ================= */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-7"
        >
          <AnimatePresence mode="popLayout">
            {filteredArtists.map((artist) => (
              <motion.div
                
                key={artist.id}
                onClick={() => setSelectedArtist(artist)}
                className="group relative aspect-[4/5] mx-auto w-full max-w-[320px] rounded-3xl overflow-hidden cursor-pointer bg-[#0F172A] border border-[#1E293B] hover:border-[#6C5CE7]/50 transition-all duration-500 shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(108,92,231,0.25)]"
              >
                {/* Hover Glow Behind Image */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#6C5CE7] rounded-full blur-[80px] opacity-0 group-hover:opacity-20 transition-opacity duration-500 pointer-events-none z-0"></div>

                {/* Image */}
                <img 
                  src={artist.image} 
                  alt={artist.name} 
                  className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 grayscale-[0.3] group-hover:grayscale-0 opacity-80 group-hover:opacity-100 z-10"
                />
                
                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#020617]/20 via-transparent to-[#020617]/90 z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-0 group-hover:opacity-80 transition-opacity duration-500 z-10" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end transform transition-transform duration-500 translate-y-3 group-hover:translate-y-0 z-20">
                  {artist.trending && (
                    <span className="w-fit bg-[#F43F5E] text-white px-3 py-1 rounded-full text-[9px] font-[800] uppercase tracking-widest mb-3 shadow-[0_0_10px_rgba(244,63,94,0.5)]">
                      Trending
                    </span>
                  )}
                  
                  <h3 className="text-xl font-[800] text-[#F8FAFC] leading-tight mb-1 drop-shadow-md group-hover:text-[#6C5CE7] transition-colors">{artist.name}</h3>
                  <p className="text-[#00B4D8] text-xs font-[700] mb-3">{artist.genre}</p>
                  
                  {/* Hover Reveal Stats */}
                  <div className="h-0 opacity-0 overflow-hidden group-hover:h-auto group-hover:opacity-100 transition-all duration-500 delay-100">
                    <div className="flex items-center gap-4 pt-3 border-t border-[#334155]">
                      <div className="flex items-center gap-1.5 text-[11px] font-[600] text-[#E2E8F0]">
                        <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" /> {artist.followers}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-[600] text-[#E2E8F0]">
                        <Calendar className="w-3.5 h-3.5 text-[#00B4D8]" /> {artist.upcomingShows} Shows
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {filteredArtists.length === 0 && (
          <div className="py-32 text-center bg-[#0F172A] border border-[#1E293B] rounded-[2.5rem] mt-8 shadow-lg">
            <Music className="w-12 h-12 text-[#334155] mx-auto mb-4" />
            <h3 className="text-xl font-[800] text-[#F8FAFC] mb-2">No artists found</h3>
            <p className="text-[#94A3B8] font-[500]">Try adjusting your search criteria.</p>
          </div>
        )}
      </div>

      {/* ================= SIDE DRAWER ================= */}
      <AnimatePresence>
        {selectedArtist && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArtist(null)}
              className="fixed inset-0 bg-[#020617]/80 backdrop-blur-sm z-[100] cursor-pointer"
            />

            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full md:w-[480px] bg-[#0F172A] border-l border-[#1E293B] z-[110] shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-y-auto"
            >
              
              <button 
                onClick={() => setSelectedArtist(null)}
                className="absolute top-6 right-6 z-20 w-10 h-10 bg-[#1E293B]/80 border border-[#334155] backdrop-blur-md hover:bg-[#334155] rounded-full flex items-center justify-center text-[#F8FAFC] transition-all shadow-lg"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative w-full h-[400px]">
                <img 
                  src={selectedArtist.image} 
                  alt={selectedArtist.name} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/50 to-transparent" />
                
                <div className="absolute bottom-6 left-8 flex gap-2">
                  <span className="bg-[#1E293B]/80 backdrop-blur-md border border-[#334155] text-[#F8FAFC] px-4 py-1.5 rounded-full text-xs font-[800] uppercase tracking-wider shadow-sm">
                    {selectedArtist.genre}
                  </span>
                  {selectedArtist.trending && (
                    <span className="bg-[#F43F5E]/20 backdrop-blur-md border border-[#F43F5E]/40 text-[#F43F5E] px-4 py-1.5 rounded-full text-xs font-[800] uppercase tracking-wider flex items-center gap-1.5 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                      <TrendingUp className="w-3.5 h-3.5" /> Hot
                    </span>
                  )}
                </div>
              </div>

              <div className="p-8">
                <h2 className="text-4xl font-[900] text-[#F8FAFC] tracking-tight mb-4 drop-shadow-md">{selectedArtist.name}</h2>
                <p className="text-[#94A3B8] font-[500] text-base leading-relaxed mb-8">
                  {selectedArtist.tagline}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-10">
                  <div className="bg-[#1E293B]/40 border border-[#334155] p-5 rounded-2xl shadow-inner">
                    <div className="text-3xl font-[900] text-[#F8FAFC] mb-1">{selectedArtist.followers}</div>
                    <div className="text-xs text-[#64748B] uppercase tracking-widest font-[800]">Listeners</div>
                  </div>
                  <div className="bg-[#1E293B]/40 border border-[#334155] p-5 rounded-2xl shadow-inner">
                    <div className="text-3xl font-[900] text-[#F8FAFC] mb-1">{selectedArtist.upcomingShows}</div>
                    <div className="text-xs text-[#64748B] uppercase tracking-widest font-[800]">Live Shows</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button className="w-full group bg-[#6C5CE7] hover:bg-[#5A4BCF] text-white font-[800] uppercase tracking-wider py-4 px-6 rounded-2xl transition-all flex items-center justify-between shadow-[0_0_20px_rgba(108,92,231,0.4)] hover:shadow-[0_0_30px_rgba(108,92,231,0.6)]">
                    <span className="flex items-center gap-3"><Calendar className="w-5 h-5" /> Tour Dates & Tickets</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                  <button className="w-full group bg-[#020617] hover:bg-[#1E293B] border border-[#334155] hover:border-[#F43F5E]/50 text-[#F8FAFC] font-[800] uppercase tracking-wider py-4 px-6 rounded-2xl transition-all flex items-center justify-between hover:shadow-[0_0_15px_rgba(244,63,94,0.3)]">
                    <span className="flex items-center gap-3"><Play className="w-5 h-5 text-[#F43F5E]" /> Play Artist Radio</span>
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Artists;