import { Star } from "lucide-react";

interface TestimonialCardProps {
    name: string;
    role: string;
    quote: string;
    avatar: string; // Placeholder intitials or color
}

export default function TestimonialCard({ name, role, quote, avatar }: TestimonialCardProps) {
    return (
        <div className="flex flex-col justify-between rounded-xl border border-white/10 bg-zinc-900/30 p-6 backdrop-blur-sm shadow-sm transition-all hover:bg-zinc-900/50 hover:border-white/20">
            <div className="mb-4 flex text-yellow-500">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                ))}
            </div>
            <p className="mb-6 text-zinc-300 italic">"{quote}"</p>
            <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-white/10 text-white font-bold text-sm">
                    {avatar}
                </div>
                <div>
                    <p className="font-semibold text-white text-sm">{name}</p>
                    <p className="text-xs text-zinc-500">{role}</p>
                </div>
            </div>
        </div>
    );
}
