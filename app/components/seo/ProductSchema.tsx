import { Product } from "@/lib/firestore/products";

export default function ProductSchema({ product }: { product: Product }) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "image": [
            product.image,
            ...(product.listingImages?.map(img => img.url) || [])
        ],
        "description": product.shortDescription || product.fullDescription || `Custom ${product.name}`,
        "sku": product.id,
        "mpn": product.id,
        "brand": {
            "@type": "Brand",
            "name": "Print Brawl"
        },
        "category": product.category,
        "offers": {
            "@type": "Offer",
            "url": `https://www.printbrawl.com/products/${product.id}`,
            "priceCurrency": "USD",
            "price": product.price ? String(product.price) : "0", // Default to 0 if missing, better than fake price
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
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
