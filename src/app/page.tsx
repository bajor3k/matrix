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
              Use Cases
            </Link>
            <ThemeToggle />
          </div>
        </nav>
      </header>

      <main className="flex-1 px-6 md:px-8">
        <div className="w-full max-w-7xl mx-auto min-h-screen grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-left relative z-10">
            <h1 className="text-[10rem] sm:text-[12rem] md:text-[16rem] lg:text-[18rem] font-extrabold leading-none tracking-tighter text-black dark:text-white">
              matrix
            </h1>
          </div>
          <div className="hidden lg:flex justify-center items-center relative h-[600px]">
            {/* Computer Mockup 1 */}
            <div className="absolute w-[500px] h-[320px] bg-gray-200 dark:bg-gray-700 p-2 rounded-lg transform -rotate-6 shadow-2xl border-4 border-gray-200 dark:border-gray-700">
              <div className="bg-black h-full w-full rounded-sm overflow-hidden relative" data-ai-hint="desktop app">
                  <Image src="https://placehold.co/800x500.png" alt="App screenshot 1" layout="fill" objectFit="cover" />
              </div>
            </div>
            {/* Computer Mockup 2 */}
            <div className="absolute w-[500px] h-[320px] bg-gray-200 dark:bg-gray-700 p-2 rounded-lg transform rotate-6 z-10 shadow-2xl border-4 border-gray-200 dark:border-gray-700">
              <div className="bg-black h-full w-full rounded-sm overflow-hidden relative" data-ai-hint="desktop app">
                   <Image src="https://placehold.co/800x500.png" alt="App screenshot 2" layout="fill" objectFit="cover" />
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-7xl mx-auto py-32 md:py-48 text-center">
          <h2 className="text-6xl md:text-8xl lg:text-9xl font-extrabold tracking-tighter text-black dark:text-white whitespace-nowrap">
            One Login. One Matrix.
          </h2>
        </div>
      </main>
    </div>
  );
}
