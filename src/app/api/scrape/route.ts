import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/client";
import { scrapeUrl } from "@/lib/scraper";
import { generateDiff } from "@/lib/differ";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", {
      status: 401,
    });
  }

  try {
    // 1. Fetch all URLs to be scraped
    const { data: urls, error: urlsError } = await supabase
      .from("urls")
      .select("id, url");

    if (urlsError) {
      throw new Error(`Failed to fetch URLs: ${urlsError.message}`);
    }

    if (!urls || urls.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No URLs to scrape.",
      });
    }

    // 2. Process each URL
    for (const url of urls) {
      // 2a. Get the most recent successful snapshot for this URL
      const { data: lastSnapshot, error: lastSnapshotError } = await supabase
        .from("snapshots")
        .select("content")
        .eq("url_id", url.id)
        .eq("status", "Success")
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (lastSnapshotError && lastSnapshotError.code !== "PGRST116") {
        // Ignore 'No rows found' error
        console.error(
          `Error fetching last snapshot for ${url.url}:`,
          lastSnapshotError
        );
        continue; // Skip to next URL
      }

      // 2b. Scrape the current content
      const scrapeResult = await scrapeUrl(url.url);

      // 2c. Store the new snapshot
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

      // 2d. Compare and store diff if content has changed
      if (scrapeResult.success && lastSnapshot?.content) {
        const diffContent = generateDiff(
          lastSnapshot.content,
          scrapeResult.data
        );

        if (diffContent !== "No significant changes detected.") {
          const { error: diffError } = await supabase.from("diffs").insert({
            snapshot_id: newSnapshot.id,
            diff_content: diffContent,
          });

          if (diffError) {
            console.error(`Error inserting diff for ${url.url}:`, diffError);
          }
        }
      }
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
