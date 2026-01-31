---
name: Homepage Bounce Analysis
overview: Comprehensive analysis of all reasons why users bounce from the homepage when arriving from ads, organized by category (Performance, UX, Trust, Content, Technical) with specific file references and actionable insights.
todos: []
---

# Homepage Bounce Analysis - Print Brawl

## Executive Summary

This analysis identifies critical issues causing users to bounce immediately after landing on the homepage from ads. Issues are categorized by severity and impact on user experience.

---

## 🔴 CRITICAL ISSUES (Immediate Bounce Risk)

### 1. **Blocking Server-Side Data Fetching**

**Location:** [`app/page.tsx`](app/page.tsx) lines 72-74

**Problem:**

- Page uses `force-dynamic` (line 70), meaning NO caching
- Two blocking database calls on every request:
  - `getTrendingProducts()` → calls `getAllProducts()` which fetches ALL products from Firestore
  - `getCategories()` → fetches all categories from Firestore
- Users see blank/loading page until both API calls complete
- If Firestore is slow (common on cold starts), users wait 2-5+ seconds

**Impact:** High - Users bounce if page doesn't load in 2-3 seconds

**Evidence:**

```typescript
export const dynamic = 'force-dynamic'; // Line 70 - No caching!
const featuredProducts = await getTrendingProducts(); // Line 73 - Blocks render
const allCategories = await getCategories(); // Line 74 - Blocks render
```

---

### 2. **Inefficient Data Fetching**

**Location:** [`lib/firestore/products.ts`](lib/firestore/products.ts) line 105-112

**Problem:**

- `getAllProducts()` fetches ALL products from Firestore
- Then filters client-side for just 6 trending products
- Wastes bandwidth and increases load time

**Impact:** Medium-High - Unnecessary data transfer slows page load

---

### 3. **No Image Optimization**

**Location:** [`app/page.tsx`](app/page.tsx) lines 178-189, [`app/components/landing/HeroVisual.tsx`](app/components/landing/HeroVisual.tsx) line 78

**Problem:**

- Using regular `<img>` tags instead of Next.js `<Image>` component
- No lazy loading, no priority hints
- Large images from Firebase Storage loaded synchronously
- HeroVisual image (line 78) loads immediately but isn't critical
- Design editor images (lines 178-189) load without optimization

**Impact:** High - Large unoptimized images cause slow LCP (Largest Contentful Paint)

**Evidence:**

```tsx
// Line 178-189: Regular img tags, no optimization
<img src="https://firebasestorage.googleapis.com/..." />
<img src="https://firebasestorage.googleapis.com/..." />
```

---

### 4. **Multiple Tracking Scripts Blocking Render**

**Location:** [`app/layout.tsx`](app/layout.tsx) lines 82-109

**Problem:**

- Facebook Pixel and Meta Signals pixel load synchronously
- Analytics session initialization happens on page load
- Multiple API calls on mount: `/api/analytics/session`, `/api/analytics/pageview`
- These block or delay initial render

**Impact:** Medium-High - Tracking scripts delay content visibility

---

### 5. **Non-Functional CTA Button**

**Location:** [`app/components/landing/HeroVisual.tsx`](app/components/landing/HeroVisual.tsx) line 106-108

**Problem:**

- "Customize This Product" button has no `href` or `onClick` handler
- Button appears clickable but does nothing
- Creates frustration and reduces trust

**Impact:** High - Users click expecting action, get nothing, bounce

**Evidence:**

```tsx
<button className="..."> // No onClick, no Link wrapper
    <Palette className="w-4 h-4" /> Customize This Product
</button>
```

---

## 🟡 HIGH PRIORITY ISSUES

### 6. **No Loading States**

**Location:** [`app/page.tsx`](app/page.tsx)

**Problem:**

- No skeleton loaders or loading indicators
- Users see blank page during data fetch
- No visual feedback that page is loading

**Impact:** Medium-High - Users think site is broken and leave

---

### 7. **Empty State Shows Error Message**

**Location:** [`app/page.tsx`](app/page.tsx) lines 302-305

**Problem:**

- If no trending products found, shows: "No trending products found. Check back soon!"
- This looks like an error to users
- Should show fallback products or hide section

**Impact:** Medium - Makes site look broken/incomplete

---

### 8. **No Trust Signals Above the Fold**

**Location:** [`app/components/landing/HeroSection.tsx`](app/components/landing/HeroSection.tsx)

**Problem:**

- "Trusted by 10,000+ happy customers" (line 42) has no proof
- No reviews, testimonials, or social proof visible
- No security badges (SSL, payment security)
- No shipping/return policy visible
- No live chat or support indicator

**Impact:** Medium-High - Users from ads need immediate trust signals

---

### 9. **No Price Visibility**

**Location:** Hero section and value props

**Problem:**

- No pricing information in hero section
- Users can't quickly assess if products are affordable
- Price is hidden until they click into products

**Impact:** Medium - Users want to know cost before engaging

---

### 10. **Excessive Mobile Padding**

**Location:** [`app/components/landing/HeroSection.tsx`](app/components/landing/HeroSection.tsx) line 7

**Problem:**

- `pt-32` (128px top padding) on mobile
- Pushes hero content below fold
- Users don't see value proposition immediately

**Impact:** Medium - Mobile users (likely majority from ads) miss key content

---

## 🟢 MEDIUM PRIORITY ISSUES

### 11. **External Background Image**

**Location:** [`app/page.tsx`](app/page.tsx) line 97

**Problem:**

- Background uses external URL: `https://grainy-gradients.vercel.app/noise.svg`
- External dependency can fail or be slow
- Adds another network request

