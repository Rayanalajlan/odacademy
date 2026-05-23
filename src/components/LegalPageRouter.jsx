import PrivacyPolicy from "./PrivacyPolicy";
import TermsOfUse from "./TermsOfUse";
import DataDeletionRequest from "./DataDeletionRequest";

export function getLegalRouteName(pathname) {
  const path =
    pathname ||
    (typeof window !== "undefined" ? window.location.pathname : "/");

  const cleanPath = path.replace(/\/+$/, "") || "/";

  if (cleanPath === "/privacy") return "privacy";
  if (cleanPath === "/terms") return "terms";
  if (cleanPath === "/data-deletion") return "data-deletion";

  return "";
}

export function isLegalPath(pathname) {
  return Boolean(getLegalRouteName(pathname));
}

export default function LegalPageRouter() {
  const routeName = getLegalRouteName();

  if (routeName === "privacy") {
    return <PrivacyPolicy />;
  }

  if (routeName === "terms") {
    return <TermsOfUse />;
  }

  if (routeName === "data-deletion") {
    return <DataDeletionRequest />;
  }

  return null;
}
