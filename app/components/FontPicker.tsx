'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, Type, Check, Loader2, ChevronDown, X } from 'lucide-react';
import { GOOGLE_FONTS, GoogleFont } from '../data/googleFonts';
import { loadFont } from '../utils/fontLoader';
import { cn } from '@/lib/utils';
import { createPortal } from 'react-dom';

interface FontPickerProps {
    currentFont: string;
    onFontSelect: (fontFamily: string) => void;
    onClose?: () => void;
    className?: string;
}

const FontOption = ({ font, isSelected, onClick, loadingSelected }: { font: GoogleFont, isSelected: boolean, onClick: (e: React.MouseEvent, font: GoogleFont) => void, loadingSelected: boolean }) => {
    const [loaded, setLoaded] = useState(false);
    const ref = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !loaded) {
                loadFont(font.family).then(() => setLoaded(true));
                observer.disconnect();
            }
        }, { rootMargin: '50px' });

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => observer.disconnect();
    }, [font.family, loaded]);

    return (
        <button
            ref={ref}
            onClick={(e) => onClick(e, font)}
            className={cn(
                "w-full text-left px-3 py-2.5 rounded-lg flex items-center justify-between transition-all group",
                isSelected ? "bg-indigo-50 text-indigo-700" : "hover:bg-slate-50 text-slate-700"
            )}
        >
            <div className="flex flex-col">
                <span
                    className="text-base leading-tight transition-all duration-300"
                    style={{ fontFamily: loaded ? font.family : 'inherit' }}
                >
                    {font.family}
                </span>
                <span className="text-[10px] text-slate-400 font-medium group-hover:text-slate-500 transition-colors uppercase tracking-wider">{font.category}</span>
            </div>

            {loadingSelected ? (
                <Loader2 size={16} className="animate-spin text-indigo-500" />
            ) : isSelected && (
                <Check size={16} className="text-indigo-600" />
            )}
        </button>
    );
};

export default function FontPicker({ currentFont, onFontSelect, onClose, className }: FontPickerProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [loadingFont, setLoadingFont] = useState<string | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Filter fonts based on search
    const filteredFonts = useMemo(() => {
        if (!searchQuery) return GOOGLE_FONTS;
        const lowerQ = searchQuery.toLowerCase();
        return GOOGLE_FONTS.filter(f => f.family.toLowerCase().includes(lowerQ));
    }, [searchQuery]);

    // Handle selection
    const handleSelect = async (e: React.MouseEvent, font: GoogleFont) => {
        e.preventDefault();
        e.stopPropagation();

        if (loadingFont) return; // Prevent multiple clicks

        setLoadingFont(font.family);
        try {
            await loadFont(font.family);
            onFontSelect(font.family);
            setIsOpen(false);
        } catch (error) {
            console.error("Failed to load font", error);
        } finally {
            setLoadingFont(null);
        }
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    return (
        <div className={cn("relative font-sans text-left", className)} ref={containerRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl hover:bg-white hover:border-indigo-300 transition-all text-sm group"
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-100 flex items-center justify-center text-slate-500 shadow-sm group-hover:text-indigo-600 transition-colors">
                        <Type size={16} />
                    </div>
                    <div className="flex flex-col items-start truncate">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Font Family</span>
                        <span className="font-semibold text-slate-900 truncate" style={{ fontFamily: currentFont }}>{currentFont}</span>
                    </div>
                </div>
                <ChevronDown size={16} className={cn("text-slate-400 transition-transform duration-200", isOpen ? "rotate-180" : "")} />
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl border border-slate-200 shadow-xl z-50 flex flex-col w-[300px] max-h-[400px] animate-in fade-in zoom-in-95 duration-200 p-2 origin-top-left">
                    {/* Search Header */}
                    <div className="px-2 pb-2 border-b border-slate-50 mb-2">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            <input
                                autoFocus
                                type="text"
                                placeholder="Search fonts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-100 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    {/* Font List */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1 px-1">
                        {filteredFonts.length === 0 ? (
                            <div className="py-8 text-center text-xs text-slate-400">No fonts found</div>
                        ) : (
                            filteredFonts.map((font) => (
                                <FontOption
                                    key={font.family}
                                    font={font}
                                    isSelected={currentFont === font.family}
                                    onClick={handleSelect}
                                    loadingSelected={loadingFont === font.family}
                                />
                            ))
                        )}
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-50 text-center">
                        <p className="text-[10px] text-slate-400">Powered by Google Fonts</p>
                    </div>
                </div>
            )}
        </div>
    );
}
