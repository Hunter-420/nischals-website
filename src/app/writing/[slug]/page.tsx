import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import connectToDatabase from "@/lib/db";
import Post from "@/models/Post";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ArrowLeft, ArrowRight } from "lucide-react";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  await connectToDatabase();
  const post = await Post.findOne({ slug, published: true }).lean() as any;
  if (!post) return { title: 'Not Found' };
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const description = post.keyTakeaway || post.excerpt || '';
  return {
    title: post.title,
    description,
    alternates: { canonical: `${baseUrl}/writing/${slug}` },
    openGraph: {
      title: post.title,
      description,
      url: `${baseUrl}/writing/${slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      tags: post.tags || [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  await connectToDatabase();
  const post = await Post.findOne({ slug, published: true }).lean() as any;

  if (!post) notFound();

  // Find the next older post (previous chronologically, but next to read)
  const nextPost = await Post.findOne({
    published: true,
    publishedAt: { $lt: post.publishedAt }
  }).sort({ publishedAt: -1 }).lean() as any;

  // Estimate reading time (avg 200 words/min)
  const wordCount = (post.content || '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  return (
    <Container>
      <Navigation />

      <main className="flex-1 mt-8 mb-24 flex flex-col gap-10">
        {/* Back */}
        <Link
          href="/writing"
          className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          All Writing
        </Link>

        <article className="flex flex-col gap-8 max-w-2xl">
          {/* Header */}
          <header className="flex flex-col gap-3">
            <h1 className="text-2xl font-semibold tracking-tight leading-snug text-gray-900 dark:text-gray-100">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="w-4 h-4" />
                <time dateTime={post.publishedAt}>
                  {new Date(post.publishedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </time>
              </span>
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <span>{readingTime} min read</span>
            </div>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {(post.tags as string[]).map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/exploring/tag/${encodeURIComponent(tag.replace(/\s+/g, '-'))}`}
                    className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 px-2.5 py-1 rounded-full transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </header>

          {/* Divider */}
          <div className="border-t border-gray-100 dark:border-gray-800" />

          {/* Content rendered from rich text editor */}
          <div
            className="prose prose-zinc dark:prose-invert max-w-none
              prose-headings:font-semibold prose-headings:tracking-tight
              prose-h2:text-xl prose-h3:text-lg
              prose-p:leading-[1.8] prose-p:font-normal prose-p:text-gray-900 dark:prose-p:text-gray-100
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-code:font-mono prose-code:text-sm prose-code:bg-gray-100 dark:prose-code:bg-gray-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-gray-950 dark:prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800 prose-pre:text-gray-100
              [&_pre_code]:bg-transparent [&_pre_code]:dark:bg-transparent [&_pre_code]:p-0
              prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600 prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
              prose-img:rounded-lg prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: post.content || '' }}
          />

          {/* Footer */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-8 flex items-center justify-between">
            <Link
              href="/writing"
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              ← Back to all writing
            </Link>
            {nextPost && (
              <Link
                href={`/writing/${nextPost.slug}`}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 text-right group"
              >
                <span className="flex flex-col">
                  <span className="text-xs text-gray-400">Next</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:underline">{nextPost.title}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </Link>
            )}
          </div>
        </article>
      </main>
    </Container>
  );
}
