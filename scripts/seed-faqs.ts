
// Imports moved dynamically inside main function

// You might need to adjust imports depending on your project structure to run this as a standalone script
// If running with ts-node, you might need absolute paths or module aliases.
// For Simplicity, I'll copy the minimal config needed or rely on the environment.

/* 
 * USAGE: 
 * npx tsx scripts/seed-faqs.ts
 */

import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const PRODUCTS_COLLECTION = "products";

const DEFAULT_FAQ = [
    {
        question: "How long does shipping take?",
        answer: "Standard shipping typically takes 2-5 business days within the USA. International shipping times vary depending on the destination."
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
];

async function seedFaqs() {
    console.log("Starting FAQ Seeding...");

    // Initialize Firebase standalone
    const { initializeApp } = await import("firebase/app");
    const { getFirestore, collection, getDocs, doc, writeBatch } = await import("firebase/firestore");

    const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
    };

    console.log("Initializing Firebase with project:", firebaseConfig.projectId);

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    try {
        const productsRef = collection(db, PRODUCTS_COLLECTION);
        const snapshot = await getDocs(productsRef);

        if (snapshot.empty) {
            console.log("No products found.");
            return;
        }

        const batch = writeBatch(db);
        let count = 0;

        snapshot.docs.forEach((productDoc) => {
            const data = productDoc.data();

            // Only update if FAQ is missing or empty
            if (!data.faq || data.faq.length === 0) {
                const ref = doc(db, PRODUCTS_COLLECTION, productDoc.id);
                // Customize FAQ slightly if needed (e.g. insert product name)
                const customizedFaq = DEFAULT_FAQ.map(f => ({
                    ...f,
                    answer: f.answer.replace("this product", data.name || "this product")
                }));

                batch.update(ref, { faq: customizedFaq });
                count++;
            }
        });

        if (count > 0) {
            await batch.commit();
            console.log(`Successfully updated ${count} products with default FAQs.`);
        } else {
            console.log("All products already have FAQs.");
        }

    } catch (error) {
        console.error("Error seeding FAQs:", error);
    }
}

// Execute
seedFaqs().then(() => process.exit(0));
