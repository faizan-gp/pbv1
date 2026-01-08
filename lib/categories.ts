
import { getAllCategoriesFromDB } from './firestore/categories';

export interface CategoryData {
    slug: string;
    name: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    parentCategory?: string;
    subcategories?: Record<string, CategoryData>; // Recursive definition for subcategories
}

// Fallback / Static Cache
export const CATEGORIES: Record<string, CategoryData> = {
    'mens-clothing': {
        slug: 'mens-clothing',
        name: "Men's Clothing",
        description: "Elevate your style with premium custom apparel. From heavyweight cotton tees to durable hoodies, our men's collection is built for comfort and print perfection.",
        metaTitle: "Custom Men's Clothing & Apparel | Print Brawl",
        metaDescription: "Design your own men's t-shirts, hoodies, and more. High-quality print-on-demand men's clothing made in the USA.",
        keywords: ["custom mens clothing", "mens custom t-shirts", "custom hoodies for men", "print on demand mens apparel"],
        subcategories: {
            'sweatshirts': { slug: 'sweatshirts', name: 'Sweatshirts', description: 'Stay warm and stylish with our premium custom sweatshirts. Soft blends tailored for everyday comfort.', metaTitle: '', metaDescription: '', keywords: [] },
            'hoodies': { slug: 'hoodies', name: 'Hoodies', description: 'The ultimate canvas for your creativity. Heavyweight, durable, and super soft hoodies.', metaTitle: '', metaDescription: '', keywords: [] },
            't-shirts': { slug: 't-shirts', name: 'T-shirts', description: 'Classic cuts, premium fabrics. The perfect start for any custom design.', metaTitle: '', metaDescription: '', keywords: [] },
            'long-sleeves': { slug: 'long-sleeves', name: 'Long Sleeves', description: 'Versatile long sleeve tees perfect for layering or wearing solo.', metaTitle: '', metaDescription: '', keywords: [] },
            'tank-tops': { slug: 'tank-tops', name: 'Tank Tops', description: 'Beat the heat with our breathable custom tank tops.', metaTitle: '', metaDescription: '', keywords: [] },
            'sportswear': { slug: 'sportswear', name: 'Sportswear', description: 'Performance gear designed to keep up with your active lifestyle.', metaTitle: '', metaDescription: '', keywords: [] },
            'bottoms': { slug: 'bottoms', name: 'Bottoms', description: 'Comfortable custom pants, shorts, and joggers.', metaTitle: '', metaDescription: '', keywords: [] },
            'swimwear': { slug: 'swimwear', name: 'Swimwear', description: 'Make a splash with custom printed swim trunks and board shorts.', metaTitle: '', metaDescription: '', keywords: [] },
            'shoes': { slug: 'shoes', name: 'Shoes', description: 'Step up your game with custom printed footwear.', metaTitle: '', metaDescription: '', keywords: [] },
            'outerwear': { slug: 'outerwear', name: 'Outerwear', description: 'Jackets and vests to keep you warm while showcasing your brand.', metaTitle: '', metaDescription: '', keywords: [] }
        }
    },
    'womens-clothing': {
        slug: 'womens-clothing',
        name: "Women's Clothing",
        description: "Discover retail-ready women's fashion. Soft fabrics, modern cuts, and versatile styles waiting for your unique creativity.",
        metaTitle: "Custom Women's Clothing & Apparel | Print Brawl",
        metaDescription: "Create custom women's t-shirts, tank tops, and sweatshirts. Premium quality and fast shipping.",
        keywords: ["custom womens clothing", "womens custom t-shirts", "custom ladies apparel", "print on demand womens fashion"],
        subcategories: {
            'sweatshirts': { slug: 'sweatshirts', name: 'Sweatshirts', description: 'Cozy up in style with our collection of soft, custom printed sweatshirts.', metaTitle: '', metaDescription: '', keywords: [] },
            't-shirts': { slug: 't-shirts', name: 'T-shirts', description: 'From fitted to relaxed, find the perfect women\'s tee for your unique designs.', metaTitle: '', metaDescription: '', keywords: [] },
            'hoodies': { slug: 'hoodies', name: 'Hoodies', description: 'Warm, comfortable, and ready for your art. The perfect women\'s hoodie.', metaTitle: '', metaDescription: '', keywords: [] },
            'long-sleeves': { slug: 'long-sleeves', name: 'Long Sleeves', description: 'Essential long sleeve styles for cooler days and layering.', metaTitle: '', metaDescription: '', keywords: [] },
            'tank-tops': { slug: 'tank-tops', name: 'Tank Tops', description: 'Lightweight and stylish tanks perfect for summer or workouts.', metaTitle: '', metaDescription: '', keywords: [] },
            'skirts-dresses': { slug: 'skirts-dresses', name: 'Skirts & Dresses', description: 'Express yourself with custom printed skirts and dresses.', metaTitle: '', metaDescription: '', keywords: [] },
            'sportswear': { slug: 'sportswear', name: 'Sportswear', description: 'Activewear that moves with you. Leggings, sports bras, and more.', metaTitle: '', metaDescription: '', keywords: [] },
            'bottoms': { slug: 'bottoms', name: 'Bottoms', description: 'Trendy custom pants, joggers, and leggings.', metaTitle: '', metaDescription: '', keywords: [] },
            'swimwear': { slug: 'swimwear', name: 'Swimwear', description: 'Stand out at the beach with custom bikinis and one-pieces.', metaTitle: '', metaDescription: '', keywords: [] },
            'shoes': { slug: 'shoes', name: 'Shoes', description: 'Unique footwear to complete any outfit.', metaTitle: '', metaDescription: '', keywords: [] },
            'outerwear': { slug: 'outerwear', name: 'Outerwear', description: 'Stylish jackets and coats customized by you.', metaTitle: '', metaDescription: '', keywords: [] }
        }
    },
    'kids-clothing': {
        slug: 'kids-clothing',
        name: "Kids' Clothing",
        description: "Durable, soft, and play-ready. Our kids' collection features safe, comfortable fabrics perfect for little ones and their big adventures.",
        metaTitle: "Custom Kids' Clothing | Print Brawl",
        metaDescription: "Design custom t-shirts and hoodies for kids. Safe, durable, and comfortable.",
        keywords: ["custom kids clothing", "kids t-shirts", "custom baby clothes"],
        subcategories: {
            't-shirts': { slug: 't-shirts', name: 'T-shirts', description: 'Soft, durable tees built for playtime.', metaTitle: '', metaDescription: '', keywords: [] },
            'long-sleeves': { slug: 'long-sleeves', name: 'Long Sleeves', description: 'Cozy long sleeves for cooler days.', metaTitle: '', metaDescription: '', keywords: [] },
            'sweatshirts': { slug: 'sweatshirts', name: 'Sweatshirts', description: 'Warm layers for little adventurers.', metaTitle: '', metaDescription: '', keywords: [] },
            'baby-clothing': { slug: 'baby-clothing', name: 'Baby Clothing', description: 'Gentle on skin, adorable in style. Onesies and bibs.', metaTitle: '', metaDescription: '', keywords: [] },
            'sportswear': { slug: 'sportswear', name: 'Sportswear', description: 'Active gear for energetic kids.', metaTitle: '', metaDescription: '', keywords: [] },
            'bottoms': { slug: 'bottoms', name: 'Bottoms', description: 'Comfortable pants and shorts for every activity.', metaTitle: '', metaDescription: '', keywords: [] },
            'other': { slug: 'other', name: 'Other', description: 'More custom items for kids.', metaTitle: '', metaDescription: '', keywords: [] }
        }
    },
    'accessories': {
        slug: 'accessories',
        name: "Accessories",
        description: "The perfect finishing touches. Personalize everything from tote bags and hats to phone cases with high-quality printing.",
        metaTitle: "Custom Accessories | Print Brawl",
        metaDescription: "Create custom accessories. Phone cases, bags, hats, and more.",
        keywords: ["custom accessories", "custom phone cases", "custom bags"],
        subcategories: {
            'jewelry': { slug: 'jewelry', name: 'Jewelry', description: 'Elegant custom jewelry pieces.', metaTitle: '', metaDescription: '', keywords: [] },
            'phone-cases': { slug: 'phone-cases', name: 'Phone Cases', description: 'Protect your tech with style. Custom cases for iPhone and Samsung.', metaTitle: '', metaDescription: '', keywords: [] },
            'bags': { slug: 'bags', name: 'Bags', description: 'Totes, backpacks, and accessory pouches.', metaTitle: '', metaDescription: '', keywords: [] },
            'socks': { slug: 'socks', name: 'Socks', description: 'Fun, custom printed socks.', metaTitle: '', metaDescription: '', keywords: [] },
            'hats': { slug: 'hats', name: 'Hats', description: 'Caps, beanies, and bucket hats customized by you.', metaTitle: '', metaDescription: '', keywords: [] },
            'underwear': { slug: 'underwear', name: 'Underwear', description: 'Comfortable and fun custom underwear.', metaTitle: '', metaDescription: '', keywords: [] },
            'baby-accessories': { slug: 'baby-accessories', name: 'Baby Accessories', description: 'Bibs and blankets for the little ones.', metaTitle: '', metaDescription: '', keywords: [] },
            'mouse-pads': { slug: 'mouse-pads', name: 'Mouse Pads', description: 'Upgrade your desk with a custom mouse pad.', metaTitle: '', metaDescription: '', keywords: [] },
            'pets': { slug: 'pets', name: 'Pets', description: 'Bandanas and accesories for your furry friends.', metaTitle: '', metaDescription: '', keywords: [] },
            'kitchen-accessories': { slug: 'kitchen-accessories', name: 'Kitchen Accessories', description: 'Aprons and more for the home chef.', metaTitle: '', metaDescription: '', keywords: [] },
            'car-accessories': { slug: 'car-accessories', name: 'Car Accessories', description: 'Customize your ride.', metaTitle: '', metaDescription: '', keywords: [] },
            'tech-accessories': { slug: 'tech-accessories', name: 'Tech Accessories', description: 'Laptop sleeves and gadget organizers.', metaTitle: '', metaDescription: '', keywords: [] },
            'travel-accessories': { slug: 'travel-accessories', name: 'Travel Accessories', description: 'Tags, covers, and more for your journey.', metaTitle: '', metaDescription: '', keywords: [] },
            'stationery-accessories': { slug: 'stationery-accessories', name: 'Stationery Accessories', description: 'Custom office supplies.', metaTitle: '', metaDescription: '', keywords: [] },
            'sports-games': { slug: 'sports-games', name: 'Sports & Games', description: 'Custom gear for fun and games.', metaTitle: '', metaDescription: '', keywords: [] },
            'face-masks': { slug: 'face-masks', name: 'Face Masks', description: 'Reusable custom face coverings.', metaTitle: '', metaDescription: '', keywords: [] },
            'other': { slug: 'other', name: 'Other', description: 'Unique accessories.', metaTitle: '', metaDescription: '', keywords: [] }
        }
    },
    'home-living': {
        slug: 'home-living',
        name: "Home & Living",
        description: "Transform your space. Custom printed mugs, pillows, and decor that turn houses into homes with your personal artistic flair.",
        metaTitle: "Custom Home Decor | Print Brawl",
        metaDescription: "Design your own home decor. Mugs, pillows, blankets, and more.",
        keywords: ["custom home decor", "custom mugs", "custom pillows"],
        subcategories: {
            'mugs': { slug: 'mugs', name: 'Mugs', description: 'Sip in style with custom ceramic and enamel mugs.', metaTitle: '', metaDescription: '', keywords: [] },
            'candles': { slug: 'candles', name: 'Candles', description: 'Scented and unscented candles for a cozy atmosphere.', metaTitle: '', metaDescription: '', keywords: [] },
            'ornaments': { slug: 'ornaments', name: 'Ornaments', description: 'Holiday decorations that mean more.', metaTitle: '', metaDescription: '', keywords: [] },
            'seasonal-decorations': { slug: 'seasonal-decorations', name: 'Seasonal Decorations', description: 'Festive items for every holiday.', metaTitle: '', metaDescription: '', keywords: [] },
            'glassware': { slug: 'glassware', name: 'Glassware', description: 'Custom pint glasses and tumblers.', metaTitle: '', metaDescription: '', keywords: [] },
            'bottles-tumblers': { slug: 'bottles-tumblers', name: 'Bottles & Tumblers', description: 'Stay hydrated with custom water bottles.', metaTitle: '', metaDescription: '', keywords: [] },
            'canvas': { slug: 'canvas', name: 'Canvas', description: 'Turn your photos into gallery-quality canvas art.', metaTitle: '', metaDescription: '', keywords: [] },
            'posters': { slug: 'posters', name: 'Posters', description: 'High-quality prints for your walls.', metaTitle: '', metaDescription: '', keywords: [] },
            'postcards': { slug: 'postcards', name: 'Postcards', description: 'Send a personal message with custom postcards.', metaTitle: '', metaDescription: '', keywords: [] },
            'journals-notebooks': { slug: 'journals-notebooks', name: 'Journals & Notebooks', description: 'Write it down in a custom notebook.', metaTitle: '', metaDescription: '', keywords: [] },
            'magnets-stickers': { slug: 'magnets-stickers', name: 'Magnets & Stickers', description: 'Small items, big statement.', metaTitle: '', metaDescription: '', keywords: [] },
            'home-decor': { slug: 'home-decor', name: 'Home Decor', description: 'Accents to brighten up any room.', metaTitle: '', metaDescription: '', keywords: [] },
            'blankets': { slug: 'blankets', name: 'Blankets', description: 'Cozy custom fleece and sherpa blankets.', metaTitle: '', metaDescription: '', keywords: [] },
            'pillows-covers': { slug: 'pillows-covers', name: 'Pillows & Covers', description: 'Accent pillows to match your style.', metaTitle: '', metaDescription: '', keywords: [] },
            'towels': { slug: 'towels', name: 'Towels', description: 'Beach and bath towels customized by you.', metaTitle: '', metaDescription: '', keywords: [] },
            'bathroom': { slug: 'bathroom', name: 'Bathroom', description: 'Shower curtains and mats.', metaTitle: '', metaDescription: '', keywords: [] },
            'rugs-mats': { slug: 'rugs-mats', name: 'Rugs & Mats', description: 'Custom floor mats and area rugs.', metaTitle: '', metaDescription: '', keywords: [] },
            'bedding': { slug: 'bedding', name: 'Bedding', description: 'Duvet covers and pillowcases.', metaTitle: '', metaDescription: '', keywords: [] },
            'food-health-beauty': { slug: 'food-health-beauty', name: 'Food - Health - Beauty', description: 'Custom aprons and accessories.', metaTitle: '', metaDescription: '', keywords: [] }
        }
    }
};

