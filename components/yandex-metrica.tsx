'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import Script from 'next/script'

const COUNTER_ID = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID

export function YandexMetrica() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!COUNTER_ID) return

    // Track SPA route changes — send a "hit" on every navigation
    const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '')
    if (typeof window !== 'undefined' && typeof window.ym === 'function') {
      window.ym(Number(COUNTER_ID), 'hit', url)
    }
  }, [pathname, searchParams])

  if (!COUNTER_ID) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        '[YandexMetrica] NEXT_PUBLIC_YANDEX_METRIKA_ID is not set. ' +
        'Counter is disabled. Set it in .env or in your hosting environment variables.'
      )
    }
    return null
  }

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

          ym(${COUNTER_ID}, "init", {
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true,
            triggerEvent: true
          });
        `}
      </Script>
      <noscript>
        <div>
          <img
            src={`https://mc.yandex.ru/watch/${COUNTER_ID}`}
            style={{ position: 'absolute', left: '-9999px' }}
            alt=""
          />
        </div>
      </noscript>
    </>
  )
}
