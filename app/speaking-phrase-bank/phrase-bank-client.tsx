"use client";

import { useState, useMemo } from "react";
import Link from "next/link";

type Phrase = {
  phrase: string;
  category: string;
  example: string;
};

const PHRASES: Phrase[] = [
  // Opinions
  { phrase: "In my opinion...", category: "Opinions", example: "In my opinion, remote work has more benefits than drawbacks." },
  { phrase: "I'd say that...", category: "Opinions", example: "I'd say that education is one of the most important investments a society can make." },
  { phrase: "From my perspective...", category: "Opinions", example: "From my perspective, technology has made communication much easier." },
  { phrase: "As I see it...", category: "Opinions", example: "As I see it, public transport should be free for everyone." },
  { phrase: "It seems to me that...", category: "Opinions", example: "It seems to me that young people today face more pressure than previous generations." },
  { phrase: "I strongly believe that...", category: "Opinions", example: "I strongly believe that environmental protection must be a global priority." },
  { phrase: "Personally, I feel that...", category: "Opinions", example: "Personally, I feel that social media has a negative impact on mental health." },
  { phrase: "If you ask me...", category: "Opinions", example: "If you ask me, cities should invest more in green spaces." },
  // Examples
  { phrase: "For example...", category: "Examples", example: "For example, in Japan, people often work very long hours." },
  { phrase: "For instance...", category: "Examples", example: "For instance, many European countries offer free university education." },
  { phrase: "A good example of this is...", category: "Examples", example: "A good example of this is how Singapore manages its waste." },
  { phrase: "To illustrate...", category: "Examples", example: "To illustrate, consider how smartphones have changed daily life." },
  { phrase: "Take ... for example.", category: "Examples", example: "Take Sweden, for example — they've achieved excellent work-life balance." },
  { phrase: "This is evident in...", category: "Examples", example: "This is evident in how streaming services have replaced traditional TV." },
  { phrase: "One example that comes to mind is...", category: "Examples", example: "One example that comes to mind is the rise of electric vehicles." },
  // Contrast
  { phrase: "On the other hand...", category: "Contrast", example: "On the other hand, living in a city can be expensive and stressful." },
  { phrase: "However...", category: "Contrast", example: "However, not everyone has access to quality healthcare." },
  { phrase: "Although...", category: "Contrast", example: "Although technology has many benefits, it also creates new problems." },
  { phrase: "Despite this...", category: "Contrast", example: "Despite this, many people still prefer traditional learning methods." },
  { phrase: "In contrast...", category: "Contrast", example: "In contrast, rural areas tend to have lower living costs." },
  { phrase: "That said...", category: "Contrast", example: "That said, there are some clear advantages to a structured routine." },
  { phrase: "Nevertheless...", category: "Contrast", example: "Nevertheless, I think the benefits outweigh the risks." },
  { phrase: "Even so...", category: "Contrast", example: "Even so, many companies are reluctant to adopt flexible hours." },
  // Time
  { phrase: "These days...", category: "Time", example: "These days, most people rely on smartphones for almost everything." },
  { phrase: "In recent years...", category: "Time", example: "In recent years, online shopping has grown dramatically." },
  { phrase: "Nowadays...", category: "Time", example: "Nowadays, it's hard to imagine life without the internet." },
  { phrase: "In the past...", category: "Time", example: "In the past, people used to write letters instead of emails." },
  { phrase: "Over the last decade...", category: "Time", example: "Over the last decade, renewable energy has become much cheaper." },
  { phrase: "In the future...", category: "Time", example: "In the future, artificial intelligence may replace many jobs." },
  { phrase: "Eventually...", category: "Time", example: "Eventually, electric cars will become the standard." },
  { phrase: "At the moment...", category: "Time", example: "At the moment, the economy is recovering slowly." },
  // Agreeing
  { phrase: "I completely agree with...", category: "Agreeing", example: "I completely agree with the idea that education should be free." },
  { phrase: "That's a good point...", category: "Agreeing", example: "That's a good point — public transport does reduce congestion significantly." },
  { phrase: "Absolutely...", category: "Agreeing", example: "Absolutely, community engagement is essential for social cohesion." },
  { phrase: "I couldn't agree more.", category: "Agreeing", example: "I couldn't agree more — mental health deserves as much attention as physical health." },
  { phrase: "You're right to say...", category: "Agreeing", example: "You're right to say that urban planning affects quality of life." },
  { phrase: "I share that view.", category: "Agreeing", example: "I share that view — creativity should be encouraged from an early age." },
  // Disagreeing
  { phrase: "I'm not sure I agree...", category: "Disagreeing", example: "I'm not sure I agree — people still value face-to-face interaction." },
  { phrase: "I see it differently...", category: "Disagreeing", example: "I see it differently — stricter laws don't always reduce crime." },
  { phrase: "That's one way to look at it, but...", category: "Disagreeing", example: "That's one way to look at it, but there are serious drawbacks to consider." },
  { phrase: "I'd argue that...", category: "Disagreeing", example: "I'd argue that social media can be a positive force when used responsibly." },
  { phrase: "Actually, I think...", category: "Disagreeing", example: "Actually, I think working from home increases productivity for many people." },
  { phrase: "I disagree because...", category: "Disagreeing", example: "I disagree because the evidence suggests otherwise." },
  // Clarifying
  { phrase: "What I mean is...", category: "Clarifying", example: "What I mean is that people need more time to adapt to new technology." },
  { phrase: "To put it another way...", category: "Clarifying", example: "To put it another way, success often depends more on mindset than talent." },
  { phrase: "In other words...", category: "Clarifying", example: "In other words, quality matters more than quantity." },
  { phrase: "What I'm trying to say is...", category: "Clarifying", example: "What I'm trying to say is that education reform needs to start early." },
  { phrase: "Let me clarify...", category: "Clarifying", example: "Let me clarify — I'm not saying all technology is bad, just certain uses of it." },
  // Concluding
  { phrase: "To sum up...", category: "Concluding", example: "To sum up, I believe a balanced approach is the most effective solution." },
  { phrase: "In conclusion...", category: "Concluding", example: "In conclusion, both individuals and governments need to take responsibility." },
  { phrase: "All in all...", category: "Concluding", example: "All in all, I think the positives outweigh the negatives in this case." },
  { phrase: "To summarize...", category: "Concluding", example: "To summarize, the issue is complex but progress is possible." },
  { phrase: "Overall, I think...", category: "Concluding", example: "Overall, I think technology has improved our lives in significant ways." },
  { phrase: "In short...", category: "Concluding", example: "In short, we need better policies to address climate change." },
  // Describing
  { phrase: "What stands out is...", category: "Describing", example: "What stands out is how quickly attitudes have shifted in the last few years." },
  { phrase: "The most striking thing is...", category: "Describing", example: "The most striking thing is the lack of affordable housing in major cities." },
  { phrase: "It's characterized by...", category: "Describing", example: "It's characterized by a fast pace and a strong sense of community." },
  { phrase: "What makes it special is...", category: "Describing", example: "What makes it special is the mix of traditional and modern architecture." },
  { phrase: "It's worth noting that...", category: "Describing", example: "It's worth noting that this trend began well before the pandemic." },
  // Comparing
  { phrase: "Compared to...", category: "Comparing", example: "Compared to previous generations, young people today are more environmentally aware." },
  { phrase: "Similarly...", category: "Comparing", example: "Similarly, Japan and South Korea have both invested heavily in public transport." },
  { phrase: "In the same way...", category: "Comparing", example: "In the same way, athletes and musicians both require years of dedicated practice." },
  { phrase: "Both ... and ... are...", category: "Comparing", example: "Both exercise and sleep are essential for maintaining good mental health." },
  { phrase: "Unlike...", category: "Comparing", example: "Unlike urban areas, rural communities often have stronger social bonds." },
  { phrase: "While ... is ..., ... is ...", category: "Comparing", example: "While online learning is flexible, in-person learning is more interactive." },
  // Cause & Effect
  { phrase: "This leads to...", category: "Cause & Effect", example: "This leads to higher levels of stress and burnout in the workplace." },
  { phrase: "As a result...", category: "Cause & Effect", example: "As a result, many young people are leaving rural areas to find work." },
  { phrase: "Because of this...", category: "Cause & Effect", example: "Because of this, governments are investing in renewable energy." },
  { phrase: "Therefore...", category: "Cause & Effect", example: "Therefore, we need stricter regulations on plastic use." },
  { phrase: "Consequently...", category: "Cause & Effect", example: "Consequently, air quality in many cities has improved significantly." },
  { phrase: "This is why...", category: "Cause & Effect", example: "This is why early childhood education is so critical." },
  { phrase: "Due to...", category: "Cause & Effect", example: "Due to advances in medicine, people are living longer than ever before." },
];

