import type { Metadata } from "next";
import type { ReactNode } from "react";
import Script from "next/script";
import { FloatingThemeToggle } from "@/components/floating-theme-toggle";
import { SiteFooter } from "@/components/site-footer";
import { MarketingStickyCta } from "@/components/marketing-sticky-cta";
import { Providers } from "@/components/providers";
import { siteConfig } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.domain),
  title: {
    default: "SpeakAce AI",
    template: "%s | SpeakAce AI"
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  category: "education",
  applicationName: "SpeakAce AI",
  alternates: {
    canonical: siteConfig.domain
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION
  },
  openGraph: {
    title: "SpeakAce AI",
    description: siteConfig.description,
    url: siteConfig.domain,
    siteName: siteConfig.name,
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "SpeakAce AI",
    description: siteConfig.description
  },
  manifest: "/manifest.webmanifest"
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <head>
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
      </head>
      <body>
        <Providers>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Organization",
                name: siteConfig.name,
                url: siteConfig.domain,
                sameAs: [],
                description: siteConfig.description
              })
            }}
          />
          {children}
          <FloatingThemeToggle />
          <MarketingStickyCta />
          <SiteFooter />
        </Providers>
      </body>
    </html>
  );
}
