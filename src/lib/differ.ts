import { diff_match_patch, DIFF_DELETE, DIFF_INSERT } from "diff-match-patch";

export function generateDiff(text1: string, text2: string): string {
  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(text1, text2);
  dmp.diff_cleanupSemantic(diffs);

  let summary = "";
  for (const [op, data] of diffs) {
    const cleanData = data.trim();
    if (cleanData.length === 0) continue;

    if (op === DIFF_INSERT) {
      summary += `Added: "${cleanData}"\n`;
    } else if (op === DIFF_DELETE) {
      summary += `Removed: "${cleanData}"\n`;
    }
  }

  return summary.trim() || "No significant changes detected.";
}
