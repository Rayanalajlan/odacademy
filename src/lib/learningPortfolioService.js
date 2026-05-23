import { listLessonBookmarks } from "./lessonBookmarkService";
import { getRecentLessonNotes } from "./lessonNotesService";
import { loadRadarAssessmentHistory } from "./radarAssessmentService";
import {
  getOrCreateMonthlyCertificates,
  MONTHLY_MILESTONES
} from "./monthlyCertificateService";

function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function percent(completedDays, totalDays) {
  const total = Math.max(1, safeNumber(totalDays, 180));
  const completed = Math.min(total, Math.max(0, safeNumber(completedDays, 0)));
  return Math.round((completed / total) * 100);
}

function normalizeNotes(rows = []) {
  return rows.map((row) => ({
    id: row.id,
    month_index: Number(row.month_index || 0),
    week_index: Number(row.week_index || 0),
    day_index: Number(row.day_index || 0),
    note_title: row.note_title || "ملاحظة محفوظة",
    note: row.note || "",
    is_pinned: Boolean(row.is_pinned),
    updated_at: row.updated_at || row.created_at || null
  }));
}

function normalizeRadar(rows = []) {
  return rows.map((row) => ({
    id: row.id,
    assessment_type: row.assessment_type,
    assessment_title: row.assessment_title || "رادار الأداء",
    overall_score: Number(row.overall_score || 0),
    scores: Array.isArray(row.scores) ? row.scores : [],
    created_at: row.created_at || null
  }));
}

function normalizeCertificates(rows = []) {
  return rows.map((row) => ({
    id: row.id,
    month_number: Number(row.month_number || 0),
    month_title: row.month_title || `شهادة الشهر ${row.month_number || ""}`.trim(),
    status: row.status || "locked",
    certificate_code: row.certificate_code || "",
    verification_slug: row.verification_slug || "",
    issued_at: row.issued_at || null
  }));
}

export async function fetchLearningPortfolioData({
  userName = "متدرب",
  completedDays = 0,
  totalDays = 180
} = {}) {
  const progressPercent = percent(completedDays, totalDays);

  const [bookmarksResult, notesResult, radarResult, certificatesResult] =
    await Promise.allSettled([
      listLessonBookmarks(),
      getRecentLessonNotes(12),
      loadRadarAssessmentHistory({ limit: 6 }),
      getOrCreateMonthlyCertificates({
        userName,
        completedDays,
        totalDays
      })
    ]);

  const bookmarks =
    bookmarksResult.status === "fulfilled" && Array.isArray(bookmarksResult.value)
      ? bookmarksResult.value
      : [];

  const notes =
    notesResult.status === "fulfilled" && Array.isArray(notesResult.value)
      ? normalizeNotes(notesResult.value)
      : [];

  const radarHistory =
    radarResult.status === "fulfilled" && Array.isArray(radarResult.value)
      ? normalizeRadar(radarResult.value)
      : [];

  const monthlyCertificates =
    certificatesResult.status === "fulfilled" && Array.isArray(certificatesResult.value)
      ? normalizeCertificates(certificatesResult.value)
      : MONTHLY_MILESTONES.map((milestone) => ({
          id: null,
          month_number: milestone.monthNumber,
          month_title: milestone.title,
          status: safeNumber(completedDays) >= milestone.requiredDays ? "issued" : "locked",
          certificate_code: "",
          verification_slug: "",
          issued_at: null
        }));

  const pinnedNotes = notes.filter((note) => note.is_pinned);
  const latestRadar = radarHistory[0] || null;
  const issuedCertificates = monthlyCertificates.filter((item) => item.status === "issued");

  return {
    summary: {
      completedDays: safeNumber(completedDays),
      totalDays: safeNumber(totalDays, 180),
      progressPercent,
      remainingDays: Math.max(0, safeNumber(totalDays, 180) - safeNumber(completedDays)),
      estimatedHours: safeNumber(completedDays) * 4
    },
    bookmarks: bookmarks.slice(0, 8),
    notes: notes.slice(0, 8),
    pinnedNotes: pinnedNotes.slice(0, 6),
    radarHistory: radarHistory.slice(0, 6),
    latestRadar,
    monthlyCertificates,
    issuedCertificates,
    masteryReady: safeNumber(completedDays) >= safeNumber(totalDays, 180)
  };
}
