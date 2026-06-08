type Props = {
    data: Record<string, unknown> | Record<string, unknown>[];
};

/**
 * Renders a JSON-LD structured-data block. Server-rendered into the document
 * so crawlers can read it without executing client JS.
 */
export const JsonLd = ({ data }: Props) => (
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
);
