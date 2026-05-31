import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";

export default function ProjectsPage() {
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
          <p className="text-slate-800 dark:text-slate-200 font-normal text-base leading-relaxed italic">Projects will be listed here.</p>
        </section>
      </main>
    </Container>
  );
}
