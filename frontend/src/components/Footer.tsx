
import { Music } from 'lucide-react';


const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-[#020617] border-t border-[#1E293B] py-8 px-4 sm:px-6 lg:px-12 relative overflow-hidden z-20">
      
      {/* Subtle Bottom Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[300px] h-[50px] bg-[#6C5CE7]/20 blur-[50px] pointer-events-none" />

      <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        
        {/* ================= Brand Logo ================= */}
        <div className="flex items-center gap-3 text-[#F8FAFC] font-[900] text-xl tracking-tight cursor-pointer group">
          <div className="w-8 h-8 rounded-lg bg-[#6C5CE7]/10 border border-[#6C5CE7]/30 flex items-center justify-center shadow-[0_0_10px_rgba(108,92,231,0.2)] group-hover:shadow-[0_0_15px_rgba(108,92,231,0.4)] transition-shadow">
            <Music className="w-4 h-4 text-[#6C5CE7]" />
          </div>
          <span className="drop-shadow-sm group-hover:text-[#6C5CE7] transition-colors">TuneTix</span>
        </div>

        {/* ================= Copyright & Maker Credit ================= */}
        <div className="text-[#94A3B8] font-[500] text-sm text-center flex flex-col sm:flex-row items-center gap-1.5 sm:gap-3">
          <span>© {currentYear} TuneTix. All rights reserved.</span>
          <span className="hidden sm:inline text-[#334155]">•</span>
          <span>
            Engineered by{' '}
            <span className="font-[900] text-transparent bg-clip-text bg-gradient-to-r from-[#6C5CE7] to-[#F43F5E] drop-shadow-[0_0_8px_rgba(244,63,94,0.3)] tracking-wide">
              Ajith K
            </span>
          </span>
        </div>

        {/* ================= GitHub Link ================= */}
        <a 
          href="https://github.com/ajithk-testwork" 
          target="_blank" 
          rel="noopener noreferrer"
          className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F172A] border border-[#1E293B] text-[#94A3B8] font-[800] text-sm uppercase tracking-wider hover:bg-[#1E293B]/50 hover:border-[#6C5CE7]/50 hover:text-[#F8FAFC] hover:shadow-[0_0_20px_rgba(108,92,231,0.3)] transition-all duration-300"
          aria-label="Ajith K GitHub Profile"
        >
          <GithubIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>GitHub</span>
        </a>

      </div>
    </footer>
  );
};

export default Footer;