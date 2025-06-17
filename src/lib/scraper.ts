import cheerio from "cheerio";

export async function scrapeUrl(
  url: string
): Promise<
  { success: true; data: string } | { success: false; error: string }
> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to fetch URL: ${response.statusText}`,
      };
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove script and style tags to avoid including their content
    $("script, style").remove();

    const bodyText = $("body").text();

    // Clean up the text by removing excessive whitespace and newlines
    const cleanedText = bodyText.replace(/\s\s+/g, " ").trim();

    return { success: true, data: cleanedText };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "An unknown error occurred during scraping.",
    };
  }
}
