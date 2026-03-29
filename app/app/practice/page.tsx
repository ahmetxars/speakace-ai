import { Suspense } from "react";
import { PracticeConsole } from "@/components/practice-console";

export default function PracticePage() {
  return (
    <Suspense fallback={null}>
      <PracticeConsole />
    </Suspense>
  );
}
