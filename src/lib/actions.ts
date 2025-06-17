"use server";

import { z } from "zod";
import { supabase } from "./supabase/client";
import { revalidatePath } from "next/cache";

// ========== Project Actions ==========

const ProjectSchema = z.object({
  name: z.string().min(1, { message: "Project name cannot be empty." }),
});

export async function createProject(formData: FormData) {
  const validatedFields = ProjectSchema.safeParse({
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name } = validatedFields.data;

  const { error } = await supabase.from("projects").insert([{ name }]);

  if (error) {
    console.error("Error creating project:", error);
    return {
      message: "Database Error: Failed to Create Project.",
    };
  }

  revalidatePath("/");
}

export async function getProjects() {
  const { data: projects, error } = await supabase.from("projects").select(`
    *,
    competitors (
      *,
      urls (*)
    )
  `);

  if (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
  return projects;
}

export async function deleteProject(id: string) {
  const { error } = await supabase.from("projects").delete().match({ id });

  if (error) {
    console.error("Error deleting project:", error);
    return {
      message: "Database Error: Failed to Delete Project.",
    };
  }

  revalidatePath("/");
}

// ========== Competitor Actions ==========

const CompetitorSchema = z.object({
  name: z.string().min(1, "Competitor name is required"),
  projectId: z.string().uuid("Invalid project ID"),
  homepage: z.string().url("Invalid homepage URL").optional().or(z.literal("")),
  shop: z.string().url("Invalid shop URL").optional().or(z.literal("")),
});

export async function createCompetitor(formData: FormData) {
  const rawData = {
    name: formData.get("name"),
    projectId: formData.get("projectId"),
    homepage: formData.get("homepage"),
    shop: formData.get("shop"),
    pdps: formData.getAll("pdps").filter((pdp) => pdp !== ""),
  };

  const validatedFields = CompetitorSchema.safeParse(rawData);
  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Create competitor
  const { data: competitor, error: competitorError } = await supabase
    .from("competitors")
    .insert({
      name: validatedFields.data.name,
      project_id: validatedFields.data.projectId,
    })
    .select()
    .single();

  if (competitorError) {
    console.error("Error creating competitor:", competitorError);
    return { message: "Database Error: Failed to Create Competitor." };
  }

  // Create associated URLs
  const urlsToInsert = [];
  if (validatedFields.data.homepage) {
    urlsToInsert.push({
      competitor_id: competitor.id,
      url: validatedFields.data.homepage,
      page_type: "Homepage",
    });
  }
  if (validatedFields.data.shop) {
    urlsToInsert.push({
      competitor_id: competitor.id,
      url: validatedFields.data.shop,
      page_type: "Shop",
    });
  }
  for (const pdp of rawData.pdps as string[]) {
    urlsToInsert.push({
      competitor_id: competitor.id,
      url: pdp,
      page_type: "PDP",
    });
  }

  if (urlsToInsert.length > 0) {
    const { error: urlError } = await supabase
      .from("urls")
      .insert(urlsToInsert);
    if (urlError) {
      console.error("Error creating URLs:", urlError);
      return { message: "Database Error: Failed to create URLs." };
    }
  }

  revalidatePath("/");
}

export async function deleteCompetitor(id: string) {
  const { error } = await supabase.from("competitors").delete().match({ id });

  if (error) {
    console.error("Error deleting competitor:", error);
    return {
      message: "Database Error: Failed to Delete Competitor.",
    };
  }

  revalidatePath("/");
}
