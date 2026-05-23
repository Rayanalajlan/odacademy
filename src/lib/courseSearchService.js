function safeText(value) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.filter(Boolean).join(" ");
  if (value && typeof value === "object") {
    return safeText(value.text || value.content || value.body || value.title || "");
  }
  return "";
}

function stripArabicDiacritics(text) {
  return text.replace(/[\u064B-\u065F\u0670]/g, "");
}

export function normalizeSearchText(value) {
  return stripArabicDiacritics(String(value || ""))
    .toLowerCase()
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/[^\u0600-\u06FFa-z0-9\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  return normalizeSearchText(value)
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function getDayText(day) {
  return safeText(
    day?.content ||
      day?.lesson ||
      day?.body ||
      day?.text ||
      day?.markdown ||
      ""
  );
}

function pickExcerpt(sourceText, query, size = 170) {
  const text = String(sourceText || "").replace(/\s+/g, " ").trim();
  if (!text) return "";

  const cleanQuery = String(query || "").trim();
  if (!cleanQuery) return text.slice(0, size);

  const normalizedText = normalizeSearchText(text);
  const normalizedQuery = normalizeSearchText(cleanQuery);
  const index = normalizedQuery ? normalizedText.indexOf(normalizedQuery) : -1;

  if (index === -1) {
    return text.slice(0, size);
  }

  const start = Math.max(0, index - 65);
  const end = Math.min(text.length, index + size);
  const prefix = start > 0 ? "…" : "";
  const suffix = end < text.length ? "…" : "";

  return `${prefix}${text.slice(start, end)}${suffix}`;
}

function monthLabel(month) {
  return month?.title || `الشهر ${month?.monthIndex || ""}`.trim();
}

function weekLabel(week) {
  return week?.title || `الأسبوع ${week?.weekIndex || ""}`.trim();
}

function dayLabel(day) {
  return day?.label || day?.title || `اليوم ${day?.dayIndex || ""}`.trim();
}

export function buildCourseSearchIndex(course = []) {
  if (!Array.isArray(course)) return [];

  return course.flatMap((month) => {
    const weeks = Array.isArray(month?.weeks) ? month.weeks : [];

    return weeks.flatMap((week) => {
      const days = Array.isArray(week?.days) ? week.days : [];

      return days
        .map((day) => {
          const content = getDayText(day);
          const title = day?.title || day?.name || dayLabel(day);

          if (!content && !title) return null;

          const path = `${monthLabel(month)} ← ${weekLabel(week)} ← ${dayLabel(day)}`;
          const searchable = [
            monthLabel(month),
            month?.subtitle,
            weekLabel(week),
            week?.subtitle,
            week?.intro,
            dayLabel(day),
            title,
            content
          ]
            .map(safeText)
            .join(" ");

          return {
            id: day?.id || `m${month?.monthIndex}-w${week?.weekIndex}-d${day?.dayIndex}`,
            monthIndex: Number(day?.monthIndex ?? month?.monthIndex),
            weekIndex: Number(day?.weekIndex ?? week?.weekIndex),
            dayIndex: Number(day?.dayIndex),
            monthTitle: monthLabel(month),
            weekTitle: weekLabel(week),
            dayTitle: title,
            dayLabel: dayLabel(day),
            path,
            content,
            searchable,
            normalizedSearchable: normalizeSearchText(searchable)
          };
        })
        .filter(Boolean);
    });
  });
}

function scoreResult(item, query, tokens) {
  const normalizedQuery = normalizeSearchText(query);
  const normalizedTitle = normalizeSearchText(item.dayTitle);
  const normalizedPath = normalizeSearchText(item.path);
  const haystack = item.normalizedSearchable;

  let score = 0;

  if (!normalizedQuery) return 0;

  if (normalizedTitle.includes(normalizedQuery)) score += 90;
  if (normalizedPath.includes(normalizedQuery)) score += 70;
  if (haystack.includes(normalizedQuery)) score += 45;

  tokens.forEach((token) => {
    if (normalizedTitle.includes(token)) score += 20;
    if (normalizedPath.includes(token)) score += 14;
    if (haystack.includes(token)) score += 6;
  });

  // تفضيل النتائج الأقرب لبداية الرحلة عند تساوي الدرجة.
  score -= (Number(item.monthIndex || 0) * 0.08);
  score -= (Number(item.weekIndex || 0) * 0.03);
  score -= (Number(item.dayIndex || 0) * 0.01);

  return score;
}

export function searchCourse(course = [], query = "", limit = 12) {
  const cleanQuery = String(query || "").trim();
  const tokens = tokenize(cleanQuery);

  if (cleanQuery.length < 2 && tokens.length === 0) {
    return [];
  }

  return buildCourseSearchIndex(course)
    .map((item) => {
      const score = scoreResult(item, cleanQuery, tokens);

      return {
        ...item,
        score,
        excerpt: pickExcerpt(item.content || item.searchable, cleanQuery)
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export const COURSE_SEARCH_SUGGESTIONS = [
  "RACI",
  "الوصف الوظيفي",
  "الثقافة",
  "قياس الأثر",
  "المقاومة",
  "التغيير",
  "الصلاحيات",
  "التشخيص",
  "التعلم المؤسسي"
];
