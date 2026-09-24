   "use client";

import Script from "next/script";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function MetaPixelWrapper() {
    const pathname = usePathname();

    // Disparar PageView en cada cambio de ruta
    useEffect(() => {
        if (typeof window !== "undefined" && (window as any).fbq) {
            (window as any).fbq('track', 'PageView');
        }
    }, [pathname]);

    return (
        <>
            {/* Pixel oficial de Meta */}
            <Script
                id="facebook-pixel"
                strategy="afterInteractive"
                dangerouslySetInnerHTML={{
                    __html: `
                        !function(f,b,e,v,n,t,s)
                        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                        n.queue=[];t=b.createElement(e);t.async=!0;
                        t.src=v;s=b.getElementsByTagName(e)[0];
                        s.parentNode.insertBefore(t,s)}(window, document,'script',
                        'https://connect.facebook.net/en_US/fbevents.js');
                        fbq('init', '1060702146673864');
                        fbq('track', 'PageView');
                    `,
                }}
            />
            {/* Fallback para usuarios sin JS */}
            <noscript>
                <img
                    height="1"
                    width="1"
                    style={{ display: "none" }}
                    src="https://www.facebook.com/tr?id=1060702146673864&ev=PageView&noscript=1"
                    alt=""
                />
            </noscript>
        </>
    );
}