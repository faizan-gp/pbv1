
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Terms of Service | Print Brawl",
    description: "Terms and conditions for using Print Brawl services.",
};

export default function TermsOfServicePage() {
    return (
        <div className="min-h-screen bg-slate-50 py-24">
            <div className="container-width max-w-4xl px-6">
                <div className="bg-white p-8 md:p-12 rounded-2xl border border-slate-200 shadow-sm">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-8">Terms of Service</h1>
                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p className="lead text-lg">
                            Last Updated: {new Date().toLocaleDateString()}
                        </p>
                        <p>
                            Welcome to Print Brawl. By accessing or using our website and services, you agree to be bound by these Terms of Service. Please read them carefully.
                        </p>

                        <h3>1. Custom Products & Refund Policy</h3>
                        <p>
                            Because our products are custom-made to order based on your specific design and requirements, <strong>we cannot offer refunds or exchanges for "change of mind" or incorrect size selection.</strong>
                        </p>
                        <p>
                            <strong>Defective Items:</strong> If you receive a defective product or a print error that is our fault, please contact us within 14 days of delivery. We will gladly provide a free replacement or refund upon verification of the issue (photos required).
                        </p>

                        <h3>2. User-Generated Content & Copyright</h3>
                        <p>
                            By uploading any image, design, text, or other content ("User Content") to Print Brawl, you adhere to the following:
                        </p>
                        <ul>
                            <li><strong>Ownership:</strong> You represent and warrant that you own all rights to the User Content or have obtained all necessary permissions to use and reproduce it.</li>
                            <li><strong>Indemnification:</strong> You agree to indemnify, defend, and hold harmless Print Brawl and its affiliates from any claims, damages, liabilities, and expenses arising out of any third-party claim that your User Content infringes upon their intellectual property rights.</li>
                            <li><strong>Right of Refusal:</strong> We reserve the right to refuse to print any content that we deem illegal, hateful, obscene, or infringing on intellectual property rights.</li>
                        </ul>

                        <h3>3. Color & Print Disclaimer</h3>
                        <p>
                            Please note that colors viewed on a digital screen (RGB) may appear different when printed on fabric (CMYK). We strive for accuracy, but slight variations in color, vibrancy, and placement are standard in the custom printing industry and are not considered defects.
                        </p>

                        <h3>4. Shipping & Delivery</h3>
                        <p>
                            Production times listed on our site are estimates. While we aim to meet these timelines, delays can occur due to stock availability or high volume. Shipping times are determined by the carrier and are outside our direct control once the package leaves our facility.
                        </p>

                        <h3>5. Limitation of Liability</h3>
                        <p>
                            To the fullest extent permitted by law, Print Brawl shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with the use of our services.
                        </p>

                        <h3>6. Changes to Terms</h3>
                        <p>
                            We reserve the right to modify these terms at any time. Continued use of our service after changes constitutes acceptance of the new terms.
                        </p>

                        <hr className="my-8 border-slate-200" />
                        <p className="text-sm">
                            Questions about these terms? Contact us at <a href="mailto:support@printbrawl.com" className="text-indigo-600 hover:underline">hello@printbrawl.com</a>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
