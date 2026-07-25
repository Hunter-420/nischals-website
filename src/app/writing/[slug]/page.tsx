import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import { ArticleContent } from "@/components/ui/ArticleContent";
import { fixAnchorLinks } from "@/lib/fixAnchorLinks";
import connectToDatabase from "@/lib/db";
import Post from "@/models/Post";
import SiteSettings from "@/models/SiteSettings";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/ui/JsonLd";
import { ReactButton } from "@/components/ui/ReactButton";

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

export const revalidate = 300; // Re-generate at most every 5 minutes
export const dynamicParams = true; // Serve new slugs via SSR until next build

// Pre-render every published article at build time → zero DB latency on visit
export async function generateStaticParams() {
  await connectToDatabase();
  const posts = await Post.find({ published: true }).select('slug').lean() as any[];
  return posts.map((p) => ({ slug: p.slug }));
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  await connectToDatabase();
  const post = await Post.findOne({ slug, published: true }).lean() as any;
  if (!post) return { title: 'Not Found' };
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://khanalnischal.com.np').replace(/\/$/, '');
  const description = post.keyTakeaway || post.excerpt || '';
  const imageUrl = `${baseUrl}/writing/${slug}/opengraph-image`;
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
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;

  await connectToDatabase();
  const [post, settings] = await Promise.all([
    Post.findOne({ slug, published: true }).lean() as any,
    SiteSettings.findOne().lean() as any
  ]);

  if (!post) notFound();

  // Fix internal anchor links (#heading) that TipTap may have absolutised,
  // and add id attributes to headings so TOC navigation works.
  const processedContent = fixAnchorLinks(post.content || '');

  // Find the next older post (previous chronologically, but next to read)
  const nextPost = await Post.findOne({
    published: true,
    publishedAt: { $lt: post.publishedAt }
  }).sort({ publishedAt: -1 }).lean() as any;

  // Find the previous newer post (next chronologically)
  const previousPost = await Post.findOne({
    published: true,
    publishedAt: { $gt: post.publishedAt }
  }).sort({ publishedAt: 1 }).lean() as any;

  // Find related posts (same tags, not this post)
  const relatedPosts = await Post.find({
    published: true,
    _id: { $ne: post._id },
    tags: { $in: post.tags || [] }
  }).sort({ publishedAt: -1 }).limit(2).lean() as any[];

  // Estimate reading time (avg 200 words/min)
  const wordCount = (post.content || '').replace(/<[^>]+>/g, '').split(/\s+/).filter(Boolean).length;
  const readingTime = Math.max(1, Math.round(wordCount / 200));

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://khanalnischal.com.np').replace(/\/$/, '');
  const url = `${baseUrl}/writing/${slug}`;
  const imageUrl = `${baseUrl}/writing/${slug}/opengraph-image`;

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": "Blog", "item": `${baseUrl}/writing` },
      { "@type": "ListItem", "position": 3, "name": post.title, "item": url }
    ]
  };

  const blogPosting = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "image": [imageUrl],
    "datePublished": post.publishedAt,
    "dateModified": post.updatedAt || post.publishedAt,
    "author": [{
      "@type": "Person",
      "name": "Nischal Khanal",
      "url": baseUrl
    }]
  };

  return (
    <>
      <JsonLd data={breadcrumbList} />
      <JsonLd data={blogPosting} />
      <Container>
        <Navigation />

      <main className="flex-1 mt-8 mb-24 flex flex-col gap-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 self-start">
          <Link href="/" className="hover:text-black dark:hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/writing" className="hover:text-black dark:hover:text-white transition-colors">Blog</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900 dark:text-gray-100 truncate max-w-[200px] sm:max-w-xs">{post.title}</span>
        </nav>

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
              <span className="text-gray-300 dark:text-gray-600">·</span>
              <ReactButton type="post" slug={post.slug} />
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
          <ArticleContent
            html={processedContent}
            className="prose prose-zinc dark:prose-invert max-w-none
              prose-headings:font-semibold prose-headings:tracking-tight
              prose-h2:text-xl prose-h3:text-lg
              prose-p:leading-[1.8] prose-p:font-normal prose-p:text-gray-900 dark:prose-p:text-gray-100
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              [&_a]:break-words [&_a]:overflow-wrap-anywhere
              prose-code:font-inherit prose-code:text-[0.95em] prose-code:bg-transparent prose-code:px-0 prose-code:py-0 prose-code:rounded-none prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-gray-950 dark:prose-pre:bg-gray-900 prose-pre:border prose-pre:border-gray-800 prose-pre:text-gray-100
              [&_pre_code]:bg-transparent [&_pre_code]:dark:bg-transparent [&_pre_code]:p-0
              prose-blockquote:border-l-4 prose-blockquote:border-gray-300 dark:prose-blockquote:border-gray-600 prose-blockquote:text-gray-600 dark:prose-blockquote:text-gray-400
              prose-img:rounded-lg prose-img:shadow-md
              [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:my-6 [&_table]:text-sm
              [&_thead_th]:bg-gray-100 [&_thead_th]:dark:bg-gray-800 [&_thead_th]:font-semibold
              [&_th]:border [&_th]:border-gray-200 [&_th]:dark:border-gray-700 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left
              [&_td]:border [&_td]:border-gray-200 [&_td]:dark:border-gray-700 [&_td]:px-4 [&_td]:py-3"
          />

          {/* Share & Author Block */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-8 mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="flex flex-col">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Nischal Khanal</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">Systems & Performance Engineer</span>
                <span className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <Link href="/contact" className="hover:underline">
                    {settings?.openToWorkText || "Interested in Systems & Infrastructure Roles"}
                  </Link>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">Share</span>
              <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(url)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400 transition-colors">
                <LinkedinIcon className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Related Posts */}
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-800 pt-8 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Related Reading</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPosts.map((rp) => (
                  <Link key={rp.slug} href={`/writing/${rp.slug}`} className="block p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50 hover:border-gray-200 dark:hover:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-1">{rp.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{rp.keyTakeaway || rp.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="border-t border-gray-100 dark:border-gray-800 pt-8 mt-4 flex items-center justify-between gap-4">
            {previousPost ? (
              <Link
                href={`/writing/${previousPost.slug}`}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 group"
              >
                <ArrowLeft className="w-4 h-4 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
                <span className="flex flex-col">
                  <span className="text-xs text-gray-400">Previous</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:underline truncate max-w-[120px] sm:max-w-[200px]">{previousPost.title}</span>
                </span>
              </Link>
            ) : (
              <Link
                href="/writing"
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                All Writing
              </Link>
            )}
            {nextPost && (
              <Link
                href={`/writing/${nextPost.slug}`}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors flex items-center gap-2 text-right group ml-auto"
              >
                <span className="flex flex-col">
                  <span className="text-xs text-gray-400">Next</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:underline truncate max-w-[120px] sm:max-w-[200px]">{nextPost.title}</span>
                </span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-900 dark:group-hover:text-gray-100" />
              </Link>
            )}
          </div>
        </article>
      </main>
    </Container>
    </>
  );
}
