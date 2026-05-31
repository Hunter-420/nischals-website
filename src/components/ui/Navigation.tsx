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
            className={`transition-colors hover:text-black dark:hover:text-white ${
              isActive ? "text-black dark:text-white" : "text-gray-500 dark:text-gray-400"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
