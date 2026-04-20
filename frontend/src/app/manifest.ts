import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OTTO-IMUNE",
    short_name: "OTTO-IMUNE",
    description: "Portal de Imunobiológicos para RSC com Polipose Nasossinusal",
    start_url: "/",
    display: "standalone",
    background_color: "#f0f4f8",
    theme_color: "#0d6d6d",
    orientation: "portrait",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable"
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any"
      }
    ]
  };
}
