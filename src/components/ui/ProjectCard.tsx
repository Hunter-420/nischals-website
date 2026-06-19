import { ExternalLink } from "lucide-react";
import Link from "next/link";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

export interface ProjectCardMetric {
  label: string;
  value: string;
}

export interface ProjectCardLink {
  label: string;
  href: string;
  external?: boolean;
  variant?: "primary" | "secondary";
}

export interface ProjectCardProps {
  title: string;
  description: string;
  tags: string[];
  metrics?: ProjectCardMetric[];
  links: ProjectCardLink[];
  eyebrow?: string;
  focusTitle?: string;
  className?: string;
}

export function ProjectCard({
  title,
  description,
  tags,
  metrics = [],
  links,
  eyebrow = "Preview",
  focusTitle = "Architectural focus",
  className = "",
}: ProjectCardProps) {
  const primaryLink = links.find((link) => link.variant === "primary") ?? links[0];

  return (
    <article className={`overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_1px_0_rgba(15,23,42,0.03)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-slate-700 dark:hover:shadow-slate-950/30 ${className}`}>
      <header className="border-b border-slate-200/80 bg-gradient-to-b from-slate-50 to-transparent px-5 py-5 dark:border-slate-800/80 dark:from-slate-900/60">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <h3 className="text-xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 md:text-[1.35rem] break-words hyphens-auto">
              {title}
            </h3>

            {tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium tracking-wide text-slate-700 dark:bg-slate-800 dark:text-slate-300 break-words"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-shrink-0 items-center gap-2 text-slate-500 dark:text-slate-400">
            {links.filter((link) => link.variant !== "primary").map((link) => {
              const isExternal = link.external ?? true;
              const content = link.label === "GitHub" ? <GithubIcon className="h-4 w-4" /> : <ExternalLink className="h-4 w-4" />;

              return (
                <a
                  key={`${link.label}-${link.href}`}
                  href={link.href}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400 dark:hover:border-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-50"
                  title={link.label}
                  aria-label={link.label}
                >
                  {content}
                </a>
              );
            })}
          </div>
        </div>
      </header>

      <div className="bg-white px-5 py-5 dark:bg-slate-950/30 md:px-6">
        <div className="flex h-full min-w-0 flex-col gap-5">
          {/* <div className="space-y-3 min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              {eyebrow}
            </span>
            <h4 className="break-words hyphens-auto text-left text-2xl font-semibold tracking-tight text-slate-950 dark:text-slate-50 md:text-[1.75rem]">
              {focusTitle}
            </h4>
          </div> */}

          {metrics.length > 0 && (
            <div className="grid gap-0 md:grid-cols-4 md:items-start">
              {/* <div className="space-y-3 md:col-span-1">
                {metrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800/70">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 break-words">
                      {metric.label}
                    </div>
                    <div className="mt-1 break-words text-sm font-medium text-slate-800 dark:text-slate-200">
                      {metric.value}
                    </div>
                  </div>
                ))}
              </div> */}

              <div className="md:col-span-4">
                <p className="break-words hyphens-auto text-left text-sm leading-7 text-slate-600 dark:text-slate-400 md:text-[0.98rem]">
                  {description}
                </p>
              </div>
            </div>
          )}

          {metrics.length === 0 && (
            <p className="break-words hyphens-auto text-left text-sm leading-7 text-slate-600 dark:text-slate-400 md:text-[0.98rem]">
              {description}
            </p>
          )}

          {primaryLink && (
            <div className="mt-auto pt-2">
              {primaryLink.external ? (
                <a
                  href={primaryLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center  text-sm font-semibold text-blue-500 transition-colors"
                >
                  {primaryLink.label} &rarr;
                </a>
              ) : (
                <Link
                  href={primaryLink.href}
                  className="inline-flex w-full items-center justify-center  text-sm font-semibold text-blue-500 transition-colors"
                >
                  {primaryLink.label} &rarr;
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}