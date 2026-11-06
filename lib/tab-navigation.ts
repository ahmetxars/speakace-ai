import type { KeyboardEvent } from "react";

/** Roving focus for existing tab lists; activation stays with each tab's own handler. */
export function handleTabKeys(event: KeyboardEvent<HTMLElement>) {
  if (!["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"].includes(event.key)) return;
  const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="tab"]')).filter(tab => !tab.disabled && tab.getAttribute("aria-disabled") !== "true" && tab.closest('[role="tablist"]') === event.currentTarget);
  const index = tabs.indexOf(event.target as HTMLButtonElement);
  if (index < 0) return;
  event.preventDefault();
  const next = event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 :
    (index + (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1) + tabs.length) % tabs.length;
  tabs[next].click();
  tabs[next].focus();
}
