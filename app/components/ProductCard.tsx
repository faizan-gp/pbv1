import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
    product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { id, name, image } = product;
    const price = 29.99; // Default price until added to DB
    return (
        <div className="group relative overflow-hidden rounded-lg border border-border bg-white transition-all hover:shadow-lg">
            <div className="aspect-square w-full overflow-hidden bg-muted">
                {/* In a real app, use next/image. For now, using a placeholder if needed or assuming valid URL */}
                <Link href={`/products/${id}`} className="relative h-full w-full bg-gray-100 block">
                    <Image
                        src={image}
                        alt={`${name} - Custom ${product.category || 'Apparel'}`}
                        fill
                        className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    />
                </Link>
            </div>
            <div className="p-4">
                <Link href={`/products/${id}`} className="block">
                    <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">{name}</h3>
                </Link>
                <p className="mt-1 text-sm text-muted-foreground">${price.toFixed(2)}</p>
                <Link
                    href={`/products/${id}`}
                    className="mt-4 block w-full rounded-md bg-white border-2 border-primary py-2 text-center text-sm font-bold text-primary transition-all hover:bg-primary hover:text-white"
                >
                    View Details
                </Link>
            </div>
        </div>
    );
}
