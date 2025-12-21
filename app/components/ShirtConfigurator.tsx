'use client';

import React from 'react';
import ShirtConfiguratorDesktop from './ShirtConfiguratorDesktop';
import ShirtConfiguratorMobile from './ShirtConfiguratorMobile';

interface ShirtConfiguratorProps {
    product: any;
}

export default function ShirtConfigurator(props: ShirtConfiguratorProps) {
    return (
        <>
            <div className="md:hidden">
                <ShirtConfiguratorMobile {...props} />
            </div>
            <div className="hidden md:block">
                <ShirtConfiguratorDesktop {...props} />
            </div>
        </>
    );
}