import{b as e,p as t,y as n}from"./index-r2YaTxdB.js";import{i as r}from"./masteryCertificateService-BmBj30lS.js";var i=e(n(),1),a=t();function o({slug:e}){let[t,n]=(0,i.useState)(!0),[o,s]=(0,i.useState)(null),[c,l]=(0,i.useState)(``);(0,i.useEffect)(()=>{let t=!0;async function i(){n(!0),l(``);try{let n=await r(e);if(!t)return;n?s(n):l(`لم يتم العثور على وثيقة أو شهادة مفعّلة بهذا الرقم.`)}catch(e){t&&l(e?.message||`تعذر التحقق من الوثيقة.`)}finally{t&&n(!1)}}return i(),()=>{t=!1}},[e]);let u=o?.certificate_type===`monthly`||Number.isFinite(Number(o?.month_number));return(0,a.jsxs)(`main`,{className:`verify-page`,dir:`rtl`,children:[(0,a.jsx)(`style`,{children:`
        .verify-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 24px;
          color: #18102e;
          background:
            radial-gradient(circle at 12% 12%, rgba(139, 92, 246,.16), transparent 30%),
            radial-gradient(circle at 88% 18%, rgba(245,158,11,.14), transparent 28%),
            linear-gradient(135deg, #f4f0fb, #efe9fb);
          font-family: inherit;
        }

        .verify-card {
          width: min(820px, 100%);
          border-radius: 34px;
          padding: 28px;
          background: rgba(255,255,255,.94);
          border: 1px solid rgba(167, 139, 250,.22);
          box-shadow: 0 28px 80px rgba(28, 17, 48,.14);
        }

        .verify-card.success {
          border-color: rgba(16,185,129,.28);
        }

        .verify-mark {
          width: 76px;
          height: 76px;
          border-radius: 26px;
          display: grid;
          place-items: center;
          margin-bottom: 18px;
          color: #fff;
          font-size: 32px;
          font-weight: 950;
          background: linear-gradient(135deg, #10b981, #059669);
          box-shadow: 0 18px 42px rgba(16,185,129,.22);
        }

        .verify-card h1 {
          margin: 0 0 12px;
          font-size: clamp(28px, 5vw, 46px);
          line-height: 1.18;
          font-weight: 950;
        }

        .verify-card p {
          margin: 0 0 18px;
          color: #7a6c9a;
          font-size: 14px;
          line-height: 2;
          font-weight: 760;
        }

        .verify-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 18px;
        }

        .verify-field {
          border-radius: 20px;
          padding: 14px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.16);
        }

        .verify-field span {
          display: block;
          color: #7a6c9a;
          font-size: 11px;
          font-weight: 850;
          margin-bottom: 6px;
        }

        .verify-field strong {
          display: block;
          color: #18102e;
          font-size: 14px;
          line-height: 1.7;
          font-weight: 950;
          word-break: break-word;
        }

        .verify-state {
          display: inline-flex;
          border-radius: 999px;
          padding: 8px 12px;
          color: #065f46;
          background: #ecfdf5;
          border: 1px solid rgba(16,185,129,.22);
          font-weight: 950;
          font-size: 12px;
          margin-top: 12px;
        }

        .verify-home {
          display: inline-flex;
          margin-top: 20px;
          min-height: 44px;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border-radius: 16px;
          padding: 0 16px;
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          font-weight: 950;
        }

        .verify-error {
          color: #991b1b;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 22px;
          padding: 16px;
          line-height: 1.9;
          font-weight: 850;
        }

        @media (max-width: 640px) {
          .verify-grid {
            grid-template-columns: 1fr;
          }

          .verify-card {
            padding: 20px;
            border-radius: 26px;
          }
        }
      `}),(0,a.jsx)(`section`,{className:`verify-card ${o?`success`:``}`,children:t?(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(`div`,{className:`verify-mark`,children:`…`}),(0,a.jsx)(`h1`,{children:`جارٍ التحقق من الوثيقة`}),(0,a.jsx)(`p`,{children:`نراجع رقم الوثيقة في قاعدة بيانات رحلة التطوير التنظيمي.`})]}):o?(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(`div`,{className:`verify-mark`,children:`✓`}),(0,a.jsx)(`h1`,{children:u?`شهادة إنجاز شهرية موثّقة`:`وثيقة إتقان موثّقة`}),(0,a.jsx)(`p`,{children:u?`تم العثور على شهادة شهرية مفعّلة وصادرة بعد إكمال محطة شهرية من رحلة التطوير التنظيمي.`:`تم العثور على وثيقة مفعّلة وصادرة بعد إكمال رحلة التطوير التنظيمي.`}),(0,a.jsx)(`span`,{className:`verify-state`,children:`صالحة ومفعّلة`}),(0,a.jsxs)(`div`,{className:`verify-grid`,children:[(0,a.jsxs)(`div`,{className:`verify-field`,children:[(0,a.jsx)(`span`,{children:`رقم الوثيقة`}),(0,a.jsx)(`strong`,{children:o.certificate_code})]}),(0,a.jsxs)(`div`,{className:`verify-field`,children:[(0,a.jsx)(`span`,{children:`اسم المتدرب`}),(0,a.jsx)(`strong`,{children:o.certificate_name})]}),u?(0,a.jsxs)(a.Fragment,{children:[(0,a.jsxs)(`div`,{className:`verify-field`,children:[(0,a.jsx)(`span`,{children:`نوع الشهادة`}),(0,a.jsxs)(`strong`,{children:[`شهادة شهرية · الشهر `,o.month_number]})]}),(0,a.jsxs)(`div`,{className:`verify-field`,children:[(0,a.jsx)(`span`,{children:`عنوان الشهر`}),(0,a.jsx)(`strong`,{children:o.month_title||`إنجاز شهري في رحلة OD`})]})]}):(0,a.jsxs)(`div`,{className:`verify-field`,children:[(0,a.jsx)(`span`,{children:`نوع الوثيقة`}),(0,a.jsx)(`strong`,{children:`وثيقة إتقان نهائية`})]}),(0,a.jsxs)(`div`,{className:`verify-field`,children:[(0,a.jsx)(`span`,{children:`الأيام المكتملة`}),(0,a.jsxs)(`strong`,{children:[o.completed_days,` / `,o.total_days]})]}),(0,a.jsxs)(`div`,{className:`verify-field`,children:[(0,a.jsx)(`span`,{children:`تاريخ الإصدار`}),(0,a.jsx)(`strong`,{children:o.issued_at?new Intl.DateTimeFormat(`ar-SA`,{year:`numeric`,month:`long`,day:`numeric`}).format(new Date(o.issued_at)):`غير محدد`})]})]}),(0,a.jsx)(`a`,{className:`verify-home`,href:`/`,children:`العودة للمنصة`})]}):(0,a.jsxs)(a.Fragment,{children:[(0,a.jsx)(`div`,{className:`verify-mark`,style:{background:`linear-gradient(135deg,#ef4444,#991b1b)`},children:`!`}),(0,a.jsx)(`h1`,{children:`لم يتم التحقق من الوثيقة`}),(0,a.jsx)(`div`,{className:`verify-error`,children:c||`الرابط غير صحيح أو الوثيقة غير مفعّلة.`}),(0,a.jsx)(`a`,{className:`verify-home`,href:`/`,children:`العودة للمنصة`})]})})]})}export{o as default};