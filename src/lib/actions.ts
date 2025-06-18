"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "./supabase/server";

// ========== Project Actions ==========

export type ProjectState = {
  errors?: {
    name?: string[];
  };
  message?: string | null;
};

const ProjectSchema = z.object({
  name: z.string().min(1, { message: "Project name cannot be empty." }),
});

export async function createProject(
  prevState: ProjectState,
  formData: FormData
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "Authentication required." };
  }

  const validatedFields = ProjectSchema.safeParse({
    name: formData.get("name"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name } = validatedFields.data;

  const { error } = await supabase
    .from("projects")
    .insert([{ name, user_id: user.id }]);

  if (error) {
    console.error("Error creating project:", error);
    return {
      message: "Database Error: Failed to Create Project.",
    };
  }

  revalidatePath("/");
  return { message: "Project created successfully." };
}

export async function getProjects() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    // Return empty array or handle error as appropriate
    return [];
  }

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
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "Authentication required." };
  }

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

export type CompetitorState = {
  formErrors?: Record<string, string[] | undefined>;
  message?: string | null;
};

const CompetitorSchema = z.object({
  name: z.string().min(1, "Competitor name is required"),
  projectId: z.string().uuid("Invalid project ID"),
  homepage: z.string().url("Invalid homepage URL").optional().or(z.literal("")),
  shop: z.string().url("Invalid shop URL").optional().or(z.literal("")),
});

export async function createCompetitor(
  prevState: CompetitorState,
  formData: FormData
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "Authentication required." };
  }

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
      formErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  // Validate PDP URLs
  const pdpUrls = rawData.pdps as string[];
  for (const pdp of pdpUrls) {
    if (!z.string().url().safeParse(pdp).success) {
      return {
        formErrors: { pdps: ["One or more PDP URLs are invalid."] },
      };
    }
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
  return { message: "Competitor created successfully." };
}

export async function deleteCompetitor(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "Authentication required." };
  }

  const { error } = await supabase.from("competitors").delete().match({ id });

  if (error) {
    console.error("Error deleting competitor:", error);
    return {
      message: "Database Error: Failed to Delete Competitor.",
    };
  }

  revalidatePath("/");
}
