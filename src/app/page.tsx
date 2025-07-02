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
            <Link href="#" className="hover:text-black dark:hover:text-white transition-colors">
              Review
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="flex-1 px-6 md:px-8 pt-12 md:pt-24">
        <div className="w-full max-w-7xl mx-auto text-center">
          
          <h1 className="text-[10rem] sm:text-[12rem] md:text-[16rem] lg:text-[18rem] font-extrabold leading-none tracking-tighter text-black dark:text-white">
            matrix
          </h1>

          <div className="mt-8 flex justify-center items-center gap-4">
            <p className="text-4xl md:text-5xl text-black dark:text-white font-bold tracking-wide">
              see how deep the rabbit hole goes…
            </p>
            {/* Red Pill */}
            <div className="red-pill"></div>
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
