import { NavLinks } from "./NavLinks";
import connectToDatabase from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";

export async function Navigation() {
  await connectToDatabase();
  const settings = await SiteSettings.findOne().lean() as any;
  const socialLinks = settings?.socialLinks || {};
  const resumeUrl = settings?.resumeUrl;

  return (
    <nav className="flex flex-wrap items-center justify-between gap-6 w-full mt-8 mb-6">
      <NavLinks />

        {resumeUrl ? (
          <a
            href="/resume"
            className="px-4 py-1.5 text-sm font-semibold bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-sm"
          >
            Resume
          </a>
        ) : (
          <a
            href="/resume"
            className="px-4 py-1.5 text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Resume
          </a>
        )}

    </nav>
  );
}
