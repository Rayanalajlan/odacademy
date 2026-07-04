export const SECTION_ICON_ASSETS = {
  home: {
    label: "الرئيسية",
    src: "/section-icons/home.webp"
  },
  portfolio: {
    label: "حسابي",
    src: "/section-icons/portfolio.webp"
  },
  journey: {
    label: "رحلتك التعليمية",
    src: "/section-icons/journey.webp"
  },
  tools: {
    label: "الأدوات التعليمية",
    src: "/section-icons/tools.webp"
  },
  mastery: {
    label: "وثيقة الإتقان",
    src: "/section-icons/mastery.webp"
  },
  about: {
    label: "عن ريان",
    src: "/section-icons/about.webp"
  }
};

export const SECTION_ICON_ALIASES = {
  "learning-profile": "portfolio",
  "learner-profile": "portfolio",
  profile: "portfolio",
  radar: "tools",
  simulation: "tools",
  "ai-mentor": "tools",
  "learning-roi": "tools",
  "educational-tools": "tools",
  certificate: "mastery",
  masteryCertificate: "mastery",
  "about-rayan": "about"
};

export function resolveSectionIconId(pageId = "") {
  const normalized = String(pageId || "").trim();
  return SECTION_ICON_ASSETS[normalized]
    ? normalized
    : SECTION_ICON_ALIASES[normalized] || "home";
}

export function getSectionIcon(pageId = "") {
  return SECTION_ICON_ASSETS[resolveSectionIconId(pageId)] || SECTION_ICON_ASSETS.home;
}

export const SECTION_ICON_LIST = [
  { id: "home", ...SECTION_ICON_ASSETS.home },
  { id: "portfolio", ...SECTION_ICON_ASSETS.portfolio },
  { id: "journey", ...SECTION_ICON_ASSETS.journey },
  { id: "tools", ...SECTION_ICON_ASSETS.tools },
  { id: "mastery", ...SECTION_ICON_ASSETS.mastery },
  { id: "about", ...SECTION_ICON_ASSETS.about }
];
