import { useEffect } from "react";
import { MUNSAQAH_ASSETS } from "../lib/munsaqahBrand";

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
    upsertLink({ id: "site-favicon-ico", rel: "icon", href: MUNSAQAH_ASSETS.favicon, type: "image/x-icon" });
    upsertLink({ id: "site-favicon-svg", rel: "icon", href: MUNSAQAH_ASSETS.siteIcon, type: "image/svg+xml" });
    upsertLink({ id: "site-favicon-32", rel: "icon", href: MUNSAQAH_ASSETS.favicon32, type: "image/png", sizes: "32x32" });
    upsertLink({ id: "site-favicon-16", rel: "icon", href: MUNSAQAH_ASSETS.favicon16, type: "image/png", sizes: "16x16" });
    upsertLink({ id: "site-apple-touch-icon", rel: "apple-touch-icon", href: MUNSAQAH_ASSETS.appleTouchIcon, sizes: "180x180" });
    upsertLink({ id: "site-webmanifest", rel: "manifest", href: MUNSAQAH_ASSETS.manifest });
    upsertLink({ id: "site-logo-preload", rel: "preload", href: MUNSAQAH_ASSETS.horizontal, type: "image/png" });

    upsertMeta({ id: "site-og-image", property: "og:image", content: MUNSAQAH_ASSETS.ogImage });
    upsertMeta({ id: "site-twitter-image", name: "twitter:image", content: MUNSAQAH_ASSETS.ogImage });

    const jsonLd = document.getElementById("site-jsonld-logo");
    if (jsonLd) {
      try {
        const parsed = JSON.parse(jsonLd.textContent || "{}");
        parsed.logo = MUNSAQAH_ASSETS.horizontal;
        parsed.image = MUNSAQAH_ASSETS.ogImage;
        jsonLd.textContent = JSON.stringify(parsed);
      } catch {
        // لا نغيّر محتوى JSON-LD النصي إذا لم يكن JSON صالحًا.
      }
    }
  }, []);

  return null;
}
