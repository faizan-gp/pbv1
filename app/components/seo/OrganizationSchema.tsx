export default function OrganizationSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Print Brawl",
        "url": "https://www.printbrawl.com",
        "logo": "https://www.printbrawl.com/logov2.png",
        "description": "Custom apparel design and print-on-demand platform",
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+1-555-234-5678",
            "contactType": "customer service",
            "email": "hello@printbrawl.com",
            "areaServed": "Worldwide",
            "availableLanguage": "English"
        },
        "sameAs": [
            "https://www.facebook.com/printbrawl",
            "https://www.instagram.com/printbrawl",
            "https://www.twitter.com/printbrawl"
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
