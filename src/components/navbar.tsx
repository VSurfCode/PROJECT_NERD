import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link } from 'react-router-dom';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.nav
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 transition-all duration-300 ${
        scrolled ? "py-2 shadow-lg" : "py-4 shadow-md"
      } bg-white/60 backdrop-blur-md border-b border-white/30`}
    >
      {/* Left side - NerdHerd text (link to home) */}
      <Link to="/" className="text-2xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-400 rounded">
        Nerd<span className="text-[#7c3aed]">Herd</span>
      </Link>

      {/* Centered Logo */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <img
          src="/NerdHerdNewLogo.svg"
          alt="NerdHerd Tech Repair"
          className={`transition-all duration-300 ${scrolled ? "h-8 md:h-10" : "h-12 md:h-16"}`}
          style={{
            filter:
              "brightness(0) saturate(100%) invert(48%) sepia(97%) saturate(749%) hue-rotate(222deg) brightness(101%) contrast(101%)",
          }}
          draggable={false}
        />
      </div>

      {/* Hamburger for mobile */}
      <button
        className="ml-auto flex flex-col items-center justify-center p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400 bp1000:hidden"
        onClick={() => setMenuOpen((v) => !v)}
        aria-label="Open navigation menu"
      >
        <span className="block w-6 h-0.5 bg-slate-800" />
        <span className="block w-6 h-0.5 bg-slate-800 my-1" />
        <span className="block w-6 h-0.5 bg-slate-800" />
      </button>

      {/* Section Links - Far Right (desktop) */}
      <div className="hidden bp1000:flex gap-6 text-lg font-medium ml-auto">
        <Link to="/" className="text-slate-700 hover:text-[#7c3aed] transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400 rounded">Home</Link>
        <a href="#services" className="text-slate-700 hover:text-[#7c3aed] transition-colors">What We Fix</a>
        <a href="#about" className="text-slate-700 hover:text-[#7c3aed] transition-colors">About</a>
        <a href="#why-us" className="text-slate-700 hover:text-[#7c3aed] transition-colors">Why Us</a>
        <a href="#contact" className="text-slate-700 hover:text-[#7c3aed] transition-colors">Contact</a>
      </div>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed left-0 right-0 top-[64px] bottom-0 bg-black bg-opacity-40 z-50 flex flex-col items-end bp1000:hidden" onClick={() => setMenuOpen(false)}>
          <div className="bg-white rounded-bl-2xl shadow-lg mt-0 mr-4 p-6 flex flex-col gap-4 text-lg font-medium min-w-[200px]" onClick={e => e.stopPropagation()}>
            <Link to="/" className="text-slate-700 hover:text-[#7c3aed] transition-colors" onClick={() => setMenuOpen(false)}>Home</Link>
            <a href="#services" className="text-slate-700 hover:text-[#7c3aed] transition-colors" onClick={() => setMenuOpen(false)}>What We Fix</a>
            <a href="#about" className="text-slate-700 hover:text-[#7c3aed] transition-colors" onClick={() => setMenuOpen(false)}>About</a>
            <a href="#why-us" className="text-slate-700 hover:text-[#7c3aed] transition-colors" onClick={() => setMenuOpen(false)}>Why Us</a>
            <a href="#contact" className="text-slate-700 hover:text-[#7c3aed] transition-colors" onClick={() => setMenuOpen(false)}>Contact</a>
          </div>
        </div>
      )}
    </motion.nav>
  );
}
