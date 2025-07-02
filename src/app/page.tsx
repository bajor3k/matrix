import Link from 'next/link';
import Image from 'next/image';
import { Brain } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f6f6f6] dark:bg-black text-black dark:text-[#f2f2f2] flex flex-col font-sans transition-colors duration-300">
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
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="flex-1 px-6 md:px-8 pt-24 md:pt-32">
        <div className="w-full max-w-7xl mx-auto text-center pt-12">
          <div>
            <h1 className="text-[10rem] sm:text-[12rem] md:text-[16rem] lg:text-[18rem] font-extrabold leading-none tracking-tighter text-black dark:text-white">
              matrix
            </h1>
            <div className="mt-8 flex justify-center items-center gap-6">
              <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-400 font-light tracking-wide">
                see how deep the rabbit hole goes…
              </p>
              <div className="flex items-center gap-4">
                {/* Blue Pill */}
                <svg width="24" height="48" viewBox="0 0 24 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -rotate-45 drop-shadow-lg">
                  <defs>
                    <linearGradient id="blue-pill-gloss" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
                    </linearGradient>
                  </defs>
                  <rect width="24" height="48" rx="12" fill="#2563eb" />
                  <rect width="24" height="48" rx="12" fill="url(#blue-pill-gloss)" />
                </svg>
                {/* Red Pill */}
                <svg width="24" height="48" viewBox="0 0 24 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform -rotate-45 drop-shadow-lg">
                  <defs>
                    <linearGradient id="red-pill-gloss" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
                      <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
                    </linearGradient>
                  </defs>
                  <rect width="24" height="48" rx="12" fill="#dc2626" />
                  <rect width="24" height="48" rx="12" fill="url(#red-pill-gloss)" />
                </svg>
              </div>
            </div>
          </div>
          <div className="py-32 md:py-48">
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-black dark:text-white whitespace-nowrap">
              One Login. One Matrix.
            </h2>
            <h2 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-black dark:text-white mt-16 md:mt-24">
              Analytics that power your business.
            </h2>
          </div>
        </div>
      </main>
    </div>
  );
}
