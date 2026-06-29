import{b as e,p as t,y as n}from"./index-r2YaTxdB.js";import{t as r}from"./courseContent-DjeFhL45.js";import{n as i,t as a}from"./monthlyCertificateService-6-LMto3h.js";import{n as o,r as s,t as c}from"./masteryCertificateService-BmBj30lS.js";var l=e(n(),1),u=t();function d(e,t=0){let n=Number(e);return Number.isFinite(n)?n:t}function f(e){if(!e)return`غير صادر بعد`;try{return new Intl.DateTimeFormat(`ar-SA`,{year:`numeric`,month:`long`,day:`numeric`}).format(new Date(e))}catch{return`غير محدد`}}function p({userName:e=`متدرب`,completedDays:t=0,totalDays:n=180}){let[r,s]=(0,l.useState)([]),[p,m]=(0,l.useState)(!1),[h,g]=(0,l.useState)(``),[_,v]=(0,l.useState)(``),y=Math.max(0,Math.min(d(n,180),d(t)));async function b(){m(!0),g(``);try{s(await i({userName:e,completedDays:y,totalDays:n}))}catch(e){console.warn(`تعذر مزامنة شهادات الإنجاز الشهرية:`,e),g(e?.message||`تعذر مزامنة شهادات الإنجاز الشهرية الآن.`)}finally{m(!1)}}(0,l.useEffect)(()=>{b()},[e,y,n]);let x=(0,l.useMemo)(()=>r.filter(e=>e.status===`issued`).length,[r]);async function S(e){await o(c(e.verification_slug||e.certificate_code))?(v(e.verification_slug||e.certificate_code),setTimeout(()=>v(``),2400)):alert(`لم يتم نسخ رابط التحقق تلقائيًا. انسخه يدويًا من البطاقة.`)}let C=r.length?r:a.map(e=>({certificate_type:`monthly`,month_number:e.monthNumber,month_title:e.title,month_subtitle:e.subtitle,required_days:e.requiredDays,completed_days:y,total_days:n,status:y>=e.requiredDays?`issued`:`locked`,verification_enabled:!1}));return(0,u.jsxs)(`section`,{className:`monthly-certificates mastery-no-print`,"aria-label":`شهادات الإنجاز الشهرية`,children:[(0,u.jsx)(`style`,{children:`
        .monthly-certificates {
          margin-top: 24px;
          border-radius: 32px;
          padding: 24px;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.12), transparent 34%),
            linear-gradient(135deg, rgba(255,255,255,.96), rgba(248,250,252,.94));
          border: 1px solid rgba(167, 139, 250, 0.22);
          box-shadow: 0 18px 55px rgba(28, 17, 48, 0.08);
        }

        .monthly-head {
          display: grid;
          grid-template-columns: minmax(0, 1fr) auto;
          gap: 16px;
          align-items: start;
          margin-bottom: 18px;
        }

        .monthly-kicker {
          display: inline-flex;
          width: fit-content;
          border-radius: 999px;
          padding: 8px 13px;
          background: #efe9fb;
          color: #6d28d9;
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 10px;
        }

        .monthly-head h2 {
          margin: 0 0 8px;
          color: #18102e;
          font-size: clamp(22px, 3vw, 34px);
          line-height: 1.35;
          font-weight: 950;
        }

        .monthly-head p {
          margin: 0;
          color: #7a6c9a;
          line-height: 1.9;
          font-size: 14px;
          font-weight: 760;
        }

        .monthly-status {
          min-width: 150px;
          border-radius: 24px;
          padding: 16px;
          text-align: center;
          background: #18102e;
          color: #fff;
          box-shadow: 0 18px 38px rgba(28, 17, 48,.14);
        }

        .monthly-status strong {
          display: block;
          color: #fbbf24;
          font-size: 34px;
          line-height: 1;
          margin-bottom: 6px;
        }

        .monthly-status span {
          display: block;
          color: #c9bdf0;
          font-size: 12px;
          font-weight: 850;
        }

        .monthly-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
        }

        .monthly-card {
          position: relative;
          overflow: hidden;
          border-radius: 26px;
          padding: 18px;
          background: #ffffff;
          border: 1px solid rgba(167, 139, 250,.20);
          box-shadow: 0 16px 38px rgba(28, 17, 48,.06);
        }

        .monthly-card.issued {
          border-color: rgba(16,185,129,.28);
          background:
            radial-gradient(circle at top left, rgba(16,185,129,.12), transparent 35%),
            #ffffff;
        }

        .monthly-card.locked {
          background: #f4f0fb;
        }

        .monthly-card-top {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .monthly-badge {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 18px;
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #7c3aed);
          font-weight: 950;
          box-shadow: 0 14px 30px rgba(139, 92, 246,.18);
        }

        .monthly-lock {
          display: inline-flex;
          border-radius: 999px;
          padding: 7px 10px;
          font-size: 11px;
          font-weight: 950;
          background: #efe9fb;
          color: #5b4f78;
          border: 1px solid rgba(167, 139, 250,.25);
        }

        .monthly-card.issued .monthly-lock {
          background: #ecfdf5;
          color: #065f46;
          border-color: rgba(16,185,129,.24);
        }

        .monthly-card h3 {
          margin: 0 0 8px;
          color: #18102e;
          font-size: 18px;
          line-height: 1.55;
          font-weight: 950;
        }

        .monthly-card p {
          margin: 0 0 12px;
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 760;
        }

        .monthly-mini {
          display: grid;
          gap: 8px;
          margin-top: 12px;
        }

        .monthly-mini div {
          border-radius: 16px;
          padding: 11px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.14);
        }

        .monthly-mini span {
          display: block;
          color: #7a6c9a;
          font-size: 10px;
          font-weight: 850;
          margin-bottom: 4px;
        }

        .monthly-mini strong {
          display: block;
          color: #18102e;
          font-size: 12px;
          line-height: 1.7;
          font-weight: 950;
          word-break: break-word;
        }

        .monthly-progress {
          height: 10px;
          border-radius: 999px;
          background: #e0d8f5;
          overflow: hidden;
          margin-top: 12px;
        }

        .monthly-progress i {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #8b5cf6, #10b981);
        }

        .monthly-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
        }

        .monthly-button {
          border: none;
          cursor: pointer;
          border-radius: 16px;
          padding: 11px 13px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 950;
          color: #fff;
          background: linear-gradient(135deg,#8b5cf6,#3b1d6e);
        }

        .monthly-button.ghost {
          background: #efe9fb;
          color: #18102e;
          border: 1px solid rgba(167, 139, 250,.22);
        }

        .monthly-button:disabled {
          cursor: not-allowed;
          opacity: .65;
        }

        .monthly-warning {
          margin-top: 14px;
          border-radius: 20px;
          padding: 14px 16px;
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fecaca;
          font-weight: 850;
          line-height: 1.8;
        }

        @media (max-width: 980px) {
          .monthly-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 680px) {
          .monthly-head,
          .monthly-grid {
            grid-template-columns: 1fr;
          }

          .monthly-status {
            width: 100%;
            box-sizing: border-box;
          }
        }
      `}),(0,u.jsxs)(`div`,{className:`monthly-head`,children:[(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`span`,{className:`monthly-kicker`,children:`Phase 22 · Monthly Milestones`}),(0,u.jsx)(`h2`,{children:`شهادات إنجاز شهرية قبل وثيقة الإتقان النهائية`}),(0,u.jsx)(`p`,{children:`بدل انتظار نهاية الرحلة كاملة، يحصل المتدرب على شهادة إنجاز موثقة عند إكمال كل 30 يومًا. هذه الشهادات مرتبطة بتقدمه الفعلي داخل المنصة وتظهر تدريجيًا مع الإنجاز.`}),(0,u.jsx)(`div`,{className:`monthly-actions`,children:(0,u.jsx)(`button`,{type:`button`,className:`monthly-button`,onClick:b,disabled:p,children:p?`جارٍ مزامنة الشهادات...`:`تحديث شهاداتي الشهرية`})})]}),(0,u.jsxs)(`div`,{className:`monthly-status`,children:[(0,u.jsxs)(`strong`,{children:[x,`/6`]}),(0,u.jsx)(`span`,{children:`شهادات شهرية مفتوحة`})]})]}),h?(0,u.jsx)(`div`,{className:`monthly-warning`,children:h}):null,(0,u.jsx)(`div`,{className:`monthly-grid`,children:C.map(e=>{let t=d(e.required_days,30),n=Math.min(100,Math.round(y/t*100)),r=e.status===`issued`,i=r&&e.verification_enabled,a=_&&_===(e.verification_slug||e.certificate_code);return(0,u.jsxs)(`article`,{className:`monthly-card ${r?`issued`:`locked`}`,children:[(0,u.jsxs)(`div`,{className:`monthly-card-top`,children:[(0,u.jsxs)(`div`,{className:`monthly-badge`,children:[`M`,e.month_number]}),(0,u.jsx)(`span`,{className:`monthly-lock`,children:r?`مفتوحة`:`مقفلة`})]}),(0,u.jsx)(`h3`,{children:e.month_title}),(0,u.jsx)(`p`,{children:e.month_subtitle}),(0,u.jsx)(`div`,{className:`monthly-progress`,"aria-label":`تقدم الشهر ${e.month_number}`,children:(0,u.jsx)(`i`,{style:{width:`${n}%`}})}),(0,u.jsxs)(`div`,{className:`monthly-mini`,children:[(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`span`,{children:`شرط الفتح`}),(0,u.jsxs)(`strong`,{children:[Math.min(y,t),` / `,t,` يومًا`]})]}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`span`,{children:`تاريخ الإصدار`}),(0,u.jsx)(`strong`,{children:r?f(e.issued_at):`بعد إكمال الشرط`})]}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`span`,{children:`رقم الشهادة`}),(0,u.jsx)(`strong`,{children:r?e.certificate_code:`يظهر بعد الفتح`})]})]}),r?(0,u.jsx)(`div`,{className:`monthly-actions`,children:(0,u.jsx)(`button`,{type:`button`,className:`monthly-button ghost`,onClick:()=>S(e),disabled:!i,children:a?`تم نسخ رابط التحقق ✅`:i?`نسخ رابط التحقق`:`التحقق غير مفعل`})}):null]},e.month_number)})})]})}function m(e,t,n){let r=Number(e||0);return Number.isNaN(r)?t:Math.min(n,Math.max(t,r))}function h(e,t){let n=String(e||`OD`).replace(/\s+/g,`-`).replace(/[^\u0600-\u06FFa-zA-Z0-9-]/g,``).slice(0,18);return`OD-${new Date().toISOString().slice(0,10).replaceAll(`-`,``)}-${n||`Learner`}-${t}`}function g({userName:e,completedDays:t=0,setActivePage:n}){let[i,a]=(0,l.useState)(!1),[d,f]=(0,l.useState)(!1),[g,_]=(0,l.useState)(null),[v,y]=(0,l.useState)(!1),[b,x]=(0,l.useState)(``),S=r?.totalDays||180,C=m(t,0,S),w=Math.round(C/S*100),T=Math.max(0,S-C),E=C*4,D=S*4,O=C>=S,k=e?.trim()||`متدرب`,A=h(k,C),j=g?.certificate_code||A,M=c(g?.verification_slug||j.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff]+/gi,`-`).replace(/^-+|-+$/g,``)),N=!!(g?.verification_enabled&&g?.status===`issued`);g?.status;let P=(0,l.useMemo)(()=>new Intl.DateTimeFormat(`ar-SA`,{year:`numeric`,month:`long`,day:`numeric`}).format(new Date),[]);(0,l.useEffect)(()=>{let e=!0;async function t(){y(!0),x(``);try{let t=await s({userName:k,completedDays:C,totalDays:S,isUnlocked:O});e&&_(t)}catch(t){console.warn(`تعذر مزامنة وثيقة الإتقان:`,t),e&&x(t?.message||`تعذر مزامنة بيانات الوثيقة.`)}finally{e&&y(!1)}}return t(),()=>{e=!1}},[k,C,S,O]);let F=(0,l.useMemo)(()=>`أتممت بحمد الله رحلة معرفية امتدت 6 أشهر في هندسة التطوير التنظيمي OD، عبر مسار مكثف جمع بين التشخيص التنظيمي، تصميم الهياكل والأدوار، قيادة التغيير، الثقافة التنظيمية، التعلم المؤسسي، قياس الأثر، واستدامة تدخلات التطوير التنظيمي.

لم تكن الرحلة مجرد محتوى تعليمي؛ بل تدريبًا عمليًا على سؤال جوهري:
لا تبدأ بالحل، افهم النظام الذي جعل السلوك منطقيًا داخله.

خرجت من هذه التجربة بمنهجية أكثر نضجًا في قراءة المنظمات:
تشخيص → فرضيات → بيانات → تدخل → تبنّي → أثر → استدامة → تعلم.

شكرًا لريان العجلان على بناء هذا المختبر المعرفي الملهم في التطوير التنظيمي.

#التطوير_التنظيمي
#OD
#الموارد_البشرية
#قيادة_التغيير
#التعلم_المؤسسي`,[]);async function I(){try{await navigator.clipboard.writeText(F),a(!0),setTimeout(()=>a(!1),2500)}catch{a(!1),alert(`لم يتم النسخ تلقائيًا. انسخ النص يدويًا من مربع المشاركة.`)}}async function L(){await o(M)?(f(!0),setTimeout(()=>f(!1),2500)):alert(`لم يتم نسخ رابط التحقق تلقائيًا. انسخه يدويًا من البطاقة.`)}function R(){I(),window.open(`https://www.linkedin.com/sharing/share-offsite/?url=https%3A%2F%2Fwww.linkedin.com%2Fin%2Frayan-alajlan`,`_blank`,`width=760,height=680`)}function z(){if(!O)return;let e=document.createElement(`style`);e.id=`mastery-print-style`,e.innerHTML=`
      @media print {
        body * {
          visibility: hidden !important;
        }

        #printable-certificate-frame,
        #printable-certificate-frame * {
          visibility: visible !important;
        }

        #printable-certificate-frame {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          max-width: 100% !important;
          min-height: 100vh !important;
          margin: 0 !important;
          padding: 24px !important;
          box-shadow: none !important;
          border: none !important;
          background: #0e0820 !important;
          color: #fff !important;
        }

        .mastery-no-print {
          display: none !important;
        }

        @page {
          size: A4 landscape;
          margin: 0;
        }
      }
    `,document.head.appendChild(e),window.print(),setTimeout(()=>{let e=document.getElementById(`mastery-print-style`);e&&e.remove()},1e3)}return(0,u.jsxs)(`section`,{className:`mastery-page`,dir:`rtl`,children:[(0,u.jsx)(`style`,{children:`
        .mastery-page {
          min-height: 100vh;
          padding: 40px 18px 70px;
          background:
            radial-gradient(circle at 20% 10%, rgba(139, 92, 246, 0.18), transparent 28%),
            radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.16), transparent 26%),
            linear-gradient(180deg, #f4f0fb 0%, #efe9fb 48%, #f4f0fb 100%);
          color: #18102e;
          font-family: inherit;
        }

        .mastery-shell {
          max-width: 1180px;
          margin: 0 auto;
        }

        .mastery-hero {
          position: relative;
          overflow: hidden;
          border-radius: 34px;
          padding: 34px;
          background:
            linear-gradient(135deg, rgba(28, 17, 48, 0.97), rgba(30, 41, 59, 0.94)),
            radial-gradient(circle at top left, rgba(139, 92, 246, 0.45), transparent 35%);
          color: white;
          box-shadow: 0 24px 70px rgba(28, 17, 48, 0.18);
          border: 1px solid rgba(255, 255, 255, 0.12);
        }

        .mastery-hero::before {
          content: "";
          position: absolute;
          inset: -40%;
          background:
            linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.08), transparent);
          transform: rotate(18deg);
          animation: masteryShine 8s linear infinite;
        }

        @keyframes masteryShine {
          0% { transform: translateX(70%) rotate(18deg); }
          100% { transform: translateX(-70%) rotate(18deg); }
        }

        .mastery-hero-content {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 26px;
          align-items: center;
        }

        .mastery-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.1);
          color: #c3b5e8;
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 14px;
        }

        .mastery-hero h1 {
          margin: 0;
          font-size: clamp(30px, 5vw, 56px);
          line-height: 1.15;
          letter-spacing: -1px;
        }

        .mastery-hero h1 span {
          color: #fbbf24;
        }

        .mastery-hero p {
          margin: 18px 0 0;
          max-width: 760px;
          color: #c9bdf0;
          line-height: 2;
          font-size: 16px;
        }

        .mastery-progress-orb {
          width: 230px;
          height: 230px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          margin-inline: auto;
          background:
            conic-gradient(#a855f7 ${w*3.6}deg, rgba(255,255,255,0.12) 0deg);
          box-shadow: inset 0 0 0 14px rgba(28, 17, 48, 0.45), 0 22px 50px rgba(0,0,0,0.22);
        }

        .mastery-progress-inner {
          width: 166px;
          height: 166px;
          border-radius: 50%;
          background: #18102e;
          display: grid;
          place-items: center;
          text-align: center;
          border: 1px solid rgba(255,255,255,0.12);
        }

        .mastery-progress-inner strong {
          font-size: 42px;
          color: #fff;
          line-height: 1;
        }

        .mastery-progress-inner span {
          color: #9d8fc0;
          font-weight: 800;
          font-size: 13px;
          margin-top: 8px;
        }

        .mastery-stats {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin: 18px 0 24px;
        }

        .mastery-stat {
          background: rgba(255,255,255,0.8);
          backdrop-filter: blur(14px);
          border: 1px solid rgba(167, 139, 250, 0.22);
          border-radius: 24px;
          padding: 18px;
          box-shadow: 0 18px 45px rgba(28, 17, 48, 0.08);
        }

        .mastery-stat span {
          display: block;
          color: #7a6c9a;
          font-weight: 800;
          font-size: 12px;
          margin-bottom: 8px;
        }

        .mastery-stat strong {
          display: block;
          color: #18102e;
          font-size: 24px;
          font-weight: 950;
        }

        .mastery-lock {
          position: relative;
          overflow: hidden;
          border-radius: 30px;
          padding: 28px;
          background: white;
          border: 1px solid rgba(167, 139, 250, 0.24);
          box-shadow: 0 18px 60px rgba(28, 17, 48, 0.08);
          margin-top: 22px;
        }

        .mastery-lock-grid {
          display: grid;
          grid-template-columns: 90px 1fr auto;
          gap: 20px;
          align-items: center;
        }

        .mastery-lock-icon {
          width: 84px;
          height: 84px;
          border-radius: 26px;
          display: grid;
          place-items: center;
          font-size: 34px;
          background: linear-gradient(135deg, #efe9fb, #fff7ed);
          border: 1px solid #e0d8f5;
        }

        .mastery-lock h2 {
          margin: 0 0 8px;
          font-size: 24px;
          color: #18102e;
        }

        .mastery-lock p {
          margin: 0;
          color: #7a6c9a;
          line-height: 1.9;
        }

        .mastery-track {
          margin-top: 20px;
          height: 14px;
          border-radius: 999px;
          background: #e0d8f5;
          overflow: hidden;
        }

        .mastery-track span {
          display: block;
          height: 100%;
          width: ${w}%;
          border-radius: 999px;
          background: linear-gradient(90deg, #8b5cf6, #a855f7);
        }

        .mastery-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          justify-content: center;
          margin-top: 22px;
        }

        .mastery-button {
          border: none;
          cursor: pointer;
          border-radius: 18px;
          padding: 14px 20px;
          font-weight: 950;
          font-size: 14px;
          transition: 0.25s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }

        .mastery-button:hover {
          transform: translateY(-2px);
        }

        .mastery-button.primary {
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          color: white;
          box-shadow: 0 16px 34px rgba(139, 92, 246,0.28);
        }

        .mastery-button.dark {
          background: #18102e;
          color: white;
          box-shadow: 0 16px 34px rgba(28, 17, 48,0.18);
        }

        .mastery-button.linkedin {
          background: #0077b5;
          color: white;
          box-shadow: 0 16px 34px rgba(0,119,181,0.20);
        }

        .mastery-button.ghost {
          background: #efe9fb;
          color: #18102e;
        }

        .certificate-stage {
          margin-top: 26px;
          display: ${O?`block`:`none`};
        }

        .certificate-frame {
          position: relative;
          overflow: hidden;
          border-radius: 34px;
          padding: 18px;
          background:
            linear-gradient(135deg, #a855f7, #8b5cf6, #18102e);
          box-shadow: 0 30px 85px rgba(28, 17, 48, 0.22);
        }

        .certificate-inner {
          position: relative;
          overflow: hidden;
          border-radius: 26px;
          min-height: 520px;
          padding: 44px;
          background:
            radial-gradient(circle at 20% 15%, rgba(245, 158, 11, 0.18), transparent 25%),
            radial-gradient(circle at 80% 10%, rgba(139, 92, 246, 0.24), transparent 28%),
            linear-gradient(145deg, #0e0820, #18102e 45%, #111827);
          color: white;
          border: 1px solid rgba(255,255,255,0.12);
        }

        .certificate-inner::before {
          content: "OD";
          position: absolute;
          left: 30px;
          top: 20px;
          font-size: 220px;
          line-height: 1;
          font-weight: 950;
          color: rgba(255,255,255,0.025);
          letter-spacing: -14px;
        }

        .certificate-top {
          position: relative;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          align-items: flex-start;
          border-bottom: 1px solid rgba(255,255,255,0.12);
          padding-bottom: 24px;
          margin-bottom: 34px;
        }

        .certificate-brand {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .brand-mark {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #8b5cf6, #a855f7);
          color: white;
          font-weight: 950;
          box-shadow: 0 16px 36px rgba(0,0,0,0.25);
        }

        .certificate-brand strong {
          display: block;
          font-size: 16px;
          letter-spacing: 0.5px;
        }

        .certificate-brand span,
        .certificate-code span {
          display: block;
          margin-top: 4px;
          color: #9d8fc0;
          font-size: 11px;
          font-weight: 800;
        }

        .certificate-code {
          text-align: left;
          color: #e0d8f5;
          font-size: 12px;
          font-weight: 900;
        }

        .certificate-title {
          position: relative;
          text-align: center;
          max-width: 850px;
          margin: 0 auto;
        }

        .certificate-title .badge {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(245, 158, 11, 0.1);
          color: #fbbf24;
          border: 1px solid rgba(245,158,11,0.28);
          font-size: 12px;
          font-weight: 950;
          letter-spacing: 1px;
          margin-bottom: 18px;
        }

        .certificate-title h2 {
          margin: 0;
          font-size: clamp(28px, 5vw, 56px);
          line-height: 1.15;
          letter-spacing: -1px;
        }

        .certificate-title .learner {
          margin: 24px auto 18px;
          display: inline-block;
          padding: 10px 28px;
          border-radius: 22px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff;
          font-size: clamp(24px, 4vw, 42px);
          font-weight: 950;
        }

        .certificate-title p {
          margin: 0 auto;
          max-width: 820px;
          color: #c9bdf0;
          font-size: 15px;
          line-height: 2.05;
          font-weight: 700;
        }

        .certificate-pillars {
          position: relative;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin: 34px 0;
        }

        .certificate-pillar {
          padding: 14px;
          border-radius: 18px;
          background: rgba(255,255,255,0.055);
          border: 1px solid rgba(255,255,255,0.09);
          text-align: center;
        }

        .certificate-pillar strong {
          display: block;
          color: #fbbf24;
          font-size: 18px;
          margin-bottom: 5px;
        }

        .certificate-pillar span {
          color: #9d8fc0;
          font-weight: 800;
          font-size: 11px;
        }

        .certificate-footer {
          position: relative;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          align-items: end;
          border-top: 1px solid rgba(255,255,255,0.12);
          padding-top: 24px;
        }

        .certificate-footer strong {
          display: block;
          color: #e0d8f5;
          margin-bottom: 8px;
        }

        .certificate-footer span,
        .certificate-footer small {
          color: #9d8fc0;
          line-height: 1.8;
          font-size: 12px;
          font-weight: 800;
        }

        .signature {
          text-align: left;
        }

        .signature .name {
          color: #fbbf24;
          font-size: 22px;
          font-weight: 950;
          letter-spacing: 0.6px;
        }

        .linkedin-panel {
          margin-top: 24px;
          border-radius: 30px;
          padding: 22px;
          background: white;
          border: 1px solid rgba(167, 139, 250, 0.22);
          box-shadow: 0 18px 55px rgba(28, 17, 48, 0.08);
        }

        .linkedin-panel h3 {
          margin: 0 0 10px;
          color: #18102e;
          font-size: 20px;
        }

        .linkedin-panel p {
          margin: 0 0 14px;
          color: #7a6c9a;
          line-height: 1.8;
        }

        .linkedin-textarea {
          width: 100%;
          min-height: 210px;
          resize: vertical;
          border: 1px solid #c9bdf0;
          border-radius: 22px;
          padding: 18px;
          line-height: 1.9;
          font-family: inherit;
          font-weight: 700;
          color: #18102e;
          background: #f4f0fb;
          outline: none;
        }

        .linkedin-textarea:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246,0.08);
        }

        .certificate-verification-panel {
          margin: 22px 0;
          border-radius: 30px;
          padding: 22px;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.10), transparent 35%),
            #ffffff;
          border: 1px solid rgba(167, 139, 250, 0.22);
          box-shadow: 0 18px 55px rgba(28, 17, 48, 0.08);
        }

        .certificate-verification-grid {
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 14px;
          align-items: stretch;
        }

        .certificate-verification-card {
          border-radius: 22px;
          padding: 16px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.18);
        }

        .certificate-verification-card span {
          display: block;
          color: #7a6c9a;
          font-size: 12px;
          font-weight: 850;
          margin-bottom: 7px;
        }

        .certificate-verification-card strong {
          display: block;
          color: #18102e;
          font-size: 15px;
          line-height: 1.8;
          font-weight: 950;
          word-break: break-word;
        }

        .certificate-verification-card small {
          display: block;
          margin-top: 8px;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.8;
          font-weight: 760;
        }

        .certificate-verification-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 14px;
        }

        .verify-state {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 950;
        }

        .verify-state.enabled {
          background: #ecfdf5;
          color: #065f46;
          border: 1px solid rgba(16,185,129,.25);
        }

        .verify-state.locked {
          background: #efe9fb;
          color: #5b4f78;
          border: 1px solid rgba(167, 139, 250,.25);
        }

        .certificate-verify-line {
          margin-top: 14px;
          padding-top: 14px;
          border-top: 1px solid rgba(255,255,255,.12);
          color: #c9bdf0;
          font-size: 11px;
          line-height: 1.8;
          font-weight: 800;
          word-break: break-word;
        }

        .certificate-verify-line strong {
          color: #fbbf24;
          display: inline;
          margin: 0;
        }

        @media (max-width: 850px) {
          .mastery-hero-content,
          .mastery-lock-grid,
          .certificate-footer,
          .certificate-verification-grid {
            grid-template-columns: 1fr;
          }

          .mastery-progress-orb {
            width: 190px;
            height: 190px;
          }

          .mastery-progress-inner {
            width: 134px;
            height: 134px;
          }

          .mastery-stats,
          .certificate-pillars {
            grid-template-columns: repeat(2, 1fr);
          }

          .certificate-inner {
            padding: 28px 18px;
          }

          .certificate-top {
            flex-direction: column;
          }

          .signature,
          .certificate-code {
            text-align: right;
          }
        }

        @media (max-width: 520px) {
          .mastery-stats,
          .certificate-pillars {
            grid-template-columns: 1fr;
          }
        }
      `}),(0,u.jsxs)(`div`,{className:`mastery-shell`,children:[(0,u.jsx)(`div`,{className:`mastery-hero mastery-no-print`,children:(0,u.jsxs)(`div`,{className:`mastery-hero-content`,children:[(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`span`,{className:`mastery-eyebrow`,children:`📜 وثيقة الإتقان`}),(0,u.jsxs)(`h1`,{children:[`لا تُمنح الوثيقة عند الدخول،`,(0,u.jsx)(`br`,{}),`بل عند اكتمال `,(0,u.jsx)(`span`,{children:`الرحلة كاملة`}),`.`]}),(0,u.jsx)(`p`,{children:`هذه الوثيقة ليست شهادة حضور؛ إنها سجل إتمام لمسار معرفي تطبيقي يمتد عبر 180 يومًا في هندسة التطوير التنظيمي، ولا تظهر إلا بعد اكتمال جميع أيام الرحلة التعليمية.`})]}),(0,u.jsx)(`div`,{className:`mastery-progress-orb od-circular-indicator od-indicator-completion`,style:{"--od-indicator-progress":`${w}%`},"aria-label":`نسبة إتمام الرحلة`,children:(0,u.jsx)(`div`,{className:`mastery-progress-inner`,children:(0,u.jsxs)(`div`,{children:[(0,u.jsxs)(`strong`,{children:[w,`%`]}),(0,u.jsx)(`span`,{children:`إتمام الرحلة`})]})})})]})}),(0,u.jsxs)(`div`,{className:`mastery-stats mastery-no-print`,children:[(0,u.jsxs)(`div`,{className:`mastery-stat`,children:[(0,u.jsx)(`span`,{children:`الأيام المكتملة`}),(0,u.jsxs)(`strong`,{children:[C,` / `,S]})]}),(0,u.jsxs)(`div`,{className:`mastery-stat`,children:[(0,u.jsx)(`span`,{children:`الساعات المحتسبة`}),(0,u.jsxs)(`strong`,{children:[E,` / `,D]})]}),(0,u.jsxs)(`div`,{className:`mastery-stat`,children:[(0,u.jsx)(`span`,{children:`الأيام المتبقية`}),(0,u.jsx)(`strong`,{children:T})]}),(0,u.jsxs)(`div`,{className:`mastery-stat`,children:[(0,u.jsx)(`span`,{children:`حالة الوثيقة`}),(0,u.jsx)(`strong`,{children:O?`مفتوحة`:`مقفلة`})]})]}),(0,u.jsx)(p,{userName:k,completedDays:C,totalDays:S}),(0,u.jsx)(`section`,{className:`certificate-verification-panel mastery-no-print`,"aria-label":`بيانات التحقق من الوثيقة`,children:(0,u.jsxs)(`div`,{className:`certificate-verification-grid`,children:[(0,u.jsxs)(`div`,{className:`certificate-verification-card`,children:[(0,u.jsx)(`span`,{children:`رقم الوثيقة`}),(0,u.jsx)(`strong`,{children:j}),(0,u.jsx)(`small`,{children:v?`جارٍ مزامنة رقم الوثيقة مع قاعدة البيانات...`:b||`يرتبط هذا الرقم بإنجازك الفعلي داخل الرحلة.`})]}),(0,u.jsxs)(`div`,{className:`certificate-verification-card`,children:[(0,u.jsx)(`span`,{children:`حالة التحقق العام`}),(0,u.jsx)(`strong`,{children:(0,u.jsx)(`i`,{className:`verify-state ${N?`enabled`:`locked`}`,children:N?`مفعّل بعد الإكمال`:`غير مفعّل قبل الإكمال`})}),(0,u.jsx)(`small`,{children:O?`يمكن مشاركة رابط التحقق بعد صدور الوثيقة.`:`سيظهر رابط التحقق بعد إكمال جميع أيام الرحلة.`}),O&&(0,u.jsx)(`div`,{className:`certificate-verification-actions`,children:(0,u.jsx)(`button`,{type:`button`,className:`mastery-button ghost`,onClick:L,children:d?`تم نسخ رابط التحقق ✅`:`نسخ رابط التحقق`})})]})]})}),!O&&(0,u.jsxs)(`div`,{className:`mastery-lock mastery-no-print`,children:[(0,u.jsxs)(`div`,{className:`mastery-lock-grid`,children:[(0,u.jsx)(`div`,{className:`mastery-lock-icon`,children:`🔒`}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`h2`,{children:`وثيقة الإتقان لم تُفتح بعد`}),(0,u.jsxs)(`p`,{children:[`أكمل جميع أيام الرحلة التعليمية أولًا. بقي أمامك`,` `,(0,u.jsx)(`strong`,{children:T}),` يومًا حتى تُفتح الوثيقة تلقائيًا. هذا الإقفال مقصود حتى تبقى الوثيقة مرتبطة بالإنجاز الفعلي لا بمجرد دخول الصفحة.`]})]}),(0,u.jsx)(`button`,{className:`mastery-button primary`,onClick:()=>n?.(`journey`),children:`العودة إلى رحلتك التعليمية 🧭`})]}),(0,u.jsx)(`div`,{className:`mastery-track`,children:(0,u.jsx)(`span`,{})})]}),O&&(0,u.jsxs)(u.Fragment,{children:[(0,u.jsxs)(`div`,{className:`certificate-stage`,children:[(0,u.jsx)(`div`,{id:`printable-certificate-frame`,className:`certificate-frame`,children:(0,u.jsxs)(`div`,{className:`certificate-inner`,children:[(0,u.jsxs)(`div`,{className:`certificate-top`,children:[(0,u.jsxs)(`div`,{className:`certificate-brand`,children:[(0,u.jsx)(`div`,{className:`brand-mark`,children:`RA`}),(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`strong`,{children:`OD Engineering LAB`}),(0,u.jsx)(`span`,{children:`مختبر التطوير التنظيمي المستقل`})]})]}),(0,u.jsxs)(`div`,{className:`certificate-code`,children:[(0,u.jsxs)(`strong`,{children:[`رقم الوثيقة: `,j]}),(0,u.jsxs)(`span`,{children:[`تاريخ الإتمام: `,P]}),(0,u.jsxs)(`div`,{className:`certificate-verify-line`,children:[`حالة التحقق: `,(0,u.jsx)(`strong`,{children:N?`مفعّل`:`قيد التفعيل`}),(0,u.jsx)(`br`,{}),N?M:`يُفعّل الرابط عند صدور الوثيقة.`]})]})]}),(0,u.jsxs)(`div`,{className:`certificate-title`,children:[(0,u.jsx)(`span`,{className:`badge`,children:`وثيقة إتقان معرفي وتطبيقي`}),(0,u.jsx)(`h2`,{children:`إتمام رحلة هندسة التطوير التنظيمي`}),(0,u.jsx)(`div`,{className:`learner`,children:k}),(0,u.jsx)(`p`,{children:`تُمنح هذه الوثيقة تقديرًا لإتمام رحلة معرفية تطبيقية امتدت ستة أشهر كاملة، شملت التشخيص التنظيمي، تصميم المنظمة، الأدوار والأوصاف الوظيفية، قيادة التغيير، الثقافة التنظيمية، التعلم المؤسسي، قياس الأثر، واستدامة تدخلات التطوير التنظيمي.`})]}),(0,u.jsxs)(`div`,{className:`certificate-pillars`,children:[(0,u.jsxs)(`div`,{className:`certificate-pillar`,children:[(0,u.jsx)(`strong`,{children:S}),(0,u.jsx)(`span`,{children:`يومًا تعليميًا`})]}),(0,u.jsxs)(`div`,{className:`certificate-pillar`,children:[(0,u.jsx)(`strong`,{children:D}),(0,u.jsx)(`span`,{children:`ساعة تعلم محتسبة`})]}),(0,u.jsxs)(`div`,{className:`certificate-pillar`,children:[(0,u.jsx)(`strong`,{children:`24`}),(0,u.jsx)(`span`,{children:`أسبوعًا تطبيقيًا`})]}),(0,u.jsxs)(`div`,{className:`certificate-pillar`,children:[(0,u.jsx)(`strong`,{children:`6`}),(0,u.jsx)(`span`,{children:`أشهر إتقان`})]})]}),(0,u.jsxs)(`div`,{className:`certificate-footer`,children:[(0,u.jsxs)(`div`,{children:[(0,u.jsx)(`strong`,{children:`المرجعيات العلمية للمسار`}),(0,u.jsx)(`span`,{children:`Cummings & Worley • Donald Anderson • Burke-Litwin • Peter Senge • Hackman & Oldham`})]}),(0,u.jsxs)(`div`,{className:`signature`,children:[(0,u.jsx)(`strong`,{children:`اعتماد معرفي مستقل`}),(0,u.jsx)(`div`,{className:`name`,children:`Rayan Alajlan`}),(0,u.jsx)(`small`,{children:`SHRM-SCP • SPHRi • CPTD • PMP`})]})]})]})}),(0,u.jsxs)(`div`,{className:`mastery-actions mastery-no-print`,children:[(0,u.jsx)(`button`,{className:`mastery-button dark`,onClick:z,children:`طباعة الوثيقة / حفظ PDF 🖨️`}),(0,u.jsx)(`button`,{className:`mastery-button ghost`,onClick:L,children:d?`تم نسخ رابط التحقق ✅`:`نسخ رابط التحقق`}),(0,u.jsx)(`button`,{className:`mastery-button ghost`,onClick:I,children:i?`تم نسخ نص البوست ✅`:`نسخ نص بوست LinkedIn ✍️`}),(0,u.jsx)(`button`,{className:`mastery-button linkedin`,onClick:R,children:`فتح LinkedIn للمشاركة 🔗`})]})]}),(0,u.jsxs)(`div`,{className:`linkedin-panel mastery-no-print`,children:[(0,u.jsx)(`h3`,{children:`نص مقترح للمشاركة على LinkedIn`}),(0,u.jsx)(`p`,{children:`انسخ النص أو استخدم زر المشاركة. عند فتح LinkedIn الصق النص في المنشور ثم انشره.`}),(0,u.jsx)(`textarea`,{className:`linkedin-textarea`,value:F,readOnly:!0,"aria-label":`نص مقترح لمنشور لينكدإن`})]})]})]})]})}export{g as default};