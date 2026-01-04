import { Metadata } from 'next';
import ContactContent from './ContactContent';

export const metadata: Metadata = {
    title: "Contact Support | Print Brawl",
    description: "Need help with your custom order? Contact our friendly support team for assistance with designing, shipping, or returns.",
    openGraph: {
        title: "Contact Print Brawl",
        description: "We're here to help. Reach out to us for any questions about your custom apparel.",
    }
};

export default function ContactPage() {
    return <ContactContent />;
}
