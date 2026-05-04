import { createElement } from "react";
import type { ElementType } from "react";

type MotionProps = Record<string, unknown> & {
  animate?: unknown;
  initial?: unknown;
  transition?: unknown;
  variants?: unknown;
  whileHover?: unknown;
  whileInView?: unknown;
  whileTap?: unknown;
  viewport?: unknown;
};

function createMotionTag<T extends ElementType>(Tag: T) {
  return function MotionTag({
    animate: _animate,
    initial: _initial,
    transition: _transition,
    variants: _variants,
    whileHover: _whileHover,
    whileInView: _whileInView,
    whileTap: _whileTap,
    viewport: _viewport,
    ...rest
  }: MotionProps) {
    void _animate;
    void _initial;
    void _transition;
    void _variants;
    void _whileHover;
    void _whileInView;
    void _whileTap;
    void _viewport;
    return createElement(Tag, rest);
  };
}

export const motion = {
  div: createMotionTag("div"),
  h1: createMotionTag("h1"),
  p: createMotionTag("p"),
  span: createMotionTag("span")
};
