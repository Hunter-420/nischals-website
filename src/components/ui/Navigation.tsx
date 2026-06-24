import { NavLinks } from "./NavLinks";
import connectToDatabase from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import { unstable_cache } from "next/cache";

/**
 * Cache SiteSettings for 5 minutes.
 * This is the single biggest win: previously every page render did a fresh
 * MongoDB round-trip just to read the Resume URL.  Now it's served from
 * Next.js's in-process data cache and only re-fetched every 5 minutes.
 */
const getCachedSettings = unstable_cache(
  async () => {
    await connectToDatabase();
    const settings = await SiteSettings.findOne().lean() as any;
    return {
      resumeUrl: settings?.resumeUrl ?? null,
      socialLinks: settings?.socialLinks ?? {},
    };
  },
  ["site-settings"],
  { revalidate: 300 } // 5 minutes
);

export async function Navigation() {
  const { resumeUrl } = await getCachedSettings();

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