**Impact:** Low-Medium - Could cause layout shift if fails

---

### 12. **No Error Boundaries**

**Location:** Entire app

**Problem:**

- No React error boundaries
- If any component crashes, entire page breaks
- Users see blank page or error

**Impact:** Medium - Catastrophic if error occurs

---

### 13. **Analytics Calls on Every Page Load**

**Location:** [`app/components/analytics/AnalyticsProvider.tsx`](app/components/analytics/AnalyticsProvider.tsx)

**Problem:**

- Multiple API calls on mount: session creation, pageview tracking
- These happen even if user bounces immediately
- Could slow down page if API is slow

**Impact:** Low-Medium - Adds latency but not critical

---

### 14. **Generic Value Props**

**Location:** [`app/page.tsx`](app/page.tsx) lines 115-120

**Problem:**

- Value props are generic: "No Minimums", "Free Editor", "High Quality"
- No specific numbers or proof points
- Could be any e-commerce site

**Impact:** Low-Medium - Doesn't differentiate from competitors

---

### 15. **No Urgency or Scarcity**

**Location:** Homepage

**Problem:**

- No limited-time offers
- No stock indicators
- No social proof (e.g., "5 people viewing this")
- No exit-intent popups

**Impact:** Low-Medium - Missed conversion opportunities

---

## 📊 PERFORMANCE METRICS ISSUES

### 16. **No Core Web Vitals Optimization**

- No `fetchPriority="high"` on hero images
- No `loading="eager"` on above-fold images
- No preloading of critical resources
- Large JavaScript bundles likely (no analysis shown)

**Impact:** Medium - Poor Core Web Vitals = lower search rankings and higher bounce

---

## 🎯 CONTENT & MESSAGING ISSUES

### 17. **Value Proposition Not Immediately Clear**

**Location:** Hero section

**Problem:**

- Headline is generic: "Create Custom Products in Minutes"
- Doesn't explain WHAT you can customize
- Doesn't address pain points (e.g., "No design skills needed")

**Impact:** Medium - Users don't understand offering quickly

---

### 18. **Too Much Text Before Products**

**Location:** [`app/page.tsx`](app/page.tsx)

**Problem:**

- Hero section
- Value props section
- Feature deep dive section
- Categories section
- THEN products (line 285+)

**Impact:** Low-Medium - Users want to see products faster

---

## 🔧 TECHNICAL DEBT

### 19. **Commented Out Sections**

**Location:** [`app/page.tsx`](app/page.tsx) lines 380-464

**Problem:**

- Large commented-out sections (Material Quality, Sustainability)
- Adds to file size and confusion
- Should be removed or implemented

**Impact:** Low - Code cleanliness

---

### 20. **Duplicate Background Comment**

**Location:** [`app/page.tsx`](app/page.tsx) lines 93-95

**Problem:**

- Duplicate "GLOBAL BACKGROUND" comments
- Suggests incomplete refactoring

**Impact:** Low - Code quality

---

## 📱 MOBILE-SPECIFIC ISSUES

### 21. **Complex HeroVisual on Mobile**

**Location:** [`app/components/landing/HeroVisual.tsx`](app/components/landing/HeroVisual.tsx)

**Problem:**

- Animated floating elements might be distracting
- Could cause performance issues on low-end devices
- Takes up valuable mobile screen space

**Impact:** Medium - Mobile users are likely majority from ads

---

## 🎨 DESIGN/UX ISSUES

### 22. **No Visual Hierarchy for CTAs**

**Location:** Hero section

**Problem:**

- Two CTAs: "Start Designing Now" and "See Products"
- Both are prominent, creating choice paralysis
- No clear primary action

**Impact:** Low-Medium - Reduces conversion rate

---

### 23. **ProductCard Uses Next Image But Homepage Doesn't**

**Location:** [`app/components/ProductCard.tsx`](app/components/ProductCard.tsx) vs [`app/page.tsx`](app/page.tsx)

**Problem:**

- Inconsistency: ProductCard uses Next.js Image (good)
- But homepage hero images use regular img tags (bad)
- Inconsistent optimization strategy

**Impact:** Low - Inconsistent performance

---

## 📈 RECOMMENDATIONS SUMMARY

### Immediate Actions (This Week):

1. Add loading skeletons for data fetching
2. Fix non-functional CTA button in HeroVisual
3. Optimize images using Next.js Image component
4. Add error boundaries
5. Show fallback products instead of error message

### Short-term (This Month):

1. Implement caching for products/categories (remove force-dynamic or use ISR)
2. Optimize data fetching (query only trending products, not all)
3. Add trust signals above fold (reviews, badges, guarantees)
4. Add price visibility in hero
5. Reduce mobile padding

### Long-term (Next Quarter):

1. Implement Core Web Vitals optimizations
2. Add A/B testing for hero messaging
3. Add exit-intent popups
4. Implement progressive loading
5. Add service worker for offline support

---

## 🔍 FILES TO REVIEW

- [`app/page.tsx`](app/page.tsx) - Main homepage component
- [`app/components/landing/HeroSection.tsx`](app/components/landing/HeroSection.tsx) - Hero section
- [`app/components/landing/HeroVisual.tsx`](app/components/landing/HeroVisual.tsx) - Hero visual component
- [`lib/firestore/products.ts`](lib/firestore/products.ts) - Product data fetching
- [`lib/categories.ts`](lib/categories.ts) - Category data fetching
- [`app/layout.tsx`](app/layout.tsx) - Root layout with tracking scripts
- [`app/components/analytics/AnalyticsProvider.tsx`](app/components/analytics/AnalyticsProvider.tsx) - Analytics initialization