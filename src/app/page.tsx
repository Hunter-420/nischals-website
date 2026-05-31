import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import Link from "next/link";
import connectToDatabase from "@/lib/db";
import SiteSettings from "@/models/SiteSettings";
import Post from "@/models/Post";

export const revalidate = 60;

async function getHomeData() {
  await connectToDatabase();
  const [settings, recentPosts] = await Promise.all([
    SiteSettings.findOne().lean(),
    Post.find({ published: true }).sort({ publishedAt: -1 }).limit(3).lean(),
  ]);
  return {
    settings: settings as any,
    recentPosts: recentPosts as any[],
  };
}

export default async function Home() {
  const { settings, recentPosts } = await getHomeData();

  const socialLinks = settings?.socialLinks || {};

  return (
    <Container>
      <Navigation />

      <main className="flex-1 mt-8 mb-24 flex flex-col gap-16">
        {/* Hero */}
        <section className="flex flex-col gap-5">
          <h1 className="text-2xl font-semibold tracking-tight">
            {settings?.title || 'Nischal Khanal'}
          </h1>
          <p className="text-gray-900 dark:text-gray-100 font-normal max-w-xl leading-[1.8]">
            {settings?.description || 'Software Engineer exploring systems, market infrastructure, and performance engineering.'}
          </p>

          {settings?.aboutText ? (
            <p className="text-sm text-gray-900 dark:text-gray-100 font-normal max-w-xl leading-[1.8]">
              {settings.aboutText}
            </p>
          ) : (
            <div className="flex flex-col gap-3 max-w-xl">
              <p className="text-sm text-gray-900 dark:text-gray-100 font-normal leading-[1.8]">
                My interests sit at the intersection of networking, operating systems, distributed systems, and modern market infrastructure. I&apos;m currently focused on understanding how information moves through systems, how bottlenecks emerge, and how engineering decisions influence performance under real-world constraints.
              </p>
              <p className="text-sm text-gray-900 dark:text-gray-100 font-normal leading-[1.8]">
                This website documents what I&apos;m building, what I&apos;m learning, and the questions I&apos;m trying to answer.
              </p>
            </div>
          )}

          {/* Quick links */}
          <div className="flex flex-wrap gap-4 text-sm font-medium">
            <Link href="/about" className="text-blue-600 dark:text-blue-400 hover:underline">
              More about me &rarr;
            </Link>
            <Link href="/now" className="text-blue-600 dark:text-blue-400 hover:underline">
              What I&apos;m exploring &rarr;
            </Link>
            <Link href="/what-i-bring" className="text-blue-600 dark:text-blue-400 hover:underline">
              What I Aim to be &rarr;
            </Link>
            <Link href="/resume" className="text-blue-600 dark:text-blue-400 hover:underline">
              Resume &rarr;
            </Link>
          </div>

          {/* Contact / social links */}
          {(socialLinks.email || socialLinks.github || socialLinks.linkedin || socialLinks.twitter) && (
            <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
              {socialLinks.email && (
                <a
                  href={`mailto:${socialLinks.email}`}
                  className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  {socialLinks.email}
                </a>
              )}
              {socialLinks.github && (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  GitHub
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  LinkedIn
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Twitter / X
                </a>
              )}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-base font-semibold tracking-tight">What I&apos;m Exploring</h2>
          <Link
            href="/exploring"
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline transition-colors"
          >
            View what I&apos;m exploring &rarr;
          </Link>
        </section>

        {/* Recent Writing */}
        <section className="flex flex-col gap-5">
          <h2 className="text-base font-semibold tracking-tight">Recent Writing</h2>
          <div className="flex flex-col gap-0">
            {recentPosts.length > 0 ? (
              recentPosts.map((post) => (
                <Link
                  key={post._id.toString()}
                  href={`/writing/${post.slug}`}
                  className="group flex flex-col gap-1 py-4 border-b border-gray-100 dark:border-gray-800 first:pt-0 last:border-0"
                >
                  <span className="text-sm font-medium group-hover:underline">{post.title}</span>
                  {post.excerpt && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {post.excerpt}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic text-sm">No posts yet.</p>
            )}
          </div>
          <Link
            href="/writing"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            View all writing &rarr;
          </Link>
        </section>

        {/* Other Areas */}
        <section className="flex flex-col gap-5">
          <h2 className="text-base font-semibold tracking-tight">Other Areas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <Link href="/library" className="group flex flex-col gap-0.5">
              <span className="font-medium group-hover:underline">Library</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Books I recommend</span>
            </Link>
            <Link href="/certifications" className="group flex flex-col gap-0.5">
              <span className="font-medium group-hover:underline">Certifications</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Professional certs</span>
            </Link>
            <Link href="/resume" className="group flex flex-col gap-0.5">
              <span className="font-medium group-hover:underline">Resume</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">My experience</span>
            </Link>
          </div>
        </section>
      </main>
    </Container>
  );
}
