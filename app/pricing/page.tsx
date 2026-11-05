import type { Metadata } from "next";
import { PricingCards } from "@/components/pricing-cards";
import { getServerLanguage } from "@/lib/language";
import { normalizePublicLanguage } from "@/lib/copy";
import { pricingCopy } from "@/lib/pricing-copy";
export async function generateMetadata(): Promise<Metadata> {
  const t = pricingCopy[normalizePublicLanguage(await getServerLanguage())];
  return {
    title: "SpeakAce Plus · " + t.eyebrow,
    description: t.intro,
    alternates: { canonical: "/pricing" },
  };
}
export default function PricingPage() {
  return <PricingCards />;
}
