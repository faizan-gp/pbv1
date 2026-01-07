import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
    product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { id, name, image } = product;
    // Ensure price is a number for formatting
    const price = Number(product.price) || 29.99;

    return (
        <Link href={`/products/${id}`} className="group block">
            {/* Image Container */}
            <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100 rounded-sm">
                <Image
                    src={image}
                    alt={`${name} - ${product.category || 'Apparel'}`}
                    fill
                    className="object-contain p-6 transition-transform duration-500 ease-out group-hover:scale-105"
                />

                {/* Optional: 'Quick Add' or Badge overlay could go here */}
                {product.trending && (
                    <div className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                        Trending
                    </div>
                )}
            </div>

            {/* Details */}
            <div className="mt-4 space-y-1">
                <h3 className="text-base font-bold text-neutral-900 leading-tight group-hover:underline decoration-1 underline-offset-4 decoration-neutral-400">
                    {name}
                </h3>
                <div className="flex items-center justify-between">
                    <p className="text-sm text-neutral-500 font-medium">
                        ${price.toFixed(2)}
                    </p>
                    {/* Size availability or simplistic visual cue could go here */}
                </div>
            </div>
        </Link>
    );
}
