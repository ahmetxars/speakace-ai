"use client";

import { useEffect } from "react";
import { persistShareAttribution } from "@/lib/share-growth";

export function ShareAttributionCapture({ path }: { path: string }) {
  useEffect(() => {
    persistShareAttribution(path);
  }, [path]);

  return null;
}
