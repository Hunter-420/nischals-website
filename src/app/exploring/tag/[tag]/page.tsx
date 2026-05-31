import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import connectToDatabase from "@/lib/db";
import Post from "@/models/Post";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { notFound } from "next/navigation";

export const revalidate = 60;

interface Props {
  params: Promise<{ tag: string }>;
}

export default async function ExploringTagPage({ params }: Props) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag).replace(/-/g, ' ');

  await connectToDatabase();
  const posts = await Post.find({
    published: true,
    tags: { $regex: new RegExp(`^${tag}$`, 'i') },
  })
    .sort({ publishedAt: -1 })
    .lean();

  return (
    <Container>
      <Navigation />

      <main className="flex-1 mt-8 mb-24 flex flex-col gap-10">
        {/* Back link */}
        <Link
          href="/exploring"
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Exploring
        </Link>

        {/* Header */}
        <header className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              Tagged
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight capitalize">{tag}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {posts.length === 0
              ? 'No posts written about this topic yet.'
              : `${posts.length} ${posts.length === 1 ? 'post' : 'posts'} on this topic`}
          </p>
        </header>

        {/* Posts list */}
        {(posts as any[]).length > 0 && (
          <section className="flex flex-col gap-6">
            {(posts as any[]).map((post) => (
              <Link
                key={post._id.toString()}
                href={`/writing/${post.slug}`}
                className="group flex flex-col gap-2 border-b border-gray-100 dark:border-gray-800 pb-6 last:border-0 last:pb-0"
              >
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:underline leading-snug">
                  {post.title}
                </h2>
                {post.excerpt && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {post.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-1">
                  <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                    <CalendarDays className="w-3.5 h-3.5" />
                    {new Date(post.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  {/* Other tags */}
                  {post.tags && post.tags.length > 1 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {(post.tags as string[])
                        .filter((t: string) => t.toLowerCase() !== tag.toLowerCase())
                        .slice(0, 3)
                        .map((t: string) => (
                          <span
                            key={t}
                            className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full"
                          >
                            {t}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </section>
        )}
      </main>
    </Container>
  );
}
