"use client";

import { useState } from "react";
import { Palette, Upload, MousePointerClick, Sparkles } from "lucide-react";

// --- MOCK DATA ---
const HERO_COLORS = [
    { name: "Midnight Black", class: "bg-slate-900", filter: "brightness(0.8)" },
    { name: "Royal Blue", class: "bg-blue-600", filter: "hue-rotate(200deg) brightness(1.2)" },
    { name: "Forest Green", class: "bg-green-700", filter: "hue-rotate(90deg) brightness(0.9)" },
    { name: "Heather Grey", class: "bg-gray-400", filter: "grayscale(100%) brightness(1.5)" },
];

export default function HeroVisual() {
    const [activeColor, setActiveColor] = useState(HERO_COLORS[0]);

    return (
        <div className="relative perspective-[2000px] flex flex-col items-center">

            {/* --- FLOATING ANIMATED STEPS --- */}

            {/* Step 1: Upload (Top Right) */}
            <div className="absolute top-12 -right-4 lg:-right-12 bg-white p-3 rounded-xl shadow-xl border border-slate-100 z-30 animate-bounce [animation-duration:4s]">
                <div className="flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                        <Upload size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Step 1</p>
                        <p className="text-xs font-bold text-slate-900">Add Text or Image</p>
                    </div>
                </div>
            </div>

            {/* Step 2: Drag (Middle Left) */}
            <div className="absolute top-1/2 -left-2 lg:-left-12 -translate-y-1/2 bg-white p-3 rounded-xl shadow-xl border border-slate-100 z-30 animate-pulse [animation-duration:3s]">
                <div className="flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                        <MousePointerClick size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Step 2</p>
                        <p className="text-xs font-bold text-slate-900">Drag & Drop</p>
                    </div>
                </div>
            </div>

            {/* Step 3: Style (Bottom Right) */}
            <div className="absolute bottom-32 -right-4 lg:-right-8 bg-white p-3 rounded-xl shadow-xl border border-slate-100 z-30 animate-bounce [animation-delay:1s] [animation-duration:4.5s]">
                <div className="flex items-center gap-3">
                    <div className="bg-pink-100 p-2 rounded-lg text-pink-600">
                        <Sparkles size={18} />
                    </div>
                    <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Step 3</p>
                        <p className="text-xs font-bold text-slate-900">Style It</p>
                    </div>
                </div>
            </div>

            {/* --- MAIN CARD --- */}
            <div className="relative z-20 w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 transform transition-transform duration-500 hover:rotate-y-[-2deg]">
                {/* Visual Header */}
                <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-4">
                    <div className="flex gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    </div>
                    <div className="text-xs font-mono text-slate-500">PREVIEW MODE</div>
                </div>

                {/* The Product Image */}
                <div className="aspect-[4/5] bg-slate-50 rounded-lg mb-6 relative overflow-hidden group">
                    <div className="absolute inset-0 transition-colors duration-500" style={{ backgroundColor: activeColor.class === 'bg-white' ? '#f8fafc' : '' }}></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <img
                            src="https://firebasestorage.googleapis.com/v0/b/printbrawl.firebasestorage.app/o/website%2Fshirt_sand_dune.webp?alt=media&token=5d4a8c14-5d9a-40ac-b3f2-0efc7ce9b032"
                            alt="Custom Hoodie"
                            className="w-full h-full object-cover mix-blend-multiply transition-all duration-500"
                        />
                    </div>
                    {/* Design Zone Overlay */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-48 border-2 border-dashed border-indigo-500/50 rounded bg-indigo-500/5 flex flex-col items-center justify-center text-indigo-600 animate-pulse">
                        <Upload className="w-8 h-8 mb-2 opacity-50" />
                        <span className="text-xs font-bold uppercase tracking-wider opacity-70">Your Design Here</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700">Select Color</span>
                        <span className="text-xs text-slate-500">{activeColor.name}</span>
                    </div>
                    <div className="flex gap-3">
                        {HERO_COLORS.map((color) => (
                            <button
                                key={color.name}
                                onClick={() => setActiveColor(color)}
                                className={`w-10 h-10 rounded-full border-2 shadow-sm transition-all ${color.class} ${activeColor.name === color.name ? 'border-indigo-600 scale-110 ring-2 ring-indigo-200' : 'border-slate-200 hover:scale-105'}`}
                                aria-label={`Select ${color.name}`}
                            />
                        ))}
                    </div>
                    <button className="w-full py-3 mt-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2">
                        <Palette className="w-4 h-4" /> Customize This Product
                    </button>
                </div>
            </div>
        </div>
    );
}
