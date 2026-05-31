import { Container } from "@/components/ui/Container";
import { Navigation } from "@/components/ui/Navigation";

export default function ProjectsPage() {
  return (
    <Container>
      <Navigation />
      
      <main className="flex-1 mt-8 mb-24 flex flex-col gap-12">
        <header className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
          <p className="text-gray-900 dark:text-gray-100 font-normal leading-[1.8]">
            A selection of projects I&apos;ve built over the years.
          </p>
        </header>

        <section className="flex flex-col gap-8">
          <p className="text-sm text-gray-900 dark:text-gray-100 font-normal leading-[1.8] italic">Projects will be listed here.</p>
        </section>
      </main>
    </Container>
  );
}
