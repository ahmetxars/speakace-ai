import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SpeakAce AI",
    short_name: "SpeakAce",
    description: "IELTS and TOEFL speaking practice with AI feedback, transcript review, and score-focused drills.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6efe6",
    theme_color: "#d95d39",
    icons: []
  };
}
