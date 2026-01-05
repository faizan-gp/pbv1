
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Privacy Policy | Print Brawl",
    description: "How we collect, use, and protect your data.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-slate-50 py-24">
            <div className="container-width max-w-4xl px-6">
                <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8">Privacy Policy</h1>
                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p className="lead text-lg">
                            Last Updated: {new Date().toLocaleDateString()}
                        </p>
                        <p>
                            At Print Brawl, we respect your privacy and are committed to protecting the personal information you share with us. This policy explains what data we collect and how we use it.
                        </p>

                        <h3>1. Information We Collect</h3>
                        <ul>
                            <li><strong>Order Information:</strong> When you make a purchase, we collect your name, shipping address, and email address to fulfill your order.</li>
                            <li><strong>Design Assets:</strong> We store the images and design files you upload solely for the purpose of printing your custom products.</li>
                            <li><strong>Payment Information:</strong> We do <strong>not</strong> store your credit card details. All payment transactions are processed securely by our third-party payment providers (e.g., Stripe, PayPal).</li>
                        </ul>

                        <h3>2. How We Use Your Data</h3>
                        <p>
                            We use your information to:
                        </p>
                        <ul>
                            <li>Process and ship your orders.</li>
                            <li>Communicate with you regarding order status or customer service inquiries.</li>
                            <li>Improve our website and product offerings.</li>
                        </ul>
                        <p>
                            We do <strong>not</strong> sell your personal data to advertisers or third parties.
                        </p>

                        <h3>3. Third-Party Sharing</h3>
                        <p>
                            We may share necessary data with trusted third-party partners strictly for fulfillment purposes, such as:
                        </p>
                        <ul>
                            <li><strong>Print Providers:</strong> To manufacture your custom items.</li>
                            <li><strong>Shipping Carriers:</strong> To deliver your package (e.g., USPS, FedEx).</li>
                        </ul>

                        <h3>4. Cookies</h3>
                        <p>
                            We use essential cookies to keep track of your shopping cart contents and ensure the website functions correctly. We may also use analytics cookies to understand how visitors interact with our site, which helps us improve the user experience.
                        </p>

                        <h3>5. Data Security</h3>
                        <p>
                            We implement industry-standard security measures to protect your data during transmission and storage. However, no method of transmission over the internet is 100% secure.
                        </p>

                        <h3>6. Your Rights</h3>
                        <p>
                            You have the right to request access to the personal information we hold about you or to request its deletion, subject to our need to retain records for order processing and legal compliance.
                        </p>

                        <hr className="my-8 border-slate-200" />
                        <p className="text-sm">
                            For privacy concerns, please contact our Data Privacy Officer at <a href="mailto:privacy@printbrawl.com" className="text-indigo-600 hover:underline">hello@printbrawl.com</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
