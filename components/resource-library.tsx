"use client";

import { useAppState } from "@/components/providers";
import { normalizePublicLanguage } from "@/lib/copy";
import { discoveryRefinementCopy } from "@/lib/discovery-refinement-copy";
import { usePanelFeedback } from "@/components/motion/use-panel-feedback";
import { handleTabKeys } from "@/lib/tab-navigation";
import type { Route } from "next";
import { ResourceCard } from "@/components/public/page-primitives";
import { LibrarySearch } from "@/components/public/library-search";
import { startTransition, useDeferredValue, useState } from "react";
import { BookOpenText, Gauge, Repeat2, Search, Wrench } from "lucide-react";

export type ResourceCategory = "exam" | "skills" | "tools" | "habit";

export type ResourceLibraryItem = {
  href: Route;
  category: ResourceCategory;
  kicker: string;
  title: string;
  description: string;
};

type ResourceLibraryProps = {
  eyebrow: string;
  title: string;
  description: string;
  tabLabel: string;
  searchPlaceholder: string;
  resultLabel: string;
  emptyLabel: string;
  openLabel: string;
  showMoreLabel: string;
  categories: Record<"all" | ResourceCategory, string>;
  items: ResourceLibraryItem[];
};

const categoryIcons = {
  exam: BookOpenText,
  skills: Gauge,
  tools: Wrench,
  habit: Repeat2,
} as const;

export function ResourceLibrary({
  eyebrow,
  title,
  description,
  tabLabel,
  searchPlaceholder,
  resultLabel,
  emptyLabel,
  openLabel,
  showMoreLabel,
  categories,
  items,
}: ResourceLibraryProps) {
  const { language } = useAppState();
  const discovery = discoveryRefinementCopy[normalizePublicLanguage(language)];
  const [activeCategory, setActiveCategory] = useState<
    "all" | ResourceCategory
  >("all");
  const [query, setQuery] = useState("");
  const feedback = usePanelFeedback(activeCategory);
  const [visibleLimit, setVisibleLimit] = useState(6);
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  const categoryOrder: Array<"all" | ResourceCategory> = [
    "all",
    "exam",
    "skills",
    "tools",
    "habit",
  ];
  const visibleItems = items.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const searchable =
      `${item.kicker} ${item.title} ${item.description}`.toLocaleLowerCase();
    return (
      matchesCategory && (!deferredQuery || searchable.includes(deferredQuery))
    );
  });

  return (
    <section
      {...feedback.input}
      className="resource-library"
      aria-labelledby="resource-library-title"
    >
      <div className="resource-library-head">
        <div>
          <span className="content-kicker">{eyebrow}</span>
          <h2 id="resource-library-title">{title}</h2>
        </div>
        <p>{description}</p>
      </div>

      <div className="resource-intent-grid" aria-label={discovery.title}>
        {(["habit", "skills", "exam", "tools"] as const).map(
          (category, index) => (
            <button
              key={category}
              type="button"
              aria-pressed={activeCategory === category}
              onClick={() => {
                setActiveCategory(category);
                setVisibleLimit(6);
              }}
            >
              <strong>{discovery.intents[index]}</strong>
              <span>{discovery.notes[index]}</span>
            </button>
          ),
        )}
      </div>
      <div className="resource-library-controls">
        <div
          className="resource-library-tabs"
          role="tablist"
          onKeyDown={handleTabKeys}
          aria-label={tabLabel}
        >
          {categoryOrder.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              id={`resource-tab-${category}`}
              aria-controls="resource-results"
              tabIndex={activeCategory === category ? 0 : -1}
              aria-selected={activeCategory === category}
              className={activeCategory === category ? "is-active" : ""}
              onClick={() =>
                startTransition(() => {
                  setActiveCategory(category);
                  setVisibleLimit(6);
                })
              }
            >
              {categories[category]}
            </button>
          ))}
        </div>

        <LibrarySearch
          value={query}
          label={searchPlaceholder}
          onChange={(value) => {
            setQuery(value);
            setVisibleLimit(6);
          }}
        />
      </div>

      <div
        className="resource-library-grid public-resource-grid"
        role="tabpanel"
        ref={feedback.ref}
        id="resource-results"
        aria-labelledby={`resource-tab-${activeCategory}`}
      >
        {visibleItems.slice(0, visibleLimit).map((item, index) => {
          const Icon = categoryIcons[item.category];
          return (
            <ResourceCard
              key={item.href}
              href={item.href}
              category={item.kicker}
              title={item.title}
              description={item.description}
              action={openLabel}
              index={index}
              icon={<Icon size={18} aria-hidden="true" />}
            />
          );
        })}
      </div>

      {visibleItems.length === 0 ? (
        <p className="resource-library-empty" role="status">
          <Search size={20} aria-hidden="true" />
          {emptyLabel}
        </p>
      ) : null}

      {visibleItems.length > visibleLimit ? (
        <button
          type="button"
          className="resource-library-more"
          onClick={() =>
            startTransition(() => setVisibleLimit((current) => current + 6))
          }
        >
          {showMoreLabel}
          <span>
            {visibleLimit} / {visibleItems.length}
          </span>
        </button>
      ) : null}

      {(activeCategory !== "all" || query) && (
        <button
          type="button"
          className="library-reset"
          onClick={() => {
            setActiveCategory("all");
            setQuery("");
            setVisibleLimit(6);
          }}
        >
          {discovery.reset}
        </button>
      )}
      <p className="resource-library-count" aria-live="polite">
        {discovery.showing} {Math.min(visibleLimit, visibleItems.length)}{" "}
        {discovery.of} {visibleItems.length} {resultLabel}
      </p>
    </section>
  );
}
