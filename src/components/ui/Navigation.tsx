"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Writing", href: "/writing" },
  { name: "Projects", href: "/projects" },
  { name: "Exploring", href: "/exploring" },
  { name: "About", href: "/about" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-medium tracking-tight mt-8 mb-6">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`transition-colors border-b-2 hover:text-slate-900 dark:hover:text-slate-100 ${
              isActive 
                ? "text-slate-900 font-medium border-slate-900 pb-1 dark:text-slate-100 dark:border-slate-100" 
                : "text-slate-500 border-transparent pb-1 dark:text-slate-400"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
