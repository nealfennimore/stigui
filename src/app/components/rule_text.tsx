import React from "react";

const COMMAND_PREFIXES = ["$ ", "# ", "sudo ", "> "];

/**
 * Heuristic: a paragraph renders as a mono command block only when every
 * non-empty line looks like a shell command or is indented. Anything
 * ambiguous stays a normal paragraph.
 */
const isCommandParagraph = (paragraph: string) => {
    const lines = paragraph.split("\n").filter((line) => line.trim());
    if (!lines.length) {
        return false;
    }
    return lines.every(
        (line) =>
            COMMAND_PREFIXES.some((prefix) => line.startsWith(prefix)) ||
            /^\s{4,}\S/.test(line)
    );
};

/** Long-form rule text with conservative command-block formatting. */
export const RuleText = ({ text }: { text: string }) => {
    const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim());

    return (
        <>
            {paragraphs.map((paragraph, index) =>
                isCommandParagraph(paragraph) ? (
                    <pre
                        key={index}
                        className="font-[family-name:var(--font-geist-mono)] text-xs bg-surface-muted text-foreground rounded-md p-3 overflow-x-auto whitespace-pre"
                    >
                        {paragraph}
                    </pre>
                ) : (
                    <p key={index} className="whitespace-pre-line">
                        {paragraph}
                    </p>
                )
            )}
        </>
    );
};
