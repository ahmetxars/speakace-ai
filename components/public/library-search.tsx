"use client";
import { Search, X } from "lucide-react";
import { useAppState } from "@/components/providers";
import { normalizePublicLanguage } from "@/lib/copy";
import { publicDesignCopy } from "@/lib/public-design-copy";
export function LibrarySearch({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  const { language } = useAppState();
  return (
    <label className="public-library-search">
      <Search size={16} aria-hidden="true" />
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        placeholder={label}
      />
      {value && (
        <button
          type="button"
          aria-label={publicDesignCopy[normalizePublicLanguage(language)].clear}
          onClick={() => onChange("")}
        >
          <X size={16} />
        </button>
      )}
    </label>
  );
}
