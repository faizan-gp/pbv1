import ProductCreator from '../components/ProductCreator';

export default function CreateProductPage() {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-6xl mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Product Creator</h1>
                    <p className="text-gray-600 mt-2">Upload a product image and define the printable design zone.</p>
                </div>
                <ProductCreator />
            </div>
        </div>
    );
}
