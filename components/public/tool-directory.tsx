"use client";
import { useDeferredValue, useState } from "react";
import { useAppState } from "@/components/providers";
import { normalizePublicLanguage } from "@/lib/copy";
import { discoveryRefinementCopy } from "@/lib/discovery-refinement-copy";
import { handleTabKeys } from "@/lib/tab-navigation";
import { LibrarySearch } from "./library-search";
import { ResourceCard } from "./page-primitives";

type Tool = {
  href: string;
  title: string;
  description: string;
  group: number;
  reference?: boolean;
};
export function ToolDirectory({ tools }: { tools: Tool[] }) {
  const { language } = useAppState();
  const t = discoveryRefinementCopy[normalizePublicLanguage(language)];
  const [group, setGroup] = useState(-1);
  const [query, setQuery] = useState("");
  const search = useDeferredValue(query.trim().toLocaleLowerCase());
  const filtered = tools.filter(
    (tool) =>
      (group === -1 || tool.group === group) &&
      (!search ||
        `${tool.title} ${tool.description}`
          .toLocaleLowerCase()
          .includes(search)),
  );
  return (
    <section
      className="public-section tool-directory-library"
      aria-labelledby="tool-directory-title"
    >
      <div className="public-section-head">
        <div>
          <span className="public-kicker">{t.eyebrow}</span>
          <h2 id="tool-directory-title">{t.toolTitle}</h2>
        </div>
        <p>{t.toolIntro}</p>
      </div>
      <div
        className="resource-library-tabs"
        role="tablist"
        aria-label={t.allTools}
        onKeyDown={handleTabKeys}
      >
        {[t.allTools, ...t.toolGroups].map((label, i) => (
          <button
            key={label}
            id={`tool-tab-${i}`}
            type="button"
            role="tab"
            aria-controls="tool-results"
            aria-selected={group === i - 1}
            tabIndex={group === i - 1 ? 0 : -1}
            onClick={() => setGroup(i - 1)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="tool-discovery-summary">
        <p>{group === -1 ? t.limitation : t.toolNotes[group]}</p>
        <LibrarySearch value={query} label={t.allTools} onChange={setQuery} />
      </div>
      <p className="resource-library-count" aria-live="polite">
        {filtered.length} {t.results}
      </p>
      <div
        id="tool-results"
        role="tabpanel"
        aria-labelledby={`tool-tab-${group + 1}`}
        className="public-resource-grid"
      >
        {filtered.map((tool, i) => (
          <ResourceCard
            key={tool.href}
            href={tool.href}
            title={tool.title}
            description={tool.description}
            category={
              t.toolGroups[tool.group] +
              " · " +
              (tool.reference ? t.reference : t.interactive)
            }
            action={t.open}
            index={i}
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <div className="tool-empty">
          <p>
            {t.showing} 0 {t.results}
          </p>
          <button
            className="public-button is-secondary"
            type="button"
            onClick={() => {
              setGroup(-1);
              setQuery("");
            }}
          >
            {t.reset}
          </button>
        </div>
      )}
    </section>
  );
}
