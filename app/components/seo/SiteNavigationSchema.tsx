
interface NavItem {
    name: string;
    url: string;
}

export default function SiteNavigationSchema() {
    const baseUrl = "https://www.printbrawl.com"; // In production this should come from env but standard is ok for now

    // Define main navigation items matching the Navbar
    const navItems: NavItem[] = [
        { name: "Home", url: `${baseUrl}/` },
        { name: "All Products", url: `${baseUrl}/products` },
        { name: "Men's Clothing", url: `${baseUrl}/products?category=Men's+Clothing` },
        { name: "Women's Clothing", url: `${baseUrl}/products?category=Women's+Clothing` },
        { name: "Kids' Clothing", url: `${baseUrl}/products?category=Kids'+Clothing` },
        { name: "Home & Living", url: `${baseUrl}/products?category=Home+&+Living` },
        { name: "Accessories", url: `${baseUrl}/products?category=Accessories` },
    ];

    const schema = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": navItems.map((item, index) => ({
            "@type": "SiteNavigationElement",
            "position": index + 1,
            "name": item.name,
            "description": item.name, // Optional but helpful
            "url": item.url
        }))
    };

    return (
        <script
            id="site-nav-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
