import { Star } from "lucide-react";

interface TestimonialCardProps {
    name: string;
    role: string;
    quote: string;
    avatar: string; // Placeholder intitials or color
}

export default function TestimonialCard({ name, role, quote, avatar }: TestimonialCardProps) {
    return (
        <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:border-indigo-100 hover:shadow-md">
            <div className="mb-4 flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                ))}
            </div>
            <p className="mb-6 text-gray-600 italic">"{quote}"</p>
            <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-sm">
                    {avatar}
                </div>
                <div>
                    <p className="font-semibold text-gray-900 text-sm">{name}</p>
                    <p className="text-xs text-gray-500">{role}</p>
                </div>
            </div>
        </div>
    );
}
