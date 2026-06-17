"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Briefcase, 
  Library, 
  Award, 
  Settings,
  LogOut,
  Clock,
  Compass,
  Menu,
  X,
} from 'lucide-react';
import { signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Posts', href: '/admin/posts', icon: FileText },
  { name: 'Projects', href: '/admin/projects', icon: Briefcase },
  { name: 'Library', href: '/admin/library', icon: Library },
  { name: 'Certifications', href: '/admin/certifications', icon: Award },
  { name: 'Exploring', href: '/admin/exploring', icon: Compass },
  { name: 'Now', href: '/admin/now', icon: Clock },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const navContent = (
    <>
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold tracking-tight text-gray-900">Admin</h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-gray-200 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          Log Out
        </button>
      </div>
    </>
  );

  return (
    <>
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-gray-500">Admin</p>
          <h1 className="text-lg font-bold tracking-tight text-gray-900">Dashboard</h1>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100"
          aria-label="Open admin navigation"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close admin navigation"
          />
          <aside className="absolute left-0 top-0 flex h-full w-80 max-w-[85vw] flex-col bg-gray-50 border-r border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-200 p-4">
              <h2 className="text-lg font-bold tracking-tight text-gray-900">Admin</h2>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-gray-200 text-gray-700 hover:bg-gray-100"
                aria-label="Close admin navigation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {navContent}
          </aside>
        </div>
      )}

      <aside className="hidden md:flex md:w-64 md:flex-col bg-gray-50 border-r border-gray-200 min-h-screen shrink-0">
        {navContent}
      </aside>
    </>
  );
}