const CATEGORIES = [
  "All",
  "Opinions",
  "Examples",
  "Contrast",
  "Time",
  "Agreeing",
  "Disagreeing",
  "Clarifying",
  "Concluding",
  "Describing",
  "Comparing",
  "Cause & Effect",
];

export default function PhraseBankClient() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [copied, setCopied] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return PHRASES.filter((p) => {
      const catMatch = activeCategory === "All" || p.category === activeCategory;
      const searchMatch =
        !q ||
        p.phrase.toLowerCase().includes(q) ||
        p.example.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return catMatch && searchMatch;
    });
  }, [activeCategory, search]);

  function toggleSelect(phrase: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(phrase)) next.delete(phrase);
      else next.add(phrase);
      return next;
    });
  }

  function toggleExpand(phrase: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(phrase)) next.delete(phrase);
      else next.add(phrase);
      return next;
    });
  }

  function handleCopy(phrase: string) {
    navigator.clipboard.writeText(phrase).then(() => {
      setCopied(phrase);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  const grouped = useMemo(() => {
    if (activeCategory !== "All") return null;
    const map = new Map<string, Phrase[]>();
    CATEGORIES.slice(1).forEach((cat) => {
      const items = filtered.filter((p) => p.category === cat);
      if (items.length) map.set(cat, items);
    });
    return map;
  }, [filtered, activeCategory]);

  return (
    <main className="page-shell section">
      <div className="section-head">
        <span className="eyebrow">Phrase Bank</span>
        <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.4rem)" }}>
          IELTS speaking phrase bank
        </h1>
        <p style={{ color: "var(--muted)" }}>
          {PHRASES.length}+ phrases organised by function. Click to highlight, expand to see an example.
        </p>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "1.25rem" }}>
        <input
          type="search"
          placeholder="Search phrases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 420,
            padding: "0.65rem 1rem",
            borderRadius: "var(--radius-md, 10px)",
            border: "1.5px solid var(--border)",
            background: "var(--surface)",
            color: "var(--fg, var(--text))",
            fontSize: "1rem",
            outline: "none",
          }}
        />
      </div>

      {/* Filter pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5rem",
          marginBottom: "2rem",
        }}
      >
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className="pill"
            style={{
              cursor: "pointer",
              border: "none",
              background:
                activeCategory === cat
                  ? "var(--primary)"
                  : "var(--surface)",
              color: activeCategory === cat ? "#fff" : "var(--muted)",
              outline: activeCategory === cat ? "2px solid var(--primary)" : "1px solid var(--border)",
              fontWeight: activeCategory === cat ? 600 : 400,
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Results count */}
      <p style={{ color: "var(--muted)", fontSize: "0.88rem", marginBottom: "1rem" }}>
        Showing {filtered.length} phrase{filtered.length !== 1 ? "s" : ""}
        {selected.size > 0 && ` · ${selected.size} highlighted`}
      </p>

      {/* Phrases */}
      {grouped ? (
        // Grouped by category when "All" is selected
        <div style={{ display: "grid", gap: "2rem" }}>
          {Array.from(grouped.entries()).map(([cat, phrases]) => (
            <div key={cat}>
              <h2
                style={{
                  fontSize: "1rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.07em",
                  color: "var(--muted)",
                  marginBottom: "0.75rem",
                }}
              >
                {cat}
              </h2>
              <PhraseList
                phrases={phrases}
                selected={selected}
                expanded={expanded}
                copied={copied}
                onToggleSelect={toggleSelect}
                onToggleExpand={toggleExpand}
                onCopy={handleCopy}
              />
            </div>
          ))}
        </div>
      ) : (
        <PhraseList
          phrases={filtered}
          selected={selected}
          expanded={expanded}
          copied={copied}
          onToggleSelect={toggleSelect}
          onToggleExpand={toggleExpand}
          onCopy={handleCopy}
        />
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--muted)" }}>
          No phrases match your search. Try a different term.
        </div>
      )}

      {/* CTA */}
      <div
        className="card"
        style={{
          marginTop: "3rem",
          padding: "2rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.4rem", margin: 0 }}>
          Ready to use these phrases?
        </h2>
        <p style={{ color: "var(--muted)", margin: 0, maxWidth: 480 }}>
          Practise using them in real IELTS-style answers with instant AI feedback.
        </p>
        <Link href="/app/practice" className="button button-primary">
          Practice using these phrases with AI
        </Link>
      </div>
    </main>
  );
}

