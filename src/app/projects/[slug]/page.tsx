import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, ExternalLink } from "lucide-react";

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

export const revalidate = 60;

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

  const publishedDate = project.createdAt || project.updatedAt;

  return (
    <Container>
      <Navigation />

      <main className="flex-1 mt-8 mb-24 flex flex-col gap-10">
        <Link
          href="/projects"
          className="inline-flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          All Projects
        </Link>

        <article className="flex flex-col gap-8 max-w-2xl">
          <header className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Project Case Study
            </p>
            <h1 className="text-2xl font-semibold tracking-tight leading-snug text-slate-900 dark:text-slate-100">
              {project.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
              {publishedDate && (
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
              )}
            </div>

            {project.technologies?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {project.technologies.map((tech: string) => (
                  <span
                    key={tech}
                    className="rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-500 dark:text-slate-400"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            )}
          </header>

          <div className="border-t border-slate-100 dark:border-slate-800" />

          <div
            className="prose prose-zinc dark:prose-invert max-w-none
              prose-headings:font-semibold prose-headings:tracking-tight
              prose-h2:text-2xl prose-h3:text-xl
              prose-p:leading-[1.8] prose-p:font-normal prose-p:text-slate-900 dark:prose-p:text-slate-100
              prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-code:font-inherit prose-code:text-[0.95em] prose-code:bg-transparent prose-code:px-0 prose-code:py-0 prose-code:rounded-none prose-code:before:content-none prose-code:after:content-none
              prose-pre:bg-slate-950 dark:prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-pre:text-slate-100
              [&_pre_code]:bg-transparent [&_pre_code]:dark:bg-transparent [&_pre_code]:p-0
              prose-blockquote:border-l-4 prose-blockquote:border-slate-300 dark:prose-blockquote:border-slate-600 prose-blockquote:text-slate-600 dark:prose-blockquote:text-slate-400
              prose-img:rounded-lg prose-img:shadow-md
              [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:my-6 [&_table]:text-sm
              [&_thead_th]:bg-slate-100 [&_thead_th]:dark:bg-slate-800 [&_thead_th]:font-semibold
              [&_th]:border [&_th]:border-slate-200 [&_th]:dark:border-slate-700 [&_th]:px-4 [&_th]:py-3 [&_th]:text-left
              [&_td]:border [&_td]:border-slate-200 [&_td]:dark:border-slate-700 [&_td]:px-4 [&_td]:py-3"
            dangerouslySetInnerHTML={{ __html: project.content || project.description || '' }}
          />

          <div className="border-t border-slate-100 dark:border-slate-800 pt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              href="/projects"
              className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition-colors"
            >
              ← Back to all projects
            </Link>

            <div className="flex flex-wrap gap-3 text-sm">
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-200 hover:border-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
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
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 dark:border-slate-700 px-4 py-2 text-slate-700 dark:text-slate-200 hover:border-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
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
  );
}
