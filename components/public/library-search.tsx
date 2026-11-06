"use client";
import { useRef } from "react";
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
  const input = useRef<HTMLInputElement>(null);
  return (
    <div className="public-library-search">
      <Search size={16} aria-hidden="true" />
      <input
        ref={input}
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
          onClick={() => { onChange(""); input.current?.focus(); }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
}
