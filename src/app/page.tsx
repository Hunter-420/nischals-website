import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import Link from "next/link";
import connectToDatabase from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import Post from "@/models/Post";
import Project from "@/models/Project";

export const revalidate = 60;

async function getHomeData() {
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
}

export default async function Home() {
  const { settings, recentPosts, featuredProjects } = await getHomeData();

  const socialLinks = settings?.socialLinks || {};

  return (
    <Container>
      <Navigation />

      <main className="flex-1 mt-8 mb-24 flex flex-col gap-16">
        {/* Hero */}
        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
              {settings?.title || 'Nischal Khanal'}
            </h1>
            <p className="text-slate-800 dark:text-slate-200 font-normal text-base max-w-xl leading-relaxed">
              {settings?.description || 'Software Engineer exploring systems, market infrastructure, and performance engineering.'}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-2">
            {(settings?.skills?.length ? settings.skills : ['C++', 'Go', 'Rust', 'Python', 'TCP/IP', 'Distributed Systems']).map((tech: string) => (
              <span key={tech} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700">
                {tech}
              </span>
            ))}
          </div>

          {settings?.aboutText ? (
            <p className="text-slate-800 dark:text-slate-200 font-normal text-base max-w-xl leading-relaxed">
              {settings.aboutText}
            </p>
          ) : (
            <div className="flex flex-col gap-4 max-w-xl">
              <p className="text-slate-800 dark:text-slate-200 font-normal text-base leading-relaxed">
                My interests sit at the intersection of networking, operating systems, <strong>distributed systems</strong>, and modern <strong>exchange architecture</strong>.
              </p>
              <p className="text-slate-800 dark:text-slate-200 font-normal text-base leading-relaxed">
                I&apos;m currently focused on understanding how information moves through systems, <strong>market microstructure</strong>, how bottlenecks emerge, and how engineering decisions influence performance under real-world constraints.
              </p>
              <p className="text-slate-800 dark:text-slate-200 font-normal text-base leading-relaxed">
                This website documents what I&apos;m building, what I&apos;m learning, and the questions I&apos;m trying to answer.
              </p>
            </div>
          )}

          {/* Quick links */}
          <div className="flex flex-wrap gap-4 text-sm font-medium mt-2">
            <Link href="/about" className="text-blue-600 dark:text-blue-400 hover:underline">
              More about me &rarr;
            </Link>
            <Link href="/what-i-bring" className="text-blue-600 dark:text-blue-400 hover:underline">
              What I Aim to be &rarr;
            </Link>
          </div>
        </section>

        {/* Featured Projects */}
        <section className="flex flex-col gap-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Featured Projects</h2>
          <div className="flex flex-col gap-6">
            {featuredProjects.length > 0 ? (
              featuredProjects.map((project) => (
                <div key={project._id.toString()} className="flex flex-col gap-2 p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
                      {project.title}
                    </h3>
                    {(project.githubUrl || project.liveUrl) && (
                      <div className="flex gap-3 text-sm">
                        {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">GitHub</a>}
                        {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">Live</a>}
                      </div>
                    )}
                  </div>
                  
                  {project.coreProblem && (
                    <div className="text-sm text-slate-700 dark:text-slate-300">
                      <span className="font-semibold text-slate-900 dark:text-slate-100">The Problem: </span>
                      {project.coreProblem}
                    </div>
                  )}
                  
                  {project.technologies && project.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-1">
                      {project.technologies.map((tech: string) => (
                        <span key={tech} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}

                  {project.resultMetric && (
                    <div className="mt-2 text-sm font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 rounded-lg border border-emerald-100 dark:border-emerald-900/50">
                      🚀 {project.resultMetric}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic text-sm">No featured projects yet.</p>
            )}
          </div>
          <Link
            href="/projects"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline transition-colors mt-2"
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
        <section className="flex flex-col gap-5">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">Recent Writing</h2>
          <div className="flex flex-col gap-0">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <Link
                  key={post._id.toString()}
                  href={`/writing/${post.slug}`}
                  className="group flex flex-col gap-1 py-4 border-b border-slate-100 dark:border-slate-800 first:pt-0 last:border-0"
                >
                  <span className="text-sm font-medium text-slate-900 dark:text-slate-100 group-hover:underline">{post.title}</span>
                  {post.excerpt && (
                    <span className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                      {post.excerpt}
                    </span>
                  )}
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-slate-500 dark:text-slate-400 italic text-sm">No posts yet.</p>
            )}
          </div>
          <Link
            href="/writing"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline transition-colors"
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
