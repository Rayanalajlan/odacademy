import{_ as e,b as t,d as n,p as r,v as i,y as a}from"./index-r2YaTxdB.js";import{n as o}from"./lessonBookmarkService-BR_dCajy.js";import{t as s}from"./radarAssessmentService-BIsnWc7g.js";import{n as c,t as l}from"./monthlyCertificateService-6-LMto3h.js";var u=t(a(),1),d=`weekly_reflections`,f=`odacademy_weekly_reflections_v1`;function p(){return new Date().toISOString()}function m(e,t=0){let n=Number(e);return Number.isFinite(n)?n:t}function h(e,t=3e3){return String(e||``).trim().slice(0,t)}function g(e,t){return`${m(e)}-${m(t)}`}function _(e={}){let t=m(e.month_index??e.monthIndex),n=m(e.week_index??e.weekIndex),r=e.created_at||p(),i=e.updated_at||r;return{id:e.id||g(t,n),user_id:e.user_id||null,month_index:t,week_index:n,week_title:h(e.week_title??e.weekTitle,220),key_learning:h(e.key_learning??e.keyLearning),observed_pattern:h(e.observed_pattern??e.observedPattern),application_idea:h(e.application_idea??e.applicationIdea),next_action:h(e.next_action??e.nextAction),confidence_score:Math.min(5,Math.max(1,m(e.confidence_score??e.confidenceScore,3))),status:e.status===`submitted`?`submitted`:`draft`,created_at:r,updated_at:i}}function v(e=[]){return[...e].sort((e,t)=>new Date(t.updated_at||t.created_at||0).getTime()-new Date(e.updated_at||e.created_at||0).getTime())}function y(){try{let e=window.localStorage.getItem(f),t=e?JSON.parse(e):[];return Array.isArray(t)?v(t.map(_)):[]}catch{return[]}}async function b(){if(!e||!i)return null;try{let{data:e,error:t}=await i.auth.getUser();return t?(console.warn(`تعذر قراءة المستخدم للتأمل الأسبوعي:`,t.message),null):e?.user||null}catch(e){return console.warn(`تعذر الاتصال بمستخدم Supabase:`,e),null}}async function x({limit:t=10}={}){let n=y();if(!e||!i)return n.slice(0,t);let r=await b();if(!r?.id)return n.slice(0,t);let{data:a,error:o}=await i.from(d).select(`*`).eq(`user_id`,r.id).order(`updated_at`,{ascending:!1}).limit(Math.min(Math.max(Number(t)||10,1),30));if(o)return console.warn(`تعذر تحميل التأملات الأسبوعية:`,o.message),n.slice(0,t);let s=Array.isArray(a)?a.map(_):[];return v(s.length?s:n).slice(0,t)}function S(e,t=0){let n=Number(e);return Number.isFinite(n)?n:t}function C(e,t){let n=Math.max(1,S(t,180)),r=Math.min(n,Math.max(0,S(e,0)));return Math.round(r/n*100)}function w(e=[]){return e.map(e=>({id:e.id,month_index:Number(e.month_index||0),week_index:Number(e.week_index||0),day_index:Number(e.day_index||0),note_title:e.note_title||`ملاحظة محفوظة`,note:e.note||``,is_pinned:!!e.is_pinned,updated_at:e.updated_at||e.created_at||null}))}function T(e=[]){return e.map(e=>({id:e.id,month_index:Number(e.month_index||0),week_index:Number(e.week_index||0),week_title:e.week_title||``,key_learning:e.key_learning||``,observed_pattern:e.observed_pattern||``,application_idea:e.application_idea||``,next_action:e.next_action||``,confidence_score:Number(e.confidence_score||0),status:e.status||`draft`,updated_at:e.updated_at||e.created_at||null}))}function E(e=[]){return e.map(e=>({id:e.id,assessment_type:e.assessment_type,assessment_title:e.assessment_title||`رادار الأداء`,overall_score:Number(e.overall_score||0),scores:Array.isArray(e.scores)?e.scores:[],created_at:e.created_at||null}))}function D(e=[]){return e.map(e=>({id:e.id,month_number:Number(e.month_number||0),month_title:e.month_title||`شهادة الشهر ${e.month_number||``}`.trim(),status:e.status||`locked`,certificate_code:e.certificate_code||``,verification_slug:e.verification_slug||``,issued_at:e.issued_at||null}))}async function O({userName:e=`متدرب`,completedDays:t=0,totalDays:r=180}={}){let i=C(t,r),[a,u,d,f,p]=await Promise.allSettled([o(),n(12),x({limit:8}),s({limit:6}),c({userName:e,completedDays:t,totalDays:r})]),m=a.status===`fulfilled`&&Array.isArray(a.value)?a.value:[],h=u.status===`fulfilled`&&Array.isArray(u.value)?w(u.value):[],g=d.status===`fulfilled`&&Array.isArray(d.value)?T(d.value):[],_=f.status===`fulfilled`&&Array.isArray(f.value)?E(f.value):[],v=p.status===`fulfilled`&&Array.isArray(p.value)?D(p.value):l.map(e=>({id:null,month_number:e.monthNumber,month_title:e.title,status:S(t)>=e.requiredDays?`issued`:`locked`,certificate_code:``,verification_slug:``,issued_at:null})),y=h.filter(e=>e.is_pinned),b=_[0]||null,O=v.filter(e=>e.status===`issued`);return{summary:{completedDays:S(t),totalDays:S(r,180),progressPercent:i,remainingDays:Math.max(0,S(r,180)-S(t)),estimatedHours:S(t)*4},bookmarks:m.slice(0,8),notes:h.slice(0,8),pinnedNotes:y.slice(0,6),weeklyReflections:g.slice(0,8),latestWeeklyReflection:g[0]||null,radarHistory:_.slice(0,6),latestRadar:b,monthlyCertificates:v,issuedCertificates:O,masteryReady:S(t)>=S(r,180)}}var k=r();function A(e){if(!e)return`غير محدد`;try{return new Intl.DateTimeFormat(`ar-SA`,{year:`numeric`,month:`long`,day:`numeric`}).format(new Date(e))}catch{return`غير محدد`}}function j(e){if(!e)return`غير محدد`;try{return new Intl.DateTimeFormat(`ar-SA`,{year:`numeric`,month:`long`,day:`numeric`,hour:`2-digit`,minute:`2-digit`}).format(new Date(e))}catch{return`غير محدد`}}function M(e,t=360){let n=String(e||``).replace(/\s+/g,` `).trim();return n?n.length>t?`${n.slice(0,t)}…`:n:`لا يوجد نص محفوظ.`}function N(e){return`الشهر ${e?.month_index||`-`} · الأسبوع ${e?.week_index||`-`} · اليوم ${e?.day_index||`-`}`}function P(e){return e===`issued`?`مفتوحة`:e===`revoked`?`ملغاة`:`مقفلة`}function F(){typeof window<`u`&&window.print()}function I({userName:e=`متدرب`,generatedAt:t=new Date().toISOString(),data:n,summary:r,loading:i=!1,onClose:a}){let o=r||{completedDays:0,totalDays:180,progressPercent:0,remainingDays:180,estimatedHours:0},s=n?.bookmarks||[],c=n?.pinnedNotes||[],l=n?.weeklyReflections||[],u=n?.radarHistory||[],d=n?.monthlyCertificates||[],f=n?.issuedCertificates||[],p=n?.latestRadar||null;return(0,k.jsxs)(`section`,{className:`portfolio-export-shell`,dir:`rtl`,"aria-label":`تقرير ملفي التعليمي`,children:[(0,k.jsx)(`style`,{children:`
        .portfolio-export-shell {
          position: fixed;
          inset: 0;
          z-index: 160;
          overflow: auto;
          background: rgba(28, 17, 48,.58);
          backdrop-filter: blur(10px);
          padding: 18px;
        }

        .portfolio-export-report {
          width: min(1040px, 100%);
          margin: 0 auto;
          border-radius: 32px;
          overflow: hidden;
          background: #ffffff;
          color: #18102e;
          box-shadow: 0 34px 110px rgba(0,0,0,.34);
          border: 1px solid rgba(167, 139, 250,.24);
        }

        .report-toolbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 14px;
          background: #f4f0fb;
          border-bottom: 1px solid rgba(167, 139, 250,.22);
        }

        .report-toolbar strong {
          color: #18102e;
          font-size: 14px;
          font-weight: 950;
        }

        .report-toolbar-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .report-toolbar button {
          border: 0;
          cursor: pointer;
          min-height: 40px;
          border-radius: 14px;
          padding: 0 13px;
          font-family: inherit;
          font-weight: 950;
          color: #18102e;
          background: #e0d8f5;
        }

        .report-toolbar button.primary {
          color: #fff;
          background: linear-gradient(135deg, #047857, #064e3b);
        }

        .report-cover {
          padding: 34px;
          color: #fff;
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.26), transparent 34%),
            radial-gradient(circle at 0% 100%, rgba(16,185,129,.18), transparent 34%),
            linear-gradient(135deg, #18102e, #1e1b4b 58%, #3b1d6e);
        }

        .report-kicker {
          display: inline-flex;
          width: fit-content;
          border-radius: 999px;
          padding: 8px 12px;
          color: #fde68a;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.15);
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 12px;
        }

        .report-cover h1 {
          margin: 0;
          font-size: clamp(32px, 5vw, 58px);
          line-height: 1.15;
          font-weight: 950;
        }

        .report-cover p {
          margin: 12px 0 0;
          color: #dbeafe;
          line-height: 1.9;
          font-size: 14px;
          font-weight: 760;
        }

        .report-meta {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          margin-top: 18px;
        }

        .report-meta div,
        .report-stat {
          border-radius: 18px;
          padding: 13px;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.14);
        }

        .report-meta span,
        .report-stat span {
          display: block;
          color: #c9bdf0;
          font-size: 11px;
          font-weight: 850;
          margin-bottom: 5px;
        }

        .report-meta strong,
        .report-stat strong {
          display: block;
          color: #fff;
          font-size: 14px;
          line-height: 1.6;
          font-weight: 950;
        }

        .report-body {
          padding: 26px 34px 36px;
          background: #ffffff;
        }

        .report-stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-bottom: 18px;
        }

        .report-stats-grid .report-stat {
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.18);
        }

        .report-stats-grid .report-stat span {
          color: #7a6c9a;
        }

        .report-stats-grid .report-stat strong {
          color: #18102e;
          font-size: 24px;
        }

        .report-section {
          break-inside: avoid;
          page-break-inside: avoid;
          border-radius: 24px;
          padding: 18px;
          background: #ffffff;
          border: 1px solid rgba(167, 139, 250,.20);
          margin-top: 14px;
        }

        .report-section h2 {
          margin: 0 0 6px;
          color: #18102e;
          font-size: 20px;
          line-height: 1.5;
          font-weight: 950;
        }

        .report-section > p {
          margin: 0 0 12px;
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 760;
        }

        .report-list {
          display: grid;
          gap: 9px;
        }

        .report-row {
          break-inside: avoid;
          page-break-inside: avoid;
          border-radius: 18px;
          padding: 12px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.16);
        }

        .report-row small {
          display: block;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.7;
          font-weight: 850;
          margin-bottom: 4px;
        }

        .report-row strong {
          display: block;
          color: #18102e;
          font-size: 13px;
          line-height: 1.7;
          font-weight: 950;
        }

        .report-row p {
          margin: 6px 0 0;
          color: #5b4f78;
          font-size: 12px;
          line-height: 1.9;
          font-weight: 760;
        }

        .report-cert-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 9px;
        }

        .report-cert {
          border-radius: 16px;
          padding: 12px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.18);
        }

        .report-cert.issued {
          background: #ecfdf5;
          border-color: rgba(16,185,129,.24);
        }

        .report-cert b {
          display: block;
          color: #18102e;
          font-size: 12px;
          line-height: 1.7;
          font-weight: 950;
        }

        .report-cert span {
          display: inline-flex;
          width: fit-content;
          margin-top: 7px;
          border-radius: 999px;
          padding: 5px 8px;
          color: #5b4f78;
          background: #e0d8f5;
          font-size: 10px;
          font-weight: 950;
        }

        .report-cert.issued span {
          color: #065f46;
          background: #d1fae5;
        }

        .report-empty {
          border-radius: 18px;
          padding: 13px;
          background: #f4f0fb;
          border: 1px dashed rgba(167, 139, 250,.38);
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 800;
        }

        .report-footer-note {
          margin-top: 18px;
          border-radius: 20px;
          padding: 14px;
          color: #5b4f78;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.18);
          font-size: 11px;
          line-height: 1.8;
          font-weight: 760;
        }

        @media (max-width: 780px) {
          .report-meta,
          .report-stats-grid,
          .report-cert-grid {
            grid-template-columns: 1fr;
          }

          .report-cover,
          .report-body {
            padding: 22px;
          }

          .report-toolbar {
            display: grid;
          }
        }

        @media print {
          @page {
            size: A4;
            margin: 12mm;
          }

          body * {
            visibility: hidden !important;
          }

          .portfolio-export-shell,
          .portfolio-export-shell *,
          .portfolio-export-report,
          .portfolio-export-report * {
            visibility: visible !important;
          }

          .portfolio-export-shell {
            position: static !important;
            inset: auto !important;
            z-index: auto !important;
            overflow: visible !important;
            padding: 0 !important;
            background: #fff !important;
            backdrop-filter: none !important;
          }

          .portfolio-export-report {
            width: 100% !important;
            margin: 0 !important;
            border-radius: 24px !important;
            box-shadow: none !important;
            border: 0 !important;
          }

          .report-no-print,
          .report-toolbar {
            display: none !important;
          }

          .report-cover {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .report-section {
            box-shadow: none !important;
          }
        }
      `}),(0,k.jsxs)(`article`,{className:`portfolio-export-report`,children:[(0,k.jsxs)(`div`,{className:`report-toolbar report-no-print`,children:[(0,k.jsx)(`strong`,{children:`تقرير ملفي التعليمي`}),(0,k.jsxs)(`div`,{className:`report-toolbar-actions`,children:[(0,k.jsx)(`button`,{type:`button`,className:`primary`,onClick:F,children:`طباعة / حفظ PDF`}),(0,k.jsx)(`button`,{type:`button`,onClick:a,children:`إغلاق`})]})]}),(0,k.jsxs)(`header`,{className:`report-cover`,children:[(0,k.jsx)(`span`,{className:`report-kicker`,children:`OD Academy · Learning Portfolio Report`}),(0,k.jsx)(`h1`,{children:`تقرير الملف التعليمي`}),(0,k.jsx)(`p`,{children:`تقرير موجز يجمع أثر التعلم داخل المنصة: التقدم، المحفوظات، الملاحظات، الرادار، التأملات الأسبوعية، والشهادات.`}),(0,k.jsxs)(`div`,{className:`report-meta`,children:[(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`span`,{children:`اسم المتدرب`}),(0,k.jsx)(`strong`,{children:e||`متدرب`})]}),(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`span`,{children:`تاريخ التوليد`}),(0,k.jsx)(`strong`,{children:j(t)})]}),(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`span`,{children:`حالة التقرير`}),(0,k.jsx)(`strong`,{children:i?`جارٍ تحميل البيانات`:`جاهز للتصدير`})]})]})]}),(0,k.jsxs)(`div`,{className:`report-body`,children:[(0,k.jsxs)(`section`,{className:`report-stats-grid`,"aria-label":`ملخص التقرير`,children:[(0,k.jsxs)(`div`,{className:`report-stat`,children:[(0,k.jsx)(`span`,{children:`نسبة الإنجاز`}),(0,k.jsxs)(`strong`,{children:[o.progressPercent,`%`]})]}),(0,k.jsxs)(`div`,{className:`report-stat`,children:[(0,k.jsx)(`span`,{children:`الأيام المكتملة`}),(0,k.jsxs)(`strong`,{children:[o.completedDays,` / `,o.totalDays]})]}),(0,k.jsxs)(`div`,{className:`report-stat`,children:[(0,k.jsx)(`span`,{children:`المتبقي`}),(0,k.jsx)(`strong`,{children:o.remainingDays})]}),(0,k.jsxs)(`div`,{className:`report-stat`,children:[(0,k.jsx)(`span`,{children:`وقت تعلم تقديري`}),(0,k.jsxs)(`strong`,{children:[Math.round(Number(o.estimatedHours||0)),` ساعة`]})]})]}),(0,k.jsxs)(`section`,{className:`report-section`,children:[(0,k.jsx)(`h2`,{children:`الدروس المحفوظة`}),(0,k.jsx)(`p`,{children:`أبرز الدروس التي اختار المتدرب العودة لها لاحقًا.`}),s.length?(0,k.jsx)(`div`,{className:`report-list`,children:s.slice(0,8).map(e=>(0,k.jsxs)(`div`,{className:`report-row`,children:[(0,k.jsx)(`small`,{children:e.lesson_path||N(e)}),(0,k.jsx)(`strong`,{children:e.lesson_title||`درس محفوظ`}),(0,k.jsx)(`p`,{children:M(e.excerpt,260)})]},`${e.month_index}-${e.week_index}-${e.day_index}`))}):(0,k.jsx)(`div`,{className:`report-empty`,children:`لا توجد دروس محفوظة حتى الآن.`})]}),(0,k.jsxs)(`section`,{className:`report-section`,children:[(0,k.jsx)(`h2`,{children:`الملاحظات المثبتة`}),(0,k.jsx)(`p`,{children:`أهم الملاحظات التي اختار المتدرب تثبيتها داخل الدروس.`}),c.length?(0,k.jsx)(`div`,{className:`report-list`,children:c.slice(0,6).map(e=>(0,k.jsxs)(`div`,{className:`report-row`,children:[(0,k.jsxs)(`small`,{children:[N(e),` · `,A(e.updated_at)]}),(0,k.jsx)(`strong`,{children:e.note_title||`ملاحظة مثبتة`}),(0,k.jsx)(`p`,{children:M(e.note,300)})]},e.id))}):(0,k.jsx)(`div`,{className:`report-empty`,children:`لا توجد ملاحظات مثبتة حتى الآن.`})]}),(0,k.jsxs)(`section`,{className:`report-section`,children:[(0,k.jsx)(`h2`,{children:`التأملات الأسبوعية وخطط التطبيق`}),(0,k.jsx)(`p`,{children:`تأملات المتدرب التي تربط المفاهيم بتطبيق عملي.`}),l.length?(0,k.jsx)(`div`,{className:`report-list`,children:l.slice(0,8).map(e=>(0,k.jsxs)(`div`,{className:`report-row`,children:[(0,k.jsxs)(`small`,{children:[`الشهر `,e.month_index,` · الأسبوع `,e.week_index,` · `,A(e.updated_at)]}),(0,k.jsx)(`strong`,{children:e.week_title||`تأمل أسبوعي`}),(0,k.jsxs)(`p`,{children:[(0,k.jsx)(`b`,{children:`أهم فكرة:`}),` `,M(e.key_learning,260)]}),(0,k.jsxs)(`p`,{children:[(0,k.jsx)(`b`,{children:`الإجراء القادم:`}),` `,M(e.next_action,260)]}),(0,k.jsxs)(`p`,{children:[`مستوى الثقة بالتطبيق: `,e.confidence_score||`-`,` / 5`]})]},e.id||`${e.month_index}-${e.week_index}`))}):(0,k.jsx)(`div`,{className:`report-empty`,children:`لا توجد تأملات أسبوعية محفوظة حتى الآن.`})]}),(0,k.jsxs)(`section`,{className:`report-section`,children:[(0,k.jsx)(`h2`,{children:`رادار الأداء`}),(0,k.jsx)(`p`,{children:`آخر تقييمات محفوظة في رادار الأداء.`}),p?(0,k.jsxs)(`div`,{className:`report-row`,children:[(0,k.jsxs)(`small`,{children:[`آخر تقييم · `,A(p.created_at)]}),(0,k.jsx)(`strong`,{children:p.assessment_title}),(0,k.jsxs)(`p`,{children:[`الدرجة العامة: `,p.overall_score,` من 5`]})]}):(0,k.jsx)(`div`,{className:`report-empty`,children:`لا توجد نتيجة رادار محفوظة حتى الآن.`}),u.length>1?(0,k.jsx)(`div`,{className:`report-list`,style:{marginTop:10},children:u.slice(1,4).map(e=>(0,k.jsxs)(`div`,{className:`report-row`,children:[(0,k.jsx)(`small`,{children:A(e.created_at)}),(0,k.jsx)(`strong`,{children:e.assessment_title}),(0,k.jsxs)(`p`,{children:[`الدرجة العامة: `,e.overall_score,` من 5`]})]},e.id))}):null]}),(0,k.jsxs)(`section`,{className:`report-section`,children:[(0,k.jsx)(`h2`,{children:`الشهادات والإنجازات`}),(0,k.jsx)(`p`,{children:`حالة الشهادات الشهرية ووثيقة الإتقان النهائية.`}),(0,k.jsx)(`div`,{className:`report-cert-grid`,children:d.slice(0,6).map(e=>(0,k.jsxs)(`div`,{className:`report-cert ${e.status===`issued`?`issued`:``}`,children:[(0,k.jsx)(`b`,{children:e.month_title}),(0,k.jsx)(`span`,{children:P(e.status)})]},e.month_number))}),(0,k.jsxs)(`div`,{className:`report-cert ${n?.masteryReady?`issued`:``}`,style:{marginTop:10},children:[(0,k.jsx)(`b`,{children:`وثيقة الإتقان النهائية`}),(0,k.jsx)(`span`,{children:n?.masteryReady?`جاهزة`:`تفتح بعد إكمال الرحلة`})]}),(0,k.jsxs)(`p`,{className:`report-footer-note`,children:[`عدد الشهادات الشهرية المفتوحة: `,f.length,` من 6. هذا التقرير يعكس البيانات المتاحة وقت التوليد داخل المنصة.`]})]})]})]})]})}function L(e){if(!e)return`غير محدد`;try{return new Intl.DateTimeFormat(`ar-SA`,{year:`numeric`,month:`short`,day:`numeric`}).format(new Date(e))}catch{return`غير محدد`}}function R(e){let t=Number(e||0);return t<1?`0 ساعة`:`${Math.round(t)} ساعة`}function z(e,t=150){let n=String(e||``).replace(/\s+/g,` `).trim();return n?n.length>t?`${n.slice(0,t)}…`:n:``}function B(e){return`الشهر ${e.month_index||e.monthIndex||`-`} · الأسبوع ${e.week_index||e.weekIndex||`-`} · اليوم ${e.day_index||e.dayIndex||`-`}`}function V(e){return e===`issued`?`مفتوحة`:e===`revoked`?`ملغاة`:`مقفلة`}function H({userName:e=`متدرب`,completedDays:t=0,totalDays:n=180,setActivePage:r,onResumeJourney:i}){let[a,o]=(0,u.useState)(null),[s,c]=(0,u.useState)(!0),[l,d]=(0,u.useState)(``),[f,p]=(0,u.useState)(!1);async function m(){c(!0),d(``);try{o(await O({userName:e,completedDays:t,totalDays:n}))}catch(e){console.warn(`تعذر تحميل الملف التعليمي:`,e),d(e?.message||`تعذر تحميل بعض بيانات ملفك التعليمي الآن.`)}finally{c(!1)}}(0,u.useEffect)(()=>{m()},[e,t,n]);let h=a?.summary||{completedDays:t,totalDays:n,progressPercent:Math.round(Number(t||0)/Math.max(1,Number(n||180))*100),remainingDays:Math.max(0,Number(n||180)-Number(t||0)),estimatedHours:Number(t||0)*4},g=(0,u.useMemo)(()=>String(e||`متدرب`).trim().split(/\s+/)[0]||`متدرب`,[e]);function _(e){typeof r==`function`&&r(e)}function v(){if(typeof i==`function`){i();return}_(`journey`)}function y(){_(`journey`)}return(0,k.jsxs)(`main`,{className:`learning-portfolio`,dir:`rtl`,children:[(0,k.jsx)(`style`,{children:`
        .learning-portfolio {
          --ink: #18102e;
          --muted: #7a6c9a;
          --line: rgba(167, 139, 250,.22);
          --primary: #8b5cf6;
          --gold: #a855f7;
          --green: #10b981;
          width: min(1180px, calc(100% - 28px));
          margin: 18px auto 70px;
          color: var(--ink);
        }

        .portfolio-hero {
          border-radius: 38px;
          overflow: hidden;
          padding: clamp(24px, 4vw, 38px);
          color: #fff;
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.24), transparent 34%),
            radial-gradient(circle at 0% 100%, rgba(16,185,129,.14), transparent 34%),
            linear-gradient(135deg, #18102e, #1e1b4b 58%, #3b1d6e);
          box-shadow: 0 28px 90px rgba(28, 17, 48,.22);
        }

        .portfolio-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.2fr) minmax(260px, .8fr);
          gap: 24px;
          align-items: center;
        }

        .portfolio-kicker {
          display: inline-flex;
          width: fit-content;
          border-radius: 999px;
          padding: 8px 13px;
          color: #fde68a;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.15);
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 12px;
        }

        .portfolio-hero h1 {
          margin: 0;
          font-size: clamp(34px, 5vw, 64px);
          line-height: 1.12;
          font-weight: 950;
          letter-spacing: -1px;
        }

        .portfolio-hero h1 span {
          color: #fde68a;
        }

        .portfolio-hero p {
          margin: 14px 0 0;
          color: #dbeafe;
          font-size: 15px;
          line-height: 2;
          font-weight: 760;
          max-width: 780px;
        }

        .portfolio-orb {
          width: 210px;
          height: 210px;
          margin: 0 auto;
          border-radius: 50%;
          display: grid;
          place-items: center;
          background:
            conic-gradient(#a855f7 ${h.progressPercent*3.6}deg, rgba(255,255,255,.14) 0deg);
          box-shadow: inset 0 0 0 12px rgba(28, 17, 48,.32), 0 24px 64px rgba(0,0,0,.22);
        }

        .portfolio-orb div {
          width: 145px;
          height: 145px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          text-align: center;
          background: #18102e;
          border: 1px solid rgba(255,255,255,.12);
        }

        .portfolio-orb strong {
          display: block;
          color: #fff;
          font-size: 42px;
          line-height: 1;
          font-weight: 950;
        }

        .portfolio-orb small {
          display: block;
          color: #c9bdf0;
          margin-top: 7px;
          font-size: 12px;
          font-weight: 850;
        }

        .portfolio-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 20px;
        }

        .portfolio-button {
          border: 0;
          cursor: pointer;
          min-height: 46px;
          border-radius: 18px;
          padding: 0 16px;
          font-family: inherit;
          font-weight: 950;
          transition: .18s ease;
        }

        .portfolio-button:hover {
          transform: translateY(-2px);
        }

        .portfolio-button.primary {
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          box-shadow: 0 18px 38px rgba(139, 92, 246,.24);
        }

        .portfolio-button.soft {
          color: #18102e;
          background: #ffffff;
        }

        .portfolio-button.dark {
          color: #fff;
          background: #18102e;
        }

        .portfolio-button.export {
          color: #fff;
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.24), transparent 35%),
            linear-gradient(135deg, #047857, #064e3b);
          box-shadow: 0 18px 38px rgba(16,185,129,.22);
        }

        .portfolio-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin: 16px 0;
        }

        .portfolio-stat {
          border-radius: 26px;
          padding: 17px;
          background: rgba(255,255,255,.94);
          border: 1px solid var(--line);
          box-shadow: 0 18px 48px rgba(28, 17, 48,.07);
        }

        .portfolio-stat span {
          display: block;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.7;
          font-weight: 850;
        }

        .portfolio-stat strong {
          display: block;
          color: var(--ink);
          font-size: 26px;
          line-height: 1.25;
          margin-top: 5px;
          font-weight: 950;
        }

        .portfolio-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(320px, .55fr);
          gap: 14px;
          align-items: start;
        }

        .portfolio-section {
          border-radius: 30px;
          padding: 20px;
          background: rgba(255,255,255,.94);
          border: 1px solid var(--line);
          box-shadow: 0 18px 48px rgba(28, 17, 48,.07);
          margin-bottom: 14px;
        }

        .portfolio-section-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 12px;
        }

        .portfolio-section h2 {
          margin: 0;
          color: var(--ink);
          font-size: 20px;
          line-height: 1.5;
          font-weight: 950;
        }

        .portfolio-section-head p {
          margin: 4px 0 0;
          color: var(--muted);
          font-size: 12px;
          line-height: 1.8;
          font-weight: 760;
        }

        .portfolio-mini-tag {
          display: inline-flex;
          border-radius: 999px;
          padding: 7px 10px;
          color: #6d28d9;
          background: #efe9fb;
          font-size: 11px;
          font-weight: 950;
          white-space: nowrap;
        }

        .portfolio-list {
          display: grid;
          gap: 10px;
        }

        .portfolio-row {
          border: 1px solid rgba(167, 139, 250,.18);
          border-radius: 22px;
          padding: 14px;
          background: #f4f0fb;
        }

        .portfolio-row.clickable {
          border: 1px solid rgba(167, 139, 250,.22);
          cursor: pointer;
          text-align: right;
          font-family: inherit;
          width: 100%;
        }

        .portfolio-row.clickable:hover {
          background: #efe9fb;
          border-color: rgba(139, 92, 246,.30);
        }

        .portfolio-row small {
          display: block;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.7;
          font-weight: 850;
          margin-bottom: 4px;
        }

        .portfolio-row strong {
          display: block;
          color: #18102e;
          font-size: 14px;
          line-height: 1.7;
          font-weight: 950;
        }

        .portfolio-row p {
          margin: 6px 0 0;
          color: #5b4f78;
          font-size: 12px;
          line-height: 1.9;
          font-weight: 760;
        }

        .portfolio-empty {
          border-radius: 22px;
          padding: 16px;
          color: #7a6c9a;
          background: #f4f0fb;
          border: 1px dashed rgba(167, 139, 250,.38);
          font-size: 12px;
          line-height: 1.9;
          font-weight: 800;
        }

        .portfolio-cert-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .portfolio-cert {
          border-radius: 22px;
          padding: 14px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.18);
        }

        .portfolio-cert.issued {
          background: #ecfdf5;
          border-color: rgba(16,185,129,.24);
        }

        .portfolio-cert b {
          display: block;
          color: #18102e;
          font-size: 13px;
          line-height: 1.7;
          font-weight: 950;
        }

        .portfolio-cert span {
          display: inline-flex;
          margin-top: 8px;
          border-radius: 999px;
          padding: 5px 8px;
          font-size: 10px;
          font-weight: 950;
          color: #5b4f78;
          background: #e0d8f5;
        }

        .portfolio-cert.issued span {
          color: #065f46;
          background: #d1fae5;
        }

        .portfolio-notice {
          margin-top: 14px;
          border-radius: 20px;
          padding: 14px;
          color: #92400e;
          background: #fffbeb;
          border: 1px solid #fde68a;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 850;
        }

        @media (max-width: 980px) {
          .portfolio-hero-grid,
          .portfolio-layout,
          .portfolio-stats {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 680px) {
          .learning-portfolio {
            width: calc(100% - 18px);
          }

          .portfolio-cert-grid {
            grid-template-columns: 1fr;
          }
        }
      `}),(0,k.jsx)(`section`,{className:`portfolio-hero`,children:(0,k.jsxs)(`div`,{className:`portfolio-hero-grid`,children:[(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`span`,{className:`portfolio-kicker`,children:`Learning Portfolio Center`}),(0,k.jsxs)(`h1`,{children:[`ملفك التعليمي يا `,(0,k.jsx)(`span`,{children:g})]}),(0,k.jsx)(`p`,{children:`هنا يتجمع أثر تعلمك: تقدم الرحلة، الدروس التي حفظتها، الملاحظات المثبتة، نتائج الرادار، والشهادات الشهرية. هذا هو مكان الرجوع الهادئ عندما تريد أن ترى ماذا بنيت فعلًا.`}),(0,k.jsxs)(`div`,{className:`portfolio-actions`,children:[(0,k.jsx)(`button`,{type:`button`,className:`portfolio-button primary`,onClick:v,children:`متابعة من آخر محطة`}),(0,k.jsx)(`button`,{type:`button`,className:`portfolio-button soft`,onClick:()=>_(`journey`),children:`فتح الرحلة`}),(0,k.jsx)(`button`,{type:`button`,className:`portfolio-button soft`,onClick:()=>_(`radar`),children:`فتح الرادار`}),(0,k.jsx)(`button`,{type:`button`,className:`portfolio-button soft`,onClick:()=>_(`mastery`),children:`وثيقة الإتقان`}),(0,k.jsx)(`button`,{type:`button`,className:`portfolio-button export`,onClick:()=>p(!0),children:`تصدير تقرير ملفي التعليمي`})]})]}),(0,k.jsx)(`div`,{className:`portfolio-orb od-circular-indicator od-indicator-general`,style:{"--od-indicator-progress":`${h.progressPercent}%`},children:(0,k.jsx)(`div`,{children:(0,k.jsxs)(`span`,{children:[(0,k.jsxs)(`strong`,{children:[h.progressPercent,`%`]}),(0,k.jsxs)(`small`,{children:[h.completedDays,` / `,h.totalDays,` يوم`]})]})})})]})}),l?(0,k.jsx)(`div`,{className:`portfolio-notice`,children:l}):null,f&&(0,k.jsx)(I,{userName:e,generatedAt:new Date().toISOString(),data:a,summary:h,loading:s,onClose:()=>p(!1)}),(0,k.jsxs)(`section`,{className:`portfolio-stats`,"aria-label":`ملخص الملف التعليمي`,children:[(0,k.jsxs)(`div`,{className:`portfolio-stat`,children:[(0,k.jsx)(`span`,{children:`الأيام المكتملة`}),(0,k.jsx)(`strong`,{children:h.completedDays})]}),(0,k.jsxs)(`div`,{className:`portfolio-stat`,children:[(0,k.jsx)(`span`,{children:`المتبقي في الرحلة`}),(0,k.jsx)(`strong`,{children:h.remainingDays})]}),(0,k.jsxs)(`div`,{className:`portfolio-stat`,children:[(0,k.jsx)(`span`,{children:`وقت تعلم تقديري`}),(0,k.jsx)(`strong`,{children:R(h.estimatedHours)})]}),(0,k.jsxs)(`div`,{className:`portfolio-stat`,children:[(0,k.jsx)(`span`,{children:`الشهادات الشهرية`}),(0,k.jsxs)(`strong`,{children:[a?.issuedCertificates?.length||0,`/6`]})]})]}),(0,k.jsxs)(`div`,{className:`portfolio-layout`,children:[(0,k.jsxs)(`div`,{children:[(0,k.jsxs)(`section`,{className:`portfolio-section`,children:[(0,k.jsxs)(`div`,{className:`portfolio-section-head`,children:[(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`h2`,{children:`الدروس المحفوظة`}),(0,k.jsx)(`p`,{children:`آخر الدروس التي اخترت الرجوع لها لاحقًا.`})]}),(0,k.jsxs)(`span`,{className:`portfolio-mini-tag`,children:[a?.bookmarks?.length||0,` محفوظ`]})]}),s?(0,k.jsx)(`div`,{className:`portfolio-empty`,children:`جارٍ تحميل الدروس المحفوظة...`}):a?.bookmarks?.length?(0,k.jsx)(`div`,{className:`portfolio-list`,children:a.bookmarks.map(e=>(0,k.jsxs)(`button`,{type:`button`,className:`portfolio-row clickable`,onClick:y,children:[(0,k.jsx)(`small`,{children:e.lesson_path||B(e)}),(0,k.jsx)(`strong`,{children:e.lesson_title||`درس محفوظ`}),e.excerpt?(0,k.jsx)(`p`,{children:z(e.excerpt,170)}):null]},`${e.month_index}-${e.week_index}-${e.day_index}`))}):(0,k.jsx)(`div`,{className:`portfolio-empty`,children:`لا توجد دروس محفوظة بعد. افتح أي درس واضغط "حفظ هذا الدرس".`})]}),(0,k.jsxs)(`section`,{className:`portfolio-section`,children:[(0,k.jsxs)(`div`,{className:`portfolio-section-head`,children:[(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`h2`,{children:`الملاحظات المثبتة`}),(0,k.jsx)(`p`,{children:`أفكارك المهمة التي ثبتّها داخل الدروس.`})]}),(0,k.jsxs)(`span`,{className:`portfolio-mini-tag`,children:[a?.pinnedNotes?.length||0,` مثبتة`]})]}),s?(0,k.jsx)(`div`,{className:`portfolio-empty`,children:`جارٍ تحميل الملاحظات...`}):a?.pinnedNotes?.length?(0,k.jsx)(`div`,{className:`portfolio-list`,children:a.pinnedNotes.map(e=>(0,k.jsxs)(`div`,{className:`portfolio-row`,children:[(0,k.jsxs)(`small`,{children:[B(e),` · `,L(e.updated_at)]}),(0,k.jsx)(`strong`,{children:e.note_title||`ملاحظة مثبتة`}),(0,k.jsx)(`p`,{children:z(e.note,210)})]},e.id))}):(0,k.jsx)(`div`,{className:`portfolio-empty`,children:`لا توجد ملاحظات مثبتة بعد. اكتب ملاحظة داخل أي درس وفعل خيار التثبيت.`})]}),(0,k.jsxs)(`section`,{className:`portfolio-section`,children:[(0,k.jsxs)(`div`,{className:`portfolio-section-head`,children:[(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`h2`,{children:`التأملات الأسبوعية وخطط التطبيق`}),(0,k.jsx)(`p`,{children:`أثر التعلم الأسبوعي: فكرة، نمط تنظيمي، وخطوة تطبيق عملية.`})]}),(0,k.jsxs)(`span`,{className:`portfolio-mini-tag`,children:[a?.weeklyReflections?.length||0,` تأمل`]})]}),s?(0,k.jsx)(`div`,{className:`portfolio-empty`,children:`جارٍ تحميل التأملات الأسبوعية...`}):a?.weeklyReflections?.length?(0,k.jsx)(`div`,{className:`portfolio-list`,children:a.weeklyReflections.map(e=>(0,k.jsxs)(`div`,{className:`portfolio-row`,children:[(0,k.jsxs)(`small`,{children:[`الشهر `,e.month_index,` · الأسبوع `,e.week_index,e.updated_at?` · ${L(e.updated_at)}`:``]}),(0,k.jsx)(`strong`,{children:e.week_title||`تأمل أسبوعي`}),e.key_learning?(0,k.jsxs)(`p`,{children:[(0,k.jsx)(`b`,{children:`أهم فكرة:`}),` `,z(e.key_learning,180)]}):null,e.next_action?(0,k.jsxs)(`p`,{children:[(0,k.jsx)(`b`,{children:`الإجراء القادم:`}),` `,z(e.next_action,180)]}):null,e.confidence_score?(0,k.jsxs)(`p`,{children:[`مستوى الثقة بالتطبيق: `,e.confidence_score,` / 5`]}):null]},e.id||`${e.month_index}-${e.week_index}`))}):(0,k.jsx)(`div`,{className:`portfolio-empty`,children:`لا توجد تأملات أسبوعية بعد. افتح الرحلة واكتب تأمل الأسبوع وخطة التطبيق.`})]})]}),(0,k.jsxs)(`aside`,{children:[(0,k.jsxs)(`section`,{className:`portfolio-section`,children:[(0,k.jsxs)(`div`,{className:`portfolio-section-head`,children:[(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`h2`,{children:`آخر نتيجة رادار`}),(0,k.jsx)(`p`,{children:`أحدث تقييم محفوظ من رادار الأداء.`})]}),(0,k.jsx)(`span`,{className:`portfolio-mini-tag`,children:`Radar`})]}),s?(0,k.jsx)(`div`,{className:`portfolio-empty`,children:`جارٍ تحميل الرادار...`}):a?.latestRadar?(0,k.jsxs)(`div`,{className:`portfolio-row`,children:[(0,k.jsx)(`small`,{children:L(a.latestRadar.created_at)}),(0,k.jsx)(`strong`,{children:a.latestRadar.assessment_title}),(0,k.jsxs)(`p`,{children:[`الدرجة العامة: `,a.latestRadar.overall_score,` من 5`]})]}):(0,k.jsx)(`div`,{className:`portfolio-empty`,children:`لا توجد نتيجة رادار محفوظة بعد. افتح الرادار واحفظ تقييمك.`})]}),(0,k.jsxs)(`section`,{className:`portfolio-section`,children:[(0,k.jsxs)(`div`,{className:`portfolio-section-head`,children:[(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`h2`,{children:`الشهادات`}),(0,k.jsx)(`p`,{children:`حالة الشهادات الشهرية ووثيقة الإتقان.`})]}),(0,k.jsxs)(`span`,{className:`portfolio-mini-tag`,children:[a?.issuedCertificates?.length||0,`/6`]})]}),(0,k.jsx)(`div`,{className:`portfolio-cert-grid`,children:(a?.monthlyCertificates||[]).slice(0,6).map(e=>(0,k.jsxs)(`div`,{className:`portfolio-cert ${e.status===`issued`?`issued`:``}`,children:[(0,k.jsx)(`b`,{children:e.month_title}),(0,k.jsx)(`span`,{children:V(e.status)})]},e.month_number))}),(0,k.jsxs)(`div`,{className:`portfolio-cert ${a?.masteryReady?`issued`:``}`,style:{marginTop:10},children:[(0,k.jsx)(`b`,{children:`وثيقة الإتقان النهائية`}),(0,k.jsx)(`span`,{children:a?.masteryReady?`جاهزة`:`تفتح بعد إكمال الرحلة`})]})]}),(0,k.jsxs)(`section`,{className:`portfolio-section`,children:[(0,k.jsx)(`div`,{className:`portfolio-section-head`,children:(0,k.jsxs)(`div`,{children:[(0,k.jsx)(`h2`,{children:`اختصارات`}),(0,k.jsx)(`p`,{children:`تنقل سريع لأهم مناطق الأثر.`})]})}),(0,k.jsxs)(`div`,{className:`portfolio-actions`,style:{marginTop:0},children:[(0,k.jsx)(`button`,{type:`button`,className:`portfolio-button dark`,onClick:()=>_(`journey`),children:`الرحلة`}),(0,k.jsx)(`button`,{type:`button`,className:`portfolio-button dark`,onClick:()=>_(`radar`),children:`الرادار`}),(0,k.jsx)(`button`,{type:`button`,className:`portfolio-button dark`,onClick:()=>_(`mastery`),children:`الشهادات`})]})]})]})]})]})}export{H as default};