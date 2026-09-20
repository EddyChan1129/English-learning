import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Fowl to Phoenix — 雞仔變鳳凰",
    short_name: "Fowl to Phoenix",
    description: "Learn and retain English vocabulary with three-pass spaced repetition.",
    start_url: "/",
    display: "standalone",
    background_color: "#F4F7FB",
    theme_color: "#C9562F",
    lang: "en",
    categories: ["education", "productivity"],
    icons: [{ src: "/stage3-3d.png", sizes: "1254x1254", type: "image/png" }],
  };
}
