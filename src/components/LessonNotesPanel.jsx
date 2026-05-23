import { useEffect, useState } from "react";
import {
  deleteLessonNote,
  getLessonNote,
  saveLessonNote
} from "../lib/lessonNotesService";

export default function LessonNotesPanel({
  monthIndex,
  weekIndex,
  dayIndex,
  title = "ملاحظتي على هذا الدرس"
}) {
  const [noteId, setNoteId] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [note, setNote] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");

  async function loadNote() {
    if (!monthIndex || !weekIndex || !dayIndex) return;

    const data = await getLessonNote({
      monthIndex,
      weekIndex,
      dayIndex
    });

    if (data) {
      setNoteId(data.id);
      setNoteTitle(data.note_title || "");
      setNote(data.note || "");
      setIsPinned(Boolean(data.is_pinned));
    }
  }

  useEffect(() => {
    loadNote();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monthIndex, weekIndex, dayIndex]);

  async function handleSave() {
    setSaving(true);
    setStatus("");

    try {
      const saved = await saveLessonNote({
        monthIndex,
        weekIndex,
        dayIndex,
        noteTitle,
        note,
        isPinned
      });

      setNoteId(saved.id);
      setStatus("تم حفظ الملاحظة.");
    } catch (error) {
      setStatus(error?.message || "تعذر حفظ الملاحظة.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!noteId) return;

    const confirmed = window.confirm("هل تريد حذف هذه الملاحظة؟");

    if (!confirmed) return;

    try {
      await deleteLessonNote(noteId);
      setNoteId("");
      setNoteTitle("");
      setNote("");
      setIsPinned(false);
      setStatus("تم حذف الملاحظة.");
    } catch (error) {
      setStatus(error?.message || "تعذر حذف الملاحظة.");
    }
  }

  return (
    <section className="lesson-notes-panel" dir="rtl">
      <style>{`
        .lesson-notes-panel {
          border-radius: 26px;
          padding: 18px;
          margin: 18px 0;
          background:
            radial-gradient(circle at 100% 0%, rgba(79,70,229,.10), transparent 35%),
            #ffffff;
          border: 1px solid rgba(148,163,184,.20);
          box-shadow: 0 16px 42px rgba(15,23,42,.06);
        }

        .lesson-notes-panel h3 {
          margin: 0 0 8px;
          color: #0f172a;
          font-size: 18px;
          line-height: 1.6;
          font-weight: 950;
        }

        .lesson-notes-panel p {
          margin: 0 0 12px;
          color: #64748b;
          font-size: 12px;
          line-height: 1.9;
          font-weight: 780;
        }

        .lesson-notes-grid {
          display: grid;
          gap: 10px;
        }

        .lesson-notes-panel input,
        .lesson-notes-panel textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #cbd5e1;
          border-radius: 16px;
          padding: 12px;
          font-family: inherit;
          font-weight: 800;
          color: #0f172a;
          outline: none;
        }

        .lesson-notes-panel textarea {
          min-height: 120px;
          resize: vertical;
          line-height: 1.8;
        }

        .lesson-note-check {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #334155;
          font-size: 12px;
          font-weight: 900;
        }

        .lesson-note-check input {
          width: auto;
        }

        .lesson-notes-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          align-items: center;
        }

        .lesson-notes-actions button {
          border: 0;
          min-height: 42px;
          border-radius: 16px;
          padding: 0 14px;
          font-family: inherit;
          font-weight: 950;
          cursor: pointer;
        }

        .lesson-notes-actions .primary {
          color: #fff;
          background: linear-gradient(135deg, #4f46e5, #312e81);
        }

        .lesson-notes-actions .soft {
          color: #334155;
          background: #f1f5f9;
        }

        .lesson-note-status {
          color: #64748b;
          font-size: 12px;
          font-weight: 850;
        }
      `}</style>

      <h3>{title}</h3>
      <p>اكتب خلاصة قصيرة أو سؤالًا مهنيًا تريد الرجوع إليه لاحقًا داخل ملفك التعليمي.</p>

      <div className="lesson-notes-grid">
        <input
          value={noteTitle}
          onChange={(event) => setNoteTitle(event.target.value)}
          placeholder="عنوان اختياري للملاحظة"
        />

        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="ما الفكرة التي تريد تثبيتها من هذا الدرس؟"
        />

        <label className="lesson-note-check">
          <input
            type="checkbox"
            checked={isPinned}
            onChange={(event) => setIsPinned(event.target.checked)}
          />
          تثبيت الملاحظة في ملفي التعليمي
        </label>

        <div className="lesson-notes-actions">
          <button type="button" className="primary" onClick={handleSave} disabled={saving}>
            {saving ? "جارٍ الحفظ..." : "حفظ الملاحظة"}
          </button>

          {noteId && (
            <button type="button" className="soft" onClick={handleDelete}>
              حذف
            </button>
          )}

          {status && <span className="lesson-note-status">{status}</span>}
        </div>
      </div>
    </section>
  );
}
