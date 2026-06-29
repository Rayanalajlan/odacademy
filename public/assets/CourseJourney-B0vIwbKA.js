import{b as e,f as t,g as n,h as r,l as i,p as a,u as o,y as s}from"./index-r2YaTxdB.js";import{n as c,t as l}from"./courseContent-DjeFhL45.js";import{n as u,r as d,t as f}from"./lessonBookmarkService-BR_dCajy.js";var p=e(s(),1),m=a();function h({monthIndex:e,weekIndex:n,dayIndex:r,title:a=`ملاحظتي على هذا الدرس`}){let[s,c]=(0,p.useState)(``),[l,u]=(0,p.useState)(``),[d,f]=(0,p.useState)(``),[h,g]=(0,p.useState)(!1),[_,v]=(0,p.useState)(!1),[y,b]=(0,p.useState)(``);async function ee(){if(!e||!n||!r)return;let t=await o({monthIndex:e,weekIndex:n,dayIndex:r});t&&(c(t.id),u(t.note_title||``),f(t.note||``),g(!!t.is_pinned))}(0,p.useEffect)(()=>{ee()},[e,n,r]);async function x(){v(!0),b(``);try{c((await t({monthIndex:e,weekIndex:n,dayIndex:r,noteTitle:l,note:d,isPinned:h})).id),b(`تم حفظ الملاحظة.`)}catch(e){b(e?.message||`تعذر حفظ الملاحظة.`)}finally{v(!1)}}async function S(){if(s&&window.confirm(`هل تريد حذف هذه الملاحظة؟`))try{await i(s),c(``),u(``),f(``),g(!1),b(`تم حذف الملاحظة.`)}catch(e){b(e?.message||`تعذر حذف الملاحظة.`)}}return(0,m.jsxs)(`section`,{className:`lesson-notes-panel`,dir:`rtl`,children:[(0,m.jsx)(`style`,{children:`
        .lesson-notes-panel {
          border-radius: 26px;
          padding: 18px;
          margin: 18px 0;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.10), transparent 35%),
            #ffffff;
          border: 1px solid rgba(167, 139, 250,.20);
          box-shadow: 0 16px 42px rgba(28, 17, 48,.06);
        }

        .lesson-notes-panel h3 {
          margin: 0 0 8px;
          color: #18102e;
          font-size: 18px;
          line-height: 1.6;
          font-weight: 950;
        }

        .lesson-notes-panel p {
          margin: 0 0 12px;
          color: #7a6c9a;
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
          border: 1px solid #c9bdf0;
          border-radius: 16px;
          padding: 12px;
          font-family: inherit;
          font-weight: 800;
          color: #18102e;
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
          color: #463c63;
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
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
        }

        .lesson-notes-actions .soft {
          color: #463c63;
          background: #efe9fb;
        }

        .lesson-note-status {
          color: #7a6c9a;
          font-size: 12px;
          font-weight: 850;
        }
      `}),(0,m.jsx)(`h3`,{children:a}),(0,m.jsx)(`p`,{children:`اكتب خلاصة قصيرة أو سؤالًا مهنيًا تريد الرجوع إليه لاحقًا داخل ملفك التعليمي.`}),(0,m.jsxs)(`div`,{className:`lesson-notes-grid`,children:[(0,m.jsx)(`input`,{value:l,onChange:e=>u(e.target.value),placeholder:`عنوان اختياري للملاحظة`}),(0,m.jsx)(`textarea`,{value:d,onChange:e=>f(e.target.value),placeholder:`ما الفكرة التي تريد تثبيتها من هذا الدرس؟`}),(0,m.jsxs)(`label`,{className:`lesson-note-check`,children:[(0,m.jsx)(`input`,{type:`checkbox`,checked:h,onChange:e=>g(e.target.checked)}),`تثبيت الملاحظة في ملفي التعليمي`]}),(0,m.jsxs)(`div`,{className:`lesson-notes-actions`,children:[(0,m.jsx)(`button`,{type:`button`,className:`primary`,onClick:x,disabled:_,children:_?`جارٍ الحفظ...`:`حفظ الملاحظة`}),s&&(0,m.jsx)(`button`,{type:`button`,className:`soft`,onClick:S,children:`حذف`}),y&&(0,m.jsx)(`span`,{className:`lesson-note-status`,children:y})]})]})]})}function g(e){return typeof e==`string`?e:Array.isArray(e)?e.filter(Boolean).join(` `):e&&typeof e==`object`?g(e.text||e.content||e.body||e.title||``):``}function _(e){return e.replace(/[\u064B-\u065F\u0670]/g,``)}function v(e){return _(String(e||``)).toLowerCase().replace(/[إأآا]/g,`ا`).replace(/ى/g,`ي`).replace(/ة/g,`ه`).replace(/ؤ/g,`و`).replace(/ئ/g,`ي`).replace(/[^\u0600-\u06FFa-z0-9\s-]/gi,` `).replace(/\s+/g,` `).trim()}function y(e){return v(e).split(` `).map(e=>e.trim()).filter(e=>e.length>=2)}function b(e){return g(e?.content||e?.lesson||e?.body||e?.text||e?.markdown||``)}function ee(e,t,n=170){let r=String(e||``).replace(/\s+/g,` `).trim();if(!r)return``;let i=String(t||``).trim();if(!i)return r.slice(0,n);let a=v(r),o=v(i),s=o?a.indexOf(o):-1;if(s===-1)return r.slice(0,n);let c=Math.max(0,s-65),l=Math.min(r.length,s+n),u=c>0?`…`:``,d=l<r.length?`…`:``;return`${u}${r.slice(c,l)}${d}`}function x(e){return e?.title||`الشهر ${e?.monthIndex||``}`.trim()}function S(e){return e?.title||`الأسبوع ${e?.weekIndex||``}`.trim()}function C(e){return e?.label||e?.title||`اليوم ${e?.dayIndex||``}`.trim()}function te(e=[]){return Array.isArray(e)?e.flatMap(e=>(Array.isArray(e?.weeks)?e.weeks:[]).flatMap(t=>(Array.isArray(t?.days)?t.days:[]).map(n=>{let r=b(n),i=n?.title||n?.name||C(n);if(!r&&!i)return null;let a=`${x(e)} ← ${S(t)} ← ${C(n)}`,o=[x(e),e?.subtitle,S(t),t?.subtitle,t?.intro,C(n),i,r].map(g).join(` `);return{id:n?.id||`m${e?.monthIndex}-w${t?.weekIndex}-d${n?.dayIndex}`,monthIndex:Number(n?.monthIndex??e?.monthIndex),weekIndex:Number(n?.weekIndex??t?.weekIndex),dayIndex:Number(n?.dayIndex),monthTitle:x(e),weekTitle:S(t),dayTitle:i,dayLabel:C(n),path:a,content:r,searchable:o,normalizedSearchable:v(o)}}).filter(Boolean))):[]}function w(e,t,n){let r=v(t),i=v(e.dayTitle),a=v(e.path),o=e.normalizedSearchable,s=0;return r?(i.includes(r)&&(s+=90),a.includes(r)&&(s+=70),o.includes(r)&&(s+=45),n.forEach(e=>{i.includes(e)&&(s+=20),a.includes(e)&&(s+=14),o.includes(e)&&(s+=6)}),s-=Number(e.monthIndex||0)*.08,s-=Number(e.weekIndex||0)*.03,s-=Number(e.dayIndex||0)*.01,s):0}function T(e=[],t=``,n=12){let r=String(t||``).trim(),i=y(r);return r.length<2&&i.length===0?[]:te(e).map(e=>{let t=w(e,r,i);return{...e,score:t,excerpt:ee(e.content||e.searchable,r)}}).filter(e=>e.score>0).sort((e,t)=>t.score-e.score).slice(0,n)}var ne=[`RACI`,`الوصف الوظيفي`,`الثقافة`,`قياس الأثر`,`المقاومة`,`التغيير`,`الصلاحيات`,`التشخيص`,`التعلم المؤسسي`];function re({course:e=[],onJump:t,placeholder:n=`ابحث داخل الرحلة...`}){let[r,i]=(0,p.useState)(``),[a,o]=(0,p.useState)(!1),s=(0,p.useMemo)(()=>T(e,r,10),[e,r]),c=r.trim().length>=2;function l(e){i(e),o(!0)}function u(e){t?.(e),o(!1)}return(0,m.jsxs)(`section`,{className:`course-search-box course-search-box--stable`,"aria-label":`البحث داخل الرحلة التعليمية`,children:[(0,m.jsx)(`style`,{children:`
        .course-search-box {
          margin: 18px 0;
          border-radius: 30px;
          padding: 20px;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.10), transparent 32%),
            rgba(255,255,255,.94);
          border: 1px solid rgba(167, 139, 250,.20);
          box-shadow: 0 18px 48px rgba(28, 17, 48,.07);
        }

        .course-search-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 14px;
          align-items: center;
          margin-bottom: 14px;
        }

        .course-search-title {
          display: grid;
          gap: 4px;
        }

        .course-search-title strong {
          color: #18102e;
          font-size: 18px;
          line-height: 1.5;
          font-weight: 950;
        }

        .course-search-title span {
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 780;
        }

        .course-search-counter {
          border-radius: 999px;
          padding: 8px 12px;
          color: #6d28d9;
          background: #efe9fb;
          border: 1px solid rgba(139, 92, 246,.18);
          font-size: 12px;
          font-weight: 950;
          white-space: nowrap;
        }

        .course-search-row {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 10px;
        }

        .course-search-input {
          width: 100%;
          min-height: 52px;
          border-radius: 18px;
          border: 1px solid #c9bdf0;
          padding: 0 15px;
          color: #18102e;
          background: #ffffff;
          font-family: inherit;
          font-size: 14px;
          font-weight: 850;
          outline: none;
          box-sizing: border-box;
        }

        .course-search-input:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246,.10);
        }

        .course-search-clear {
          border: 0;
          cursor: pointer;
          min-height: 52px;
          border-radius: 18px;
          padding: 0 15px;
          color: #18102e;
          background: #efe9fb;
          font-family: inherit;
          font-size: 12px;
          font-weight: 950;
        }

        .course-search-suggestions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-top: 12px;
        }

        .course-search-suggestions button {
          border: 1px solid rgba(167, 139, 250,.22);
          cursor: pointer;
          border-radius: 999px;
          padding: 8px 11px;
          color: #463c63;
          background: #ffffff;
          font-family: inherit;
          font-size: 11px;
          font-weight: 900;
        }

        .course-search-results {
          display: grid;
          gap: 10px;
          margin-top: 14px;
        }

        .course-search-result {
          width: 100%;
          border: 1px solid rgba(167, 139, 250,.20);
          cursor: pointer;
          border-radius: 22px;
          padding: 15px;
          text-align: right;
          font-family: inherit;
          background: #ffffff;
          color: #18102e;
          transition: .2s ease;
        }

        .course-search-result:hover {
          transform: translateY(-2px);
          border-color: rgba(139, 92, 246,.35);
          box-shadow: 0 18px 34px rgba(139, 92, 246,.10);
        }

        .course-search-path {
          display: block;
          color: #8b5cf6;
          font-size: 11px;
          line-height: 1.8;
          font-weight: 950;
          margin-bottom: 6px;
        }

        .course-search-result strong {
          display: block;
          color: #18102e;
          font-size: 15px;
          line-height: 1.7;
          font-weight: 950;
        }

        .course-search-result p {
          margin: 6px 0 0;
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.9;
          font-weight: 760;
        }

        .course-search-empty {
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

        @media (max-width: 680px) {
          .course-search-head,
          .course-search-row {
            grid-template-columns: 1fr;
          }

          .course-search-counter {
            width: fit-content;
          }
        }

        html body .course-search-box--stable.course-search-box--stable {
          width: auto !important;
          min-height: 0 !important;
          margin: 18px 0 !important;
          padding: 20px !important;
          border-radius: 30px !important;
          overflow: hidden !important;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.10), transparent 32%),
            rgba(255,255,255,.94) !important;
          border: 1px solid rgba(167, 139, 250,.20) !important;
          box-shadow: 0 18px 48px rgba(28, 17, 48,.07) !important;
          backdrop-filter: none !important;
        }

        html body .course-search-box--stable .course-search-head,
        html body .course-search-box--stable .course-search-row,
        html body .course-search-box--stable .course-search-suggestions {
          border: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
        }

        html body .course-search-box--stable .course-search-head {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) auto !important;
          gap: 14px !important;
          align-items: center !important;
          padding: 0 !important;
          margin: 0 0 14px !important;
        }

        html body .course-search-box--stable .course-search-row {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) auto !important;
          gap: 10px !important;
          align-items: stretch !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        html body .course-search-box--stable .course-search-title {
          display: grid !important;
          gap: 4px !important;
          padding: 0 !important;
          min-width: 0 !important;
        }

        html body .course-search-box--stable .course-search-title strong {
          color: #18102e !important;
          -webkit-text-fill-color: #18102e !important;
          font-size: 18px !important;
          line-height: 1.5 !important;
          font-weight: 950 !important;
        }

        html body .course-search-box--stable .course-search-title span {
          color: #7a6c9a !important;
          -webkit-text-fill-color: #7a6c9a !important;
          font-size: 12px !important;
          line-height: 1.8 !important;
          font-weight: 780 !important;
        }

        html body .course-search-box--stable .course-search-counter {
          width: fit-content !important;
          min-width: 0 !important;
          min-height: 38px !important;
          display: inline-flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 8px 14px !important;
          border-radius: 999px !important;
          color: #6d28d9 !important;
          -webkit-text-fill-color: #6d28d9 !important;
          background: #efe9fb !important;
          border: 1px solid rgba(139, 92, 246,.18) !important;
          box-shadow: none !important;
          white-space: nowrap !important;
        }

        html body .course-search-box--stable .course-search-input {
          width: 100% !important;
          height: 52px !important;
          min-height: 52px !important;
          padding: 0 15px !important;
          border-radius: 18px !important;
          color: #18102e !important;
          -webkit-text-fill-color: #18102e !important;
          background: #fff !important;
          border: 1px solid #c9bdf0 !important;
          box-shadow: none !important;
          box-sizing: border-box !important;
        }

        html body .course-search-box--stable .course-search-clear {
          width: auto !important;
          min-width: 72px !important;
          height: 52px !important;
          min-height: 52px !important;
          padding: 0 15px !important;
          border-radius: 18px !important;
          color: #18102e !important;
          -webkit-text-fill-color: #18102e !important;
          background: #efe9fb !important;
          border: 1px solid transparent !important;
          box-shadow: none !important;
        }

        html body .course-search-box--stable .course-search-suggestions {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 8px !important;
          padding: 0 !important;
          margin: 12px 0 0 !important;
        }

        html body .course-search-box--stable .course-search-suggestions button {
          height: 38px !important;
          min-height: 38px !important;
          padding: 8px 11px !important;
          border-radius: 999px !important;
          color: #463c63 !important;
          -webkit-text-fill-color: #463c63 !important;
          background: #fff !important;
          border: 1px solid rgba(167, 139, 250,.22) !important;
          box-shadow: none !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable.course-search-box--stable {
          width: auto !important;
          min-height: 0 !important;
          margin: 18px 0 !important;
          padding: 20px !important;
          border-radius: 30px !important;
          overflow: hidden !important;
          background:
            radial-gradient(circle at 100% 0%, rgba(167, 139, 250,.14), transparent 32%),
            #1b1130 !important;
          border: 1px solid rgba(167, 139, 250,.28) !important;
          box-shadow: 0 18px 48px rgba(0, 0, 0,.18) !important;
          backdrop-filter: none !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-head,
        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-row,
        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-suggestions {
          border: 0 !important;
          background: transparent !important;
          box-shadow: none !important;
          backdrop-filter: none !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-head {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) auto !important;
          gap: 14px !important;
          align-items: center !important;
          padding: 0 !important;
          margin: 0 0 14px !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-row {
          display: grid !important;
          grid-template-columns: minmax(0, 1fr) auto !important;
          gap: 10px !important;
          align-items: stretch !important;
          padding: 0 !important;
          margin: 0 !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-title strong {
          color: #f7f2ff !important;
          -webkit-text-fill-color: #f7f2ff !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-title span {
          color: #d8ccf3 !important;
          -webkit-text-fill-color: #d8ccf3 !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-counter {
          min-height: 38px !important;
          padding: 8px 14px !important;
          border-radius: 999px !important;
          color: #f4effc !important;
          -webkit-text-fill-color: #f4effc !important;
          background: rgba(167, 139, 250,.12) !important;
          border: 1px solid rgba(167, 139, 250,.30) !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-input {
          height: 52px !important;
          min-height: 52px !important;
          padding: 0 15px !important;
          border-radius: 18px !important;
          color: #f7f2ff !important;
          -webkit-text-fill-color: #f7f2ff !important;
          background: #130b24 !important;
          border: 1px solid rgba(167, 139, 250,.28) !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-clear {
          width: auto !important;
          min-width: 72px !important;
          height: 52px !important;
          min-height: 52px !important;
          padding: 0 15px !important;
          border-radius: 18px !important;
          color: #f4effc !important;
          -webkit-text-fill-color: #f4effc !important;
          background: rgba(167, 139, 250,.12) !important;
          border: 1px solid rgba(167, 139, 250,.30) !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-suggestions {
          display: flex !important;
          flex-wrap: wrap !important;
          gap: 8px !important;
          padding: 0 !important;
          margin: 12px 0 0 !important;
        }

        html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-suggestions button {
          height: 38px !important;
          min-height: 38px !important;
          padding: 8px 11px !important;
          border-radius: 999px !important;
          color: #f7f2ff !important;
          -webkit-text-fill-color: #f7f2ff !important;
          background: #241640 !important;
          border: 1px solid rgba(167, 139, 250,.26) !important;
        }

        @media (max-width: 680px) {
          html body .course-search-box--stable .course-search-head,
          html body .course-search-box--stable .course-search-row,
          html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-head,
          html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-row {
            grid-template-columns: 1fr !important;
          }

          html body .course-search-box--stable .course-search-counter,
          html[data-theme="dark"] body.od-theme-dark .course-search-box--stable .course-search-counter {
            justify-self: start !important;
          }
        }
      `}),(0,m.jsxs)(`div`,{className:`course-search-head`,children:[(0,m.jsxs)(`div`,{className:`course-search-title`,children:[(0,m.jsx)(`strong`,{children:`بحث سريع داخل 180 يومًا`}),(0,m.jsx)(`span`,{children:`ابحث عن مفهوم أو أداة أو موضوع، ثم انتقل مباشرة إلى اليوم المرتبط إذا كان مفتوحًا في رحلتك.`})]}),(0,m.jsx)(`span`,{className:`course-search-counter`,children:c?`${s.length} نتيجة`:`جاهز للبحث`})]}),(0,m.jsxs)(`div`,{className:`course-search-row`,children:[(0,m.jsx)(`input`,{className:`course-search-input`,value:r,onChange:e=>{i(e.target.value),o(!0)},onFocus:()=>o(!0),placeholder:n,type:`search`,"aria-label":`ابحث داخل محتوى الرحلة`}),(0,m.jsx)(`button`,{type:`button`,className:`course-search-clear`,onClick:()=>{i(``),o(!1)},children:`مسح`})]}),(0,m.jsx)(`div`,{className:`course-search-suggestions`,"aria-label":`اقتراحات بحث`,children:ne.map(e=>(0,m.jsx)(`button`,{type:`button`,onClick:()=>l(e),children:e},e))}),a&&c&&s.length>0&&(0,m.jsx)(`div`,{className:`course-search-results`,children:s.map(e=>(0,m.jsxs)(`button`,{type:`button`,className:`course-search-result`,onClick:()=>u(e),children:[(0,m.jsx)(`span`,{className:`course-search-path`,children:e.path}),(0,m.jsx)(`strong`,{children:e.dayTitle}),e.excerpt?(0,m.jsx)(`p`,{children:e.excerpt}):null]},`${e.monthIndex}-${e.weekIndex}-${e.dayIndex}`))}),a&&c&&s.length===0&&(0,m.jsx)(`div`,{className:`course-search-empty`,children:`لم أجد نتيجة واضحة. جرّب كلمة أقصر مثل: ثقافة، صلاحيات، RACI، قياس، تغيير.`})]})}function E(e){if(!e)return`غير محدد`;try{return new Intl.DateTimeFormat(`ar-SA`,{year:`numeric`,month:`short`,day:`numeric`}).format(new Date(e))}catch{return`غير محدد`}}function D(e){let t=String(e||``).trim();return t?t.length>95?`${t.slice(0,95)}…`:t:`درس محفوظ`}function ie({bookmarks:e=[],loading:t=!1,onRefresh:n,onJump:r}){let i=e.length>0;return(0,m.jsxs)(`section`,{className:`saved-lessons-panel`,"aria-label":`الدروس المحفوظة`,dir:`rtl`,children:[(0,m.jsx)(`style`,{children:`
        .saved-lessons-panel {
          margin: 18px 0;
          border-radius: 30px;
          padding: 20px;
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.12), transparent 34%),
            rgba(255,255,255,.94);
          border: 1px solid rgba(167, 139, 250,.20);
          box-shadow: 0 18px 48px rgba(28, 17, 48,.07);
        }

        .saved-lessons-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 12px;
        }

        .saved-lessons-title {
          display: grid;
          gap: 4px;
        }

        .saved-lessons-title strong {
          color: #18102e;
          font-size: 18px;
          line-height: 1.5;
          font-weight: 950;
        }

        .saved-lessons-title span {
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 780;
        }

        .saved-lessons-refresh {
          border: 0;
          cursor: pointer;
          min-height: 40px;
          border-radius: 16px;
          padding: 0 13px;
          color: #18102e;
          background: #efe9fb;
          font-family: inherit;
          font-size: 12px;
          font-weight: 950;
          white-space: nowrap;
        }

        .saved-lessons-empty {
          border-radius: 20px;
          padding: 14px;
          color: #5b4f78;
          background: #f4f0fb;
          border: 1px dashed rgba(167, 139, 250,.38);
          font-size: 12px;
          line-height: 1.9;
          font-weight: 800;
        }

        .saved-lessons-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
        }

        .saved-lesson-card {
          border: 1px solid rgba(167, 139, 250,.20);
          cursor: pointer;
          border-radius: 22px;
          padding: 15px;
          text-align: right;
          font-family: inherit;
          background: #ffffff;
          color: #18102e;
          transition: .2s ease;
        }

        .saved-lesson-card:hover {
          transform: translateY(-2px);
          border-color: rgba(245,158,11,.42);
          box-shadow: 0 18px 34px rgba(245,158,11,.10);
        }

        .saved-lesson-card small {
          display: block;
          color: #92400e;
          font-size: 11px;
          line-height: 1.8;
          font-weight: 950;
          margin-bottom: 5px;
        }

        .saved-lesson-card strong {
          display: block;
          color: #18102e;
          font-size: 14px;
          line-height: 1.7;
          font-weight: 950;
        }

        .saved-lesson-card p {
          margin: 7px 0 0;
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.85;
          font-weight: 760;
        }

        .saved-lesson-meta {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-top: 10px;
          color: #9d8fc0;
          font-size: 10px;
          font-weight: 900;
        }

        @media (max-width: 820px) {
          .saved-lessons-grid {
            grid-template-columns: 1fr;
          }

          .saved-lessons-head {
            display: grid;
          }

          .saved-lessons-refresh {
            width: fit-content;
          }
        }
      `}),(0,m.jsxs)(`div`,{className:`saved-lessons-head`,children:[(0,m.jsxs)(`div`,{className:`saved-lessons-title`,children:[(0,m.jsx)(`strong`,{children:`دروسي المحفوظة`}),(0,m.jsx)(`span`,{children:`احفظ الدروس المهمة ثم عد إليها بسرعة دون البحث كل مرة.`})]}),(0,m.jsx)(`button`,{type:`button`,className:`saved-lessons-refresh`,onClick:n,disabled:t,children:t?`جارٍ التحديث...`:`تحديث`})]}),i?(0,m.jsx)(`div`,{className:`saved-lessons-grid`,children:e.slice(0,8).map(e=>(0,m.jsxs)(`button`,{type:`button`,className:`saved-lesson-card`,onClick:()=>r?.(e),children:[(0,m.jsx)(`small`,{children:D(e.lesson_path)}),(0,m.jsx)(`strong`,{children:e.lesson_title||`درس محفوظ`}),e.excerpt?(0,m.jsx)(`p`,{children:e.excerpt}):null,(0,m.jsxs)(`span`,{className:`saved-lesson-meta`,children:[(0,m.jsxs)(`span`,{children:[`الشهر `,e.month_index,` · الأسبوع `,e.week_index,` · اليوم `,e.day_index]}),(0,m.jsx)(`span`,{children:E(e.updated_at||e.created_at)})]})]},`${e.month_index}-${e.week_index}-${e.day_index}`))}):(0,m.jsx)(`div`,{className:`saved-lessons-empty`,children:`لم تحفظ أي درس بعد. افتح أي درس واضغط زر "حفظ هذا الدرس" ليظهر هنا.`})]})}var O={locked:`مقفل`,active:`متاح`,completed:`مكتمل`},ae={months:{kicker:`بوابة الرحلة`,title:`اختر الشهر`,note:`لا يظهر لك كل المحتوى دفعة واحدة. ابدأ بالشهر، ثم افتح الأسبوع، ثم اليوم، ثم الدرس والاختبار.`,quote:`لا تبدأ بالحل. افهم النظام أولًا.`},weeks:{kicker:`خريطة الشهر`,title:`اختر الأسبوع`,note:`كل أسبوع بوابة معرفية مستقلة. لا تنتقل للبوابة التالية إلا بعد إكمال ما قبلها.`,quote:`الإتقان ليس سرعة الوصول؛ بل جودة العبور.`},days:{kicker:`مسار الأسبوع`,title:`اختر اليوم`,note:`كل أسبوع يحتوي على سبعة أيام تعليمية. كل يوم يفتح بعد إكمال اليوم السابق.`,quote:`اليوم الصغير المتقن يصنع عقلًا مهنيًا كبيرًا.`},lesson:{kicker:`غرفة الدرس والاختبار`,title:`اقرأ الدرس ثم اختبر فهمك`,note:`الدرس منسق إلى فقرات وأقسام، ثم يأتي اختبار اليوم بثلاثة أسئلة متعددة الخيارات.`,quote:`لا تحفظ النص؛ استخرج منه حكمًا مهنيًا.`}},k={1:`الأول`,2:`الثاني`,3:`الثالث`,4:`الرابع`,5:`الخامس`,6:`السادس`,7:`السابع`},A=[`الفكرة المركزية`,`ما المقصود بالتطوير التنظيمي؟`,`لماذا لا تبدأ بالحل؟`,`الفرق بين الشكوى والفرضية والدليل`,`قاعدة اليوم`,`تطبيق اليوم`,`أداة اليوم`,`مثال تطبيقي`,`لماذا هذا مهم؟`,`متى نستخدمه؟`,`متى لا نستخدمه؟`,`أخطاء شائعة`,`مكونات الخطة`,`مؤشرات النجاح`,`المهمة النهائية`,`الحصيلة المعرفية`,`القراءة المهنية`,`البيانات المطلوبة`,`مخاطر التطبيق`,`خطة التنفيذ`,`خطة القياس`,`خطة الاستدامة`];function j(e,t=0){let n=Number(e);return Number.isFinite(n)?n:t}function M(e){if(typeof e==`string`)return e;if(Array.isArray(e))return e.filter(Boolean).join(`

`);if(e&&typeof e==`object`){if(typeof e.text==`string`)return e.text;if(typeof e.content==`string`)return e.content;if(typeof e.body==`string`)return e.body}return``}function N(e){return e.replace(/[.*+?^${}()|[\]\\]/g,`\\$&`)}function P(e,t,n){return`${e}-${t}-${n}`}function F(e){return`${Math.round(Number.isFinite(e)?e:0)}٪`}function oe(e=[]){return Array.isArray(e)?e.map((e,t)=>{let n=j(e.monthIndex??e.month_index??e.index??e.number,t+1),r=(Array.isArray(e.weeks)?e.weeks:Array.isArray(e.children)?e.children:Array.isArray(e.units)?e.units:[]).map((e,t)=>{let r=j(e.weekIndex??e.week_index??e.index??e.number,t+1),i=(Array.isArray(e.days)?e.days:Array.isArray(e.lessons)?e.lessons:Array.isArray(e.children)?e.children:[]).map((e,t)=>{let i=j(e.dayIndex??e.day_index??e.index??e.number,t+1),a=M(e.content??e.lesson??e.body??e.text??e.markdown??``);return{...e,id:e.id||`m${n}-w${r}-d${i}`,monthIndex:n,weekIndex:r,dayIndex:i,label:e.label||`اليوم ${k[i]||i}`,title:e.title||e.name||`اليوم ${k[i]||i}`,content:a,quiz:e.quiz||e.questions||null,quizAnswerKey:e.quizAnswerKey||e.answerKey||e.correctAnswers||null}});return{...e,id:e.id||`m${n}-w${r}`,monthIndex:n,weekIndex:r,title:e.title||e.name||`الأسبوع ${k[r]||r}`,subtitle:e.subtitle||e.description||``,intro:M(e.intro??e.summary??``),days:i}});return{...e,id:e.id||`m${n}`,monthIndex:n,title:e.title||e.name||`الشهر ${n}`,subtitle:e.subtitle||e.description||``,weeks:r}}):[]}function I(e){return M(e?.content||``)}function L(e){return e?.days?e.days.filter(e=>!!I(e)||!!e.quiz):[]}function se(e){return L(e).length>0}function ce(e){return e.reduce((e,t)=>e+t.weeks.reduce((e,t)=>e+L(t).length,0),0)}function le(e){return Array.isArray(e)?e.map(e=>({...e,month_index:j(e.month_index??e.monthIndex,0),week_index:j(e.week_index??e.weekIndex,0),day_index:j(e.day_index??e.dayIndex,0),status:e.status||`opened`})):[]}function ue(e){return new Set(le(e).filter(e=>e.status===`completed`).map(e=>P(e.month_index,e.week_index,e.day_index)))}function R(e,t){return L(t).filter(t=>e.has(P(t.monthIndex,t.weekIndex,t.dayIndex))).length}function z(e,t){return t.weeks.reduce((t,n)=>t+R(e,n),0)}function B(e,t){return t.has(P(e.monthIndex,e.weekIndex,e.dayIndex))}function V(e){let t=M(e).replace(/ملحق غير مخصص لنسخة المتدرب[\s\S]*$/g,``).replace(/مفتاح إجابات[\s\S]*$/g,``).trim(),n=t.match(/اختبار\s+اليوم[\s\S]*$/);if(!n)return{lessonText:t,quizText:``};let r=n[0].trim();return{lessonText:t.slice(0,n.index).trim(),quizText:r}}function H(e){let t=e?.quiz;return t?(Array.isArray(t)?t:Array.isArray(t.questions)?t.questions:[]).map((e,t)=>{let n=Array.isArray(e.options)?e.options:[],r=e.correctKey??e.correct??e.answer??e.correctAnswer??e.correct_option??null,i=n.map((e,t)=>{if(typeof e==`string`){let n=[`A`,`B`,`C`,`D`][t]||String(t+1);return{id:n,originalKey:n,text:e,isCorrect:r===n||r===t||r===t+1||r===e}}let n=e.key||e.id||[`A`,`B`,`C`,`D`][t]||String(t+1);return{id:n,originalKey:n,text:e.text||e.label||e.value||``,isCorrect:!!e.isCorrect||!!e.correct||r===n||r===e.text}});return{id:e.id||`q-${t+1}`,question:e.question||e.title||e.text||``,options:i,hasKnownCorrectAnswer:i.some(e=>e.isCorrect)}}).filter(e=>e.question&&e.options.length):[]}var U={1:[`الأول`,`الاول`,`١`,`1`],2:[`الثاني`,`٢`,`2`],3:[`الثالث`,`٣`,`3`],4:[`الرابع`,`٤`,`4`],5:[`الخامس`,`٥`,`5`],6:[`السادس`,`٦`,`6`],7:[`السابع`,`٧`,`7`]};function W(e){return{أ:`A`,ا:`A`,A:`A`,ب:`B`,B:`B`,ج:`C`,C:`C`,د:`D`,D:`D`}[M(e).trim().toUpperCase()]||``}function G(e){let t={"٠":`0`,"١":`1`,"٢":`2`,"٣":`3`,"٤":`4`,"٥":`5`,"٦":`6`,"٧":`7`,"٨":`8`,"٩":`9`};return M(e).replace(/[٠-٩]/g,e=>t[e]||e)}function de(e,t){let n=G(t),r=n.search(/مفتاح\s+إجابات|مفتاح\s+الاجابات|مفاتيح\s+الإجابة|مفاتيح\s+الاجابة/);if(r<0)return``;let i=n.slice(r),a=U[Number(e?.dayIndex)]||[];for(let e of a){let t=RegExp(`اليوم\\s+${N(e)}\\s*[:：]?([\\s\\S]*?)(?=\\n\\s*اليوم\\s+(?:الأول|الاول|الثاني|الثالث|الرابع|الخامس|السادس|السابع|[1-7])\\s*[:：]?|$)`),n=i.match(t);if(n?.[1])return n[1]}return i}function fe(e){return!e||typeof e!=`object`?{}:(Array.isArray(e)?e.map((e,t)=>[t+1,e]):Object.entries(e)).reduce((e,[t,n])=>{let r=Number(G(String(t))),i=W(n);return r&&i&&(e[r]=i),e},{})}function pe(e,t){let n=fe(e?.quizAnswerKey||e?.answerKey||e?.correctAnswers);if(Object.keys(n).length)return n;let r=de(e,t),i={};if(!r)return i;let a=/(?:السؤال\s*)?([1-9]\d*)\s*[-–—:：]\s*([A-Dأابجد])/gi,o;for(;(o=a.exec(r))!==null;){let e=Number(o[1]),t=W(o[2]);e&&t&&(i[e]=t)}return i}function K(e,t){return!t||!Object.keys(t).length?e:e.map((e,n)=>{let r=t[n+1];if(!r)return e;let i=e.options.map(e=>({...e,isCorrect:W(e.id)===r||W(e.originalKey)===r}));return{...e,options:i,hasKnownCorrectAnswer:i.some(e=>e.isCorrect)}})}function me(e,t,n=``){let r=pe(e,n),i=H(e);if(i.length)return K(i,r);let a=M(t);return a?K(a.replace(/\r/g,``).split(/(?=السؤال\s+\d+)/g).map(e=>e.trim()).filter(e=>/^السؤال\s+\d+/.test(e)).map((t,n)=>{let r=t.replace(/^السؤال\s+\d+\s*/g,``).trim(),i=r.match(/^([\s\S]*?)(?=\s+(?:[A-D]|أ|ب|ج|د)\.)/),a=i?i[1].trim():r,o=[],s=/([A-D]|أ|ب|ج|د)\.\s*([\s\S]*?)(?=(?:\s+(?:[A-D]|أ|ب|ج|د)\.)|$)/g,c;for(;(c=s.exec(r))!==null;)o.push({id:{أ:`A`,ب:`B`,ج:`C`,د:`D`}[c[1]]||c[1],originalKey:c[1],text:c[2].trim(),isCorrect:!1});return{id:`${e.id}-parsed-q-${n+1}`,question:a,options:o,hasKnownCorrectAnswer:!1}}).filter(e=>e.question&&e.options.length),r):[]}function he(e){let t=I(e),{lessonText:n,quizText:r}=V(t),i=me(e,r,t);return{fullText:t,lessonText:n,quizText:r,hasQuizText:!!r,quiz:i}}function ge(e){let t=M(e).replace(/\r/g,``).replace(/[ \t]+/g,` `).replace(/([^\n])(\d+\.\s)/g,`$1

$2`).replace(/([^\n])([•·]\s)/g,`$1
$2`).replace(/([^\n])(السؤال\s+\d+)/g,`$1

$2`).replace(/([؟.!])(?=[اأإآء-ي])/g,`$1
`).replace(/(:)(?=[اأإآء-ي])/g,`$1
`);return A.forEach(e=>{let n=RegExp(`(\\d+\\.\\s*${N(e)})(?=[اأإآء-ي])`,`g`);t=t.replace(n,`$1
`)}),t.split(/\n+/).map(e=>e.trim()).filter(Boolean)}function _e({text:e}){let t=ge(e);return t.length?(0,m.jsx)(`div`,{className:`jl-rich-text`,children:t.map((e,t)=>{let n=`${t}-${e.slice(0,16)}`;return/^الشهر\s+/.test(e)?(0,m.jsx)(`h1`,{children:e},n):/^الأسبوع\s+/.test(e)||/^اليوم\s+/.test(e)?(0,m.jsx)(`h2`,{children:e},n):/^\d+\.\s/.test(e)?(0,m.jsx)(`h3`,{children:e},n):/^[•·-]\s/.test(e)?(0,m.jsx)(`div`,{className:`jl-bullet`,children:e.replace(/^[•·-]\s/,``)},n):e.endsWith(`:`)&&e.length<80?(0,m.jsx)(`h4`,{children:e},n):(0,m.jsx)(`p`,{children:e},n)})}):(0,m.jsx)(`div`,{className:`jl-empty`,children:`لا يوجد نص لهذا اليوم بعد.`})}function ve({state:e}){return e===`completed`?(0,m.jsx)(`span`,{className:`jl-status jl-status--completed`,children:`✓`}):e===`locked`?(0,m.jsx)(`span`,{className:`jl-status jl-status--locked`,children:`🔒`}):(0,m.jsx)(`span`,{className:`jl-status jl-status--active`,children:`●`})}function q({label:e,value:t,help:n}){return(0,m.jsxs)(`div`,{className:`jl-mini-progress`,children:[(0,m.jsxs)(`div`,{className:`jl-mini-head`,children:[(0,m.jsx)(`span`,{children:e}),(0,m.jsx)(`strong`,{children:F(t)})]}),(0,m.jsx)(`div`,{className:`jl-mini-track`,children:(0,m.jsx)(`i`,{style:{width:`${Math.min(100,Math.max(0,Number.isFinite(t)?t:0))}%`}})}),n&&(0,m.jsx)(`small`,{children:n})]})}function ye({day:e,questions:t,hasQuizText:n=!1,onPass:r}){let[i,a]=(0,p.useState)({}),[o,s]=(0,p.useState)(!1);(0,p.useEffect)(()=>{a({}),s(!1)},[e.id]);let c=t.length,l=Object.keys(i).length,u=c>0&&l===c,d=t.every(e=>e.hasKnownCorrectAnswer),f=t.reduce((e,t)=>{let n=i[t.id];return e+ +!!t.options.find(e=>e.id===n)?.isCorrect},0),h=d?f===c:u;function g(){s(!0),h&&r(!0)}return t.length?(0,m.jsxs)(`section`,{className:`jl-quiz`,"aria-label":`اختبار اليوم`,children:[(0,m.jsxs)(`div`,{className:`jl-quiz-header`,children:[(0,m.jsx)(`span`,{children:`اختبار اليوم`}),(0,m.jsxs)(`strong`,{children:[l,` / `,c]})]}),(0,m.jsx)(`h3`,{children:`اختبر فهمك قبل حفظ الإنجاز`}),c!==3&&(0,m.jsxs)(`div`,{className:`jl-quiz-warning`,children:[`تنبيه: المتوقع أن يحتوي اختبار كل يوم على 3 أسئلة. هذا اليوم ظهر فيه `,c,` سؤال/أسئلة بعد التحويل الآلي. راجع الدرس مرة أخرى إذا احتجت قبل المتابعة.`]}),!d&&(0,m.jsx)(`div`,{className:`jl-quiz-warning`,children:`تم استخراج الأسئلة من النص، لكن لم توجد مفاتيح إجابة منظمة في بيانات هذا اليوم. سيتم اعتبار الاختبار مكتملًا بعد الإجابة عن كل الأسئلة.`}),(0,m.jsx)(`div`,{className:`jl-question-list`,children:t.map((e,t)=>{let n=i[e.id],r=e.options.find(e=>e.id===n),s=e.options.find(e=>e.isCorrect),c=!!r?.isCorrect;return(0,m.jsxs)(`div`,{className:`jl-question`,children:[(0,m.jsxs)(`div`,{className:`jl-question-title`,children:[(0,m.jsx)(`b`,{children:t+1}),(0,m.jsx)(`span`,{children:e.question})]}),(0,m.jsx)(`div`,{className:`jl-options`,children:e.options.map((t,r)=>{let i=n===t.id,s=o&&d&&t.isCorrect,c=o&&d&&i&&!t.isCorrect;return(0,m.jsxs)(`button`,{type:`button`,className:[`jl-option`,i?`jl-option--selected`:``,s?`jl-option--correct`:``,c?`jl-option--wrong`:``].join(` `),onClick:()=>{a(n=>({...n,[e.id]:t.id}))},children:[(0,m.jsx)(`span`,{children:[`أ`,`ب`,`ج`,`د`][r]||r+1}),(0,m.jsx)(`strong`,{children:t.text})]},`${e.id}-${t.id}-${r}`)})}),o&&d&&s&&(0,m.jsx)(`div`,{className:c?`jl-answer-note jl-answer-note--correct`:`jl-answer-note jl-answer-note--wrong`,children:c?`إجابتك صحيحة.`:`الإجابة الصحيحة: ${s.text}`})]},e.id)})}),(0,m.jsxs)(`div`,{className:`jl-quiz-footer`,children:[(0,m.jsx)(`button`,{type:`button`,className:`jl-quiz-submit`,disabled:!u,onClick:g,children:`تحقق من الاختبار`}),o&&(0,m.jsx)(`div`,{className:h?`jl-quiz-result jl-quiz-result--pass`:`jl-quiz-result jl-quiz-result--fail`,children:d?h?`ممتاز. نتيجتك ${f} من ${c}. يمكنك حفظ إنجاز اليوم.`:`نتيجتك ${f} من ${c}. راجع إجاباتك ثم حاول مرة أخرى.`:`تم تسجيل محاولة الاختبار. يمكنك حفظ إنجاز اليوم.`})]})]}):(0,m.jsxs)(`div`,{className:`jl-quiz jl-quiz-soft`,children:[(0,m.jsx)(`h3`,{children:`اختبار اليوم`}),n?(0,m.jsxs)(m.Fragment,{children:[(0,m.jsx)(`p`,{children:`يوجد اختبار في النص الأصلي، لكن لم أستطع تحويله تلقائيًا إلى أزرار اختيار. اقرأ اختبار اليوم من الدرس، ثم اضغط الزر التالي لتأكيد أنك أجبت عنه.`}),(0,m.jsx)(`button`,{type:`button`,className:`jl-quiz-submit`,onClick:()=>r(!0),children:`أجبت على اختبار اليوم من النص الأصلي`})]}):(0,m.jsx)(`p`,{children:`لم يتم العثور على اختبار منفصل داخل بيانات هذا اليوم. يمكنك إنهاء اليوم بعد قراءة الدرس.`})]})}function J({progressRows:e=[],setProgressRows:t=()=>{},loading:i=!1,resumeRequest:a=0}){let o=(0,p.useMemo)(()=>oe(c),[]),[s,g]=(0,p.useState)(`months`),[_,v]=(0,p.useState)(1),[y,b]=(0,p.useState)(1),[ee,x]=(0,p.useState)(1),[S,C]=(0,p.useState)(!1),[te,w]=(0,p.useState)(``),[T,ne]=(0,p.useState)({}),[E,D]=(0,p.useState)([]),[k,A]=(0,p.useState)(!1),[j,M]=(0,p.useState)(!1),[N,P]=(0,p.useState)(``),V=(0,p.useMemo)(()=>ue(e),[e]),H=o.find(e=>e.monthIndex===_)||o[0],U=H?.weeks?.find(e=>e.weekIndex===y)||H?.weeks?.[0],W=U?.days?.find(e=>e.dayIndex===ee)||U?.days?.[0],G=(0,p.useMemo)(()=>he(W||{}),[W?.id,W?.content,W?.quiz]),de=(0,p.useMemo)(()=>[H?.title,U?.title,W?.title].filter(Boolean).join(` ← `),[H?.title,U?.title,W?.title]),fe=(0,p.useMemo)(()=>String(G.lessonText||G.fullText||``).replace(/\s+/g,` `).trim().slice(0,220),[G.lessonText,G.fullText]),pe=(0,p.useMemo)(()=>W&&E.find(e=>Number(e.month_index)===Number(W.monthIndex)&&Number(e.week_index)===Number(W.weekIndex)&&Number(e.day_index)===Number(W.dayIndex))||null,[E,W]);ce(o);let K=l?.totalDays||180,me=l?.daysPerMonth||30,ge=o.reduce((e,t)=>e+z(V,t),0);H&&H.weeks.reduce((e,t)=>e+L(t).length,0);let J=H?me:0,be=U?L(U).length:0,xe=H?z(V,H):0,Se=U?R(V,U):0,Ce=K?ge/K*100:0,we=J?xe/J*100:0,Te=be?Se/be*100:0;function Ee(e){let t=e.weeks.reduce((e,t)=>e+L(t).length,0);return t?z(V,e)>=t:!1}function Y(e){if(e.monthIndex===1)return!0;let t=o.find(t=>t.monthIndex===e.monthIndex-1);return!!(t&&Ee(t))}function De(e){return Ee(e)?`completed`:Y(e)?`active`:`locked`}function Oe(e){let t=L(e).length;return t?R(V,e)>=t:!1}function X(e,t=H){if(!t||!Y(t)||!se(e))return!1;if(e.weekIndex===1)return!0;let n=t.weeks.find(t=>t.weekIndex===e.weekIndex-1);return!!(n&&Oe(n))}function ke(e,t=H){return Oe(e)?`completed`:X(e,t)?`active`:`locked`}function Ae(e,t){let n=L(t).sort((e,t)=>e.dayIndex-t.dayIndex),r=n.findIndex(t=>t.dayIndex===e.dayIndex);return r>0?n[r-1]:null}function Z(e,t=U,n=H){if(!e||!t||!n||!I(e)&&!e.quiz||!X(t,n))return!1;let r=Ae(e,t);return r?B(r,V):!0}function je(e,t=U,n=H){return B(e,V)?`completed`:Z(e,t,n)?`active`:`locked`}function Me(e){let t=e.weeks.filter(se),n=t.filter(t=>X(t,e));return n.find(e=>!Oe(e))||n[0]||t[0]||e.weeks[0]}function Ne(e,t){let n=L(e).sort((e,t)=>e.dayIndex-t.dayIndex);return n.find(n=>Z(n,e,t)&&!B(n,V))||n[0]||e.days[0]}function Pe(){for(let e of o)if(Y(e))for(let t of e.weeks){if(!X(t,e))continue;let n=L(t).sort((e,t)=>e.dayIndex-t.dayIndex).find(n=>Z(n,t,e)&&!B(n,V));if(n)return{month:e,week:t,day:n}}let e=o[0],t=Me(e);return{month:e,week:t,day:Ne(t,e)}}(0,p.useEffect)(()=>{if(!o.length)return;let e=Pe();e?.month&&e?.week&&e?.day&&(v(e.month.monthIndex),b(e.week.weekIndex),x(e.day.dayIndex))},[o.length,e.length]),(0,p.useEffect)(()=>{!a||i||!o.length||Re()},[a,i,o.length,e.length]),(0,p.useEffect)(()=>{s===`lesson`&&W?.id&&Z(W,U,H)&&r({monthIndex:W.monthIndex,weekIndex:W.weekIndex,dayIndex:W.dayIndex}).catch(()=>void 0)},[s,W?.id]),(0,p.useEffect)(()=>{Be()},[]);function Fe(e){if(!Y(e))return;let t=Me(e),n=Ne(t,e);v(e.monthIndex),b(t.weekIndex),x(n.dayIndex),w(``),g(`weeks`)}function Ie(e){if(!X(e,H))return;let t=Ne(e,H);b(e.weekIndex),x(t.dayIndex),w(``),g(`days`)}function Le(e){Z(e,U,H)&&(x(e.dayIndex),w(``),g(`lesson`))}function Re(){let e=Pe();!e?.month||!e?.week||!e?.day||(v(e.month.monthIndex),b(e.week.weekIndex),x(e.day.dayIndex),g(`lesson`),w(``))}function ze(e){if(!e)return;let t=o.find(t=>t.monthIndex===e.monthIndex),n=t?.weeks?.find(t=>t.weekIndex===e.weekIndex),r=n?.days?.find(t=>t.dayIndex===e.dayIndex);if(!t||!n||!r){w(`لم أستطع العثور على هذه النتيجة داخل خريطة الرحلة.`);return}if(v(t.monthIndex),b(n.weekIndex),x(r.dayIndex),!Y(t)){g(`months`),w(`هذه النتيجة ضمن شهر لم يُفتح بعد. أكمل الشهر السابق أولًا.`);return}if(!X(n,t)){g(`weeks`),w(`هذه النتيجة ضمن أسبوع لم يُفتح بعد. أكمل الأسبوع السابق أولًا.`);return}if(!Z(r,n,t)){g(`days`),w(`هذه النتيجة ضمن يوم لم يُفتح بعد. أكمل اليوم السابق أولًا.`);return}g(`lesson`),w(``),window.requestAnimationFrame(()=>{document.querySelector(`.jl-reader`)?.scrollIntoView?.({behavior:`smooth`,block:`start`})})}async function Be(){A(!0);try{let e=await u();D(Array.isArray(e)?e:[])}catch(e){console.warn(`تعذر تحميل الدروس المحفوظة:`,e)}finally{A(!1)}}function Ve(e){ze({monthIndex:Number(e?.month_index),weekIndex:Number(e?.week_index),dayIndex:Number(e?.day_index)})}async function He(){if(W){M(!0),P(``);try{if(pe){await f({monthIndex:W.monthIndex,weekIndex:W.weekIndex,dayIndex:W.dayIndex}),D(e=>e.filter(e=>!(Number(e.month_index)===Number(W.monthIndex)&&Number(e.week_index)===Number(W.weekIndex)&&Number(e.day_index)===Number(W.dayIndex)))),P(`تمت إزالة الدرس من المحفوظات.`);return}let e=await d({monthIndex:W.monthIndex,weekIndex:W.weekIndex,dayIndex:W.dayIndex,lessonTitle:W.title,lessonPath:de,excerpt:fe});D(t=>[e,...t.filter(e=>!(Number(e.month_index)===Number(W.monthIndex)&&Number(e.week_index)===Number(W.weekIndex)&&Number(e.day_index)===Number(W.dayIndex)))]),P(`تم حفظ الدرس في قائمتك.`)}catch(e){P(e?.message||`تعذر تحديث الدروس المحفوظة.`)}finally{M(!1),window.setTimeout(()=>P(``),2600)}}}async function Ue(){if(!W||!Z(W,U,H)||B(W,V))return;let r=G.quiz.length>0,i=T[W.id];if(r&&!i){w(`أجب عن اختبار اليوم أولًا، ثم احفظ الإنجاز.`);return}C(!0),w(``);try{let r=await n({monthIndex:W.monthIndex,weekIndex:W.weekIndex,dayIndex:W.dayIndex,status:`completed`});t(Array.isArray(r)?r:[...le(e).filter(e=>!(e.month_index===W.monthIndex&&e.week_index===W.weekIndex&&e.day_index===W.dayIndex)),{month_index:W.monthIndex,week_index:W.weekIndex,day_index:W.dayIndex,status:`completed`}]),w(`تم حفظ إنجاز اليوم. فُتحت لك المحطة التالية.`)}catch(e){w(e?.message||`تعذر حفظ التقدم. تأكد من تسجيل الدخول أو إعداد Supabase.`)}finally{C(!1)}}function We(){s===`lesson`?g(`days`):s===`days`?g(`weeks`):s===`weeks`&&g(`months`)}if(!o.length)return(0,m.jsx)(`section`,{className:`journey-lab`,dir:`rtl`,children:(0,m.jsx)(`div`,{className:`jl-empty`,children:`لم يتم العثور على محتوى الرحلة داخل courseContent.`})});let Q=ae[s],$=W?je(W):`locked`,Ge=G.hasQuizText||G.quiz.length>0,Ke=$===`active`&&(!Ge||T[W?.id]);return(0,m.jsxs)(`section`,{className:`journey-lab`,dir:`rtl`,children:[(0,m.jsx)(`style`,{children:`
        .journey-lab {
          /* الرموز المحلية تُشتقّ الآن من نظام التصميم الموحّد */
          --ink:var(--text);
          --muted:var(--text-muted);
          --line:var(--border);
          --primary:var(--accent);
          --violet:var(--accent-hover);
          --gold:var(--accent);
          --green:var(--success);
          --red:var(--danger);
          min-height:100vh;
          position:relative;
          overflow:hidden;
          color:var(--ink);
          padding:28px 16px 70px;
          background:
            radial-gradient(circle at 12% 12%, rgba(139, 92, 246,.18), transparent 31%),
            radial-gradient(circle at 86% 18%, rgba(139,92,246,.16), transparent 28%),
            radial-gradient(circle at 50% 88%, rgba(168, 85, 247,.13), transparent 31%),
            linear-gradient(135deg,#f4f0fb 0%,#efe9fb 48%,#f4f0fb 100%);
        }

        .jl-wrap {
          width:min(1180px,100%);
          margin:0 auto;
          position:relative;
          z-index:1;
        }

        .jl-hero {
          border-radius:38px;
          padding:34px;
          color:white;
          overflow:hidden;
          position:relative;
          background:
            radial-gradient(circle at top left, rgba(139,92,246,.24), transparent 35%),
            linear-gradient(135deg,#18102e,#281748 54%,#111827);
          box-shadow:0 28px 90px rgba(28, 17, 48,.22);
        }

        .jl-hero::before {
          content:"";
          position:absolute;
          inset:-40%;
          background-image:
            linear-gradient(rgba(255,255,255,.055) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.055) 1px, transparent 1px);
          background-size:42px 42px;
          transform:rotate(-8deg);
          opacity:.45;
        }

        .jl-hero-inner {
          position:relative;
          z-index:1;
          display:grid;
          grid-template-columns:1.35fr .65fr;
          gap:26px;
          align-items:center;
        }

        .jl-eyebrow {
          display:inline-flex;
          width:fit-content;
          padding:8px 14px;
          border-radius:999px;
          background:rgba(255,255,255,.10);
          border:1px solid rgba(255,255,255,.16);
          color:#c4b5fd;
          font-size:12px;
          font-weight:950;
        }

        .jl-title {
          margin:16px 0 12px;
          font-size:clamp(30px,5vw,62px);
          line-height:1.06;
          font-weight:950;
          letter-spacing:-1.2px;
        }

        .jl-title span {
          display:block;
          color:transparent;
          background:linear-gradient(90deg,#fff,#c3b5e8,#c4b5fd);
          -webkit-background-clip:text;
          background-clip:text;
        }

        .jl-hero p {
          margin:0;
          max-width:780px;
          color:rgba(196, 181, 253,.88);
          font-size:15px;
          line-height:2;
          font-weight:750;
        }

        .jl-orb-card {
          min-height:230px;
          display:grid;
          place-items:center;
        }

        .jl-orb {
          width:210px;
          height:210px;
          border-radius:999px;
          display:grid;
          place-items:center;
          background:
            radial-gradient(circle at 38% 32%, rgba(255,255,255,.96), rgba(199,210,254,.35) 19%, rgba(139, 92, 246,.24) 42%, rgba(28, 17, 48,.08) 66%),
            conic-gradient(from 0deg,#8b5cf6,#7c3aed,#a855f7,#10b981,#8b5cf6);
          box-shadow:inset 0 0 38px rgba(255,255,255,.35),0 30px 90px rgba(139, 92, 246,.34);
        }

        .jl-orb strong {
          display:block;
          color:white;
          font-size:46px;
          font-weight:950;
          text-align:center;
          text-shadow:0 8px 24px rgba(28, 17, 48,.35);
        }

        .jl-orb small {
          display:block;
          color:rgba(255,255,255,.82);
          font-size:11px;
          font-weight:900;
          text-align:center;
        }

        .jl-control-deck {
          margin:18px 0;
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:12px;
        }

        .jl-mini-progress {
          border-radius:24px;
          padding:16px;
          background:var(--surface);
          border:1px solid var(--line);
          box-shadow:0 16px 38px rgba(28, 17, 48,.08);
          backdrop-filter:blur(18px);
        }

        .jl-mini-head {
          display:flex;
          justify-content:space-between;
          gap:12px;
          align-items:center;
          margin-bottom:10px;
        }

        .jl-mini-head span {
          color:var(--muted);
          font-size:11px;
          font-weight:900;
          line-height:1.6;
        }

        .jl-mini-head strong {
          color:var(--ink);
          font-size:18px;
          font-weight:950;
        }

        .jl-mini-track {
          height:9px;
          border-radius:999px;
          background:rgba(167, 139, 250,.18);
          overflow:hidden;
        }

        .jl-mini-track i {
          display:block;
          height:100%;
          border-radius:inherit;
          background:linear-gradient(90deg,#8b5cf6,#7c3aed,#a855f7);
        }

        .jl-mini-progress small {
          display:block;
          margin-top:9px;
          color:#9d8fc0;
          font-size:11px;
          font-weight:850;
        }

        .jl-top-actions {
          margin:20px 0;
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          flex-wrap:wrap;
        }

        .jl-breadcrumbs {
          display:flex;
          gap:8px;
          flex-wrap:wrap;
          align-items:center;
        }

        .jl-crumb,
        .jl-back,
        .jl-main-btn,
        .jl-ghost-btn,
        .jl-complete,
        .jl-quiz-submit {
          font-family:inherit;
          border:0;
          cursor:pointer;
          transition:.24s ease;
        }

        .jl-crumb {
          padding:10px 14px;
          border-radius:999px;
          background:var(--surface);
          border:1px solid var(--line);
          color:var(--muted);
          font-size:12px;
          font-weight:950;
          box-shadow:0 10px 28px rgba(28, 17, 48,.06);
        }

        .jl-crumb:hover,
        .jl-back:hover,
        .jl-main-btn:hover,
        .jl-ghost-btn:hover,
        .jl-complete:hover,
        .jl-quiz-submit:hover {
          transform:translateY(-2px);
        }

        .jl-crumb:disabled,
        .jl-complete:disabled,
        .jl-quiz-submit:disabled {
          opacity:.55;
          cursor:not-allowed;
          transform:none;
        }

        .jl-back {
          padding:11px 15px;
          border-radius:16px;
          background:#18102e;
          color:white;
          font-size:12px;
          font-weight:950;
        }

        .jl-main-btn {
          padding:13px 18px;
          border-radius:18px;
          color:white;
          background:linear-gradient(135deg,#8b5cf6,#7c3aed);
          box-shadow:0 18px 38px rgba(139, 92, 246,.24);
          font-size:12px;
          font-weight:950;
        }

        .jl-stage-panel {
          border-radius:34px;
          padding:24px;
          background:rgba(255,255,255,.76);
          border:1px solid rgba(255,255,255,.94);
          box-shadow:0 22px 60px rgba(28, 17, 48,.08);
          backdrop-filter:blur(22px);
        }

        .jl-stage-head {
          display:grid;
          grid-template-columns:1fr auto;
          gap:16px;
          align-items:start;
          margin-bottom:18px;
        }

        .jl-stage-head span {
          display:inline-flex;
          margin-bottom:8px;
          color:var(--primary);
          font-size:11px;
          font-weight:950;
        }

        .jl-stage-head h2 {
          margin:0;
          color:var(--ink);
          font-size:clamp(22px,3vw,34px);
          line-height:1.25;
          font-weight:950;
        }

        .jl-stage-head p {
          margin:10px 0 0;
          max-width:760px;
          color:var(--muted);
          font-size:13px;
          line-height:1.9;
          font-weight:750;
        }

        .jl-quote {
          max-width:310px;
          padding:14px 16px;
          border-radius:22px;
          background:#18102e;
          color:#f4f0fb;
          font-size:12px;
          line-height:1.8;
          font-weight:900;
        }

        .jl-notice {
          margin:12px 0;
          border-radius:20px;
          padding:13px 15px;
          background:#ecfdf5;
          color:#065f46;
          border:1px solid rgba(16,185,129,.22);
          font-size:12px;
          font-weight:900;
        }

        .jl-loading {
          background:#f5f0ff;
          color:#5b21b6;
          border-color:rgba(139,92,246,.24);
        }

        .jl-month-grid {
          display:grid;
          grid-template-columns:repeat(3,minmax(0,1fr));
          gap:16px;
        }

        .jl-weeks-grid {
          display:grid;
          grid-template-columns:repeat(2,minmax(0,1fr));
          gap:16px;
        }

        .jl-days-grid {
          display:grid;
          grid-template-columns:repeat(7,minmax(0,1fr));
          gap:12px;
        }

        .jl-month-card,
        .jl-week-card,
        .jl-day-card {
          font-family:inherit;
          cursor:pointer;
          text-align:right;
          border:0;
          border-radius:30px;
          background:rgba(255,255,255,.90);
          border:1px solid rgba(167, 139, 250,.20);
          box-shadow:0 18px 45px rgba(28, 17, 48,.07);
          transition:.25s ease;
          position:relative;
          overflow:hidden;
        }

        .jl-month-card:hover,
        .jl-week-card:hover,
        .jl-day-card:hover {
          transform:translateY(-6px);
          box-shadow:0 26px 60px rgba(139, 92, 246,.12);
        }

        .jl-month-card:disabled,
        .jl-week-card:disabled,
        .jl-day-card:disabled {
          cursor:not-allowed;
          opacity:.55;
          filter:grayscale(.65);
          transform:none;
        }

        .jl-month-card {
          min-height:220px;
          padding:18px;
        }

        .jl-week-card {
          min-height:188px;
          padding:18px;
        }

        .jl-day-card {
          min-height:148px;
          padding:14px 10px;
          text-align:center;
        }

        .jl-month-top,
        .jl-week-top {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:10px;
        }

        .jl-status {
          width:34px;
          height:34px;
          display:inline-grid;
          place-items:center;
          border-radius:14px;
          font-size:13px;
          font-weight:950;
        }

        .jl-status--completed {
          color:#065f46;
          background:rgba(16,185,129,.12);
        }

        .jl-status--active {
          color:#6d28d9;
          background:rgba(139, 92, 246,.12);
        }

        .jl-status--locked {
          color:#7a6c9a;
          background:rgba(100,116,139,.12);
        }

        .jl-index {
          color:rgba(28, 17, 48,.13);
          font-size:42px;
          font-weight:950;
          line-height:1;
        }

        .jl-month-card h3,
        .jl-week-card h3 {
          margin:22px 0 8px;
          color:var(--ink);
          font-size:18px;
          line-height:1.45;
          font-weight:950;
        }

        .jl-month-card p,
        .jl-week-card p {
          margin:0 0 36px;
          color:var(--muted);
          font-size:12px;
          line-height:1.8;
          font-weight:750;
        }

        .jl-card-foot {
          position:absolute;
          right:18px;
          left:18px;
          bottom:16px;
          display:flex;
          justify-content:space-between;
          gap:12px;
          color:#7a6c9a;
          font-size:11px;
          font-weight:900;
        }

        .jl-day-number {
          width:52px;
          height:52px;
          margin:0 auto 12px;
          border-radius:21px;
          display:grid;
          place-items:center;
          color:white;
          font-size:20px;
          font-weight:950;
          background:linear-gradient(135deg,#8b5cf6,#7c3aed);
        }

        .jl-day-card--completed .jl-day-number {
          background:linear-gradient(135deg,#10b981,#059669);
        }

        .jl-day-card--locked .jl-day-number {
          background:linear-gradient(135deg,#9d8fc0,#7a6c9a);
        }

        .jl-day-card strong {
          display:block;
          color:var(--ink);
          font-size:12px;
          line-height:1.6;
          font-weight:950;
        }

        .jl-day-card small {
          display:block;
          margin-top:6px;
          color:var(--muted);
          font-size:10px;
          font-weight:850;
        }

        .jl-lesson-shell {
          display:grid;
          grid-template-columns:300px minmax(0,1fr);
          gap:18px;
          align-items:start;
        }

        .jl-lesson-side {
          position:sticky;
          top:20px;
          border-radius:30px;
          padding:18px;
          color:white;
          background:
            radial-gradient(circle at top right, rgba(139,92,246,.22), transparent 36%),
            linear-gradient(160deg,#18102e,#281748);
          box-shadow:0 22px 55px rgba(28, 17, 48,.18);
        }

        .jl-pill {
          display:inline-flex;
          width:fit-content;
          padding:8px 12px;
          border-radius:999px;
          font-size:11px;
          font-weight:950;
          margin-bottom:14px;
        }

        .jl-pill--completed {
          color:#d1fae5;
          background:rgba(16,185,129,.18);
        }

        .jl-pill--active {
          color:#e0e7ff;
          background:rgba(139, 92, 246,.24);
        }

        .jl-pill--locked {
          color:#e0d8f5;
          background:rgba(167, 139, 250,.18);
        }

        .jl-lesson-side h3 {
          margin:0 0 10px;
          font-size:22px;
          line-height:1.4;
          font-weight:950;
        }

        .jl-lesson-side p {
          margin:0;
          color:rgba(196, 181, 253,.86);
          font-size:12px;
          line-height:1.9;
          font-weight:750;
        }

        .jl-lesson-actions {
          display:grid;
          gap:10px;
          margin-top:16px;
        }

        .jl-bookmark-status {
          border-radius: 16px;
          padding: 10px 12px;
          color: #e0e7ff;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.16);
          font-size: 11px;
          line-height: 1.7;
          font-weight: 850;
        }

        .jl-complete {
          padding:14px 16px;
          border-radius:18px;
          color:white;
          background:linear-gradient(135deg,#10b981,#059669);
          font-size:12px;
          font-weight:950;
        }

        .jl-ghost-btn {
          padding:13px 16px;
          border-radius:18px;
          background:rgba(255,255,255,.10);
          border:1px solid rgba(255,255,255,.18);
          color:white;
          font-size:12px;
          font-weight:950;
        }

        .jl-reader {
          border-radius:30px;
          padding:28px;
          background:rgba(255,255,255,.96);
          border:1px solid rgba(167, 139, 250,.18);
          box-shadow:0 20px 55px rgba(28, 17, 48,.07);
        }

        .jl-week-intro {
          margin:0 0 18px;
          border-radius:24px;
          padding:18px;
          background:#f5f0ff;
          border:1px solid #c4b5fd;
          color:#4c1d95;
          line-height:2;
          font-size:13px;
          font-weight:800;
          white-space:pre-wrap;
        }

        .jl-rich-text {
          display:grid;
          gap:12px;
        }

        .jl-rich-text h1,
        .jl-rich-text h2,
        .jl-rich-text h3,
        .jl-rich-text h4 {
          margin:0;
          color:#18102e;
          line-height:1.55;
          font-weight:950;
        }

        .jl-rich-text h1 {
          font-size:30px;
          padding:20px;
          border-radius:24px;
          color:white;
          background:linear-gradient(135deg,#18102e,#281748);
        }

        .jl-rich-text h2 {
          font-size:24px;
          padding:16px 18px;
          border-radius:22px;
          background:#efe9fb;
          color:#6d28d9;
          border:1px solid rgba(139, 92, 246,.12);
        }

        .jl-rich-text h3 {
          font-size:18px;
          margin-top:8px;
          padding:14px 16px;
          border-radius:20px;
          background:#f4f0fb;
          border-right:5px solid #8b5cf6;
        }

        .jl-rich-text h4 {
          font-size:15px;
          color:#5b21b6;
          padding:12px 14px;
          border-radius:18px;
          background:#f5f0ff;
        }

        .jl-rich-text p {
          margin:0;
          color:#281748;
          font-size:15px;
          line-height:2.12;
          font-weight:650;
          padding:0 2px;
        }

        .jl-bullet {
          position:relative;
          padding:12px 42px 12px 14px;
          border-radius:18px;
          color:#463c63;
          background:#f4f0fb;
          border:1px solid rgba(167, 139, 250,.18);
          font-size:14px;
          line-height:1.9;
          font-weight:750;
        }

        .jl-bullet::before {
          content:"";
          position:absolute;
          right:16px;
          top:22px;
          width:9px;
          height:9px;
          border-radius:999px;
          background:linear-gradient(135deg,#8b5cf6,#7c3aed);
        }

        .jl-quiz {
          margin-top:24px;
          padding:22px;
          border-radius:28px;
          background:#18102e;
          color:white;
          box-shadow:0 22px 55px rgba(28, 17, 48,.16);
        }

        .jl-quiz-soft {
          background:#f4f0fb;
          color:#463c63;
          border:1px dashed rgba(100,116,139,.35);
          box-shadow:none;
        }

        .jl-quiz-header {
          display:flex;
          justify-content:space-between;
          align-items:center;
          gap:12px;
          margin-bottom:10px;
        }

        .jl-quiz-header span {
          color:#c4b5fd;
          font-size:12px;
          font-weight:950;
        }

        .jl-quiz-header strong {
          color:white;
          font-size:13px;
          font-weight:950;
        }

        .jl-quiz h3 {
          margin:0 0 14px;
          font-size:23px;
          line-height:1.4;
          font-weight:950;
        }

        .jl-quiz-warning {
          margin:0 0 14px;
          padding:12px 14px;
          border-radius:18px;
          background:rgba(139,92,246,.14);
          color:#c4b5fd;
          font-size:12px;
          line-height:1.8;
          font-weight:850;
        }

        .jl-question-list {
          display:grid;
          gap:14px;
        }

        .jl-question {
          padding:16px;
          border-radius:22px;
          background:rgba(255,255,255,.08);
          border:1px solid rgba(255,255,255,.10);
        }

        .jl-question-title {
          display:flex;
          gap:12px;
          align-items:flex-start;
          margin-bottom:12px;
        }

        .jl-question-title b {
          flex:0 0 auto;
          width:32px;
          height:32px;
          border-radius:13px;
          display:grid;
          place-items:center;
          background:linear-gradient(135deg,#a855f7,#c4b5fd);
          color:#24123f;
          font-weight:950;
        }

        .jl-question-title span {
          color:#f4f0fb;
          font-size:14px;
          line-height:1.9;
          font-weight:850;
        }

        .jl-options {
          display:grid;
          gap:10px;
        }

        .jl-option {
          width:100%;
          display:flex;
          align-items:center;
          gap:10px;
          text-align:right;
          border:1px solid rgba(255,255,255,.12);
          background:rgba(255,255,255,.08);
          color:white;
          border-radius:18px;
          padding:12px;
          font-family:inherit;
          cursor:pointer;
          transition:.22s ease;
        }

        .jl-option:hover {
          background:rgba(255,255,255,.13);
        }

        .jl-option span {
          width:30px;
          height:30px;
          border-radius:12px;
          display:grid;
          place-items:center;
          background:rgba(255,255,255,.12);
          color:#c4b5fd;
          font-size:12px;
          font-weight:950;
          flex:0 0 auto;
        }

        .jl-option strong {
          font-size:13px;
          line-height:1.8;
          font-weight:850;
        }

        .jl-option--selected {
          border-color:rgba(139,92,246,.65);
          background:rgba(139,92,246,.14);
        }

        .jl-option--correct {
          border-color:rgba(16,185,129,.72);
          background:rgba(16,185,129,.18);
        }

        .jl-option--wrong {
          border-color:rgba(239,68,68,.72);
          background:rgba(239,68,68,.18);
        }

        .jl-answer-note {
          margin-top:10px;
          border-radius:16px;
          padding:10px 12px;
          font-size:12px;
          line-height:1.8;
          font-weight:900;
        }

        .jl-answer-note--correct {
          background:rgba(16,185,129,.14);
          color:#d1fae5;
          border:1px solid rgba(16,185,129,.28);
        }

        .jl-answer-note--wrong {
          background:rgba(239,68,68,.14);
          color:#fecaca;
          border:1px solid rgba(239,68,68,.28);
        }

        .jl-quiz-footer {
          display:flex;
          flex-wrap:wrap;
          align-items:center;
          gap:12px;
          margin-top:16px;
        }

        .jl-quiz-submit {
          padding:13px 18px;
          border-radius:18px;
          color:#24123f;
          background:linear-gradient(135deg,#c4b5fd,#a855f7);
          font-size:12px;
          font-weight:950;
        }

        .jl-quiz-result {
          flex:1;
          min-width:220px;
          border-radius:18px;
          padding:12px 14px;
          font-size:12px;
          line-height:1.8;
          font-weight:900;
        }

        .jl-quiz-result--pass {
          background:rgba(16,185,129,.14);
          color:#d1fae5;
        }

        .jl-quiz-result--fail {
          background:rgba(239,68,68,.14);
          color:#fecaca;
        }

        .jl-exact-source {
          margin-top:24px;
          border-radius:24px;
          background:#f4f0fb;
          border:1px solid rgba(167, 139, 250,.28);
          overflow:hidden;
        }

        .jl-exact-source summary {
          cursor:pointer;
          padding:16px 18px;
          color:#6d28d9;
          background:#efe9fb;
          font-size:13px;
          font-weight:950;
        }

        .jl-exact-source pre {
          margin:0;
          padding:18px;
          white-space:pre-wrap;
          word-break:break-word;
          overflow:auto;
          color:#18102e;
          background:white;
          font-family:Tajawal, Arial, Tahoma, sans-serif;
          font-size:14px;
          line-height:2;
          font-weight:650;
        }

        .jl-empty {
          border-radius:24px;
          padding:22px;
          background:#f4f0fb;
          color:#7a6c9a;
          border:1px dashed rgba(100,116,139,.35);
          font-size:13px;
          font-weight:900;
          text-align:center;
        }

        @media (max-width:980px) {
          .jl-hero-inner,
          .jl-lesson-shell {
            grid-template-columns:1fr;
          }

          .jl-control-deck,
          .jl-month-grid {
            grid-template-columns:1fr;
          }

          .jl-weeks-grid {
            grid-template-columns:1fr;
          }

          .jl-days-grid {
            grid-template-columns:repeat(2,minmax(0,1fr));
          }

          .jl-stage-head {
            grid-template-columns:1fr;
          }

          .jl-quote {
            max-width:100%;
          }

          .jl-lesson-side {
            position:relative;
            top:auto;
          }
        }

        @media (max-width:560px) {
          .journey-lab {
            padding:16px 10px 44px;
          }

          .jl-hero,
          .jl-stage-panel,
          .jl-reader {
            border-radius:26px;
            padding:20px;
          }

          .jl-days-grid {
            grid-template-columns:1fr;
          }
        }
      `}),(0,m.jsxs)(`div`,{className:`jl-wrap`,children:[(0,m.jsx)(`header`,{className:`jl-hero`,children:(0,m.jsxs)(`div`,{className:`jl-hero-inner`,children:[(0,m.jsxs)(`div`,{children:[(0,m.jsx)(`span`,{className:`jl-eyebrow`,children:`رحلتك التعليمية · 6 أشهر · OD Mastery`}),(0,m.jsxs)(`h1`,{className:`jl-title`,children:[`رحلة تعليمية متدرجة`,(0,m.jsx)(`span`,{children:`شهر ← أسبوع ← يوم ← درس ← اختبار`})]}),(0,m.jsx)(`p`,{children:`تم تصميم الرحلة كبوابات إتقان لا كصفحة طويلة مشتتة. كل شهر يفتح أسابيعه، وكل أسبوع يفتح أيامه، وكل يوم يحتوي على درس منسق واختبار فهم قبل حفظ الإنجاز.`})]}),(0,m.jsx)(`div`,{className:`jl-orb-card`,children:(0,m.jsx)(`div`,{className:`jl-orb od-circular-indicator od-indicator-general`,style:{"--od-indicator-progress":`${Math.min(100,Math.max(0,Ce))}%`},children:(0,m.jsxs)(`div`,{children:[(0,m.jsx)(`strong`,{children:F(Ce)}),(0,m.jsx)(`small`,{children:`من الرحلة الكاملة`})]})})})]})}),(0,m.jsxs)(`section`,{className:`jl-control-deck`,children:[(0,m.jsx)(q,{label:`التقدم الكلي`,value:Ce,help:`${ge} من ${K} يومًا`}),(0,m.jsx)(q,{label:`تقدم ${H?.title||`الشهر`}`,value:we,help:`${xe} من ${J} يومًا`}),(0,m.jsx)(q,{label:`تقدم ${U?.title||`الأسبوع`}`,value:Te,help:`${Se} من ${be} أيام`})]}),(0,m.jsx)(re,{course:o,onJump:ze,placeholder:`ابحث عن RACI، الثقافة، التغيير، الوصف الوظيفي، قياس الأثر...`}),(0,m.jsx)(ie,{bookmarks:E,loading:k,onRefresh:Be,onJump:Ve}),(0,m.jsxs)(`div`,{className:`jl-top-actions`,children:[(0,m.jsxs)(`div`,{className:`jl-breadcrumbs`,children:[(0,m.jsx)(`button`,{type:`button`,className:`jl-crumb`,onClick:()=>g(`months`),children:`الشهور`}),(0,m.jsx)(`button`,{type:`button`,className:`jl-crumb`,onClick:()=>g(`weeks`),disabled:s===`months`,children:H?.title||`الشهر`}),(0,m.jsx)(`button`,{type:`button`,className:`jl-crumb`,onClick:()=>g(`days`),disabled:s===`months`||s===`weeks`,children:U?.title||`الأسبوع`}),(0,m.jsx)(`button`,{type:`button`,className:`jl-crumb`,disabled:s!==`lesson`,children:W?.label||`اليوم`})]}),(0,m.jsxs)(`div`,{className:`jl-breadcrumbs`,children:[s!==`months`&&(0,m.jsx)(`button`,{type:`button`,className:`jl-back`,onClick:We,children:`رجوع خطوة`}),(0,m.jsx)(`button`,{type:`button`,className:`jl-main-btn`,onClick:Re,children:`واصل من آخر محطة`})]})]}),te&&(0,m.jsx)(`div`,{className:`jl-notice`,children:te}),i&&(0,m.jsx)(`div`,{className:`jl-notice jl-loading`,children:`جارٍ تحميل تقدمك...`}),(0,m.jsxs)(`main`,{className:`jl-stage-panel`,children:[(0,m.jsxs)(`div`,{className:`jl-stage-head`,children:[(0,m.jsxs)(`div`,{children:[(0,m.jsx)(`span`,{children:Q.kicker}),(0,m.jsx)(`h2`,{children:Q.title}),(0,m.jsx)(`p`,{children:Q.note})]}),(0,m.jsx)(`aside`,{className:`jl-quote`,children:Q.quote})]}),s===`months`&&(0,m.jsx)(`section`,{className:`jl-month-grid`,children:o.map(e=>{let t=De(e),n=me,r=z(V,e),i=n?r/n*100:0;return(0,m.jsxs)(`button`,{type:`button`,className:`jl-month-card jl-month-card--${t}`,onClick:()=>Fe(e),disabled:t===`locked`,children:[(0,m.jsxs)(`div`,{className:`jl-month-top`,children:[(0,m.jsx)(ve,{state:t}),(0,m.jsx)(`span`,{className:`jl-index`,children:e.monthIndex})]}),(0,m.jsx)(`h3`,{children:e.title}),(0,m.jsx)(`p`,{children:e.subtitle}),(0,m.jsxs)(`div`,{className:`jl-card-foot`,children:[(0,m.jsx)(`span`,{children:O[t]}),(0,m.jsxs)(`span`,{children:[r,` من `,n,` يومًا · `,F(i)]})]})]},e.id)})}),s===`weeks`&&(0,m.jsx)(`section`,{className:`jl-weeks-grid`,children:H.weeks.map(e=>{let t=ke(e,H),n=L(e).length,r=R(V,e),i=n?r/n*100:0;return(0,m.jsxs)(`button`,{type:`button`,className:`jl-week-card jl-week-card--${t}`,onClick:()=>Ie(e),disabled:t===`locked`,children:[(0,m.jsxs)(`div`,{className:`jl-week-top`,children:[(0,m.jsx)(ve,{state:t}),(0,m.jsxs)(`span`,{className:`jl-index`,children:[`0`,e.weekIndex]})]}),(0,m.jsx)(`h3`,{children:e.title}),(0,m.jsx)(`p`,{children:e.subtitle}),(0,m.jsxs)(`div`,{className:`jl-card-foot`,children:[(0,m.jsx)(`span`,{children:O[t]}),(0,m.jsxs)(`span`,{children:[r,` من `,n,` أيام · `,F(i)]})]})]},e.id)})}),s===`days`&&(0,m.jsx)(`section`,{className:`jl-days-grid`,children:U.days.map(e=>{let t=je(e,U,H);return(0,m.jsxs)(`button`,{type:`button`,className:`jl-day-card jl-day-card--${t}`,onClick:()=>Le(e),disabled:t===`locked`,children:[(0,m.jsx)(`div`,{className:`jl-day-number`,children:t===`completed`?`✓`:t===`locked`?`🔒`:e.dayIndex}),(0,m.jsx)(`strong`,{children:e.label}),(0,m.jsx)(`small`,{children:O[t]})]},e.id)})}),s===`lesson`&&W&&(0,m.jsxs)(`section`,{className:`jl-lesson-shell`,children:[(0,m.jsxs)(`aside`,{className:`jl-lesson-side`,children:[(0,m.jsx)(`span`,{className:`jl-pill jl-pill--${$}`,children:O[$]}),(0,m.jsx)(`h3`,{children:W.title}),(0,m.jsxs)(`p`,{children:[H.title,` · `,U.title,` · `,W.label]}),(0,m.jsxs)(`div`,{className:`jl-lesson-actions`,children:[(0,m.jsx)(`button`,{type:`button`,className:`jl-ghost-btn`,onClick:He,disabled:j||$===`locked`,children:j?`جارٍ تحديث المحفوظات...`:pe?`إزالة من الدروس المحفوظة ★`:`حفظ هذا الدرس ☆`}),N&&(0,m.jsx)(`div`,{className:`jl-bookmark-status`,children:N}),(0,m.jsx)(`button`,{type:`button`,className:`jl-complete`,onClick:Ue,disabled:S||$!==`active`||!Ke,children:$===`completed`?`تم إكمال اليوم`:S?`جارٍ الحفظ...`:Ge&&!T[W.id]?`أكمل الاختبار أولًا`:`إنهاء اليوم وحفظ التقدم`}),$===`completed`&&(0,m.jsx)(`button`,{type:`button`,className:`jl-ghost-btn`,onClick:Re,children:`افتح المحطة التالية`}),(0,m.jsx)(`button`,{type:`button`,className:`jl-ghost-btn`,onClick:()=>g(`days`),children:`العودة لأيام الأسبوع`})]})]}),(0,m.jsxs)(`article`,{className:`jl-reader`,children:[U.intro&&W.dayIndex===1&&(0,m.jsx)(`div`,{className:`jl-week-intro`,children:U.intro}),(0,m.jsx)(_e,{text:G.lessonText}),(0,m.jsx)(h,{monthIndex:W.monthIndex,weekIndex:W.weekIndex,dayIndex:W.dayIndex,title:`ملاحظتك المهنية على هذا اليوم`}),(0,m.jsx)(ye,{day:W,questions:G.quiz,hasQuizText:G.hasQuizText,onPass:()=>{ne(e=>({...e,[W.id]:!0}))}})]})]})]})]})]})}export{J as default};