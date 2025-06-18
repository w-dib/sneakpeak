"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "./supabase/server";
import { scrapePdpLinks } from "./scraper";

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
  shop: z.string().url("A valid shop/collection URL is required"),
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

  const validatedFields = CompetitorSchema.safeParse({
    name: formData.get("name"),
    projectId: formData.get("projectId"),
    shop: formData.get("shop"),
  });

  if (!validatedFields.success) {
    return {
      formErrors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { name, projectId, shop } = validatedFields.data;

  // 1. Scrape the links first. This prevents creating an orphan competitor if scraping fails.
  const scrapeResult = await scrapePdpLinks(shop);

  if (!scrapeResult.success) {
    return { formErrors: { shop: [scrapeResult.error] } };
  }

  if (scrapeResult.links.length === 0) {
    return {
      formErrors: {
        shop: ["No product links found. Please check the URL."],
      },
    };
  }

  // 2. Create the competitor in the database.
  const { data: competitor, error: competitorError } = await supabase
    .from("competitors")
    .insert({
      name: name,
      project_id: projectId,
    })
    .select()
    .single();

  if (competitorError) {
    console.error("Error creating competitor:", competitorError);
    return { message: "Database Error: Failed to Create Competitor." };
  }

  // 3. Prepare and insert the scraped PDP URLs and the main shop URL.
  type UrlToInsert = {
    competitor_id: string;
    url: string;
    page_type: "PDP" | "Shop" | "Homepage";
  };

  const urlsToInsert: UrlToInsert[] = scrapeResult.links.map((link) => ({
    competitor_id: competitor.id,
    url: link,
    page_type: "PDP",
  }));

  urlsToInsert.push({
    competitor_id: competitor.id,
    url: shop,
    page_type: "Shop",
  });

  const { error: urlError } = await supabase.from("urls").insert(urlsToInsert);

  if (urlError) {
    console.error("Error creating URLs:", urlError);
    // At this point, the competitor exists but the URLs failed to save.
    // A more robust solution could involve deleting the just-created competitor.
    // For now, we will return a generic error.
    return { message: "Database Error: Failed to save PDP URLs." };
  }

  revalidatePath("/");
  return { message: "Competitor and products added successfully." };
}

export async function deleteCompetitor(id: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { message: "Authentication required." };
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { error } = await supabase.from("competitors").delete().match({ id });

  if (error) {
    console.error("Error deleting competitor:", error);
    return {
      message: "Database Error: Failed to Delete Competitor.",
    };
  }

  revalidatePath("/");
}
