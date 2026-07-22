"use client";

import type { Route } from "next";
import Link from "next/link";
import { startTransition, useDeferredValue, useState } from "react";
import { ArrowUpRight, BookOpenText, Gauge, Repeat2, Search, Wrench } from "lucide-react";

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
  openLabel,
  showMoreLabel,
  categories,
  items,
}: ResourceLibraryProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | ResourceCategory>("all");
  const [query, setQuery] = useState("");
  const [visibleLimit, setVisibleLimit] = useState(6);
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  const categoryOrder: Array<"all" | ResourceCategory> = ["all", "exam", "skills", "tools", "habit"];
  const visibleItems = items.filter((item) => {
    const matchesCategory = activeCategory === "all" || item.category === activeCategory;
    const searchable = `${item.kicker} ${item.title} ${item.description}`.toLocaleLowerCase();
    return matchesCategory && (!deferredQuery || searchable.includes(deferredQuery));
  });

  return (
    <section className="resource-library" aria-labelledby="resource-library-title">
      <div className="resource-library-head">
        <div>
          <span className="content-kicker">{eyebrow}</span>
          <h2 id="resource-library-title">{title}</h2>
        </div>
        <p>{description}</p>
      </div>

      <div className="resource-library-controls">
        <div className="resource-library-tabs" role="tablist" aria-label={tabLabel}>
          {categoryOrder.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={activeCategory === category}
              className={activeCategory === category ? "is-active" : ""}
              onClick={() => startTransition(() => {
                setActiveCategory(category);
                setVisibleLimit(6);
              })}
            >
              {categories[category]}
            </button>
          ))}
        </div>

        <label className="resource-library-search">
          <Search size={15} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleLimit(6);
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        </label>
      </div>

      <div className="resource-library-grid" role="tabpanel">
        {visibleItems.slice(0, visibleLimit).map((item, index) => {
          const Icon = categoryIcons[item.category];
          return (
            <article key={item.href} className="resource-library-card">
              <div className="resource-library-card-topline">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <Icon size={17} aria-hidden="true" />
              </div>
              <span className="resource-library-card-kicker">{item.kicker}</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link href={item.href}>
                {openLabel}
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </div>

      {visibleItems.length > visibleLimit ? (
        <button
          type="button"
          className="resource-library-more"
          onClick={() => startTransition(() => setVisibleLimit((current) => current + 6))}
        >
          {showMoreLabel}
          <span>{visibleLimit} / {visibleItems.length}</span>
        </button>
      ) : null}

      <p className="resource-library-count" aria-live="polite">
        {visibleItems.length} {resultLabel}
      </p>
    </section>
  );
}
