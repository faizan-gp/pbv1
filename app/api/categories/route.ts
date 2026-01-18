import { db } from '@/lib/firebase';
import { collection, getDocs, doc, writeBatch, deleteDoc, getDoc, setDoc } from 'firebase/firestore';
import { NextResponse } from 'next/server';
import { CATEGORIES, CategoryData } from '@/lib/categories';
import { createCategory, getAllCategoriesFromDB } from '@/lib/firestore/categories';

// Helper function to update category if description or subcategories are missing/empty
async function healCategory(docRef: any, currentData: any, seedData: CategoryData) {
    const updates: any = {};
    let needsUpdate = false;

    // 1. Check Description
    if (!currentData.description || currentData.description.trim() === "") {
        if (seedData.description) {
            updates.description = seedData.description;
            needsUpdate = true;
        }
    }

    // 1.5 Check Long Description (Pillar Content)
    if (!currentData.longDescription && seedData.longDescription) {
        updates.longDescription = seedData.longDescription;
        needsUpdate = true;
    }

    // 2. Check Name (fix raw slugs)
    if (currentData.name === currentData.slug || !currentData.name) {
        if (seedData.name && seedData.name !== seedData.slug) {
            updates.name = seedData.name;
            needsUpdate = true;
        }
    }

    // 3. Check Subcategories
    const currentSubs = currentData.subcategories || {};
    let subsChanged = false;

    if (seedData.subcategories) {
        const newSubs = { ...currentSubs };

        for (const [subSlug, subData] of Object.entries(seedData.subcategories)) {
            const existingSub = newSubs[subSlug];

            if (!existingSub) {
                newSubs[subSlug] = subData;
                subsChanged = true;
            } else {
                // Enrich existing
                if (!existingSub.description && subData.description) {
                    existingSub.description = subData.description;
                    subsChanged = true;
                }
                if ((!existingSub.name || existingSub.name === subSlug) && subData.name) {
                    existingSub.name = subData.name;
                    subsChanged = true;
                }
            }
        }

        if (subsChanged) {
            updates.subcategories = newSubs;
            needsUpdate = true;
        }
    }

    if (needsUpdate) {
        console.log(`Self-healing category: ${currentData.slug}`, updates);
        await setDoc(docRef, updates, { merge: true });
    }
}

export async function GET(req: Request) {
    try {
        const categoriesRef = collection(db, 'categories');
        const snapshot = await getDocs(categoriesRef);

        const categories: any[] = [];
        const existingSlugs = new Set();
        const healingPromises: Promise<any>[] = [];

        // 1. Fetch Existing
        for (const docSnap of snapshot.docs) {
            const data = docSnap.data();
            const id = docSnap.id;

            // Check against authoritative seed data
            const seed = CATEGORIES[id];

            if (seed) {
                // Self-heal descriptions/names/subcategories if missing
                healingPromises.push(healCategory(docSnap.ref, data, seed));

                // Return the updated shape (optimistic for response)
                categories.push({
                    ...data,
                    id: id,
                    slug: id,
                    description: data.description || seed.description,
                    name: (data.name === id ? seed.name : data.name) || seed.name,
                    subcategories: data.subcategories || seed.subcategories
                });
            } else {
                categories.push({ id, ...data, slug: id });
            }
            existingSlugs.add(id);
        }

        // Wait for all healing to complete
        if (healingPromises.length > 0) {
            await Promise.all(healingPromises);
        }

        // 2. Seed Missing Categories
        const batch = writeBatch(db);
        let hasNew = false;

        Object.values(CATEGORIES).forEach((cat) => {
            if (!existingSlugs.has(cat.slug)) {
                const docRef = doc(db, 'categories', cat.slug);
                batch.set(docRef, {
                    ...cat,
                    createdAt: new Date().toISOString()
                });
                categories.push(cat);
                hasNew = true;
            }
        });

        if (hasNew) {
            await batch.commit();
        }

        return NextResponse.json({ success: true, data: categories });
    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch categories' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, subcategories } = body;
        if (!name) return NextResponse.json({ success: false, error: 'Name is required' }, { status: 400 });
        const id = await createCategory({ name, subcategories: subcategories || [] });
        return NextResponse.json({ success: true, data: { id, name, subcategories } });
    } catch (error) {
        console.error("Category create error:", error);
        return NextResponse.json({ success: false, error: 'Failed to create category' }, { status: 500 });
    }
}
