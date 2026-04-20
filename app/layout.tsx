import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import Script from "next/script";
import { FloatingThemeToggle } from "@/components/floating-theme-toggle";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MarketingStickyCta } from "@/components/marketing-sticky-cta";
import { Providers } from "@/components/providers";
import { getServerDirection, getServerLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domain),
  title: {
    default: "SpeakAce AI — Practice English Speaking with AI",
    template: "%s | SpeakAce AI"
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  category: "education",
  applicationName: "SpeakAce AI",
  authors: [{ name: "SpeakAce", url: siteConfig.domain }],
  creator: "SpeakAce",
  publisher: "SpeakAce",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1
    }
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION
  },
  openGraph: {
    title: "SpeakAce AI — Practice English Speaking with AI",
    description: siteConfig.description,
    url: siteConfig.domain,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website",
    images: [
      {
        url: `${siteConfig.domain}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "SpeakAce AI — English Speaking Practice"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "SpeakAce AI — Practice English Speaking with AI",
    description: siteConfig.description,
    images: [`${siteConfig.domain}/og-image.png`]
  },
  alternates: {
    canonical: siteConfig.domain
  },
  manifest: "/manifest.webmanifest"
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  const requestHeaders = await headers();
  const language = await getServerLanguage();
  const direction = await getServerDirection();
  const currentPath = requestHeaders.get("x-current-path") ?? "/";
  const maintenanceMode = requestHeaders.get("x-maintenance-mode") === "true";
  const canonicalUrl = `${siteConfig.domain}${currentPath === "/" ? "" : currentPath}`;
  const isMaintenancePage = currentPath === "/maintenance";
  const hideGlobalChrome = isMaintenancePage;
  const showMarketingHeader =
    !hideGlobalChrome &&
    !currentPath.startsWith("/app") &&
    !currentPath.startsWith("/admin") &&
    currentPath !== "/auth";

  return (
    <html lang={language} dir={direction}>
      <head>
        <link rel="canonical" href={canonicalUrl} />
        {maintenanceMode ? <meta name="robots" content="noindex,nofollow" /> : null}
        {!hideGlobalChrome ? (
          <>
            <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />
            <link rel="dns-prefetch" href="https://googleads.g.doubleclick.net" />
            <link rel="dns-prefetch" href="https://fundingchoicesmessages.google.com" />
            <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
            <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://googleads.g.doubleclick.net" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://fundingchoicesmessages.google.com" crossOrigin="anonymous" />
            <link rel="preconnect" href="https://www.googletagmanager.com" crossOrigin="anonymous" />
            <script
              async
              fetchPriority="low"
              src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3403105676925789"
              crossOrigin="anonymous"
            />
            <Script src="https://www.googletagmanager.com/gtag/js?id=G-806S0CWRWX" strategy="afterInteractive" />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-806S0CWRWX');
              `}
            </Script>
            {process.env.NEXT_PUBLIC_CLARITY_ID ? (
              <Script id="microsoft-clarity" strategy="afterInteractive">
                {`
                  (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                  })(window, document, "clarity", "script", "${process.env.NEXT_PUBLIC_CLARITY_ID}");
                `}
              </Script>
            ) : null}
          </>
        ) : null}
      </head>
      <body>
        {/* Prevent flash of wrong theme — runs synchronously before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('speakace-theme');if(t==='dark'||t==='light'){document.body.dataset.theme=t;}else{document.body.dataset.theme=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}}catch(e){}})();`
          }}
        />
        <Providers>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: siteConfig.name,
                url: siteConfig.domain,
                logo: `${siteConfig.domain}/logo.png`,
                sameAs: [
                  "https://twitter.com/speakace",
                  "https://linkedin.com/company/speakace",
                  "https://youtube.com/@speakace"
                ],
                contactPoint: {
                  "@type": "ContactPoint",
                  email: siteConfig.contactEmail,
                  contactType: "customer support"
                },
                description: siteConfig.description
              })
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: siteConfig.name,
                url: siteConfig.domain,
                description: siteConfig.description,
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${siteConfig.domain}/blog?q={search_term_string}`
                  },
                  "query-input": "required name=search_term_string"
                }
              })
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                name: siteConfig.name,
                applicationCategory: "EducationalApplication",
                operatingSystem: "Web",
                url: siteConfig.domain,
                description: siteConfig.description,
                offers: {
                  "@type": "Offer",
                  price: "0",
                  priceCurrency: "USD",
                  availability: "https://schema.org/InStock"
                }
              })
            }}
          />
          {showMarketingHeader ? <SiteHeader /> : null}
          {children}
          {!hideGlobalChrome ? <FloatingThemeToggle /> : null}
          {!hideGlobalChrome ? <MarketingStickyCta /> : null}
          {!hideGlobalChrome ? <SiteFooter /> : null}
        </Providers>
      </body>
    </html>
  );
}
