import { NextRequest, NextResponse } from "next/server";
import { chromium, devices } from "playwright";

export async function POST(req: NextRequest) {
  const { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  let browser;
  try {
    console.log("Launching browser with Desktop Chrome profile...");
    browser = await chromium.launch();
    const context = await browser.newContext({
      ...devices["Desktop Chrome"],
    });
    const page = await context.newPage();

    console.log(`Navigating to ${url}...`);
    await page.goto(url, { waitUntil: "domcontentloaded" });

    console.log("Grabbing page content...");
    const html = await page.content();

    return NextResponse.json({ html });
  } catch (error) {
    console.error("Error during Playwright operation:", error);
    return NextResponse.json(
      { error: "Failed to fetch the page." },
      { status: 500 }
    );
  } finally {
    if (browser) {
      console.log("Closing browser...");
      await browser.close();
    }
  }
}
