import { Metadata } from 'next';
import HowItWorksContent from './HowItWorksContent';

export const metadata: Metadata = {
    title: "How It Works | Create Your Own Custom Apparel",
    description: "Design your own custom t-shirts and gifts in 3 easy steps. Select a product, add your design, and we print and ship it to you.",
    openGraph: {
        title: "How It Works - Design Your Own Apparel",
        description: "From idea to your doorstep. See how easy it is to create unique custom products for yourself or as gifts.",
    }
};

export default function HowItWorksPage() {
    return <HowItWorksContent />;
}