'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function FloatingContact() {
  const pathname = usePathname();

  if (pathname === '/contact') {
    return null;
  }

  return (
    <Link
      href="/contact"
      className="fixed bottom-6 left-6 z-50 p-3 bg-black text-white rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 ease-out border border-white/10 group flex items-center justify-center"
      aria-label="Contact Me"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="20" 
        height="20" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="group-hover:rotate-12 transition-transform duration-300"
      >
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
      </svg>
    </Link>
  );
}
