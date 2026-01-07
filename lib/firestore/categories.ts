import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, writeBatch } from "firebase/firestore";
import { CategoryData } from "@/lib/categories";

// Helper to slugify text
const slugify = (text: string) => {
    return text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};

export const createCategory = async (data: { name: string, subcategories: string[] | Record<string, any> }) => {
    const slug = slugify(data.name);
    const categoryRef = doc(db, 'categories', slug);

    // Normalize subcategories to Record<string, CategoryData> if it's an array of strings
    let subcategoriesMap: Record<string, CategoryData> = {};
    if (Array.isArray(data.subcategories)) {
        data.subcategories.forEach(subName => {
            if (typeof subName === 'string') {
                const subSlug = slugify(subName);
                subcategoriesMap[subSlug] = {
                    slug: subSlug,
                    name: subName,
                    description: `Custom ${subName}`,
                    metaTitle: `${subName} | Print Brawl`,
                    metaDescription: `Shop custom ${subName}`,
                    keywords: [subName, `custom ${subName}`],
                };
            }
        });
    } else {
        subcategoriesMap = data.subcategories as Record<string, CategoryData>;
    }

    const newCategory: CategoryData = {
        slug,
        name: data.name,
        description: `Explore our ${data.name} collection`,
        metaTitle: `${data.name} | Print Brawl`,
        metaDescription: `Shop the best ${data.name}`,
        keywords: [data.name, `custom ${data.name}`],
        subcategories: subcategoriesMap
    };

    await setDoc(categoryRef, newCategory);
    return slug;
};

export const seedCategoriesBatch = async (categories: { name: string, subcategories: string[] }[]) => {
    const batch = writeBatch(db);

    for (const cat of categories) {
        const slug = slugify(cat.name);
        const categoryRef = doc(db, 'categories', slug);

        const subcategoriesMap: Record<string, CategoryData> = {};
        cat.subcategories.forEach(subName => {
            const subSlug = slugify(subName);
            subcategoriesMap[subSlug] = {
                slug: subSlug,
                name: subName,
                description: `Custom ${subName}`,
                metaTitle: `${subName} | Print Brawl`,
                metaDescription: `Shop custom ${subName}`,
                keywords: [subName, `custom ${subName}`],
            };
        });

        const newCategory: CategoryData = {
            slug,
            name: cat.name,
            description: `Explore our ${cat.name} collection`,
            metaTitle: `${cat.name} | Print Brawl`,
            metaDescription: `Shop the best ${cat.name}`,
            keywords: [cat.name, `custom ${cat.name}`],
            subcategories: subcategoriesMap
        };

        batch.set(categoryRef, newCategory);
    }

    await batch.commit();
};


// Re-using the interface from lib/categories for now, or redefining if we want to decouple
export interface FirestoreCategory {
    id: string; // Document ID, usually the slug
    name: string;
    description: string;
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
    subcategories?: Record<string, FirestoreCategory>; // Recursive, or different structure in DB?
    // DB might store subcategories as an array or map. Assuming Map for now to match our app structure.
}

export async function getAllCategoriesFromDB(): Promise<Record<string, CategoryData>> {
    try {
        const categoriesRef = collection(db, "categories");
        const snapshot = await getDocs(categoriesRef);

        const categoriesMap: Record<string, CategoryData> = {};

        snapshot.forEach((doc) => {
            const data = doc.data();
            const slug = doc.id; // Assuming ID is slug

            let subcategories: Record<string, CategoryData> = {};

            // FIX: Handle case where DB stores subcategories as an array of strings
            if (Array.isArray(data.subcategories)) {
                data.subcategories.forEach((subName: any) => {
                    if (typeof subName === 'string') {
                        const subSlug = slugify(subName);
                        subcategories[subSlug] = {
                            slug: subSlug,
                            name: subName,
                            description: `Custom ${subName}`,
                            metaTitle: `${subName} | Print Brawl`,
                            metaDescription: `Shop custom ${subName}`,
                            keywords: [subName, `custom ${subName}`],
                        };
                    }
                });
            } else if (typeof data.subcategories === 'object' && data.subcategories !== null) {
                subcategories = data.subcategories;
            }

            categoriesMap[slug] = {
                slug: slug,
                name: data.name || slug,
                description: data.description || "",
                metaTitle: data.metaTitle || "",
                metaDescription: data.metaDescription || "",
                keywords: data.keywords || [],
                subcategories: subcategories
            };
        });

        return categoriesMap;
    } catch (error) {
        console.error("Error fetching categories:", error);
        return {};
    }
}
