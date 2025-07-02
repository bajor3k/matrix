
"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Brain, X } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LandingPage() {
  const [showPill, setShowPill] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

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
            <button onClick={() => setIsReviewModalOpen(true)} className="hover:text-black dark:hover:text-white transition-colors">
              Review
            </button>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="flex-1 px-6 md:px-8 pt-36 md:pt-48">
        <div className="w-full max-w-7xl mx-auto text-center">
          
          <h1 className="text-[10rem] sm:text-[12rem] md:text-[16rem] lg:text-[18rem] font-extrabold leading-none tracking-tighter text-black dark:text-white">
            matrix
          </h1>
          
           <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-black dark:text-white">
            One Login. One Matrix.
          </h2>
          
          <div className="flex items-center justify-center mt-8 gap-4">
            <p className="text-4xl md:text-5xl font-bold tracking-wide text-black dark:text-white">
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
                  className="relative"
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
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter text-black dark:text-white mt-8">
              Analytics that power your business.
            </h3>
          </div>

        </div>
      </main>
      
      <AnimatePresence>
        {isReviewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsReviewModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/5 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="relative flex w-full max-w-4xl flex-col items-center rounded-2xl bg-white/80 p-8 shadow-2xl dark:bg-neutral-900/80 border border-white/20"
            >
              <button
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full text-xl font-bold hover:bg-neutral-200/50"
                onClick={() => setIsReviewModalOpen(false)}
                aria-label="Close review modal"
              >
                <X className="w-4 h-4" />
              </button>
              
              <h2 className="text-2xl font-bold mb-8 text-black dark:text-white">What People Are Saying</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
                <div className="flex flex-col items-center text-center space-y-2">
                  <Image
                    src="https://placehold.co/64x64.png"
                    alt="Reviewer Alex B."
                    width={64}
                    height={64}
                    data-ai-hint="portrait person"
                    className="w-16 h-16 rounded-full border-2 border-purple-200"
                  />
                  <div className="font-semibold text-lg text-black dark:text-white">Alex B.</div>
                  <div className="italic text-neutral-700 dark:text-neutral-200">
                    “Whoever created this platform is a genius. If you ever get the chance to hire them, do it!”
                  </div>
                  <div className="text-xs text-neutral-400">— Matrix Review</div>
                </div>

                <div className="flex flex-col items-center text-center space-y-2">
                  <Image
                    src="https://placehold.co/64x64.png"
                    alt="Reviewer Jamie L."
                    width={64}
                    height={64}
                    data-ai-hint="portrait person"
                    className="w-16 h-16 rounded-full border-2 border-blue-200"
                  />
                  <div className="font-semibold text-lg text-black dark:text-white">Jamie L.</div>
                  <div className="italic text-neutral-700 dark:text-neutral-200">
                    “Matrix has completely transformed the way I run my business. The analytics are next-level—nothing else comes close!”
                  </div>
                  <div className="text-xs text-neutral-400">— Matrix Review</div>
                </div>

                <div className="flex flex-col items-center text-center space-y-2">
                  <Image
                    src="https://placehold.co/64x64.png"
                    alt="Reviewer Priya S."
                    width={64}
                    height={64}
                    data-ai-hint="portrait person"
                    className="w-16 h-16 rounded-full border-2 border-green-200"
                  />
                  <div className="font-semibold text-lg text-black dark:text-white">Priya S.</div>
                  <div className="italic text-neutral-700 dark:text-neutral-200">
                    “The integration, the speed, the intelligence—Matrix is lightyears ahead of any CRM or trading platform out there. Absolutely game-changing!”
                  </div>
                  <div className="text-xs text-neutral-400">— Matrix Review</div>
                </div>

                <div className="flex flex-col items-center text-center space-y-2">
                  <Image
                    src="https://placehold.co/64x64.png"
                    alt="Reviewer Chris T."
                    width={64}
                    height={64}
                    data-ai-hint="portrait person"
                    className="w-16 h-16 rounded-full border-2 border-yellow-200"
                  />
                  <div className="font-semibold text-lg text-black dark:text-white">Chris T.</div>
                  <div className="italic text-neutral-700 dark:text-neutral-200">
                    “If I could give Matrix 10 stars, I would. It’s like having an entire team of experts in one platform. Simply phenomenal.”
                  </div>
                  <div className="text-xs text-neutral-400">— Matrix Review</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
