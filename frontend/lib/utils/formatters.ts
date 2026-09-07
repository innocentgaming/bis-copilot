export function formatConfidence(score: number): string {
  return `${Math.round(score * 100)}%`;
}

export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return "-";
  try {
    const d = new Date(isoString);
    return d.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return isoString;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatCitationBadge(citation: {
  standard: string;
  clause?: string | null;
  pages?: string | null;
}): string {
  const parts = [citation.standard];
  if (citation.clause) parts.push(`Clause ${citation.clause}`);
  if (citation.pages) parts.push(`pp. ${citation.pages}`);
  return `[${parts.join(", ")}]`;
}
