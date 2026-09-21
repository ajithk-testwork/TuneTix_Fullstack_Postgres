import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, XCircle } from 'lucide-react';
import API from '../api/userAPI'; 
import toast from 'react-hot-toast';

// Component Imports

import FilterBar from '../components/FilterBar';
import EventCard from '../components/EventCard';
import HeroShowcase from '../components/HeroShowcase';
import ArtistSpotlight from '../components/ArtistSpotlight'; // Added missing import
import TuneTixVIP from '../components/TuneTixVIP';

const Home = () => {
  const navigate = useNavigate();
  
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  useEffect(() => {
    
    const fetchEvents = async () => {
      try {
        setIsLoading(true);
        const res = await API.get('/events');
        setEvents(res.data?.data || res.data || []); 
      } catch (error: any) {
        toast.error(error.response?.data?.message || "Failed to load events", {
          style: { background: '#fff', color: '#111', border: '1px solid #E5E7EB' }
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [navigate]);

  const filteredEvents = events.filter(event => {
    const matchesSearch = (event.title || event.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || event.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = ['ALL', ...Array.from(new Set(events.map(e => e.category).filter(Boolean)))];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };

  const getTrendingEvents = async () => {
    return events.slice(0, 3);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-[#172033] font-sans selection:bg-[#6C5CE7]/20 pb-0 overflow-hidden relative">
      
     

      {/* 2. HeroShowcase takes up the top section */}
      <HeroShowcase 
        onSearch={(query) => setSearchTerm(query)} 
        fetchTrendingEvents={getTrendingEvents} 
      />

     

      {/* 4. Main container for Filters and Event Cards */}
      <main className="relative max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-12 pt-12 pb-20 z-10">
        
        {/* Filter Bar */}
        <div className="mb-8">
          <FilterBar 
            uniqueCategories={uniqueCategories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            itemVariants={itemVariants}
          />
        </div>

        {/* Dynamic Events Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode='popLayout'>
            {isLoading ? (
               <motion.div  className="col-span-full flex flex-col items-center justify-center py-24 bg-[#FFFFFF] border border-gray-100 rounded-[2rem] shadow-sm">
                 <Loader2 className="w-8 h-8 text-[#6C5CE7] animate-spin mb-4" />
                 <p className="text-[#667085] text-sm font-[700]">Synchronizing data...</p>
               </motion.div>
            ) : filteredEvents.length === 0 ? (
               <motion.div  className="col-span-full flex flex-col items-center justify-center py-24 bg-[#FFFFFF] border border-gray-100 rounded-[2rem] shadow-sm">
                 <XCircle className="w-10 h-10 text-gray-300 mb-4" />
                 <p className="text-[#172033] font-[800] text-lg">No events found</p>
                 <p className="text-[#667085] text-sm mt-1 font-[500]">Try adjusting your search or category filters.</p>
               </motion.div>
            ) : (
              filteredEvents.map((event) => (
                <EventCard key={event.id || event._id} event={event} itemVariants={itemVariants} />
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </main>

      {/* 5. Artist Spotlight moved OUTSIDE of main so it can span full width */}
      <ArtistSpotlight />
      <TuneTixVIP />
      

    </div>
  );
};

export default Home;