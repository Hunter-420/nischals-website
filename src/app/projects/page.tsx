import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";
import { ProjectFactCard } from "@/components/ui/ProjectFactCard";
import connectToDatabase from "@/lib/db";
import Project from "@/models/Project";
import { unstable_cache } from "next/cache";

export const revalidate = 300;

const getProjects = unstable_cache(
  async () => {
    await connectToDatabase();
    return Project.find().sort({ createdAt: -1 }).lean() as Promise<any[]>;
  },
  ["projects-list"],
  { revalidate: 300 }
);

export default async function ProjectsPage() {
  const projects = await getProjects();

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
              <ProjectFactCard key={project._id.toString()} project={project} />
            ))
          ) : (
            <p className="text-slate-500 dark:text-slate-400 italic text-base">Projects will be listed here.</p>
          )}
        </section>
      </main>
    </Container>
  );
}
