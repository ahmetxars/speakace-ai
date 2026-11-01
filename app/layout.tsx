import { getCommercialEmailConfigurationStatus } from "@/lib/server/email";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { headers } from "next/headers";
import { CookieConsentPanel } from "@/components/cookie-consent";
import { CheckoutRecoveryPrompt } from "@/components/checkout-recovery-prompt";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { MarketingStickyCta } from "@/components/marketing-sticky-cta";
import { Providers } from "@/components/providers";
import { getServerDirection, getServerLanguage } from "@/lib/language";
import { siteConfig } from "@/lib/site";
import "@fontsource/dm-sans/400.css";
import "@fontsource/dm-sans/500.css";
import "@fontsource/dm-sans/600.css";
import "@fontsource/dm-sans/700.css";
import "@fontsource/instrument-serif/latin-400-italic.css";
import "./globals.css";
import "./refresh.css";
import "./editorial.css";

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

  return (
    <html lang={language} dir={direction}>
      <head>
        <link rel="canonical" href={canonicalUrl} />
        {maintenanceMode ? <meta name="robots" content="noindex,nofollow" /> : null}

      </head>
      <body className={currentPath.startsWith("/admin") ? "admin-site" : currentPath.startsWith("/app") ? "application-site" : currentPath.startsWith("/auth") ? "auth-site" : "public-site"} suppressHydrationWarning>
        {/* Prevent flash of wrong theme — runs synchronously before React hydration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(document.body.classList.contains('public-site')||document.body.classList.contains('auth-site')){document.body.dataset.theme='light';return;}var t=localStorage.getItem('speakace-theme');if(t==='dark'||t==='light'){document.body.dataset.theme=t;}else{document.body.dataset.theme=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}}catch(e){}})();`
          }}
        />
        <Providers initialLanguage={language} commercialEmailEnabled={getCommercialEmailConfigurationStatus().ready}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: siteConfig.name,
                url: siteConfig.domain,
                logo: `${siteConfig.domain}/brand/speakace-logo.png`,
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
                description: siteConfig.description
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
          {!hideGlobalChrome ? <SiteHeader /> : null}
          {children}
          {!hideGlobalChrome ? <CookieConsentPanel /> : null}
          {!hideGlobalChrome ? <CheckoutRecoveryPrompt /> : null}
          {!hideGlobalChrome ? <MarketingStickyCta /> : null}
          {!hideGlobalChrome ? <SiteFooter /> : null}
        </Providers>
      </body>
    </html>
  );
}
