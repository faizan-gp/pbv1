import Link from "next/link";
import Image from "next/image";

interface ProductCardProps {
    product: any;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { id, name, image } = product;
    const price = 29.99; // Default price until added to DB
    return (
        <div className="group relative overflow-hidden rounded-lg border border-border bg-white transition-all hover:shadow-lg dark:bg-black">
            <div className="aspect-square w-full overflow-hidden bg-muted">
                {/* In a real app, use next/image. For now, using a placeholder if needed or assuming valid URL */}
                <div className="h-full w-full bg-gray-200 dark:bg-gray-800 object-cover transition-transform duration-300 group-hover:scale-105" />
                {/* <Image 
            src={image} 
            alt={name} 
            fill 
            className="object-cover transition-transform duration-300 group-hover:scale-105"
        /> */}
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