type PhraseListProps = {
  phrases: Phrase[];
  selected: Set<string>;
  expanded: Set<string>;
  copied: string | null;
  onToggleSelect: (p: string) => void;
  onToggleExpand: (p: string) => void;
  onCopy: (p: string) => void;
};

function PhraseList({
  phrases,
  selected,
  expanded,
  copied,
  onToggleSelect,
  onToggleExpand,
  onCopy,
}: PhraseListProps) {
  return (
    <div style={{ display: "grid", gap: "0.5rem" }}>
      {phrases.map((p) => {
        const isSelected = selected.has(p.phrase);
        const isExpanded = expanded.has(p.phrase);
        const isCopied = copied === p.phrase;
        return (
          <div
            key={p.phrase}
            className="card"
            style={{
              padding: "0.85rem 1.1rem",
              border: isSelected
                ? "2px solid var(--primary)"
                : "1.5px solid var(--border)",
              background: isSelected
                ? "color-mix(in oklch, var(--primary) 6%, var(--surface))"
                : "var(--surface)",
              transition: "border-color 0.15s, background 0.15s",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <button
                onClick={() => onToggleSelect(p.phrase)}
                style={{
                  flex: 1,
                  minWidth: 0,
                  textAlign: "left",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                  fontSize: "1rem",
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected ? "var(--primary)" : "var(--fg, var(--text))",
                  lineHeight: 1.4,
                }}
              >
                {p.phrase}
              </button>
              <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                <button
                  onClick={() => onToggleExpand(p.phrase)}
                  title="Show example"
                  style={{
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md, 10px)",
                    padding: "0.3rem 0.6rem",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    color: "var(--muted)",
                    transition: "border-color 0.1s",
                  }}
                >
                  {isExpanded ? "Hide" : "Example"}
                </button>
                <button
                  onClick={() => onCopy(p.phrase)}
                  title="Copy phrase"
                  style={{
                    background: "none",
                    border: "1px solid var(--border)",
                    borderRadius: "var(--radius-md, 10px)",
                    padding: "0.3rem 0.6rem",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    color: isCopied ? "var(--success, #3bb86e)" : "var(--muted)",
                    transition: "color 0.15s",
                  }}
                >
                  {isCopied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
            {isExpanded && (
              <p
                style={{
                  margin: "0.65rem 0 0",
                  fontSize: "0.9rem",
                  color: "var(--muted)",
                  lineHeight: 1.6,
                  paddingTop: "0.65rem",
                  borderTop: "1px solid var(--border)",
                }}
              >
                <em>{p.example}</em>
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
