import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import { HeroDiagram } from "@/components/ui/HeroDiagram";
import { ProjectFactCard } from "@/components/ui/ProjectFactCard";
import { TechnicalArticleCard } from "@/components/ui/TechnicalArticleCard";
import Link from "next/link";
import connectToDatabase from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import Post from "@/models/Post";
import Project from "@/models/Project";
import { unstable_cache } from "next/cache";

export const revalidate = 300;

const getHomeData = unstable_cache(
  async () => {
    await connectToDatabase();
    const [settings, recentPosts, featuredProjects] = await Promise.all([
      SiteSettings.findOne().lean(),
      Post.find({ published: true }).sort({ publishedAt: -1 }).limit(3).lean(),
      Project.find({ featured: true }).sort({ createdAt: -1 }).limit(3).lean(),
    ]);
    return {
      settings: settings as any,
      recentPosts: recentPosts as any[],
      featuredProjects: featuredProjects as any[],
    };
  },
  ["home-data"],
  { revalidate: 300 }
);

export default async function Home() {
  const { settings, recentPosts, featuredProjects } = await getHomeData();

  const socialLinks = settings?.socialLinks || {};

  return (
    <Container>
      <Navigation />

      <main className="flex-1 mt-8 mb-24 flex flex-col gap-16">
        {/* Hero */}
        <section className="flex flex-col md:flex-row items-center md:items-start justify-between gap-12 md:gap-8">
          <div className="flex-1 flex flex-col gap-6 w-full">
            <div className="flex flex-col gap-2">
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
                {settings?.title || 'Nischal Khanal'}
              </h1>
              <h2 className="text-xl md:text-2xl font-bold text-accent-blue tracking-tight">
                Systems & Performance Engineer
              </h2>
            </div>

            <p className="text-slate-800 dark:text-slate-200 font-normal text-base max-w-xl leading-relaxed">
              {settings?.description || 'Software Engineer exploring systems, market infrastructure, and performance engineering. Focused on understanding how information moves through systems, market microstructure, and how bottlenecks emerge.'}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-2">
              <a href="/api/resume/download" target="_blank" rel="noopener noreferrer" className="inline-flex justify-center items-center px-5 py-2.5 bg-blue-600 text-white font-bold text-sm rounded-lg hover:opacity-90 transition-opacity">
                Download Resume (PDF)
              </a>
              <a href={socialLinks?.github || "https://github.com"} target="_blank" rel="noopener noreferrer" className="inline-flex justify-center items-center px-5 py-2.5 border-2 border-blue-500 text-blue-600 dark:text-blue-400 font-bold text-sm rounded-lg hover:bg-blue-500/10 transition-colors">
                View GitHub
              </a>
            </div>
            
            {/* Quick links */}
            <div className="flex flex-wrap gap-4 text-sm font-medium mt-4">
              <Link href="/about" className="text-slate-500 dark:text-slate-400 hover:text-accent-blue transition-colors">
                More about me &rarr;
              </Link>
              <Link href="/what-i-bring" className="text-slate-500 dark:text-slate-400 hover:text-accent-blue transition-colors">
                What I Aim to be &rarr;
              </Link>
              <Link href="/exploring" className="text-slate-500 dark:text-slate-400 hover:text-accent-blue transition-colors">
                What I&apos;m exploring &rarr;
              </Link>
              <Link href="/certifications" className="text-slate-500 dark:text-slate-400 hover:text-accent-blue transition-colors">
                Certifications &rarr;
              </Link>
            </div>
          </div>
          
          <div className="w-full md:w-1/2 flex justify-center md:justify-end">
            <HeroDiagram />
          </div>
        </section>

        {/* Featured Projects */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight border-b border-slate-200 dark:border-slate-800 pb-2">Featured Projects</h2>
          <div className="grid grid-cols-1 gap-8">
            {featuredProjects.length > 0 ? (
              featuredProjects.map((project) => (
                <ProjectFactCard key={project._id.toString()} project={project} />
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic text-sm">No featured projects yet.</p>
            )}
          </div>
          <Link
            href="/projects"
            className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-accent-blue transition-colors mt-2"
          >
            View all projects &rarr;
          </Link>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">What I&apos;m up to now?</h2>
          <Link
            href="/now"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline transition-colors"
          >
            View what I&apos;m focused on right now &rarr;
          </Link>
        </section>

        {/* Recent Writing */}
        <section className="flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight border-b border-slate-200 dark:border-slate-800 pb-2">Recent Writing</h2>
          <div className="grid grid-cols-1 gap-4">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <TechnicalArticleCard key={post._id.toString()} post={post} />
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic text-sm">No posts yet.</p>
            )}
          </div>
          <Link
            href="/writing"
            className="text-sm font-medium text-slate-500 dark:text-slate-400 hover:text-accent-blue transition-colors"
          >
            View all writing &rarr;
          </Link>
        </section>

        {/* Other Areas */}
        <section className="flex flex-col gap-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Other Areas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Link href="/library" className="group flex flex-col gap-0.5">
              <span className="font-medium group-hover:underline text-slate-800 dark:text-slate-200">Library</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Books I recommend</span>
            </Link>
            <Link href="/certifications" className="group flex flex-col gap-0.5">
              <span className="font-medium group-hover:underline text-slate-800 dark:text-slate-200">Certifications</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">Professional certs</span>
            </Link>
            <Link href="/resume" className="group flex flex-col gap-0.5">
              <span className="font-medium group-hover:underline text-slate-800 dark:text-slate-200">Resume</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">My experience</span>
            </Link>
          </div>
        </section>
      </main>
    </Container>
  );
}
