import Image from "next/image";
import { getProjects } from "@/lib/actions";
import { AddProjectDialog } from "@/components/add-project-dialog";
import { ProjectCard } from "@/components/project-card";
import { createClient } from "@/lib/supabase/server";
import { AuthForm } from "@/components/auth-form";

export default async function Home() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-4">
        <div className="mb-8">
          <Image src="/logo.svg" alt="Sneakpeak logo" width={240} height={64} />
        </div>
        <AuthForm />
      </div>
    );
  }

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
    <div className="p-4 md:p-6">
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
    </div>
  );
}
