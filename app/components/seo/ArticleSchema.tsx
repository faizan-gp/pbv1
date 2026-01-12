
import { Guide } from "@/lib/guides";

export default function ArticleSchema({ guide }: { guide: Guide }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": guide.title,
        "description": guide.excerpt,
        "image": "https://printbrawl.com/logov2.png", // Ideally guide.image
        "datePublished": guide.date,
        "author": {
            "@type": "Organization",
            "name": guide.author || "Print Brawl"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Print Brawl",
            "logo": {
                "@type": "ImageObject",
                "url": "https://printbrawl.com/logov2.png"
            }
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
