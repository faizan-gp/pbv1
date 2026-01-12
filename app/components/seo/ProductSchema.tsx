import { Product } from "@/lib/firestore/products";

export default function ProductSchema({ product }: { product: Product }) {
    // Helper to clean text
    const cleanText = (text: string) => {
        if (!text) return "";
        return text
            .replace(/[\u2018\u2019]/g, "'") // Smart single quotes
            .replace(/[\u201C\u201D]/g, '"') // Smart double quotes
            .replace(/\uFFFD/g, ""); // Replacement character
    };

    const graph = [
        {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": cleanText(product.name),
            "image": [
                product.image,
                ...(product.listingImages?.map(img => img.url) || [])
            ].map(url => ({
                "@type": "ImageObject",
                "url": url,
                "name": cleanText(product.name),
                "caption": cleanText(product.shortDescription || `Custom ${product.name}`),
                "author": {
                    "@type": "Organization",
                    "name": "Print Brawl"
                }
            })),
            "description": cleanText(product.fullDescription || product.shortDescription || `Custom ${product.name}`),
            "keywords": product.tags?.join(", ") || "",
            "sku": product.id,
            "mpn": product.id,
            "brand": {
                "@type": "Brand",
                "name": "Print Brawl"
            },
            "category": product.category,
            "offers": {
                "@type": "Offer",
                "url": `https://printbrawl.com/products/${product.id}`,
                "priceCurrency": "USD",
                "price": product.price ? String(product.price) : "0",
                "sku": product.id,
                "availability": "https://schema.org/InStock",
                "itemCondition": "https://schema.org/NewCondition",
                "seller": {
                    "@type": "Organization",
                    "name": "Print Brawl"
                },
                "shippingDetails": {
                    "@type": "OfferShippingDetails",
                    "shippingRate": {
                        "@type": "MonetaryAmount",
                        "value": product.shippingCost ? String(product.shippingCost) : "0",
                        "currency": "USD"
                    },
                    "shippingDestination": {
                        "@type": "DefinedRegion",
                        "addressCountry": "US"
                    },
                    "deliveryTime": {
                        "@type": "ShippingDeliveryTime",
                        "businessDays": {
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
                        },
                        "cutoffTime": "14:00",
                        "handlingTime": {
                            "@type": "QuantitativeValue",
                            "minValue": 2,
                            "maxValue": 7,
                            "unitCode": "DAY"
                        },
                        "transitTime": {
                            "@type": "QuantitativeValue",
                            "minValue": 2,
                            "maxValue": 5,
                            "unitCode": "DAY"
                        }
                    }
                }
            },
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "reviewCount": "124"
            }
        },
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": (product.faq || [
                {
                    question: "How long does shipping take?",
                    answer: `Standard shipping for ${product.name} typically takes ${product.shippingTime || '2-5 business days'} within the USA. International shipping times vary.`
                },
                {
                    question: "Can I customize the design?",
                    answer: "Yes! Use our interactive design studio to add your own text, images, logo, or artwork to this product."
                },
                {
                    question: "What is the return policy?",
                    answer: "Since this is a custom printed product, we cannot accept returns for buyer's remorse. However, if there is a defect in printing or the item arrives damaged, we will offer a free replacement."
                },
                {
                    question: "How should I wash this item?",
                    answer: "To ensure longevity of the print, we recommend machine washing cold, inside-out, on a gentle cycle. Tumble dry low or hang-dry for best results."
                }
            ]).map(faq => ({
                "@type": "Question",
                "name": cleanText(faq.question),
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": cleanText(faq.answer)
                }
            }))
        }
    ];

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graph }) }}
        />
    );
}
