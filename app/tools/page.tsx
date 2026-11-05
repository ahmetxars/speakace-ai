import type { Metadata } from "next";
import { BookOpenText, Gauge, Timer, Wrench } from "lucide-react";
import {
  PageHero,
  PageSection,
  PageCTA,
  PublicButton,
  ResourceCard,
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
      category: "Calculator",
      icon: Gauge,
    },
    {
      href: "/speaking-timer",
      title: "Speaking Practice Timer",
      description:
        "Set the IELTS part, prepare your notes and keep an eye on the clock while you practise.",
      category: "Timer",
      icon: Timer,
    },
    {
      href: "/speaking-phrase-bank",
      title: "IELTS Speaking Phrase Bank",
      description:
        "Find openers, linkers and ways to develop an example. Adapt them to your own ideas rather than memorising a script.",
      category: "Reference",
      icon: BookOpenText,
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
      <PageSection
        eyebrow="Start here"
        title="Keep a useful tool within reach."
      >
        <div className="public-resource-grid">
          {standalone.map((item, index) => (
            <ResourceCard
              key={item.href}
              {...item}
              index={index}
              icon={<item.icon size={23} />}
              action="Open tool"
            />
          ))}
        </div>
      </PageSection>
      <PageSection
        eyebrow="Prompts & planning"
        title="Choose the part of practice you need."
      >
        <div className="public-resource-grid">
          {toolPages.map((item, index) => (
            <ResourceCard
              key={item.slug}
              href={`/tools/${item.slug}`}
              category={
                item.slug.includes("calculator")
                  ? "Calculator"
                  : "Practice helper"
              }
              title={item.title}
              description={item.description}
              index={index}
              icon={<Wrench size={20} />}
              action={item.actionLabel ?? "Open tool"}
            />
          ))}
        </div>
      </PageSection>
      <PageCTA
        title="Take your notes into a real answer."
        description="Open a speaking prompt and work on one thing at a time."
      >
        <PublicButton href="/app/practice">Start free practice</PublicButton>
      </PageCTA>
    </main>
  );
}
