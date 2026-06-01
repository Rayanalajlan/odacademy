import { useEffect } from "react";
import {
  MUNSAQAH_ALT_EN,
  MUNSAQAH_ASSETS
} from "../lib/munsaqahBrand";

function upsertLink({ id, rel, href, type, sizes }) {
  if (typeof document === "undefined") return;

  let element = id ? document.getElementById(id) : null;

  if (!element) {
    element = document.createElement("link");
    if (id) element.id = id;
    document.head.appendChild(element);
  }

  element.setAttribute("rel", rel);
  element.setAttribute("href", href);

  if (type) element.setAttribute("type", type);
  if (sizes) element.setAttribute("sizes", sizes);
}

function upsertMeta({ id, property, name, content }) {
  if (typeof document === "undefined") return;

  let element = id ? document.getElementById(id) : null;

  if (!element) {
    element = document.createElement("meta");
    if (id) element.id = id;
    document.head.appendChild(element);
  }

  if (property) element.setAttribute("property", property);
  if (name) element.setAttribute("name", name);
  element.setAttribute("content", content);
}

export default function BrandMeta() {
  useEffect(() => {
    upsertLink({
      id: "munsaqah-favicon-ico",
      rel: "icon",
      href: MUNSAQAH_ASSETS.favicon,
      type: "image/x-icon"
    });

    upsertLink({
      id: "munsaqah-favicon-svg",
      rel: "icon",
      href: MUNSAQAH_ASSETS.siteIcon,
      type: "image/svg+xml"
    });

    upsertLink({
      id: "munsaqah-favicon-32",
      rel: "icon",
      href: MUNSAQAH_ASSETS.favicon32,
      type: "image/png",
      sizes: "32x32"
    });

    upsertLink({
      id: "munsaqah-favicon-16",
      rel: "icon",
      href: MUNSAQAH_ASSETS.favicon16,
      type: "image/png",
      sizes: "16x16"
    });

    upsertLink({
      id: "munsaqah-apple-touch-icon",
      rel: "apple-touch-icon",
      href: MUNSAQAH_ASSETS.appleTouchIcon,
      sizes: "180x180"
    });

    upsertLink({
      id: "munsaqah-webmanifest",
      rel: "manifest",
      href: MUNSAQAH_ASSETS.manifest
    });

    upsertLink({
      id: "munsaqah-logo-preload",
      rel: "preload",
      href: MUNSAQAH_ASSETS.horizontal,
      type: "image/svg+xml"
    });

    upsertMeta({
      id: "munsaqah-og-image",
      property: "og:image",
      content: MUNSAQAH_ASSETS.ogImage
    });

    upsertMeta({
      id: "munsaqah-twitter-image",
      name: "twitter:image",
      content: MUNSAQAH_ASSETS.ogImage
    });

    let jsonLd = document.getElementById("munsaqah-jsonld");

    if (!jsonLd) {
      jsonLd = document.createElement("script");
      jsonLd.id = "munsaqah-jsonld";
      jsonLd.type = "application/ld+json";
      document.head.appendChild(jsonLd);
    }

    jsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Munsaqah",
      alternateName: "منسقة",
      logo: MUNSAQAH_ASSETS.horizontal,
      image: MUNSAQAH_ASSETS.ogImage,
      url: window.location.origin,
      description: MUNSAQAH_ALT_EN
    });
  }, []);

  return null;
}
