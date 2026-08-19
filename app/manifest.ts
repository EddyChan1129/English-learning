import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Wordwise — English Vocabulary Learning",
    short_name: "Wordwise",
    description: "Learn and retain English vocabulary with three-pass spaced repetition.",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F8FC",
    theme_color: "#FFD84D",
    lang: "en",
    categories: ["education", "productivity"],
    icons: [{ src: "/wordwise-mark.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
