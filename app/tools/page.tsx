import { getServerLanguage } from "@/lib/language";
import { discoveryRefinementCopy } from "@/lib/discovery-refinement-copy";
import type { Metadata } from "next";
import { ToolDirectory } from "@/components/public/tool-directory";
import {
  PageHero,
  PageCTA,
  PublicButton,
} from "@/components/public/page-primitives";
import { siteConfig } from "@/lib/site";
import { toolPages } from "@/lib/seo-growth";

export const metadata: Metadata = {
  title: "Free IELTS Speaking Tools | SpeakAce",
  description:
    "Explore free IELTS speaking tools, cue-card generators, study planners, and score-focused practice helpers.",
  alternates: { canonical: "/tools" },
  openGraph: {
    title: "Free IELTS Speaking Tools | SpeakAce",
    description:
      "Use free IELTS calculators, cue-card generators, timers, and planners to start a focused speaking session.",
    url: `${siteConfig.domain}/tools`,
    siteName: siteConfig.name,
    type: "website",
  },
};

export default async function ToolsHubPage() {
  const t = discoveryRefinementCopy[await getServerLanguage()];
  const standalone = [
    {
      href: "/ielts-band-estimator",
      title: "IELTS Band Score Estimator",
      description:
        "Reflect on six speaking habits and get a practice estimate with suggested next steps. This self-assessment does not analyse a recording.",
      group: 1,
    },
    {
      href: "/speaking-timer",
      title: "Speaking Practice Timer",
      description:
        "Set the IELTS part, prepare your notes and keep an eye on the clock while you practise.",
      group: 0,
    },
    {
      href: "/speaking-phrase-bank",
      title: "IELTS Speaking Phrase Bank",
      description:
        "Find openers, linkers and ways to develop an example. Adapt them to your own ideas rather than memorising a script.",
      group: 2,
      reference: true,
    },
  ];
  return (
    <main className="public-container tools-directory">
      <PageHero
        eyebrow={t.eyebrow}
        title={t.toolHero}
        description={t.toolHeroBody}
      />
      <ToolDirectory
        tools={[
          ...standalone,
          ...toolPages.map((item) => ({
            href: `/tools/${item.slug}`,
            title: item.title,
            description: item.slug === "toefl-speaking-timer"
              ? "TOEFL timing reference and practice guidance. Use Speaking Practice Timer for an interactive countdown."
              : item.slug === "session-replay-tool"
                ? "Replay guidance and practice tips. Open saved attempts in your account to review your own recordings."
                : item.description,
            reference: ["toefl-speaking-timer", "session-replay-tool"].includes(item.slug),
            group: item.slug.includes("calculator")
              ? 1
              : /cue-card|question-generator|topic-generator|topic-of-the-day|timer/.test(
                    item.slug,
                  )
                ? 0
                : 2,
          })),
        ]}
      />
      <PageCTA
        title={t.toolClosing}
        description={t.toolClosingBody}
      >
        <PublicButton href="/app/practice">{t.practiceAction}</PublicButton>
      </PageCTA>
    </main>
  );
}
