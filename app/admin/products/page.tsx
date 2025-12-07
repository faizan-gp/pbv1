import Link from 'next/link';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
import { Edit, Plus, ExternalLink } from 'lucide-react';

async function getProducts() {
    await dbConnect();
    const products = await Product.find({}).sort({ _id: -1 }).lean();
    return JSON.parse(JSON.stringify(products));
}

export default async function AdminProductsPage() {
    const products = await getProducts();

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="sm:flex sm:items-center">
                    <div className="sm:flex-auto">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Products</h1>
                        <p className="mt-2 text-sm text-gray-700">
                            A list of all products in your catalog including their name, category, and trending status.
                        </p>
                    </div>
                    <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                        <Link
                            href="/admin/products/create"
                            className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            <span className="flex items-center gap-2">
                                <Plus className="h-4 w-4" /> Add Product
                            </span>
                        </Link>
                    </div>
                </div>
                <div className="mt-8 flow-root">
                    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg bg-white">
                                <table className="min-w-full divide-y divide-gray-300">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                                                Image
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Name
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Category
                                            </th>
                                            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                                                Status
                                            </th>
                                            <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                                                <span className="sr-only">Edit</span>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200 bg-white">
                                        {products.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="py-10 text-center text-gray-500">
                                                    No products found. Start by creating one.
                                                </td>
                                            </tr>
                                        ) : (
                                            products.map((product: any) => (
                                                <tr key={product.id}>
                                                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                                                        <div className="h-12 w-12 flex-shrink-0">
                                                            <img className="h-12 w-12 rounded-md object-contain border border-gray-200 bg-gray-50" src={product.image || '/placeholder.png'} alt="" />
                                                        </div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                                                        {product.name}
                                                        <div className="text-gray-500 text-xs font-normal font-mono mt-0.5">{product.id}</div>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        <span className="inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10">
                                                            {product.category}
                                                        </span>
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                                        {product.trending && (
                                                            <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700 ring-1 ring-inset ring-indigo-700/10">
                                                                Trending
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                        <div className="flex justify-end gap-4">
                                                            <Link href={`/admin/products/${product.id}`} className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1">
                                                                <Edit className="h-3 w-3" /> Edit
                                                            </Link>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
