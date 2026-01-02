'use client';

import React from 'react';
import DesignEditorDesktop from './DesignEditorDesktop';
import DesignEditorMobile from './DesignEditorMobile';
import { Product } from '../data/products';

interface DesignEditorProps {
    onUpdate: (data: { dataUrl: string; jsonState: any }) => void;
    product: Product;
    activeViewId: string;
    initialState?: any;
}

export default function DesignEditor(props: DesignEditorProps) {
    return (
        <>
            <div className="md:hidden h-full">
                <DesignEditorMobile {...props} />
            </div>
            <div className="hidden md:block h-full">
                <DesignEditorDesktop {...props} />
            </div>
        </>
    );
}