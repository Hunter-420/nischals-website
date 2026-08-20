import { NavLinks } from "./NavLinks";
import { MobileNavFallback } from "./MobileNavFallback";
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
    <>
      {/* Desktop Navigation (Hidden on small screens) */}
      <nav className="hidden md:flex flex-wrap items-center justify-between gap-6 w-full mt-8 mb-6">
        <NavLinks />

          {resumeUrl ? (
            <a
              href="/resume"
              className="px-5 py-2 text-sm font-bold bg-black text-white rounded-full hover:bg-gray-800 hover:scale-105 hover:shadow-lg transition-all duration-300 shadow-md"
            >
              Resume
            </a>
          ) : (
            <a
              href="/resume"
              className="px-5 py-2 text-sm font-bold border-2 border-black text-black rounded-full hover:bg-black hover:text-white hover:scale-105 transition-all duration-300"
            >
              Resume
            </a>
          )}
      </nav>

      {/* Mobile Navigation Fallback (Only shows on non-home pages) */}
      <MobileNavFallback />
    </>
  );
}
