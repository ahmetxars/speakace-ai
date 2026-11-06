import Link from "next/link";

/** The homepage's original four-bar mark and wordmark, shared without changing its shape. */
export function PublicBrand({ className = "" }: { className?: string }) {
  return (
    <Link
      className={"brand public-brand " + className}
      href="/"
      aria-label="SpeakAce home"
    >
      <BrandMark />
      SpeakAce<span className="brand-dot">.</span>
    </Link>
  );
}

/** Original four-bar voice mark for public and signed-in shells. */
export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
