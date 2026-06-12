import { useEffect } from "react";
import { MUNSAQAH_ALT_AR, MUNSAQAH_ASSETS } from "../lib/munsaqahBrand";

const SITE_TITLE = "منسقة | تعلّم ما وراء السلوك";
const SITE_DESCRIPTION =
  "رحلة تعليمية في التطوير التنظيمي تساعدك على قراءة السلوك، فهم النظام، وتشخيص جذور المشكلات قبل القفز إلى الحلول.";
const SITE_NAME = "منسقة";

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

    const siteUrl = `${window.location.origin}/`;
    const absoluteOg = new URL(MUNSAQAH_ASSETS.ogImage, window.location.origin).toString();

    document.title = SITE_TITLE;
    ensureNameMeta("description", SITE_DESCRIPTION);
    ensureNameMeta("application-name", SITE_NAME);
    ensureNameMeta("apple-mobile-web-app-title", SITE_NAME);

    ensureMeta("og:type", "website");
    ensureMeta("og:locale", "ar_SA");
    ensureMeta("og:site_name", SITE_NAME);
    ensureMeta("og:title", SITE_TITLE);
    ensureMeta("og:description", SITE_DESCRIPTION);
    ensureMeta("og:url", siteUrl);
    ensureMeta("og:image", absoluteOg);
    ensureMeta("og:image:alt", MUNSAQAH_ALT_AR);

    ensureNameMeta("twitter:card", "summary_large_image");
    ensureNameMeta("twitter:title", SITE_TITLE);
    ensureNameMeta("twitter:description", SITE_DESCRIPTION);
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
      name: SITE_NAME,
      alternateName: "Munsaqah",
      description: SITE_DESCRIPTION,
      url: siteUrl,
      logo: new URL(MUNSAQAH_ASSETS.horizontal, window.location.origin).toString(),
      image: absoluteOg
    });

    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}
