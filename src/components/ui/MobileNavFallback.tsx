"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

export function MobileNavFallback() {
  const pathname = usePathname();
  
  // On homepage, completely hide navigation on mobile
  if (pathname === "/") return null;

  // On other pages, show a smooth way to get back home
  return (
    <nav className="md:hidden flex items-center justify-between w-full mt-6 mb-6">
      <Link 
        href="/" 
        className="flex items-center gap-2 text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
      >
        <Home className="w-4 h-4" />
        Home
      </Link>
    </nav>
  );
}
