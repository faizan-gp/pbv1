import { ArrowRight } from "lucide-react";

interface FeatureStepProps {
    number: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    isLast?: boolean;
}

export default function FeatureStep({ number, title, description, icon, isLast }: FeatureStepProps) {
    return (
        <div className="relative flex flex-col items-center text-center md:flex-row md:items-start md:text-left md:gap-6">
            <div className="flex-none">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold shadow-lg">
                    {number}
                </div>
                {!isLast && (
                    <div className="absolute left-6 top-12 -ml-px hidden h-full w-0.5 bg-gray-200 md:block dark:bg-gray-800"></div>
                )}
            </div>
            <div className="mt-4 md:mt-0 md:flex-1">
                <div className="mb-2 flex items-center justify-center md:justify-start gap-2 text-primary">
                    <span className="p-2 bg-primary/10 rounded-lg">{icon}</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight">{title}</h3>
                <p className="mt-2 text-muted-foreground">{description}</p>
            </div>
        </div>
    );
}
