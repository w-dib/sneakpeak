import { NextResponse } from "next/server";
import { z } from "zod";
import { scrapePdpLinks } from "@/lib/scraper";

export async function POST(request: Request) {
  const schema = z.object({
    shopUrl: z.string().url({ message: "Invalid URL format." }),
  });

  try {
    const body = await request.json();
    const validated = schema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        {
          error: "Invalid shopUrl provided.",
          details: validated.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { shopUrl } = validated.data;

    const result = await scrapePdpLinks(shopUrl);

    if (!result.success) {
      return NextResponse.json(
        { error: "Failed to scrape the provided URL.", details: result.error },
        { status: 500 }
      );
    }

    if (result.links.length === 0) {
      return NextResponse.json({
        message: "Successfully scraped, but no PDP links were found.",
        links: [],
      });
    }

    return NextResponse.json({
      message: `Successfully scraped ${result.links.length} PDP links.`,
      links: result.links,
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request body." },
      { status: 400 }
    );
  }
}
