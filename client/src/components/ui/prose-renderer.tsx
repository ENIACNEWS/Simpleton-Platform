import { cn } from "@/lib/utils";

function stripAllMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/___(.+?)___/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
    .replace(/^>\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^---+$/gm, "")
    .replace(/^\*\*\*+$/gm, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

function cleanLine(text: string): string {
  return text
    .replace(/\*\*\*(.+?)\*\*\*/g, "$1")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/___(.+?)___/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/~~(.+?)~~/g, "$1")
    .replace(/`{1,3}([^`]+)`{1,3}/g, "$1")
    .replace(/^>\s+/gm, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .trim();
}

type Block =
  | { kind: "heading"; text: string; level: 1 | 2 | 3 }
  | { kind: "paragraph"; text: string }
  | { kind: "numbered-list"; items: string[] }
  | { kind: "bullet-list"; items: string[] }
  | { kind: "divider" };

function parseBlocks(raw: string): Block[] {
  const sections = raw.split(/\n{2,}/);
  const blocks: Block[] = [];

  for (const section of sections) {
    const trimmed = section.trim();
    if (!trimmed) continue;

    const lines = trimmed.split("\n").map((l) => l.trim()).filter(Boolean);

    if (lines.length === 0) continue;

    const firstLine = lines[0];

    if (/^---+$/.test(firstLine) || /^\*\*\*+$/.test(firstLine)) {
      blocks.push({ kind: "divider" });
      continue;
    }

    const h1Match = firstLine.match(/^#\s+(.+)$/);
    const h2Match = firstLine.match(/^##\s+(.+)$/);
    const h3Match = firstLine.match(/^###\s+(.+)$/);

    if (h3Match) {
      blocks.push({ kind: "heading", text: cleanLine(h3Match[1]), level: 3 });
      if (lines.length > 1) {
        const rest = lines.slice(1).map(cleanLine).join(" ");
        if (rest.trim()) blocks.push({ kind: "paragraph", text: rest });
      }
      continue;
    }
    if (h2Match) {
      blocks.push({ kind: "heading", text: cleanLine(h2Match[1]), level: 2 });
      if (lines.length > 1) {
        const rest = lines.slice(1).map(cleanLine).join(" ");
        if (rest.trim()) blocks.push({ kind: "paragraph", text: rest });
      }
      continue;
    }
    if (h1Match) {
      blocks.push({ kind: "heading", text: cleanLine(h1Match[1]), level: 1 });
      if (lines.length > 1) {
        const rest = lines.slice(1).map(cleanLine).join(" ");
        if (rest.trim()) blocks.push({ kind: "paragraph", text: rest });
      }
      continue;
    }

    const cleanedFirstLine = cleanLine(firstLine);
    if (lines.length === 1 && /^[A-Z][^.!?]{1,80}:$/.test(cleanedFirstLine)) {
      blocks.push({
        kind: "heading",
        text: cleanedFirstLine.replace(/:$/, ""),
        level: 2,
      });
      continue;
    }

    const numberedItems = lines.filter((l) => /^\d+\.\s/.test(l));
    if (numberedItems.length > 1 && numberedItems.length === lines.length) {
      blocks.push({
        kind: "numbered-list",
        items: lines.map((l) =>
          cleanLine(l.replace(/^\d+\.\s+/, ""))
        ),
      });
      continue;
    }

    const bulletItems = lines.filter((l) => /^[-•*]\s/.test(l));
    if (bulletItems.length > 1 && bulletItems.length === lines.length) {
      blocks.push({
        kind: "bullet-list",
        items: lines.map((l) =>
          cleanLine(l.replace(/^[-•*]\s+/, ""))
        ),
      });
      continue;
    }

    const cleanedLines = lines.map((l) => {
      let cleaned = l.replace(/^[-•*]\s+/, "").replace(/^\d+\.\s+/, "");
      return cleanLine(cleaned);
    });
    const paragraphText = cleanedLines.join(" ");
    if (paragraphText.trim()) {
      blocks.push({ kind: "paragraph", text: paragraphText });
    }
  }

  return blocks;
}

interface ProseRendererProps {
  content: string;
  className?: string;
  size?: "sm" | "base";
}

export function ProseRenderer({
  content,
  className,
  size = "sm",
}: ProseRendererProps) {
  const blocks = parseBlocks(content);
  const bodySize = size === "sm" ? "text-sm" : "text-base";

  return (
    <div className={cn("space-y-3", className)}>
      {blocks.map((block, i) => {
        if (block.kind === "heading") {
          const isH1 = block.level === 1;
          const isH2 = block.level === 2;

          if (isH1) {
            return (
              <h2
                key={i}
                className={cn("font-display font-bold tracking-tight", i > 0 ? "mt-6 pt-4" : "mt-1")}
                style={{
                  color: "var(--foreground)",
                  fontSize: "1.05rem",
                  lineHeight: 1.35,
                  borderTop: i > 0 ? '1px solid rgba(201,169,110,0.15)' : 'none',
                }}
              >
                {block.text}
              </h2>
            );
          }

          if (isH2) {
            return (
              <h3
                key={i}
                className={cn("font-display font-semibold tracking-tight", i > 0 ? "mt-5" : "mt-1")}
                style={{ color: "var(--foreground)", fontSize: "0.95rem", lineHeight: 1.4 }}
              >
                {block.text}
              </h3>
            );
          }

          return (
            <h4
              key={i}
              className={cn("font-display font-semibold", i > 0 ? "mt-4" : "mt-1")}
              style={{ color: "var(--foreground)", fontSize: "0.875rem", lineHeight: 1.4 }}
            >
              {block.text}
            </h4>
          );
        }

        if (block.kind === "numbered-list") {
          return (
            <ol
              key={i}
              className={cn("space-y-2 pl-6", bodySize)}
              style={{ listStyleType: "decimal" }}
            >
              {block.items.map((item, j) => (
                <li
                  key={j}
                  className="font-sans leading-relaxed"
                  style={{ color: "var(--foreground)", lineHeight: 1.7 }}
                >
                  {item}
                </li>
              ))}
            </ol>
          );
        }

        if (block.kind === "bullet-list") {
          return (
            <ul
              key={i}
              className={cn("space-y-2 pl-6", bodySize)}
              style={{ listStyleType: "disc" }}
            >
              {block.items.map((item, j) => (
                <li
                  key={j}
                  className="font-sans leading-relaxed"
                  style={{ color: "var(--foreground)", lineHeight: 1.7 }}
                >
                  {item}
                </li>
              ))}
            </ul>
          );
        }

        if (block.kind === "divider") {
          return (
            <hr
              key={i}
              className="my-4"
              style={{ borderColor: "rgba(201,169,110,0.15)" }}
            />
          );
        }

        return (
          <p
            key={i}
            className={cn("font-sans", bodySize)}
            style={{ color: "var(--foreground)", lineHeight: 1.75 }}
          >
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
