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
        <div className="group relative flex flex-col items-center text-center p-8 rounded-2xl bg-white border border-gray-200 shadow-sm transition-all hover:border-indigo-100 hover:shadow-xl hover:-translate-y-1">
            <div className="absolute top-4 right-6 text-6xl font-black text-gray-100 -z-10 select-none transition-colors group-hover:text-indigo-50">
                {number}
            </div>
            <div className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 transition-all group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white border border-indigo-100 group-hover:border-indigo-600">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
            <p className="text-gray-600 leading-relaxed">
                {description}
            </p>

            {!isLast && (
                <div className="hidden lg:block absolute -right-6 top-1/2 transform -translate-y-1/2 z-10 text-gray-300">
                    <ArrowRight className="h-8 w-8" />
                </div>
            )}
        </div>
    );
}
