import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LogOut,
  Ticket,
  Crown,
  LayoutDashboard,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";

interface NavbarProps {
  user: any;
}

const Navbar: React.FC<NavbarProps> = ({ user }) => {
  const navigate = useNavigate();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Prevent body scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    closeMobileMenu();
    navigate("/login");
  };

  return (
    <>
      {/* ================= DESKTOP / MAIN HEADER ================= */}
      <header
        className={`
          fixed top-0 left-0 w-full z-[100]
          transition-all duration-500
          ${
            isScrolled
              ? "bg-[#020617]/90 backdrop-blur-2xl border-b border-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.5)] py-3"
              : "bg-[#020617]/20 backdrop-blur-md py-5"
          }
        `}
      >
        <div
          className="
            max-w-[1400px]
            mx-auto
            px-4 sm:px-6 lg:px-12
            flex
            justify-between
            items-center
            font-sans
          "
        >
          {/* ================= LOGO ================= */}
          <Link
            to="/"
            onClick={closeMobileMenu}
            className="flex flex-col group relative z-[120]"
          >
            <div className="flex items-center gap-2 text-[#F8FAFC]">
              {/* Music icon */}
              <svg
                className="
                  w-7 h-7
                  sm:w-8 sm:h-8
                  text-[#6C5CE7]
                  drop-shadow-[0_0_12px_rgba(108,92,231,0.8)]
                "
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M9 18V5l12-2v13" />
                <circle cx="6" cy="18" r="3" />
                <circle cx="18" cy="16" r="3" />
              </svg>

              <span
                className="
                  font-[900]
                  tracking-tight
                  text-xl
                  sm:text-2xl
                  md:text-3xl
                  text-[#F8FAFC]
                "
              >
                TuneTix
              </span>
            </div>

            <span
              className="
                text-[#00B4D8]
                text-[8px]
                sm:text-[10px]
                font-[800]
                tracking-[0.15em]
                sm:tracking-[0.2em]
                uppercase
                mt-[-2px]
                drop-shadow-[0_0_8px_rgba(0,180,216,0.5)]
              "
            >
              Live Music Platform
            </span>
          </Link>

          {/* ================= DESKTOP NAV ================= */}
          <nav
            className="
              hidden
              lg:flex
              items-center
              gap-8
              text-[#94A3B8]
              text-sm
              font-[700]
              uppercase
              tracking-wider
            "
          >
            <Link to="/" className="hover:text-white transition-colors">
              Home
            </Link>

            <Link
              to="/events"
              className="
                hover:text-white
                transition-colors
                flex
                items-center
                gap-1
                group
              "
            >
              Events
              <ChevronDown
                className="
                  w-4 h-4
                  group-hover:text-[#6C5CE7]
                  transition-colors
                "
              />
            </Link>

            <Link to="/artists" className="hover:text-white transition-colors">
              Artists
            </Link>

            <Link to="/venues" className="hover:text-white transition-colors">
              Venues
            </Link>

            <Link
              to="/dashboard"
              className="hover:text-white transition-colors"
            >
              Tickets
            </Link>
          </nav>

          {/* ================= RIGHT SIDE ================= */}
          <div className="flex items-center gap-3 relative z-[120]">
            {/* Desktop User */}
            <div className="hidden md:block">
              {user ? (
                <div className="relative group cursor-pointer">
                  <button
                    type="button"
                    className="
                      flex
                      items-center
                      gap-3
                      px-5
                      py-2
                      bg-white/5
                      hover:bg-white/10
                      backdrop-blur-md
                      border
                      border-white/10
                      rounded-full
                      text-white
                      text-sm
                      font-[700]
                      uppercase
                      tracking-wider
                      transition-all
                    "
                  >
                    <div
                      className="
                        w-7 h-7
                        rounded-full
                        bg-gradient-to-tr
                        from-[#6C5CE7]
                        to-[#00B4D8]
                        flex
                        items-center
                        justify-center
                        text-xs
                        text-white
                        font-bold
                      "
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <span className="max-w-[120px] truncate">
                      {user?.name || "USER"}
                    </span>

                    <ChevronDown
                      className="
                        w-4 h-4
                        text-[#94A3B8]
                        group-hover:rotate-180
                        transition-all
                        duration-300
                      "
                    />
                  </button>

                  {/* Desktop dropdown */}
                  <div
                    className="
                      absolute
                      right-0
                      top-full
                      pt-4
                      w-64
                      opacity-0
                      invisible
                      translate-y-2
                      group-hover:opacity-100
                      group-hover:visible
                      group-hover:translate-y-0
                      transition-all
                      duration-300
                    "
                  >
                    <div
                      className="
                        bg-[#0F172A]/95
                        backdrop-blur-2xl
                        rounded-[20px]
                        shadow-[0_20px_50px_rgba(0,0,0,0.8)]
                        border
                        border-white/10
                        overflow-hidden
                        flex
                        flex-col
                        p-2
                        text-white
                      "
                    >
                      <div
                        className="
                          px-4
                          py-3
                          border-b
                          border-white/5
                          mb-2
                          bg-white/5
                          rounded-xl
                        "
                      >
                        <p className="text-sm font-[700] truncate">
                          {user?.name || "USER"}
                        </p>

                        <p className="text-xs text-[#94A3B8] truncate mt-0.5">
                          {user?.email || "user@example.com"}
                        </p>

                        {user?.role === "ADMIN" && (
                          <div
                            className="
                              inline-flex
                              items-center
                              gap-1
                              mt-2
                              px-2
                              py-1
                              bg-[#6C5CE7]/20
                              rounded
                              text-[10px]
                              font-[800]
                              text-[#6C5CE7]
                              uppercase
                              tracking-wider
                            "
                          >
                            <Crown className="w-3 h-3" />
                            Admin
                          </div>
                        )}
                      </div>

                      <Link
                        to="/dashboard"
                        className="
                          flex
                          items-center
                          gap-3
                          px-4
                          py-2.5
                          text-sm
                          font-[600]
                          text-[#94A3B8]
                          hover:text-white
                          hover:bg-white/5
                          rounded-xl
                          transition-colors
                        "
                      >
                        <Ticket className="w-4 h-4 text-[#00B4D8]" />
                        My Tickets
                      </Link>

                      {user?.role === "ADMIN" && (
                        <Link
                          to="/admin/dashboard"
                          className="
                            flex
                            items-center
                            gap-3
                            px-4
                            py-2.5
                            text-sm
                            font-[600]
                            text-[#94A3B8]
                            hover:text-white
                            hover:bg-white/5
                            rounded-xl
                            transition-colors
                          "
                        >
                          <LayoutDashboard className="w-4 h-4 text-[#6C5CE7]" />
                          Admin Dashboard
                        </Link>
                      )}

                      <div className="h-[1px] bg-white/5 my-2" />

                      <button
                        onClick={handleLogout}
                        className="
                          flex
                          items-center
                          gap-3
                          px-4
                          py-2.5
                          text-sm
                          font-[600]
                          text-[#F43F5E]
                          hover:bg-[#F43F5E]/10
                          rounded-xl
                          transition-colors
                          w-full
                          text-left
                        "
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="
                    px-8
                    py-3
                    bg-gradient-to-r
                    from-[#6C5CE7]
                    to-[#8B78FF]
                    hover:from-[#5A4BCF]
                    hover:to-[#6C5CE7]
                    rounded-full
                    text-white
                    text-sm
                    font-[800]
                    uppercase
                    tracking-wider
                    transition-all
                    shadow-[0_0_20px_rgba(108,92,231,0.4)]
                  "
                >
                  Get Tickets
                </Link>
              )}
            </div>

            {/* ================= MOBILE MENU BUTTON ================= */}
            <button
              type="button"
              aria-label={
                isMobileMenuOpen ? "Close mobile menu" : "Open mobile menu"
              }
              aria-expanded={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen((prev) => !prev)}
              className="
                lg:hidden
                w-11
                h-11
                flex
                items-center
                justify-center
                text-white
                bg-white/5
                hover:bg-white/10
                border
                border-white/10
                rounded-full
                transition-all
              "
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ====================================================== */}
      {/*                    MOBILE MENU                         */}
      {/* ====================================================== */}

      <div
        className={`
          lg:hidden
          fixed
          inset-0
          z-[90]
          bg-[#020617]
          transition-all
          duration-300
          ease-out
          ${
            isMobileMenuOpen
              ? "opacity-100 visible"
              : "opacity-0 invisible pointer-events-none"
          }
        `}
      >
        {/* Background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="
              absolute
              -top-40
              -left-40
              w-80
              h-80
              bg-[#6C5CE7]/20
              rounded-full
              blur-[100px]
            "
          />

          <div
            className="
              absolute
              top-1/2
              -right-40
              w-80
              h-80
              bg-[#00B4D8]/10
              rounded-full
              blur-[100px]
            "
          />
        </div>

        {/* Mobile content */}
        <div
          className="
            relative
            h-full
            w-full
            overflow-y-auto
            px-6
            pt-28
            pb-10
          "
        >
          <div className="max-w-md mx-auto">
            {/* Mobile navigation */}
            <nav className="flex flex-col gap-3">
              <Link
                to="/"
                onClick={closeMobileMenu}
                className="
                  px-5
                  py-4
                  rounded-2xl
                  text-white
                  text-lg
                  font-[800]
                  uppercase
                  tracking-wider
                  bg-white/[0.04]
                  border
                  border-white/[0.06]
                  hover:bg-[#6C5CE7]/20
                  hover:border-[#6C5CE7]/40
                  transition-all
                "
              >
                Home
              </Link>

              <Link
                to="/events"
                onClick={closeMobileMenu}
                className="
                  px-5
                  py-4
                  rounded-2xl
                  text-white
                  text-lg
                  font-[800]
                  uppercase
                  tracking-wider
                  bg-white/[0.04]
                  border
                  border-white/[0.06]
                  hover:bg-[#6C5CE7]/20
                  hover:border-[#6C5CE7]/40
                  transition-all
                "
              >
                Events
              </Link>

              <Link
                to="/artists"
                onClick={closeMobileMenu}
                className="
                  px-5
                  py-4
                  rounded-2xl
                  text-white
                  text-lg
                  font-[800]
                  uppercase
                  tracking-wider
                  bg-white/[0.04]
                  border
                  border-white/[0.06]
                  hover:bg-[#6C5CE7]/20
                  hover:border-[#6C5CE7]/40
                  transition-all
                "
              >
                Artists
              </Link>

              <Link
                to="/venues"
                onClick={closeMobileMenu}
                className="
                  px-5
                  py-4
                  rounded-2xl
                  text-white
                  text-lg
                  font-[800]
                  uppercase
                  tracking-wider
                  bg-white/[0.04]
                  border
                  border-white/[0.06]
                  hover:bg-[#6C5CE7]/20
                  hover:border-[#6C5CE7]/40
                  transition-all
                "
              >
                Venues
              </Link>

              <Link
                to="/dashboard"
                onClick={closeMobileMenu}
                className="
                  px-5
                  py-4
                  rounded-2xl
                  text-white
                  text-lg
                  font-[800]
                  uppercase
                  tracking-wider
                  bg-white/[0.04]
                  border
                  border-white/[0.06]
                  hover:bg-[#6C5CE7]/20
                  hover:border-[#6C5CE7]/40
                  transition-all
                "
              >
                Tickets
              </Link>
            </nav>

            {/* ================= MOBILE USER ================= */}
            {user ? (
              <div className="mt-8">
                {/* User card */}
                <div
                  className="
                    p-5
                    rounded-2xl
                    bg-white/[0.05]
                    border
                    border-white/10
                    backdrop-blur-xl
                  "
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="
                        w-12
                        h-12
                        rounded-full
                        bg-gradient-to-tr
                        from-[#6C5CE7]
                        to-[#00B4D8]
                        flex
                        items-center
                        justify-center
                        text-lg
                        text-white
                        font-bold
                      "
                    >
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="text-white font-bold truncate">
                        {user?.name || "USER"}
                      </p>

                      <p className="text-[#94A3B8] text-sm truncate">
                        {user?.email || "user@example.com"}
                      </p>
                    </div>

                    {user?.role === "ADMIN" && (
                      <Crown className="w-5 h-5 text-[#6C5CE7]" />
                    )}
                  </div>
                </div>

                {/* My tickets */}
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className="
                    mt-3
                    w-full
                    px-5
                    py-4
                    rounded-2xl
                    bg-white/[0.04]
                    border
                    border-white/[0.06]
                    text-white
                    flex
                    items-center
                    gap-3
                    font-semibold
                    hover:bg-white/10
                    transition-all
                  "
                >
                  <Ticket className="w-5 h-5 text-[#00B4D8]" />
                  My Tickets
                </Link>

                {/* Admin Dashboard */}
                {user?.role === "ADMIN" && (
                  <Link
                    to="/admin/dashboard"
                    onClick={closeMobileMenu}
                    className="
                      mt-3
                      w-full
                      px-5
                      py-4
                      rounded-2xl
                      bg-[#6C5CE7]/10
                      border
                      border-[#6C5CE7]/20
                      text-white
                      flex
                      items-center
                      gap-3
                      font-semibold
                      hover:bg-[#6C5CE7]/20
                      transition-all
                    "
                  >
                    <LayoutDashboard className="w-5 h-5 text-[#6C5CE7]" />
                    Admin Dashboard
                  </Link>
                )}

                {/* Sign out */}
                <button
                  onClick={handleLogout}
                  className="
                    mt-3
                    w-full
                    px-5
                    py-4
                    rounded-2xl
                    bg-[#F43F5E]/10
                    border
                    border-[#F43F5E]/20
                    text-[#F43F5E]
                    flex
                    items-center
                    justify-center
                    gap-3
                    font-[800]
                    uppercase
                    tracking-wider
                    hover:bg-[#F43F5E]/20
                    transition-all
                  "
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </div>
            ) : (
              /* Login button */
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="
                  mt-8
                  w-full
                  py-4
                  bg-gradient-to-r
                  from-[#6C5CE7]
                  to-[#8B78FF]
                  rounded-2xl
                  text-white
                  flex
                  items-center
                  justify-center
                  font-[800]
                  uppercase
                  tracking-wider
                  shadow-[0_0_25px_rgba(108,92,231,0.35)]
                "
              >
                Get Tickets
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
