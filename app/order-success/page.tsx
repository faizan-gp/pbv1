import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";

export default function OrderSuccessPage() {
    return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
            <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <CheckCircle className="h-12 w-12" />
            </div>
            <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">Order Placed Successfully!</h1>
            <p className="mt-2 text-lg text-muted-foreground max-w-md">
                Thank you for your purchase. We've received your order and will confirm it via email shortly.
            </p>
            <div className="mt-10">
                <Link
                    href="/products"
                    className="inline-flex items-center justify-center rounded-md bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground transition-transform hover:scale-105"
                >
                    Continue Shopping
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}
