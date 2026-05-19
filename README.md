# منصة إتقان هندسة التطوير التنظيمي (OD)

مشروع React/Vite متكامل يجمع الأقسام التالية في موقع واحد:

- الرئيسية
- رحلتك التعليمية
- رادار الأداء
- المحاكاة
- الموجه الذكي
- وثيقة الإتقان
- عن ريان

## البنية

```text
src/
  App.jsx
  components/
    AuthGate.jsx
    Home.jsx
    CourseJourney.jsx
    RadarAssessment.jsx
    SimulationLab.jsx
    AiMentor.jsx
    MasteryCertificate.jsx
    AboutRayan.jsx
  data/courseContent.js
  lib/supabaseClient.js
  lib/progressService.js
functions/api/mentor.js
supabase/user_progress.sql
```

## التشغيل المحلي

```bash
npm install
cp .env.example .env
npm run dev
```

## البناء

```bash
npm run build
```

مجلد النشر: `dist`

## Supabase

ضع في `.env` محليًا وفي Cloudflare Pages:

```bash
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_OR_PUBLISHABLE_KEY
VITE_SITE_URL=https://YOUR_DOMAIN.pages.dev
```

ثم نفّذ الملف التالي في Supabase SQL Editor:

```text
supabase/user_progress.sql
```

المنصة تعمل أيضًا بوضع تجريبي محلي عند غياب مفاتيح Supabase، ويتم حفظ التقدم في `localStorage`.

## الموجه الذكي عبر Cloudflare Functions

لا تضع مفتاح Gemini داخل كود الواجهة أو GitHub. تم نقل الاتصال إلى:

```text
functions/api/mentor.js
```

في Cloudflare Pages أضف متغير بيئة باسم:

```bash
GEMINI_API_KEY
```

ثم سيستدعي المتصفح المسار التالي دون كشف المفتاح:

```text
/api/mentor
```

## إعداد Cloudflare Pages

- اربط المستودع من GitHub.
- Build command:

```bash
npm run build
```

- Build output directory:

```bash
dist
```

- أضف متغيرات البيئة:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_SITE_URL`
  - `GEMINI_API_KEY`

## ملاحظة أمنية مهمة

ملف `الموجه الذكي.txt` الأصلي كان يحتوي مفتاح Gemini داخل الواجهة. هذه النسخة لا تضع المفتاح في React، بل تستخدم Cloudflare Pages Function لحماية المفتاح من الظهور في المتصفح أو GitHub.

## المحتوى التعليمي

تم الإبقاء على محتوى الرحلة التعليمية المطابق للمصدر داخل:

```text
src/data/courseContent.js
```

ويتضمن 6 أشهر، 24 أسبوعًا، 168 يومًا.
