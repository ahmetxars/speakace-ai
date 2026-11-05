import Link from "next/link";

/** The homepage's original four-bar mark and wordmark, shared without changing its shape. */
export function PublicBrand({ className = "" }: { className?: string }) {
  return (
    <Link
      className={"brand public-brand " + className}
      href="/"
      aria-label="SpeakAce home"
    >
      <span className="brand-mark" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      SpeakAce<span className="brand-dot">.</span>
    </Link>
  );
}
