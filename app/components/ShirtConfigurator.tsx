'use client';

import React from 'react';
import ShirtConfiguratorDesktop from './ShirtConfiguratorDesktop';
import ShirtConfiguratorMobile from './ShirtConfiguratorMobile';

interface ShirtConfiguratorProps {
    product: any;
}

import { useSearchParams } from 'next/navigation';

import PrintExpectationModal from './PrintExpectationModal';

export default function ShirtConfigurator(props: ShirtConfiguratorProps) {
    const searchParams = useSearchParams();
    const editCartId = searchParams.get('editCartId');
    const cartUserId = searchParams.get('cartUserId'); // remote user id
    const viewOnlyParam = searchParams.get('viewOnly');
    const viewOnly = viewOnlyParam === 'true';
    const initialColor = searchParams.get('color');
    const { product } = props;

    const [showOnboarding, setShowOnboarding] = React.useState(false);

    React.useEffect(() => {
        if (product.previewExpectationImage && product.realExpectationImage) {
            setShowOnboarding(true);
        }
    }, [product]);

    return (
        <>
            {showOnboarding && product.previewExpectationImage && product.realExpectationImage && (
                <PrintExpectationModal
                    previewImage={product.previewExpectationImage}
                    realImage={product.realExpectationImage}
                    onClose={() => {
                        setShowOnboarding(false);
                    }}
                />
            )}
            <div className="md:hidden">
                <ShirtConfiguratorMobile {...props} editCartId={editCartId} cartUserId={cartUserId} viewOnly={viewOnly} initialColor={initialColor} />
            </div>
            <div className="hidden md:block">
                <ShirtConfiguratorDesktop {...props} editCartId={editCartId} cartUserId={cartUserId} viewOnly={viewOnly} initialColor={initialColor} />
            </div>
        </>
    );
}