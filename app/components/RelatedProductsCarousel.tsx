'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductCard from './ProductCard';
import { cn } from '@/lib/utils';
import { Product } from '@/lib/firestore/products';

interface RelatedProductsCarouselProps {
    products: Product[];
}

export default function RelatedProductsCarousel({ products }: RelatedProductsCarouselProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const checkScroll = () => {
        if (scrollContainerRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5); // 5px buffer
        }
    };

    useEffect(() => {
        checkScroll();
        window.addEventListener('resize', checkScroll);
        return () => window.removeEventListener('resize', checkScroll);
    }, [products]);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
            scrollContainerRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
            // Re-check after scroll animation (approximate)
            setTimeout(checkScroll, 500);
        }
    };

    return (
        <div className="relative group/carousel">
            {/* Scroll Buttons - Hidden on mobile usually, or shown if preferred. We'll hide on touch devices via group-hover logic or always show on desktop */}

            {/* Left Arrow */}
            <button
                onClick={() => scroll('left')}
                className={cn(
                    "absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg text-gray-700 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 disabled:pointer-events-none",
                    { "opacity-0 pointer-events-none": !canScrollLeft }
                )}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Right Arrow */}
            <button
                onClick={() => scroll('right')}
                className={cn(
                    "absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-lg text-gray-700 transition-all duration-300 opacity-0 group-hover/carousel:opacity-100 disabled:opacity-0 disabled:pointer-events-none",
                    { "opacity-0 pointer-events-none": !canScrollRight }
                )}
                disabled={!canScrollRight}
                aria-label="Scroll right"
            >
                <ChevronRight className="w-5 h-5" />
            </button>


            {/* Scroll Container */}
            <div
                ref={scrollContainerRef}
                onScroll={checkScroll}
                className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 -mx-4 px-4 scroll-smooth"
            >
                {products.map(product => (
                    <div key={product.id} className="min-w-[280px] w-[280px] sm:w-[300px] flex-none snap-start">
                        <ProductCard product={product} />
                    </div>
                ))}
            </div>
        </div>
    );
}
