"use client";

import type { Route } from "next";
import Link from "next/link";
import { startTransition, useDeferredValue, useState } from "react";
import { ArrowUpRight, Search } from "lucide-react";

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
  const value = `${post.title} ${post.description} ${post.keywords.join(" ")}`.toLocaleLowerCase();
  if (value.includes("toefl")) return "toefl";
  if (["fluency", "pronunciation", "vocabulary", "grammar", "coherence"].some((term) => value.includes(term))) {
    return "skills";
  }
  if (["strategy", "score", "band", "plan", "mistake", "test day", "note-taking"].some((term) => value.includes(term))) {
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
  const [activeCategory, setActiveCategory] = useState<"all" | BlogCategory>("all");
  const [query, setQuery] = useState("");
  const [visibleLimit, setVisibleLimit] = useState(12);
  const deferredQuery = useDeferredValue(query.trim().toLocaleLowerCase());
  const categoryOrder: Array<"all" | BlogCategory> = ["all", "ielts", "toefl", "skills", "strategy"];
  const visiblePosts = posts.filter((post) => {
    const category = resolveCategory(post);
    const matchesCategory = activeCategory === "all" || category === activeCategory;
    const searchable = `${post.title} ${post.description} ${post.keywords.join(" ")}`.toLocaleLowerCase();
    return matchesCategory && (!deferredQuery || searchable.includes(deferredQuery));
  });

  return (
    <section className="blog-library" aria-labelledby="blog-library-title">
      <div className="blog-library-head">
        <div>
          <span className="content-kicker">{eyebrow}</span>
          <h2 id="blog-library-title">{title}</h2>
        </div>
        <p>{description}</p>
      </div>

      <div className="blog-library-controls">
        <div className="blog-library-tabs" role="tablist" aria-label={tabLabel}>
          {categoryOrder.map((category) => (
            <button
              key={category}
              type="button"
              role="tab"
              aria-selected={activeCategory === category}
              className={activeCategory === category ? "is-active" : ""}
              onClick={() => startTransition(() => {
                setActiveCategory(category);
                setVisibleLimit(12);
              })}
            >
              {categories[category]}
            </button>
          ))}
        </div>

        <label className="blog-library-search">
          <Search size={15} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleLimit(12);
            }}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
          />
        </label>
      </div>

      {visiblePosts.length ? (
        <div className="blog-library-grid" role="tabpanel">
          {visiblePosts.slice(0, visibleLimit).map((post, index) => (
            <article key={post.slug} className="blog-library-card">
              <div className="blog-library-card-meta">
                <span>{String(index + 1).padStart(2, "0")}</span>
                <span>{post.keywords[0] ?? categories[resolveCategory(post)]}</span>
              </div>
              <h3>{post.title}</h3>
              <p>{post.description}</p>
              <Link href={`/blog/${post.slug}` as Route}>
                {readLabel}
                <ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      ) : (
        <div className="blog-library-empty" role="tabpanel">{emptyLabel}</div>
      )}

      {visiblePosts.length > visibleLimit ? (
        <button
          type="button"
          className="blog-library-more"
          onClick={() => startTransition(() => setVisibleLimit((current) => current + 12))}
        >
          {showMoreLabel}
          <span>{visibleLimit} / {visiblePosts.length}</span>
        </button>
      ) : null}

      <p className="blog-library-count" aria-live="polite">
        {visiblePosts.length} {resultLabel}
      </p>
    </section>
  );
}
