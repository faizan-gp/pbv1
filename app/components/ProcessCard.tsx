import { ArrowRight } from "lucide-react";

interface ProcessCardProps {
    number: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    isLast?: boolean;
}

export default function ProcessCard({ number, title, description, icon, isLast }: ProcessCardProps) {
    return (
        <div className="group relative flex flex-col items-center text-center p-8 rounded-2xl bg-zinc-900/50 border border-white/10 shadow-sm transition-all hover:bg-zinc-900/80 hover:border-white/20 hover:shadow-2xl hover:-translate-y-1">
            <div className="absolute top-4 right-6 text-6xl font-black text-white/5 -z-10 select-none transition-colors group-hover:text-primary/10">
                {number}
            </div>
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-white transition-all group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground border border-white/10 group-hover:border-primary/50">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white group-hover:text-primary transition-colors">{title}</h3>
            <p className="text-zinc-400 leading-relaxed">
                {description}
            </p>

            {!isLast && (
                <div className="hidden lg:block absolute -right-6 top-1/2 transform -translate-y-1/2 z-10 text-white/10">
                    <ArrowRight className="h-8 w-8" />
                </div>
            )}
        </div>
    );
}
