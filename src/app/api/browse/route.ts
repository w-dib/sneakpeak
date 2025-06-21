import { NextRequest, NextResponse } from "next/server";
import { chromium, devices } from "playwright";

export async function POST(req: NextRequest) {
  let { url } = await req.json();

  if (!url) {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  // Prepend https:// if no protocol is present
  if (!/^(https?:\/\/)/i.test(url)) {
    url = `https://${url}`;
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

    console.log("Taking full page screenshot...");
    const screenshotBuffer = await page.screenshot({
      fullPage: true,
      type: "jpeg",
      quality: 80,
    });
    const screenshotBase64 = screenshotBuffer.toString("base64");

    console.log("Generating element map...");
    const elementMap = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll("body *"));
      return elements
        .map((element) => {
          const { x, y, width, height } = element.getBoundingClientRect();
          if (width === 0 || height === 0) return null;

          // A simple selector generator (can be improved)
          const getSelector = (el: Element): string => {
            if (el.id) return `#${el.id}`;
            let selector = el.tagName.toLowerCase();
            if (el.className) {
              selector += `.${Array.from(el.classList).join(".")}`;
            }
            // Basic nth-child selector for more specificity
            if (el.parentElement) {
              const siblings = Array.from(el.parentElement.children);
              const index = siblings.indexOf(el);
              if (index !== -1) {
                selector += `:nth-child(${index + 1})`;
              }
            }
            return selector;
          };

          return {
            selector: getSelector(element),
            x,
            y: y + window.scrollY,
            width,
            height,
          };
        })
        .filter(Boolean);
    });

    return NextResponse.json({
      screenshot: `data:image/jpeg;base64,${screenshotBase64}`,
      elementMap,
    });
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
