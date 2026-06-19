import { ProjectCard } from "@/components/ui/ProjectCard";

interface ProjectFactCardProps {
  project: any;
}

export function ProjectFactCard({ project }: ProjectFactCardProps) {
  const tags = project.technologies?.length ? project.technologies : [];
  const description = project.coreProblem || project.description || "A project case study with implementation details and results.";
  const metrics = [
    ...(tags.length ? [{ label: "Stack", value: `${tags.length} tools` }] : []),
    ...(project.resultMetric ? [{ label: "Signal", value: project.resultMetric }] : []),
  ];

  return (
    <ProjectCard
      title={project.title}
      description={description}
      tags={tags}
      metrics={metrics}
      links={[
        ...(project.githubUrl ? [{ label: "GitHub", href: project.githubUrl, external: true }] : []),
        ...(project.liveUrl ? [{ label: "Live Site", href: project.liveUrl, external: true }] : []),
        { label: "View Architecture", href: `/projects/${project.slug}`, variant: "primary" },
      ]}
    />
  );
}