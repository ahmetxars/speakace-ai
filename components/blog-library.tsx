"use client";

import { useAppState } from "@/components/providers";
import { normalizePublicLanguage } from "@/lib/copy";
import { discoveryRefinementCopy } from "@/lib/discovery-refinement-copy";
import { usePanelFeedback } from "@/components/motion/use-panel-feedback";
import { handleTabKeys } from "@/lib/tab-navigation";
import { ResourceCard } from "@/components/public/page-primitives";
import { LibrarySearch } from "@/components/public/library-search";
import { startTransition, useDeferredValue, useState } from "react";

export type BlogLibraryPost = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
};

type BlogCategory = "ielts" | "toefl" | "skills" | "strategy";

type BlogLibraryProps = {
  eyebrow: string;
  title: string;
  description: string;
  tabLabel: string;
  searchPlaceholder: string;
  resultLabel: string;
  emptyLabel: string;
  readLabel: string;
  showMoreLabel: string;
  categories: Record<"all" | BlogCategory, string>;
  posts: BlogLibraryPost[];
};

function resolveCategory(post: BlogLibraryPost): BlogCategory {
  const value =
    `${post.title} ${post.description} ${post.keywords.join(" ")}`.toLocaleLowerCase();
  if (value.includes("toefl")) return "toefl";
  if (
    ["fluency", "pronunciation", "vocabulary", "grammar", "coherence"].some(
      (term) => value.includes(term),
    )
  ) {
    return "skills";
  }
  if (
    [
      "strategy",
      "score",
      "band",
      "plan",
      "mistake",
      "test day",
      "note-taking",
    ].some((term) => value.includes(term))
  ) {
    return "strategy";
  }
  return "ielts";
}

export function BlogLibrary({
  eyebrow,
  title,
  description,
  tabLabel,
  searchPlaceholder,
  resultLabel,
  emptyLabel,
  readLabel,
  showMoreLabel,
  categories,
  posts,
}: BlogLibraryProps) {
  const { language } = useAppState();
  const discovery = discoveryRefinementCopy[normalizePublicLanguage(language)];
  const [activeCategory, setActiveCategory] = useState<"all" | BlogCategory>(
    "all",
  );
  const [query, setQuery] = useState("");
  const feedback = usePanelFeedback(activeCategory);
  const [visibleLimit, setVisibleLimit] = useState(12);
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  const categoryOrder: Array<"all" | BlogCategory> = [
    "all",
    "ielts",
    "toefl",
    "skills",
    "strategy",
  ];
  const visiblePosts = posts.filter((post) => {
    const category = resolveCategory(post);
    const matchesCategory =
      activeCategory === "all" || category === activeCategory;
    const searchable =
      `${post.title} ${post.description} ${post.keywords.join(" ")}`.toLocaleLowerCase();
    return (
      matchesCategory && (!deferredQuery || searchable.includes(deferredQuery))
    );
  });

  return (
    <section
      {...feedback.input}
      className="blog-library"
      aria-labelledby="blog-library-title"
    >
      <div className="blog-library-head">
        <div>
          <span className="content-kicker">{eyebrow}</span>
          <h2 id="blog-library-title">{title}</h2>
        </div>
        <p>{description}</p>
      </div>

      <div className="blog-library-controls">
        <div
          className="blog-library-tabs"
          role="tablist"
          onKeyDown={handleTabKeys}
          aria-label={tabLabel}
        >
          {categoryOrder.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              id={`blog-tab-${category}`}
              aria-controls="blog-results"
              tabIndex={activeCategory === category ? 0 : -1}
              aria-selected={activeCategory === category}
              className={activeCategory === category ? "is-active" : ""}
              onClick={() =>
                startTransition(() => {
                  setActiveCategory(category);
                  setVisibleLimit(12);
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
            setVisibleLimit(12);
          }}
        />
      </div>

      {visiblePosts.length ? (
        <div
          className="blog-library-grid public-resource-grid"
          role="tabpanel"
          ref={feedback.ref}
          id="blog-results"
          aria-labelledby={`blog-tab-${activeCategory}`}
        >
          {visiblePosts.slice(0, visibleLimit).map((post, index) => (
            <ResourceCard
              key={post.slug}
              href={`/blog/${post.slug}`}
              category={post.keywords[0] ?? categories[resolveCategory(post)]}
              title={post.title}
              description={post.description}
              action={readLabel}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div
          className="blog-library-empty"
          role="tabpanel"
          ref={feedback.ref}
          id="blog-results"
          aria-labelledby={`blog-tab-${activeCategory}`}
        >
          <span role="status">{emptyLabel}</span>
        </div>
      )}

      {visiblePosts.length > visibleLimit ? (
        <button
          type="button"
          className="blog-library-more"
          onClick={() =>
            startTransition(() => setVisibleLimit((current) => current + 12))
          }
        >
          {showMoreLabel}
          <span>
            {visibleLimit} / {visiblePosts.length}
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
            setVisibleLimit(12);
          }}
        >
          {discovery.reset}
        </button>
      )}
      <p className="blog-library-count" aria-live="polite">
        {discovery.showing} {Math.min(visibleLimit, visiblePosts.length)}{" "}
        {discovery.of} {visiblePosts.length} {resultLabel}
      </p>
    </section>
  );
}
