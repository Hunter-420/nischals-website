"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const navItems = [
  { name: "Home", href: "/" },
  { name: "Projects", href: "/projects" },
  { name: "Blog", href: "/writing" },
  { name: "Exploring", href: "/exploring" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function NavLinks() {
  const pathname = usePathname();

  return (
    <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm font-medium tracking-tight">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`transition-colors border-b-2 hover:text-black ${
              isActive 
                ? "text-black font-medium border-slate-900 pb-1 " 
                : "text-slate-700 border-transparent pb-1 "
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </div>
  );
}
