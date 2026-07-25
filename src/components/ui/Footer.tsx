import connectToDatabase from '@/lib/db';
import SiteSettings from '@/models/SiteSettings';
import { Mail } from 'lucide-react';

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

import Link from "next/link";

export async function Footer() {
  await connectToDatabase();
  const settings = await SiteSettings.findOne().lean() as any;
  const links = settings?.socialLinks || {};

  return (
    <footer className="mt-auto py-12 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-8 w-full text-sm">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex flex-col gap-1.5">
          <p className="font-semibold text-slate-900 dark:text-slate-100">{settings?.title || "Nischal Khanal"}</p>
          <p className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            {settings?.openToWorkText || "Interested in Systems & Infrastructure Roles"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 md:gap-6 text-slate-500 dark:text-slate-400 font-medium">
          <Link href="/" className="hover:text-slate-900 dark:hover:text-white transition-colors">Home</Link>
          <Link href="/projects" className="hover:text-slate-900 dark:hover:text-white transition-colors">Projects</Link>
          <Link href="/writing" className="hover:text-slate-900 dark:hover:text-white transition-colors">Blog</Link>
          <Link href="/exploring" className="hover:text-slate-900 dark:hover:text-white transition-colors">Exploring</Link>
          <Link href="/about" className="hover:text-slate-900 dark:hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="hover:text-slate-900 dark:hover:text-white transition-colors">Contact</Link>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-t border-slate-100 dark:border-slate-800/50 pt-8">
        <p className="text-slate-500 dark:text-slate-400">© {new Date().getFullYear()} Nischal Khanal. All rights reserved.</p>
        
        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
          {links.github && (
            <a href={links.github} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="sr-only">GitHub</span>
              <GithubIcon className="w-5 h-5" />
            </a>
          )}
          {links.twitter && (
            <a href={links.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="sr-only">Twitter</span>
              <TwitterIcon className="w-5 h-5" />
            </a>
          )}
          {links.linkedin && (
            <a href={links.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="sr-only">LinkedIn</span>
              <LinkedinIcon className="w-5 h-5" />
            </a>
          )}
          {links.email && (
            <a href={`mailto:${links.email}`} className="hover:text-slate-900 dark:hover:text-white transition-colors">
              <span className="sr-only">Email</span>
              <Mail className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>
    </footer>
  );
}
