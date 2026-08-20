import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import { ArticleContent } from "@/components/ui/ArticleContent";
import { fixAnchorLinks } from "@/lib/fixAnchorLinks";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import Post from "@/models/Post";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink, ChevronRight } from "lucide-react";
import { JsonLd } from "@/components/ui/JsonLd";
import { ReactButton } from "@/components/ui/ReactButton";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export const revalidate = 300;
export const dynamicParams = true;

// Pre-render all project pages at build time → instant navigation
export async function generateStaticParams() {
  try {
    await connectToDatabase();
    const projects = await Project.find().select('slug').lean() as any[];
    return projects.map((p) => ({ slug: p.slug }));
  } catch {
    // No DB at build time (CI) — pages will be rendered on-demand
    return [];
  }
}

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  await connectToDatabase();
  const project = await Project.findOne({ slug }).lean() as any;

  if (!project) {
    return { title: 'Not Found' };
  }

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://khanalnischal.com.np').replace(/\/$/, '');
  const description = project.coreProblem || project.description || '';

  return {
    title: project.title,
    description,
    alternates: {
      canonical: `${baseUrl}/projects/${slug}`,
    },
    openGraph: {
      title: project.title,
      description,
      url: `${baseUrl}/projects/${slug}`,
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description,
    },
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;

  await connectToDatabase();
  const project = await Project.findOne({ slug }).lean() as any;

  if (!project) notFound();

  // Fix internal anchor links (#heading) that may have been absolutised,
  // and add id attributes to headings so TOC navigation works.
  const processedContent = fixAnchorLinks(project.content || project.description || '');

  const publishedDate = project.createdAt || project.updatedAt;

  // Find related blogs (posts matching project technologies)
  const relatedPosts = project.technologies && project.technologies.length > 0 
    ? await Post.find({
        published: true,
        tags: { $in: project.technologies }
      }).sort({ publishedAt: -1 }).limit(2).lean() as any[]
    : [];

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://khanalnischal.com.np').replace(/\/$/, '');
  const url = `${baseUrl}/projects/${slug}`;

  const breadcrumbList = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": "Projects", "item": `${baseUrl}/projects` },
      { "@type": "ListItem", "position": 3, "name": project.title, "item": url }
    ]
  };

  const softwareApp = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": project.title,
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0"
    }
  };

  return (
    <>
      <JsonLd data={breadcrumbList} />
      <JsonLd data={softwareApp} />
      <Container>
        <Navigation />

      <main className="flex-1 mt-8 mb-24 flex flex-col gap-10">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm text-slate-700 self-start">
          <Link href="/" className="hover:text-black transition-colors">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/projects" className="hover:text-black transition-colors">Projects</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-black truncate max-w-[200px] sm:max-w-xs">{project.title}</span>
        </nav>

        <article className="flex flex-col gap-8 max-w-2xl">
          <header className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-700 ">
              Project Case Study
            </p>
            <h1 className="text-2xl font-semibold tracking-tight leading-snug text-black ">
              {project.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-700 ">
              {publishedDate && (
                <>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="w-4 h-4" />
                    <time dateTime={publishedDate}>
                      {new Date(publishedDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </span>
                  <span className="text-slate-300 ">·</span>
                </>
              )}
              <ReactButton type="project" slug={project.slug} />
            </div>

            {project.technologies?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech: string) => (
                  <span
                    key={tech}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700 "
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="border-t border-slate-100 " />

          <ArticleContent
            html={processedContent}
            className="prose prose-zinc max-w-none
              prose-headings:font-semibold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h3:text-xl
              prose-p:leading-[1.8] prose-p:font-normal prose-p:text-black               prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
              [&_a]:break-words [&_a]:overflow-wrap-anywhere
              prose-code:font-inherit prose-code:text-[0.95em] prose-code:bg-transparent prose-code:px-0 prose-code:py-0 prose-code:rounded-none prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-slate-950 prose-pre:border prose-pre:border-slate-800 prose-pre:text-slate-100
              [&_pre_code]:bg-transparent [&_pre_code]:[&_pre_code]:p-0
              prose-blockquote:border-l-4 prose-blockquote:border-slate-300 prose-blockquote:text-slate-600               prose-img:rounded-lg prose-img:shadow-md
              [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:my-6 [&_table]:text-sm
              [&_thead_th]:bg-slate-100 [&_thead_th]:[&_thead_th]:font-semibold
              [&_th]:border [&_th]:border-slate-200 [&_th]:[&_th]:px-4 [&_th]:py-3 [&_th]:text-left
              [&_td]:border [&_td]:border-slate-200 [&_td]:[&_td]:px-4 [&_td]:py-3"
          />

          {/* Related Blogs */}
          {relatedPosts && relatedPosts.length > 0 && (
            <div className="border-t border-slate-100 pt-8 mt-4">
              <h3 className="text-lg font-semibold text-black mb-4">Related Writing</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedPosts.map((rp) => (
                  <Link key={rp.slug} href={`/writing/${rp.slug}`} className="block p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 hover:bg-slate-50 transition-colors">
                    <h4 className="font-medium text-black mb-1">{rp.title}</h4>
                    <p className="text-sm text-slate-700 line-clamp-2">{rp.keyTakeaway || rp.excerpt}</p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="border-t border-slate-100 pt-8 mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/projects"
              className="text-sm text-slate-700 hover:text-black transition-colors"
            >
              ← Back to all projects
            </Link>

            <div className="flex flex-wrap gap-3 text-sm">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-700 hover:border-slate-400 hover:text-black transition-colors"
                >
                  <GithubIcon className="w-4 h-4" />
                  GitHub
                </a>
              )}
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-slate-700 hover:border-slate-400 hover:text-black transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  Live Site
                </a>
              )}
            </div>
          </div>
        </article>
      </main>
    </Container>

      {/* Floating Action Buttons */}
      {(project.githubUrl || project.liveUrl) && (
        <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-50">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-slate-900 text-white rounded-full shadow-lg hover:scale-105 transition-transform"
              title="View on GitHub"
            >
              <GithubIcon className="w-5 h-5" />
            </a>
          )}
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:scale-105 transition-transform"
              title="Visit Live Site"
            >
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>
      )}
    </>
  );
}
