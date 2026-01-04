'use client';

import React from 'react';
import ShirtConfiguratorDesktop from './ShirtConfiguratorDesktop';
import ShirtConfiguratorMobile from './ShirtConfiguratorMobile';

interface ShirtConfiguratorProps {
    product: any;
}

import { useSearchParams } from 'next/navigation';

export default function ShirtConfigurator(props: ShirtConfiguratorProps) {
    const searchParams = useSearchParams();
    const editCartId = searchParams.get('editCartId');

    return (
        <>
            <div className="md:hidden">
                <ShirtConfiguratorMobile {...props} editCartId={editCartId} />
            </div>
            <div className="hidden md:block">
                <ShirtConfiguratorDesktop {...props} editCartId={editCartId} />
            </div>
        </>
    );
}