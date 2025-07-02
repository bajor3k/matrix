"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Brain, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const [showPill, setShowPill] = useState(true);

  return (
    <div className="min-h-screen bg-[#f6f6f6] dark:bg-black text-black dark:text-[#f2f2f2] flex flex-col font-sans transition-colors duration-300 overflow-x-hidden">
      <header className="absolute top-0 left-0 right-0 p-6 md:p-8 z-20">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/dashboard" className="transition-transform hover:scale-110 hover:drop-shadow-lg">
            <Brain className="w-8 h-8 md:w-10 md:h-10 text-black dark:text-white" />
          </Link>

          <div className="flex items-center space-x-4 md:space-x-6 text-sm md:text-base font-medium text-gray-800 dark:text-gray-300">
            <Link href="/dashboard" className="hover:text-black dark:hover:text-white transition-colors">
              Login
            </Link>
            <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">
              Sign up
            </Link>
            <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">
              Review
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="flex-1 px-6 md:px-8 pt-24 md:pt-32">
        <div className="w-full max-w-7xl mx-auto text-center">
          
          <h1 className="text-[10rem] sm:text-[12rem] md:text-[16rem] lg:text-[18rem] font-extrabold leading-none tracking-tighter text-black dark:text-white">
            matrix
          </h1>
          
          <div className="flex items-center justify-center mt-8 gap-4">
            <p className="text-4xl md:text-5xl text-black dark:text-white font-bold tracking-wide">
                see how deep the rabbit hole goes…
            </p>
            <AnimatePresence>
              {showPill && (
                <motion.div
                  key="red-pill"
                  initial={{ x: '100vw', rotate: -540 }}
                  animate={{ x: 0, rotate: 0 }}
                  exit={{ x: '100vw', rotate: 540, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 100, damping: 20, mass: 1.5 }}
                >
                  <div className="relative">
                    <svg width="80" height="40" viewBox="0 0 80 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]">
                        <defs>
                            <linearGradient id="pillGradientRed" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#ef4444"/>
                                <stop offset="100%" stopColor="#b91c1c"/>
                            </linearGradient>
                            <linearGradient id="highlightGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="white" stopOpacity="0.7"/>
                                <stop offset="100%" stopColor="white" stopOpacity="0.1"/>
                            </linearGradient>
                        </defs>
                        <rect x="1" y="1" width="78" height="38" rx="19" fill="url(#pillGradientRed)" stroke="#7f1d1d" strokeWidth="2"/>
                        <path d="M15 10C30 7 60 7 65 10" stroke="url(#highlightGradient)" strokeWidth="4" strokeLinecap="round"/>
                    </svg>
                    <motion.button
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 1.5, type: "spring", stiffness: 300, damping: 15 }}
                        onClick={() => setShowPill(false)}
                        className="absolute -top-2 -right-2 bg-white rounded-full text-red-600 font-bold w-6 h-6 flex items-center justify-center text-sm shadow-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500 cursor-pointer"
                        aria-label="Dismiss pill"
                    >
                        <X className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="py-24 md:py-32">
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-black dark:text-white">
              One Login. One Matrix.
            </h2>
            <h3 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-black dark:text-white mt-12 md:mt-16">
              Analytics that power your business.
            </h3>
          </div>

        </div>
      </main>
    </div>
  );
}
