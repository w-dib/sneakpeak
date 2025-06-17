import Image from "next/image";
import { getProjects } from "@/lib/actions";
import { AddProjectDialog } from "@/components/add-project-dialog";
import { ProjectCard } from "@/components/project-card";

export default async function Home() {
  const projects = await getProjects();

  type Url = {
    id: string;
    url: string;
    page_type: string;
  };

  type Competitor = {
    id: string;
    name: string;
    urls: Url[];
  };

  type Project = {
    id: string;
    name: string;
    competitors: Competitor[];
  };

  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex items-center h-16 px-4 border-b shrink-0 md:px-6">
        <Image src="/logo.svg" alt="Sneakpeak logo" width={120} height={32} />
      </header>
      <main className="flex-1 p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Projects</h1>
          <AddProjectDialog />
        </div>

        <div className="grid gap-6">
          {projects && projects.length > 0 ? (
            projects.map((project: Project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          ) : (
            <div className="text-center py-10 border-dashed border-2 rounded-lg">
              <p className="text-lg font-semibold text-muted-foreground">
                No projects found.
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                Create your first project to start tracking competitors.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
