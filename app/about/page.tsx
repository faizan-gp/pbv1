import React from 'react';
import Image from 'next/image';

export default function AboutPage() {
    return (
        <div className="bg-white dark:bg-black min-h-screen">
            {/* Hero Section */}
            <div className="relative isolate overflow-hidden bg-gradient-to-b from-indigo-100/20 pt-14">
                <div className="absolute inset-y-0 right-1/2 -z-10 -mr-96 w-[200%] origin-top-right skew-x-[-30deg] bg-white shadow-xl shadow-indigo-600/10 ring-1 ring-indigo-50 sm:-mr-80 lg:-mr-96" aria-hidden="true" />
                <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
                    <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-none">
                        <p className="text-base font-semibold leading-7 text-indigo-600">Our Story</p>
                        <h1 className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">We empower creators to bring their visions to life.</h1>
                        <div className="mt-10 grid max-w-xl grid-cols-1 gap-8 text-base leading-7 text-gray-700 dark:text-gray-300 lg:max-w-none lg:grid-cols-2">
                            <div>
                                <p>
                                    PrintBrawl started with a simple idea: high-quality custom printing shouldn't be complicated or expensive. We believe that everyone has a creative spark, and our mission is to provide the tools and technology to ignite it.
                                </p>
                                <p className="mt-8">
                                    From humble beginnings in a garage, we've grown into a passionate team dedicated to delivering premium custom products. We combine cutting-edge printing technology with intuitive design software to ensure that what you see on screen is exactly what you get in your hands.
                                </p>
                            </div>
                            <div>
                                <p>
                                    We're not just a printing company; we're a partner in your creative journey. Whether you're launching a brand, creating unique gifts, or outfitting your team, we're here to help you make a lasting impression.
                                </p>
                                <p className="mt-8">
                                    Quality, speed, and customer satisfaction are at the core of everything we do. We meticulously source our base products and constantly refine our printing processes to guarantee durability and vibrancy in every print.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="mx-auto mt-8 max-w-7xl px-6 lg:px-8 pb-24">
                <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
                    <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                        <dt className="text-base leading-7 text-gray-600 dark:text-gray-400">Products Shipped</dt>
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">100k+</dd>
                    </div>
                    <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                        <dt className="text-base leading-7 text-gray-600 dark:text-gray-400">Happy Customers</dt>
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">50k+</dd>
                    </div>
                    <div className="mx-auto flex max-w-xs flex-col gap-y-4">
                        <dt className="text-base leading-7 text-gray-600 dark:text-gray-400">Designs Created</dt>
                        <dd className="order-first text-3xl font-semibold tracking-tight text-gray-900 dark:text-white sm:text-5xl">250k+</dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}
