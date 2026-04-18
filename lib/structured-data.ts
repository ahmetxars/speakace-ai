export type FaqEntry = {
  question: string;
  answer: string;
};

export function jsonLdToHtml(payload: unknown) {
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}

export function buildFaqJsonLd(entries: FaqEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  };
}
