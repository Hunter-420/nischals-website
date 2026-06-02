import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";

export const revalidate = 60;

export default async function ProjectsPage() {
  await connectToDatabase();
  const projects = await Project.find().sort({ createdAt: -1 }).lean() as any[];

  return (
    <Container>
      <Navigation />
      
      <main className="flex-1 mt-8 mb-24 flex flex-col gap-12">
        <header className="flex flex-col gap-4">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">Projects</h1>
          <p className="text-slate-800 dark:text-slate-200 font-normal text-base leading-relaxed">
            A selection of projects I&apos;ve built over the years.
          </p>
        </header>

        <section className="flex flex-col gap-8">
          {projects.length > 0 ? (
            projects.map((project) => (
              <div key={project._id.toString()} className="flex flex-col gap-3 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xl">
                    {project.title}
                  </h3>
                  {(project.githubUrl || project.liveUrl) && (
                    <div className="flex gap-4 text-sm font-medium">
                      {project.githubUrl && <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">GitHub &rarr;</a>}
                      {project.liveUrl && <a href={project.liveUrl} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">Live &rarr;</a>}
                    </div>
                  )}
                </div>
                
                {project.coreProblem && (
                  <div className="text-base text-slate-700 dark:text-slate-300">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">The Problem: </span>
                    {project.coreProblem}
                  </div>
                )}
                
                {project.description && !project.coreProblem && (
                  <p className="text-base text-slate-700 dark:text-slate-300 leading-relaxed">
                    {project.description}
                  </p>
                )}

                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {project.technologies.map((tech: string) => (
                      <span key={tech} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-md border border-slate-200 dark:border-slate-700">
                        {tech}
                      </span>
                    ))}
                  </div>
                )}

                {project.resultMetric && (
                  <div className="mt-4 text-sm font-medium text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 px-4 py-3 rounded-xl border border-emerald-200 dark:border-emerald-900/60 shadow-sm">
                    🚀 {project.resultMetric}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-slate-500 dark:text-slate-400 italic text-base">Projects will be listed here.</p>
          )}
        </section>
      </main>
    </Container>
  );
}
