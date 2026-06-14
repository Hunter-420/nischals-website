import { ExternalLink } from "lucide-react";
import Link from "next/link";

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

interface ProjectFactCardProps {
  project: any;
}

export function ProjectFactCard({ project }: ProjectFactCardProps) {
  // Try to use architectureDiagram array, otherwise fallback to an array from technologies
  const diagramNodes = project.architectureDiagram?.length
    ? project.architectureDiagram
    : project.technologies?.slice(0, 3) || ["Input", "Process", "Output"];

  return (
    <div className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 hover:border-slate-300 dark:hover:border-slate-700 transition-colors overflow-hidden">
      {/* Top: Title & Badges */}
      <div className="p-5 border-b border-slate-100 dark:border-slate-800/60 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">
            {project.title}
          </h3>
          {project.technologies && project.technologies.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {project.technologies.map((tech: string) => (
                <span
                  key={tech}
                  className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-mono rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex gap-2 text-slate-400 dark:text-slate-500">
          {project.githubUrl && (
            <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors" title="GitHub">
              <GithubIcon className="w-5 h-5" />
            </a>
          )}
          {project.liveUrl && (
            <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="hover:text-slate-900 dark:hover:text-slate-100 transition-colors" title="Live Site">
              <ExternalLink className="w-5 h-5" />
            </a>
          )}
        </div>
      </div>

      {/* Content Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800/60">
        
        {/* Left Side: Flow Diagram */}
        <div className="p-5 flex flex-col gap-3 justify-center items-center bg-slate-50/50 dark:bg-slate-900/20">
          <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 relative">
            {/* Connecting Line */}
            <div className="absolute top-1/2 left-0 right-0 h-px bg-slate-200 dark:bg-slate-700 -z-10" />
            
            {diagramNodes.map((node: string, idx: number) => (
              <div key={idx} className="flex flex-col items-center gap-1.5 bg-slate-50 dark:bg-slate-900/20">
                <div className="w-2 h-2 rounded-full bg-accent-blue shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                <span className="bg-white dark:bg-deep-dark px-1.5 py-0.5 border border-slate-200 dark:border-slate-700 rounded-sm">
                  {node}
                </span>
              </div>
            ))}
          </div>
          {project.coreProblem && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 text-center">
              {project.coreProblem}
            </p>
          )}
        </div>

        {/* Right Side: Performance Metrics */}
        <div className="p-5 flex flex-col justify-center items-center text-center gap-2">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-500 font-bold">
            Performance Highlight
          </span>
          <div className="text-xl md:text-2xl font-black text-neon-green tracking-tight">
            {project.resultMetric || "Optimized Architecture"}
          </div>
          <Link
            href={`/projects/${project.slug}`}
            className="mt-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-accent-blue dark:hover:text-accent-blue transition-colors"
          >
            Read Case Study &rarr;
          </Link>
        </div>
      </div>
    </div>
  );
}