let cache: { data: Record<string, CategoryData>, timestamp: number } | null = null;
const CACHE_DURATION = 0; // Disable cache to ensure fresh DB data

export const getCategories = async (): Promise<Record<string, CategoryData>> => {
    const now = Date.now();

    // Check cache (Disabled for now to fix staleness)
    // if (cache && (now - cache.timestamp < CACHE_DURATION)) {
    //    return cache.data;
    // }

    try {
        const dbCategories = await getAllCategoriesFromDB();
        const merged: Record<string, CategoryData> = {};

        // Merge logic: Priority to DB, fallback to Static
        // We iterate over union of keys
        const allKeys = new Set([...Object.keys(CATEGORIES), ...Object.keys(dbCategories)]);

        for (const slug of Array.from(allKeys)) {
            const dbCat = dbCategories[slug] || {};
            const staticCat = CATEGORIES[slug] || {};

            // Robust merge for subcategories
            const mergedSubcategories: Record<string, CategoryData> = {};
            const subKeys = new Set([
                ...(staticCat.subcategories ? Object.keys(staticCat.subcategories) : []),
                ...(dbCat.subcategories ? Object.keys(dbCat.subcategories) : [])
            ]);

            for (const subSlug of Array.from(subKeys)) {
                const sSub = staticCat.subcategories?.[subSlug];
                const dSub = dbCat.subcategories?.[subSlug];

                mergedSubcategories[subSlug] = {
                    ...sSub,
                    ...dSub,
                    // Prefer DB > Static > Default
                    name: dSub?.name || sSub?.name || subSlug,
                    slug: subSlug,
                    // Prioritize DB description, then Static (Rich), then fallback
                    // AVOID the generic "Custom [Name]" if we have a static one!
                    description: (dSub?.description && dSub.description !== `Custom ${dSub.name}`)
                        ? dSub.description
                        : (sSub?.description || `Custom ${dSub?.name || sSub?.name || subSlug}`),
                    // Merge other metadata similarly if needed
                } as CategoryData;
            }

            merged[slug] = {
                ...staticCat,
                ...dbCat,
                name: dbCat.name || staticCat.name || slug,
                description: dbCat.description || staticCat.description || "",
                metaTitle: dbCat.metaTitle || staticCat.metaTitle || "",
                metaDescription: dbCat.metaDescription || staticCat.metaDescription || "",
                slug: slug,
                subcategories: mergedSubcategories
            };
        }

        cache = { data: merged, timestamp: now };
        return merged;
    } catch (e) {
        console.error("Failed to fetch categories", e);
        // Fallback to static if DB fails
        return CATEGORIES;
    }
};

export const getCategoryBySlug = async (slug: string) => {
    const categories = await getCategories();
    return categories[slug] || null;
};

export const getSubcategoryBySlug = async (categorySlug: string, subcategorySlug: string) => {
    const categories = await getCategories();
    const category = categories[categorySlug];
    if (!category || !category.subcategories) return null;
    return category.subcategories[subcategorySlug] || null;
};
