export default function OrganizationSchema() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Print Brawl",
        "url": "https://printbrawl.com",
        "logo": "https://printbrawl.com/logov2.png",
        "description": "Premium custom apparel and personalized gifts for everyone. Design your own t-shirts, hoodies, and more.",
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
            "https://www.twitter.com/printbrawl",
            "https://www.pinterest.com/printbrawl",
            "https://www.tiktok.com/@printbrawl",
            "https://www.linkedin.com/company/printbrawl",
            "https://www.youtube.com/@printbrawl"
        ]
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
