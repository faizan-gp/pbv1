
export interface Guide {
    slug: string;
    title: string;
    excerpt: string;
    content: string; // Markdown or HTML
    date: string;
    author: string;
    relatedProducts?: string[]; // Product IDs
    relatedCategories?: string[]; // Category Slugs
}

export const GUIDES: Guide[] = [
    {
        slug: 'how-to-design-custom-t-shirts',
        title: "How to Design Custom T-Shirts: The Ultimate Guide",
        excerpt: "Learn the secrets to creating professional-quality custom t-shirt designs that pop. From color theory to placement, we cover it all.",
        date: "2024-01-15",
        author: "Print Brawl Team",
        relatedCategories: ['mens-clothing', 'womens-clothing', 'kids-clothing'],
        content: `
## The Art of T-Shirt Design

Designing a custom t-shirt is more than just slapping a logo on a chest. It's about self-expression, branding, and creating something unique. Whether you're designing for a family reunion, a corporate event, or your own fashion line, mastering a few key principles can take your design from amateur to pro.

### 1. Know Your Purpose and Audience

Before you open your design software, ask yourself:
*   **Who is this for?** (Trendy teens, corporate employees, podcast fans?)
*   **What is the vibe?** (Funny, serious, minimalistic, loud?)

### 2. Composition and Placement

*   **Center Chest:** The classic standard. Great for logos and main graphics.
*   **Pocket Print:** Subtle and stylish. Perfect for small logos or monograms.
*   **Back Print:** Ideal for event details, tour dates, or large complex illustrations.

### 3. Choosing the Right Colors

Contrast is king. If your shirt is dark (Black, Navy), use light ink colors (White, Yellow, Light Blue). If your shirt is light (White, Heather Grey), use dark inks.
*   **Pro Tip:** Limited color palettes (1-3 colors) often look more professional and are cheaper to print with some methods (though Print Brawl's Direct-to-Garment printing handles unlimited colors easily!).

### 4. Typography Matters

Don't just use Comic Sans. Pick a font that matches your message.
*   **Serif:** Traditional, reliable.
*   **Sans Serif:** Modern, clean.
*   **Script:** Elegant, creative.

### 5. File Quality

Always use high-resolution files. For Print on Demand, we recommend **PNG files with transparent backgrounds at 300 DPI**. This prevents "fuzzy" edges and ensures your print looks crisp.
        `
    },
    {
        slug: 'print-on-demand-vs-traditional-printing',
        title: "Print on Demand vs. Traditional Screen Printing",
        excerpt: "Which printing method is right for you? We compare costs, quality, and minimums to help you decide.",
        date: "2024-01-20",
        author: "Print Brawl Team",
        relatedCategories: ['mens-clothing', 'womens-clothing'],
        content: `
## Choosing the Right Production Method

When starting a clothing brand or ordering merch, the biggest decision is often between **Print on Demand (POD)** and **Traditional Screen Printing**. Here's the breakdown to help you choose.

### What is Print on Demand (POD)?

POD is a digital printing technology (usually Direct-to-Garment or DTG) where items are printed *only when an order is placed*.

**Pros:**
*   **No Minimums:** Order 1 item or 100.
*   **No Inventory:** You don't need a garage full of boxes.
*   **Unlimited Colors:** DTG prints complex photos and gradients easily.

**Cons:**
*   **Higher Unit Cost:** You pay more per shirt than bulk orders.

### What is Traditional Screen Printing?

Screen printing involves creating a stencil (screen) for each color in your design and pushing ink through it onto the fabric.

**Pros:**
*   **Lower Cost at Scale:** Cheap for 50+ items of the same design.
*   **Durability:** Thick ink deposits last a long time.

**Cons:**
*   **High Setup Fees:** Paying for screens makes small runs expensive.
*   **Color Limits:** Each color adds cost.

### The Verdict

*   **Choose POD (like Print Brawl)** if: You are testing new designs, selling online, or ordering for small groups (under 20).
*   **Choose Screen Printing** if: You need 50+ of the exact same shirt for an event and have a simple 1-2 color design.
        `
    },
    {
        slug: 'best-materials-for-custom-apparel',
        title: "Best Materials for Custom Apparel: Cotton vs. Poly vs. Blends",
        excerpt: "Not all fabrics print the same. Discover which material yields the best results for your custom designs.",
        date: "2024-01-25",
        author: "Print Brawl Team",
        relatedCategories: ['mens-clothing', 'womens-clothing', 'sportswear'],
        content: `
## The Fabric Guide

The canvas determines the art. In custom apparel, the "canvas" is the fabric.

### 100% Cotton

**Characteristics:** Soft, breathable, natural.
**Printing:** Excellent for DTG (Direct-to-Garment). The ink absorbs well into the fibers, creating a soft feel.
**Best For:** Everyday t-shirts, vintage looks.

### 100% Polyester

**Characteristics:** Smooth, moisture-wicking, durable, shrink-resistant.
**Printing:** Can be tricky for standard DTG, often used for Sublimation (all-over print).
**Best For:** Sportswear, performance gear.

### Tri-Blends (50% Poly, 25% Cotton, 25% Rayon)

**Characteristics:** The "softest shirt you own." Vintage feel, drape.
**Printing:** Prints will look "vintage" or slightly faded because ink doesn't bond as strongly to the polyester/rayon parts.
**Best For:** Fashion-forward brands, retro designs.

### Ring-Spun Cotton

A step up from "Carded Open End" (basic stiff cotton). Ring-spun cotton creates a smoother surface, which means **sharper prints** and a softer feel. At Print Brawl, we prioritize ring-spun fabrics for the best quality.
        `
    },
    {
        slug: 'custom-t-shirt-ideas',
        title: "20+ Custom T-Shirt Ideas for 2026",
        excerpt: "Stuck for inspiration? Check out these trending design ideas for your next custom apparel project.",
        date: "2024-02-01",
        author: "Inspo Team",
        relatedCategories: ['mens-clothing', 'womens-clothing', 'kids-clothing'],
        content: `
## Trending Themes

1.  **Retro Typography:** 70s style bubbly fonts are back.
2.  **Nature & Outdoors:** Minimalist line drawings of mountains and trees.
3.  **Local Pride:** "Support Local" designs for your specific city or town.
4.  **Pet Portraits:** Cartoon versions of your dog or cat.
5.  **Dad Jokes:** Classic humor never goes out of style.

## For Events

*   **Family Reunions:** "Smith Family Tour 2026"
*   **Bachelor/Bachelorette:** Matching squad shirts.
*   **Corporate Retreats:** "Team Building Survivor"

## For Niches

*   **Gamer Gear:** 8-bit graphics and inside jokes.
*   **Eco-Warriors:** Designs promoting sustainability.
*   **Coffee Lovers:** "Death before Decaf" styles.
        `
    }
];

export function getAllGuides() {
    return GUIDES;
}

export function getGuideBySlug(slug: string) {
    return GUIDES.find(g => g.slug === slug) || null;
}
