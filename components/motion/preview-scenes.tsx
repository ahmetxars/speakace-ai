import type { ReactNode } from "react";

type PreviewScenesProps = {
  active: number;
  children: ReactNode[];
  mode?: "question" | "fade";
};

/** Intrinsic grid sizing reserves the largest translated scene, without fixed heights. */
export function PreviewScenes({ active, children, mode = "fade" }: PreviewScenesProps) {
  return (
    <div className="preview-scenes" data-scene-mode={mode}>
      {children.map((child, index) => {
        const selected = index === active;
        const offset = (index - active + children.length) % children.length;
        return (
          <div
            key={index}
            className={`preview-scene${selected ? " is-active" : ""}`}
            data-position={offset === 1 ? "after" : "before"}
            aria-hidden={!selected}
            inert={!selected}
          >
            {child}
          </div>
        );
      })}
    </div>
  );
}
