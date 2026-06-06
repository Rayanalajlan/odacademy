import { useEffect } from "react";
import { MUNSAQAH_ALT_AR, MUNSAQAH_ASSETS } from "../lib/munsaqahBrand";

function ensureLink(rel, href, attrs = {}) {
  if (typeof document === "undefined") return;

  let link = document.querySelector(`link[rel="${rel}"]${attrs.sizes ? `[sizes="${attrs.sizes}"]` : ""}`);

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }

  link.setAttribute("href", href);

  Object.entries(attrs).forEach(([key, value]) => {
    if (value) link.setAttribute(key, value);
  });
}

function ensureMeta(property, content) {
  if (typeof document === "undefined") return;

  let meta = document.querySelector(`meta[property="${property}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("property", property);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}

function ensureNameMeta(name, content) {
  if (typeof document === "undefined") return;

  let meta = document.querySelector(`meta[name="${name}"]`);

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", name);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
}

export default function BrandMeta() {
  useEffect(() => {
    ensureLink("icon", MUNSAQAH_ASSETS.favicon);
    ensureLink("icon", MUNSAQAH_ASSETS.favicon32, { type: "image/png", sizes: "32x32" });
    ensureLink("icon", MUNSAQAH_ASSETS.favicon16, { type: "image/png", sizes: "16x16" });
    ensureLink("apple-touch-icon", MUNSAQAH_ASSETS.appleTouchIcon);
    ensureLink("manifest", MUNSAQAH_ASSETS.manifest);
    ensureLink("preload", MUNSAQAH_ASSETS.horizontal, { as: "image" });

    const absoluteOg = new URL(MUNSAQAH_ASSETS.ogImage, window.location.origin).toString();

    ensureMeta("og:image", absoluteOg);
    ensureMeta("og:image:alt", MUNSAQAH_ALT_AR);
    ensureNameMeta("twitter:image", absoluteOg);
    ensureNameMeta("twitter:image:alt", MUNSAQAH_ALT_AR);

    const oldStructuredData = document.querySelector("script[data-munsaqah-brand-jsonld]");
    if (oldStructuredData) oldStructuredData.remove();

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.setAttribute("data-munsaqah-brand-jsonld", "true");
    script.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      name: "منسقة",
      alternateName: "Munsaqah",
      url: window.location.origin,
      logo: new URL(MUNSAQAH_ASSETS.horizontal, window.location.origin).toString()
    });

    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
