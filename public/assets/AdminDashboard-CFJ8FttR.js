import{a as e,b as t,c as n,i as r,n as i,o as a,p as o,r as s,s as c,t as l,y as u}from"./index-r2YaTxdB.js";var d=t(u(),1),f=o();function p(e){if(!e)return`غير محدد`;try{return new Intl.DateTimeFormat(`ar-SA`,{year:`numeric`,month:`short`,day:`numeric`,hour:`2-digit`,minute:`2-digit`}).format(new Date(e))}catch{return`غير محدد`}}function m({value:e=0}){let t=Number(e||0);return(0,f.jsxs)(`span`,{className:`admin-stars`,"aria-label":`تقييم ${t} من 5`,children:[`★`.repeat(Math.max(0,Math.min(5,t))),`☆`.repeat(Math.max(0,5-Math.max(0,Math.min(5,t))))]})}function h({label:e,value:t,hint:n}){return(0,f.jsxs)(`div`,{className:`admin-metric`,children:[(0,f.jsx)(`span`,{children:e}),(0,f.jsx)(`strong`,{children:t??0}),n&&(0,f.jsx)(`small`,{children:n})]})}function g(){let[t,o]=(0,d.useState)(null),[u,g]=(0,d.useState)(!0),[_,v]=(0,d.useState)(null),[y,b]=(0,d.useState)([]),[x,S]=(0,d.useState)([]),[C,w]=(0,d.useState)([]),[T,E]=(0,d.useState)([]),[D,O]=(0,d.useState)(`feedback`),[k,A]=(0,d.useState)(``),[j,M]=(0,d.useState)(``),[N,P]=(0,d.useState)({userId:``,title:``,body:``});async function F(){g(!0),A(``);try{let t=await c();if(o(t),!t)return;let[n,l,u,d,f]=await Promise.all([i(),s(40),e(24),a(24),r(24)]);v(n),b(l),S(u),w(d),E(f)}catch(e){A(e?.message||`تعذر تحميل لوحة الإدارة.`)}finally{g(!1)}}(0,d.useEffect)(()=>{F()},[]);let I=(0,d.useMemo)(()=>x.find(e=>e.user_id===N.userId),[x,N.userId]);async function L(e,t){M(e.id),A(``);try{await n({feedbackId:e.id,nextStatus:t,adminNote:t===`approved`?`تم اعتماد التقييم للنشر.`:`تم رفض التقييم.`}),b(t=>t.filter(t=>t.id!==e.id)),A(t===`approved`?`تم نشر التقييم.`:`تم رفض التقييم.`),await F()}catch(e){A(e?.message||`تعذر تحديث حالة التقييم.`)}finally{M(``)}}async function R(e){e.preventDefault(),A(``);try{if(!N.userId)throw Error(`اختر متدربًا أولًا.`);if(!N.title.trim())throw Error(`اكتب عنوان التنبيه.`);await l({userId:N.userId,title:N.title,body:N.body,type:`admin`,actionLabel:`فتح الرحلة`,actionPage:`journey`}),P({userId:``,title:``,body:``}),A(`تم إرسال التنبيه للمتدرب.`),await F()}catch(e){A(e?.message||`تعذر إرسال التنبيه.`)}}return(0,f.jsxs)(`section`,{className:`admin-dashboard`,dir:`rtl`,children:[(0,f.jsx)(`style`,{children:`
        .admin-dashboard {
          min-height: 100vh;
          padding: 34px 16px 80px;
          color: #18102e;
          background:
            radial-gradient(circle at 10% 10%, rgba(139, 92, 246,.14), transparent 30%),
            radial-gradient(circle at 90% 15%, rgba(245,158,11,.13), transparent 26%),
            linear-gradient(180deg,#f4f0fb 0%, #efe9fb 55%, #f4f0fb 100%);
        }

        .admin-shell {
          width: min(1180px, 100%);
          margin: 0 auto;
        }

        .admin-hero {
          border-radius: 34px;
          padding: 28px;
          color: #fff;
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.22), transparent 34%),
            linear-gradient(135deg, #18102e, #3b1d6e);
          box-shadow: 0 24px 70px rgba(28, 17, 48,.18);
        }

        .admin-hero span,
        .admin-hero-kicker {
          display: inline-flex;
          margin-bottom: 10px;
          color: #fde68a;
          -webkit-text-fill-color: #fde68a !important;
          font-size: 12px;
          font-weight: 950;
        }

        .admin-hero h1,
        .admin-hero-title {
          margin: 0;
          font-size: clamp(28px, 5vw, 52px);
          line-height: 1.14;
          font-weight: 950;
          letter-spacing: -1px;
          color: #f8f2ff !important;
          -webkit-text-fill-color: #f8f2ff !important;
          background-image: none !important;
          text-shadow: 0 12px 34px rgba(0,0,0,.28);
        }

        .admin-hero p {
          margin: 14px 0 0;
          max-width: 820px;
          color: rgba(196, 181, 253,.9);
          -webkit-text-fill-color: rgba(196, 181, 253,.9);
          font-size: 14px;
          line-height: 2;
          font-weight: 760;
        }

        .admin-loading,
        .admin-denied,
        .admin-notice {
          width: min(1180px, 100%);
          margin: 18px auto;
          border-radius: 24px;
          padding: 18px;
          background: #fff;
          border: 1px solid rgba(167, 139, 250,.22);
          box-shadow: 0 14px 34px rgba(28, 17, 48,.06);
          color: #463c63;
          font-weight: 850;
          line-height: 1.9;
        }

        .admin-notice {
          color: #6d28d9;
          background: #efe9fb;
        }

        .admin-metrics {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin: 18px 0;
        }

        .admin-metric,
        .admin-panel {
          border-radius: 26px;
          padding: 18px;
          background: rgba(255,255,255,.94);
          border: 1px solid rgba(167, 139, 250,.20);
          box-shadow: 0 18px 48px rgba(28, 17, 48,.07);
        }

        .admin-metric span {
          display: block;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.6;
          font-weight: 900;
        }

        .admin-metric strong {
          display: block;
          margin-top: 6px;
          color: #18102e;
          font-size: 28px;
          line-height: 1.1;
          font-weight: 950;
        }

        .admin-metric small {
          display: block;
          margin-top: 8px;
          color: #9d8fc0;
          font-size: 11px;
          line-height: 1.6;
          font-weight: 780;
        }

        .admin-tabs {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin: 18px 0;
        }

        .admin-tabs button,
        .admin-action,
        .admin-soft-button {
          border: 0;
          min-height: 42px;
          border-radius: 16px;
          padding: 0 14px;
          font-family: inherit;
          font-weight: 950;
          cursor: pointer;
          transition: .18s ease;
        }

        .admin-tabs button {
          color: #463c63;
          background: #fff;
          border: 1px solid rgba(167, 139, 250,.20);
        }

        .admin-tabs button.active {
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          border-color: transparent;
        }

        .admin-tabs button:hover,
        .admin-action:hover,
        .admin-soft-button:hover {
          transform: translateY(-1px);
        }

        .admin-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .admin-panel h2,
        .admin-panel h3 {
          margin: 0 0 12px;
          color: #18102e;
          font-size: 18px;
          line-height: 1.6;
          font-weight: 950;
        }

        .admin-table {
          display: grid;
          gap: 10px;
        }

        .admin-row {
          border-radius: 20px;
          padding: 14px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.16);
        }

        .admin-row-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          align-items: flex-start;
          margin-bottom: 8px;
        }

        .admin-row-head strong {
          color: #18102e;
          font-size: 14px;
          line-height: 1.7;
          font-weight: 950;
        }

        .admin-row-head small,
        .admin-row p,
        .admin-row span {
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.9;
          font-weight: 780;
        }

        .admin-row p {
          margin: 8px 0 0;
          color: #463c63;
        }

        .admin-stars {
          color: #a855f7;
          letter-spacing: 1px;
          font-size: 14px;
        }

        .admin-actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 12px;
        }

        .admin-action.approve {
          color: #fff;
          background: linear-gradient(135deg, #10b981, #047857);
        }

        .admin-action.reject {
          color: #fff;
          background: linear-gradient(135deg, #ef4444, #991b1b);
        }

        .admin-soft-button {
          color: #463c63;
          background: #e0d8f5;
        }

        .admin-empty {
          border-radius: 20px;
          padding: 18px;
          color: #7a6c9a;
          background: #f4f0fb;
          border: 1px dashed rgba(100,116,139,.28);
          font-size: 13px;
          line-height: 1.9;
          font-weight: 850;
          text-align: center;
        }

        .admin-form {
          display: grid;
          gap: 10px;
        }

        .admin-form label {
          display: grid;
          gap: 6px;
          color: #463c63;
          font-size: 12px;
          line-height: 1.7;
          font-weight: 900;
        }

        .admin-form input,
        .admin-form select,
        .admin-form textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #c9bdf0;
          border-radius: 16px;
          min-height: 42px;
          padding: 0 12px;
          font-family: inherit;
          font-weight: 800;
          color: #18102e;
          background: #fff;
          outline: none;
        }

        .admin-form textarea {
          min-height: 100px;
          padding-top: 10px;
          line-height: 1.8;
          resize: vertical;
        }

        .admin-form input:focus,
        .admin-form select:focus,
        .admin-form textarea:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246,.09);
        }

        .admin-layout-2 {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        html[data-theme="dark"] body.od-theme-dark .admin-dashboard {
          color: #f7f3fc;
          background:
            radial-gradient(circle at 10% 10%, rgba(168, 85, 247,.16), transparent 30%),
            radial-gradient(circle at 90% 14%, rgba(124, 58, 237,.14), transparent 28%),
            linear-gradient(180deg,#10091f 0%, #170d2c 54%, #0d0719 100%);
        }

        html[data-theme="dark"] body.od-theme-dark .admin-hero {
          background:
            radial-gradient(circle at 100% 0%, rgba(245,158,11,.18), transparent 34%),
            linear-gradient(135deg, #18102e, #3b1d6e);
          border: 1px solid rgba(196, 181, 253,.18);
          box-shadow: 0 24px 70px rgba(0,0,0,.36);
        }

        html[data-theme="dark"] body.od-theme-dark .admin-metric,
        html[data-theme="dark"] body.od-theme-dark .admin-panel,
        html[data-theme="dark"] body.od-theme-dark .admin-loading,
        html[data-theme="dark"] body.od-theme-dark .admin-denied,
        html[data-theme="dark"] body.od-theme-dark .admin-notice {
          background:
            radial-gradient(circle at 100% 0%, rgba(168, 85, 247,.10), transparent 34%),
            linear-gradient(180deg, rgba(35, 22, 62,.96), rgba(25, 14, 45,.96));
          border-color: rgba(196, 181, 253,.22);
          box-shadow: 0 18px 48px rgba(0,0,0,.28);
          color: #e9ddff;
        }

        html[data-theme="dark"] body.od-theme-dark .admin-metric span,
        html[data-theme="dark"] body.od-theme-dark .admin-metric small,
        html[data-theme="dark"] body.od-theme-dark .admin-row-head small,
        html[data-theme="dark"] body.od-theme-dark .admin-row span,
        html[data-theme="dark"] body.od-theme-dark .admin-empty,
        html[data-theme="dark"] body.od-theme-dark .admin-form label {
          color: #cdbcf8;
          -webkit-text-fill-color: #cdbcf8;
        }

        html[data-theme="dark"] body.od-theme-dark .admin-metric strong,
        html[data-theme="dark"] body.od-theme-dark .admin-panel h2,
        html[data-theme="dark"] body.od-theme-dark .admin-panel h3,
        html[data-theme="dark"] body.od-theme-dark .admin-row-head strong {
          color: #ffffff;
          -webkit-text-fill-color: #ffffff;
        }

        html[data-theme="dark"] body.od-theme-dark .admin-row,
        html[data-theme="dark"] body.od-theme-dark .admin-empty {
          background: rgba(20, 12, 36,.82);
          border-color: rgba(196, 181, 253,.18);
        }

        html[data-theme="dark"] body.od-theme-dark .admin-row p {
          color: #e9ddff;
          -webkit-text-fill-color: #e9ddff;
        }

        html[data-theme="dark"] body.od-theme-dark .admin-tabs button {
          color: #d9cdf2;
          -webkit-text-fill-color: #d9cdf2;
          background: rgba(36, 22, 64,.92);
          border-color: rgba(196, 181, 253,.20);
        }

        html[data-theme="dark"] body.od-theme-dark .admin-tabs button.active {
          color: #ffffff;
          -webkit-text-fill-color: #ffffff;
          background: linear-gradient(135deg, #a855f7, #7c3aed);
          border-color: transparent;
        }

        html[data-theme="dark"] body.od-theme-dark .admin-soft-button {
          color: #efe7ff;
          -webkit-text-fill-color: #efe7ff;
          background: rgba(167, 139, 250,.16);
          border: 1px solid rgba(196, 181, 253,.22);
        }

        html[data-theme="dark"] body.od-theme-dark .admin-form input,
        html[data-theme="dark"] body.od-theme-dark .admin-form select,
        html[data-theme="dark"] body.od-theme-dark .admin-form textarea {
          color: #ffffff;
          -webkit-text-fill-color: #ffffff;
          background: #10091f;
          border-color: rgba(196, 181, 253,.24);
        }

        html[data-theme="dark"] body.od-theme-dark .admin-form input::placeholder,
        html[data-theme="dark"] body.od-theme-dark .admin-form textarea::placeholder {
          color: #a99fce;
          -webkit-text-fill-color: #a99fce;
        }

        @media (max-width: 920px) {
          .admin-metrics,
          .admin-layout-2 {
            grid-template-columns: 1fr;
          }
        }
      `}),(0,f.jsxs)(`div`,{className:`admin-shell`,children:[(0,f.jsxs)(`header`,{className:`admin-hero`,children:[(0,f.jsx)(`span`,{children:`لوحة إدارة المنصة`}),(0,f.jsx)(`h1`,{children:`مركز قرارات سريع للتقييمات، المتدربين، الوثائق، والتنبيهات.`})]}),u&&(0,f.jsx)(`div`,{className:`admin-loading`,children:`جارٍ تحميل لوحة الإدارة...`}),!u&&t===!1&&(0,f.jsx)(`div`,{className:`admin-denied`,children:`لا تملك صلاحية الوصول إلى لوحة الإدارة. سجّل الدخول بحساب المدير المعتمد.`}),k&&(0,f.jsx)(`div`,{className:`admin-notice`,children:k}),!u&&t&&(0,f.jsxs)(f.Fragment,{children:[(0,f.jsxs)(`section`,{className:`admin-metrics`,children:[(0,f.jsx)(h,{label:`إجمالي المتدربين`,value:_?.total_learners}),(0,f.jsx)(h,{label:`النشطون آخر 10 دقائق`,value:_?.active_now}),(0,f.jsx)(h,{label:`تقييمات بانتظار المراجعة`,value:_?.pending_feedback}),(0,f.jsx)(h,{label:`وثائق صادرة`,value:_?.issued_certificates})]}),(0,f.jsxs)(`nav`,{className:`admin-tabs`,"aria-label":`أقسام لوحة الإدارة`,children:[(0,f.jsx)(`button`,{className:D===`feedback`?`active`:``,onClick:()=>O(`feedback`),children:`التقييمات`}),(0,f.jsx)(`button`,{className:D===`learners`?`active`:``,onClick:()=>O(`learners`),children:`المتدربون`}),(0,f.jsx)(`button`,{className:D===`notes`?`active`:``,onClick:()=>O(`notes`),children:`الملاحظات`}),(0,f.jsx)(`button`,{className:D===`certificates`?`active`:``,onClick:()=>O(`certificates`),children:`الوثائق`}),(0,f.jsx)(`button`,{className:D===`notifications`?`active`:``,onClick:()=>O(`notifications`),children:`إرسال تنبيه`}),(0,f.jsx)(`button`,{onClick:F,children:`تحديث`})]}),(0,f.jsxs)(`div`,{className:`admin-grid`,children:[D===`feedback`&&(0,f.jsxs)(`section`,{className:`admin-panel`,children:[(0,f.jsx)(`h2`,{children:`تقييمات بانتظار المراجعة`}),(0,f.jsx)(`div`,{className:`admin-table`,children:y.length?y.map(e=>(0,f.jsxs)(`article`,{className:`admin-row`,children:[(0,f.jsxs)(`div`,{className:`admin-row-head`,children:[(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`strong`,{children:e.display_name||`متدرب`}),(0,f.jsxs)(`small`,{children:[e.email||`بدون بريد ظاهر`,` · `,p(e.submitted_at)]})]}),(0,f.jsx)(m,{value:e.rating})]}),(0,f.jsxs)(`span`,{children:[e.stage_label,` · نسبة الإكمال: `,e.completed_percent||0,`%`]}),e.testimonial_text&&(0,f.jsx)(`p`,{children:e.testimonial_text}),e.improvement_text&&(0,f.jsxs)(`p`,{children:[`ملاحظة تحسين: `,e.improvement_text]}),(0,f.jsxs)(`div`,{className:`admin-actions`,children:[(0,f.jsx)(`button`,{type:`button`,className:`admin-action approve`,disabled:j===e.id,onClick:()=>L(e,`approved`),children:`اعتماد ونشر`}),(0,f.jsx)(`button`,{type:`button`,className:`admin-action reject`,disabled:j===e.id,onClick:()=>L(e,`rejected`),children:`رفض`})]})]},e.id)):(0,f.jsx)(`div`,{className:`admin-empty`,children:`لا توجد تقييمات بانتظار المراجعة.`})})]}),D===`learners`&&(0,f.jsxs)(`section`,{className:`admin-panel`,children:[(0,f.jsx)(`h2`,{children:`آخر المتدربين`}),(0,f.jsx)(`div`,{className:`admin-table`,children:x.map(e=>(0,f.jsxs)(`article`,{className:`admin-row`,children:[(0,f.jsxs)(`div`,{className:`admin-row-head`,children:[(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`strong`,{children:e.display_name||e.email||`متدرب`}),(0,f.jsxs)(`small`,{children:[e.email,` · انضم: `,p(e.created_at)]})]}),(0,f.jsxs)(`span`,{children:[e.completed_days||0,` يوم مكتمل`]})]}),(0,f.jsxs)(`p`,{children:[`آخر ظهور: `,p(e.last_seen_at),` · وقت التعلم: `,Math.round((e.total_seconds||0)/3600),` ساعة`]})]},e.user_id))})]}),D===`notes`&&(0,f.jsxs)(`section`,{className:`admin-panel`,children:[(0,f.jsx)(`h2`,{children:`آخر الملاحظات المهنية`}),(0,f.jsx)(`div`,{className:`admin-table`,children:C.length?C.map(e=>(0,f.jsxs)(`article`,{className:`admin-row`,children:[(0,f.jsxs)(`div`,{className:`admin-row-head`,children:[(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`strong`,{children:e.display_name||e.email||`متدرب`}),(0,f.jsx)(`small`,{children:p(e.updated_at||e.created_at)})]}),(0,f.jsxs)(`span`,{children:[`شهر `,e.month_index,` · أسبوع `,e.week_index,` · يوم `,e.day_index]})]}),(0,f.jsx)(`p`,{children:e.note})]},e.id)):(0,f.jsx)(`div`,{className:`admin-empty`,children:`لا توجد ملاحظات محفوظة بعد.`})})]}),D===`certificates`&&(0,f.jsxs)(`section`,{className:`admin-panel`,children:[(0,f.jsx)(`h2`,{children:`آخر الوثائق`}),(0,f.jsx)(`div`,{className:`admin-table`,children:T.length?T.map(e=>(0,f.jsxs)(`article`,{className:`admin-row`,children:[(0,f.jsxs)(`div`,{className:`admin-row-head`,children:[(0,f.jsxs)(`div`,{children:[(0,f.jsx)(`strong`,{children:e.certificate_name||e.email||`متدرب`}),(0,f.jsxs)(`small`,{children:[e.email,` · `,p(e.created_at)]})]}),(0,f.jsx)(`span`,{children:e.status||`غير محدد`})]}),(0,f.jsxs)(`p`,{children:[`رقم الوثيقة: `,e.certificate_code||`غير مولّد`,` · تحقق: `,e.verification_enabled?`مفعّل`:`غير مفعّل`]})]},e.id)):(0,f.jsx)(`div`,{className:`admin-empty`,children:`لا توجد وثائق بعد.`})})]}),D===`notifications`&&(0,f.jsxs)(`section`,{className:`admin-layout-2`,children:[(0,f.jsxs)(`div`,{className:`admin-panel`,children:[(0,f.jsx)(`h2`,{children:`إرسال تنبيه لمتدرب`}),(0,f.jsxs)(`form`,{className:`admin-form`,onSubmit:R,children:[(0,f.jsxs)(`label`,{children:[`اختر المتدرب`,(0,f.jsxs)(`select`,{value:N.userId,onChange:e=>P(t=>({...t,userId:e.target.value})),children:[(0,f.jsx)(`option`,{value:``,children:`اختر`}),x.map(e=>(0,f.jsx)(`option`,{value:e.user_id,children:e.display_name||e.email},e.user_id))]})]}),(0,f.jsxs)(`label`,{children:[`عنوان التنبيه`,(0,f.jsx)(`input`,{value:N.title,onChange:e=>P(t=>({...t,title:e.target.value})),placeholder:`مثال: لديك محطة تعلم جديدة`})]}),(0,f.jsxs)(`label`,{children:[`نص التنبيه`,(0,f.jsx)(`textarea`,{value:N.body,onChange:e=>P(t=>({...t,body:e.target.value})),placeholder:`اكتب رسالة قصيرة ومفيدة`})]}),(0,f.jsx)(`button`,{type:`submit`,className:`admin-action approve`,children:`إرسال التنبيه`})]})]}),(0,f.jsxs)(`div`,{className:`admin-panel`,children:[(0,f.jsx)(`h3`,{children:`المتدرب المحدد`}),I?(0,f.jsxs)(`div`,{className:`admin-row`,children:[(0,f.jsx)(`strong`,{children:I.display_name||I.email}),(0,f.jsx)(`p`,{children:I.email}),(0,f.jsxs)(`p`,{children:[`أيام مكتملة: `,I.completed_days||0]})]}):(0,f.jsx)(`div`,{className:`admin-empty`,children:`اختر متدربًا لعرض ملخصه.`})]})]})]})]})]})]})}export{g as default};