import type { Metadata } from "next";
import type { ReactNode } from "react";
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
