import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Define a type for the structured change data
export type ChangeDetail = {
  projectName: string;
  competitorName: string;
  url: string;
  pageType: string;
  diffContent: string;
};

// Function to format the email content
function formatEmailBody(changes: ChangeDetail[]): string {
  let body = "<h1>Sneakpeak Daily Digest</h1>";

  const changesByProject = changes.reduce(
    (acc: Record<string, ChangeDetail[]>, change) => {
      if (!acc[change.projectName]) {
        acc[change.projectName] = [];
      }
      acc[change.projectName].push(change);
      return acc;
    },
    {} as Record<string, ChangeDetail[]>
  );

  for (const projectName in changesByProject) {
    body += `<h2>Project: ${projectName}</h2>`;
    const projectChanges = changesByProject[projectName];

    const changesByCompetitor = projectChanges.reduce(
      (acc: Record<string, ChangeDetail[]>, change) => {
        if (!acc[change.competitorName]) {
          acc[change.competitorName] = [];
        }
        acc[change.competitorName].push(change);
        return acc;
      },
      {} as Record<string, ChangeDetail[]>
    );

    for (const competitorName in changesByCompetitor) {
      body += `<h3>Competitor: ${competitorName}</h3><ul>`;
      const competitorChanges = changesByCompetitor[competitorName];
      for (const change of competitorChanges) {
        body += `<li><strong>${change.pageType} (${change.url}):</strong><br/>${change.diffContent.replace(/\n/g, "<br/>")}</li>`;
      }
      body += "</ul>";
    }
  }

  return body;
}

// Main function to send the email
export async function sendEmail(changes: ChangeDetail[], recipient: string) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.error("Resend API key is not set. Skipping email.");
    return;
  }

  console.log(
    `Resend API Key loaded. Starts with: ${apiKey.substring(0, 8)}...`
  );

  if (changes.length === 0) {
    console.log("No changes detected, skipping email.");
    return;
  }

  const emailBody = formatEmailBody(changes);

  try {
    const { data, error } = await resend.emails.send({
      from: "Sneakpeak Digest <hello@sneakpeak.waliddib.com>",
      to: recipient,
      subject: "Sneakpeak Daily Digest",
      html: emailBody,
    });

    if (error) {
      console.error("Resend API returned an error:", error);
      return;
    }

    console.log("Email sent successfully via Resend:", data);
  } catch (error) {
    console.error("Caught an exception when trying to send email:", error);
  }
}
