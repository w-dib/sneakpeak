import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { scrapeUrl } from "@/lib/scraper";
import { generateDiff } from "@/lib/differ";
import { sendEmail, ChangeDetail } from "@/lib/emailer";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    const { data: projects, error: projectsError } = await supabase.from(
      "projects"
    ).select(`
        name,
        competitors (
          name,
          urls (
            id,
            url,
            page_type
          )
        )
      `);

    if (projectsError)
      throw new Error(`Failed to fetch projects: ${projectsError.message}`);
    if (!projects || projects.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No projects to scrape.",
      });
    }

    const allChanges: ChangeDetail[] = [];

    for (const project of projects) {
      for (const competitor of project.competitors) {
        for (const url of competitor.urls) {
          const { data: lastSnapshot } = await supabase
            .from("snapshots")
            .select("content")
            .eq("url_id", url.id)
            .eq("status", "Success")
            .order("created_at", { ascending: false })
            .limit(1)
            .single();

          const scrapeResult = await scrapeUrl(url.url);

          const { data: newSnapshot, error: newSnapshotError } = await supabase
            .from("snapshots")
            .insert({
              url_id: url.id,
              content: scrapeResult.success ? scrapeResult.data : null,
              status: scrapeResult.success ? "Success" : "Could not fetch",
            })
            .select("id")
            .single();

          if (newSnapshotError) {
            console.error(
              `Error inserting new snapshot for ${url.url}:`,
              newSnapshotError
            );
            continue;
          }

          if (scrapeResult.success && lastSnapshot?.content) {
            const diffContent = generateDiff(
              lastSnapshot.content,
              scrapeResult.data
            );
            if (diffContent !== "No significant changes detected.") {
              const { error: diffError } = await supabase
                .from("diffs")
                .insert({
                  snapshot_id: newSnapshot.id,
                  diff_content: diffContent,
                });

              if (diffError) {
                console.error(
                  `Error inserting diff for ${url.url}:`,
                  diffError
                );
              } else {
                allChanges.push({
                  projectName: project.name,
                  competitorName: competitor.name,
                  url: url.url,
                  pageType: url.page_type,
                  diffContent,
                });
              }
            }
          }
        }
      }
    }

    if (process.env.EMAIL_RECIPIENT) {
      await sendEmail(allChanges, process.env.EMAIL_RECIPIENT);
    } else {
      console.log("No EMAIL_RECIPIENT set, skipping email.");
    }

    return NextResponse.json({
      success: true,
      message: "Scraping job completed.",
    });
  } catch (error) {
    console.error("An error occurred during the scraping process:", error);
    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { success: false, error: "An unknown error occurred." },
      { status: 500 }
    );
  }
}
