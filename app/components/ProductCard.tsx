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
                <div className="relative h-full w-full bg-gray-100">
                    <Image
                        src={image}
                        alt={name}
                        fill
                        className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
                    />
                </div>
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-foreground">{name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">${price.toFixed(2)}</p>
                <Link
                    href={`/customize/${id}`}
                    className="mt-4 block w-full rounded-md bg-primary py-2 text-center text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
                >
                    Customize
                </Link>
            </div>
        </div>
    );
}
