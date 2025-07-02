import Link from 'next/link';
import Image from 'next/image';
import { Brain } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#f6f6f6] text-black flex flex-col font-sans">
      <header className="absolute top-0 left-0 right-0 p-6 md:p-8 z-20">
        <nav className="flex justify-between items-center max-w-7xl mx-auto">
          <Link href="/dashboard" className="transition-transform hover:scale-110 hover:drop-shadow-lg">
            <Brain className="w-8 h-8 md:w-10 md:h-10 text-black" />
          </Link>

          <div className="flex items-center space-x-6 md:space-x-8 text-sm md:text-base font-medium text-gray-800">
            <Link href="/dashboard" className="hover:text-black transition-colors">
              Login
            </Link>
            <Link href="#" className="hover:text-black transition-colors">
              Sign up
            </Link>
            <Link href="#" className="hover:text-black transition-colors">
              Features
            </Link>
            <Link href="#" className="hover:text-black transition-colors">
              Use Cases
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 md:px-8">
        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="text-left relative z-10">
            <h1 className="text-[10rem] sm:text-[12rem] md:text-[16rem] lg:text-[18rem] font-extrabold leading-none tracking-tighter text-black">
              matrix
            </h1>
          </div>
          <div className="hidden lg:flex justify-center items-center relative h-[600px]">
            {/* Placeholder for app UI screenshots */}
            <div className="absolute w-[280px] h-[580px] bg-white rounded-3xl transform -rotate-6 overflow-hidden" data-ai-hint="app screenshot">
                <Image src="https://placehold.co/300x600.png" alt="App screenshot 1" layout="fill" objectFit="cover" />
            </div>
            <div className="absolute w-[280px] h-[580px] bg-white rounded-3xl transform rotate-6 z-10 overflow-hidden" data-ai-hint="app screenshot">
                 <Image src="https://placehold.co/300x600.png" alt="App screenshot 2" layout="fill" objectFit="cover" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
