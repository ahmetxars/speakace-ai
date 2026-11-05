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

export default function ToolsHubPage() {
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
        eyebrow="Practice toolkit"
        title={
          <>
            One small tool.
            <br />
            <em>A more focused session.</em>
          </>
        }
        description="Choose a timer, a calculator or a planning exercise. These tools help you prepare and reflect; they do not award an official exam score."
      />
      <ToolDirectory
        tools={[
          ...standalone,
          ...toolPages.map((item) => ({
            href: `/tools/${item.slug}`,
            title: item.title,
            description: item.description,
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
        title="Take your notes into a real answer."
        description="Open a speaking prompt and work on one thing at a time."
      >
        <PublicButton href="/app/practice">Start free practice</PublicButton>
      </PageCTA>
    </main>
  );
}
