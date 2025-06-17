"use client";

import { AddCompetitorDialog } from "@/components/add-competitor-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { deleteProject, deleteCompetitor } from "@/lib/actions";
import { Trash2 } from "lucide-react";

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

export function ProjectCard({ project }: { project: Project }) {
  return (
    <div className="border rounded-lg p-4 bg-card text-card-foreground">
      <div className="flex justify-between items-start">
        <h2 className="font-bold text-xl">{project.name}</h2>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" disabled>
            Manual Scrape
          </Button>
          <AddCompetitorDialog projectId={project.id} />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this project and all of its associated competitors and data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={async () => await deleteProject(project.id)}
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold text-lg">Competitors:</h3>
        {project.competitors.length > 0 ? (
          project.competitors.map((competitor) => (
            <div
              key={competitor.id}
              className="flex items-center justify-between ml-4 mt-2"
            >
              <div>
                <p className="font-medium">{competitor.name}</p>
                <ul className="list-disc ml-5 mt-1">
                  {competitor.urls.map((url) => (
                    <li key={url.id} className="text-sm text-muted-foreground">
                      <span className="font-semibold">{url.page_type}:</span>{" "}
                      <a
                        href={url.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                      >
                        {url.url}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      this competitor and all of their tracked URLs.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={async () =>
                        await deleteCompetitor(competitor.id)
                      }
                    >
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground mt-2 ml-4">No competitors yet.</p>
        )}
      </div>
    </div>
  );
}
