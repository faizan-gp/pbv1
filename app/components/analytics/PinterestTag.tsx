
'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import sha256 from 'crypto-js/sha256';

const PINTEREST_TAG_ID = '2612754096162';

export default function PinterestTag() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [email, setEmail] = useState<string>('');

    useEffect(() => {
        if (session?.user?.email) {
            const hashedEmail = sha256(session.user.email.toLowerCase().trim()).toString();
            setEmail(hashedEmail);
        }
    }, [session]);

    useEffect(() => {
        // Track page view on route change
        if (typeof window.pintrk === 'function') {
            window.pintrk('page');
        }
    }, [pathname, searchParams]);

    return (
        <>
            <Script
                id="pinterest-tag"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                    !function(e){if(!window.pintrk){window.pintrk = function () {
                    window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
                      n=window.pintrk;n.queue=[],n.version="3.0";var
                      t=document.createElement("script");t.async=!0,t.src=e;var
                      r=document.getElementsByTagName("script")[0];
                      r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
                    pintrk('load', '${PINTEREST_TAG_ID}', {
                        em: '${email}'
                    });
                    pintrk('page');
                    `,
                }}
            />
            {/* Fallback for no-js */}
            <noscript>
                <img
                    height="1"
                    width="1"
                    style={{ display: 'none' }}
                    alt=""
                    src={`https://ct.pinterest.com/v3/?event=init&tid=${PINTEREST_TAG_ID}&pd[em]=${email}&noscript=1`}
                />
            </noscript>
        </>
    );
}

// Add type definition for pintrk
declare global {
    interface Window {
        pintrk: any;
    }
}
