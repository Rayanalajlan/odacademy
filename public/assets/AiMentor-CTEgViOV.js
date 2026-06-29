import{b as e,p as t,y as n}from"./index-r2YaTxdB.js";var r=e(n(),1),i=t(),a=`odacademy_ai_mentor_sessions_v4`,o=`odacademy_ai_mentor_active_session_v4`,s=[{id:`job_description`,title:`بناء وصف وظيفي`,subtitle:`من الغرض إلى المخرجات والصلاحيات والمؤشرات`,prompt:`أريد بناء وصف وظيفي احترافي لدور عام. أعطني منهجية كاملة، قالبًا جاهزًا، وأخطاء يجب تجنبها.`,prompt:`أريد وصفًا وظيفيًا عمليًا. أعطني خلاصة، 3 إلى 5 خطوات، قالبًا مختصرًا، ومثالًا قريبًا من الواقع. اسأل سؤالًا واحدًا فقط إذا كان ضروريًا.`,badge:`1`},{id:`org_diagnosis`,title:`تشخيص مشكلة تنظيمية`,subtitle:`عرض، نمط، فرضيات، بيانات، قرار`,prompt:`لدي مشكلة تنظيمية وأريد تشخيصها بمنهجية واضحة: العرض الظاهر، النمط، الفرضيات، البيانات المطلوبة، والتدخل المحتمل.`,prompt:`لدي مشكلة تنظيمية. شخّصها باختصار من زاوية العرض، النمط، السبب المحتمل، البيانات المطلوبة، وأول تدخل عملي. لا تطل ولا تسأل أكثر من سؤال واحد.`,badge:`2`},{id:`intervention_design`,title:`تصميم تدخل`,subtitle:`تدخل متدرج لا يقفز فوق التشخيص`,prompt:`بعد التشخيص، أريد تصميم تدخل تنظيمي متدرج مع المخاطر ومؤشرات قياس الأثر.`,prompt:`أريد تصميم تدخل تنظيمي عملي بعد التشخيص. أعطني خطوات قصيرة، تجربة صغيرة، مؤشرات أثر، وخطرًا مهنيًا يجب الانتباه له.`,badge:`3`},{id:`change`,title:`إدارة تغيير`,subtitle:`رسائل، مقاومة، أصحاب مصلحة، تثبيت`,prompt:`أريد التعامل مع مقاومة تغيير. ساعدني على فهم الأطراف، أسباب المقاومة، خطة التواصل، ومؤشرات الاستدامة.`,prompt:`أريد التعامل مع مقاومة تغيير. أعطني خلاصة عملية، قراءة مختصرة للمقاومة، خطة تواصل من 3 إلى 5 خطوات، وصياغة جاهزة عند الحاجة.`,badge:`4`},{id:`performance`,title:`أداء ومساءلة`,subtitle:`أهداف، مؤشرات، تغذية راجعة، سلوك`,prompt:`أريد تحليل مشكلة أداء دون اختزالها في الموظف. ساعدني على قراءة الأهداف، المؤشرات، السلوك، والبيئة.`,prompt:`أريد تحليل مشكلة أداء دون لوم الموظف. أعطني تشخيصًا مختصرًا، خطوات عملية، مؤشرًا مناسبًا، وسلوكًا واحدًا نبدأ بتعديله.`,badge:`5`},{id:`culture`,title:`ثقافة ومناخ`,subtitle:`ثقة، صمت تنظيمي، سلوك متكرر`,prompt:`أريد قراءة مشكلة ثقافية أو مناخ تنظيمي: ما السلوك المتكرر؟ ما الرسائل غير المعلنة؟ وكيف أقيسه؟`,prompt:`أريد قراءة مشكلة ثقافة أو مناخ تنظيمي. أعطني خلاصة، السلوك المتكرر، ما يكشفه عن النظام، وتدخلًا صغيرًا يمكن تجربته.`,badge:`6`}],c={id:`starter`,role:`assistant`,content:`اختر الأداة المناسبة أو اكتب سؤالك مباشرة. سأتعامل مع طلبك كمسألة عمل: أوضح لك المنهجية، أعطيك خطوات قابلة للتنفيذ، ثم أختم بأسئلة تضبط التطبيق على حالتك.`},l=`المختبر مزدحم اليوم ووصل إلى الحد المتاح من تشغيل الذكاء الاصطناعي. ارجع بعد تجدد الحصة وسنكمل من نفس المحادثة؛ محفوظة هنا ولن تضيع.`,u={...c,content:`أبشر، اكتب سؤالك كما هو. بعطيك خلاصة عملية، خطوات مختصرة، ومثال يساعدك تطبق. وإذا احتجت تفاصيل بسألك سؤال واحد يضبط الاتجاه.`};function d(e=`id`){return`${e}-${Date.now()}-${Math.random().toString(16).slice(2)}`}function f(){return new Date().toISOString()}function p(e){return e?new Intl.DateTimeFormat(`ar-SA`,{dateStyle:`medium`,timeStyle:`short`,timeZone:`Asia/Riyadh`}).format(new Date(e)):``}function m(e){let t=String(e||``).replace(/\s+/g,` `).trim();return t?t.length>44?`${t.slice(0,44)}...`:t:`جلسة جديدة`}function h(){let e=new Date,t=new Intl.DateTimeFormat(`en-CA`,{timeZone:`Asia/Riyadh`,year:`numeric`,month:`2-digit`,day:`2-digit`}).formatToParts(e).reduce((e,t)=>(e[t.type]=t.value,e),{});return new Date(Date.UTC(Number(t.year),Number(t.month)-1,Number(t.day)+1,21,5,0)).toISOString()}function g(e,t){let n=e?.resetAt||e?.reset_at||e?.retryAt||e?.retry_at;if(n)return new Date(n).toISOString();let r=t?.headers?.get?.(`Retry-After`),i=Number(e?.retryAfterSeconds||e?.retry_after_seconds||r);return Number.isFinite(i)&&i>0?new Date(Date.now()+i*1e3).toISOString():h()}function _(e){if(!e)return{total:0,label:``};let t=new Date(e).getTime()-Date.now();if(t<=0)return{total:0,label:`جاهز الآن`};let n=Math.floor(t/1e3),r=Math.floor(n/3600),i=Math.floor(n%3600/60),a=n%60;return{total:t,label:`${String(r).padStart(2,`0`)}:${String(i).padStart(2,`0`)}:${String(a).padStart(2,`0`)}`}}function v(e){return e?new Intl.DateTimeFormat(`ar-SA`,{timeZone:`Asia/Riyadh`,hour:`2-digit`,minute:`2-digit`,hour12:!0}).format(new Date(e)):``}function y(e=``){let t=String(e).toLowerCase();return t.includes(`quota`)||t.includes(`limit`)||t.includes(`daily`)||t.includes(`429`)||t.includes(`neurons`)||String(e).includes(`الحصة`)||String(e).includes(`الحد`)||String(e).includes(`الاستخدام`)}function b(e=``){return String(e||``).replace(/\r\n/g,`
`).replace(/^\s{0,3}#{1,6}\s*/gm,``).replace(/\*\*/g,``).replace(/__/g,``).replace(/`{1,3}/g,``).replace(/\.{3,}/g,`.`).replace(/…/g,`.`).replace(/[ \t]+([،؛؟.!])/g,`$1`).replace(/([،؛؟.!])(?=\S)/g,`$1 `).replace(/\n{3,}/g,`

`).replace(/[ \t]{2,}/g,` `).trim()}function x(e=`job_description`){let t=f();return{id:d(`session`),title:`جلسة جديدة`,modeId:e,createdAt:t,updatedAt:t,messages:[u]}}function S(){if(typeof window>`u`){let e=x();return{sessions:[e],activeSessionId:e.id}}try{let e=JSON.parse(window.localStorage.getItem(a)||`[]`),t=Array.isArray(e)?e.filter(e=>e?.id&&Array.isArray(e?.messages)):[];if(t.length){let e=window.localStorage.getItem(o);return{sessions:t,activeSessionId:t.some(t=>t.id===e)?e:t[0].id}}}catch{}let e=x();return{sessions:[e],activeSessionId:e.id}}function C(){let e=(0,r.useMemo)(()=>S(),[]),[t,n]=(0,r.useState)(e.sessions),[c,h]=(0,r.useState)(e.activeSessionId),[C,w]=(0,r.useState)(``),[T,E]=(0,r.useState)(!1),[D,O]=(0,r.useState)(``),[k,A]=(0,r.useState)(null),[j,M]=(0,r.useState)({total:0,label:``}),[N,P]=(0,r.useState)(``),F=(0,r.useRef)(null),I=(0,r.useMemo)(()=>t.find(e=>e.id===c)||t[0],[t,c]),L=(0,r.useMemo)(()=>{let e=I?.modeId||`job_description`;return s.find(t=>t.id===e)||s[0]},[I?.modeId]),R=(0,r.useMemo)(()=>{let e=N.trim().toLowerCase();return e?t.filter(t=>[t.title,t.createdAt,t.updatedAt,...(t.messages||[]).map(e=>e.content)].join(` `).toLowerCase().includes(e)):t},[N,t]),z=k&&j.total>0;(0,r.useEffect)(()=>{typeof window>`u`||(window.localStorage.setItem(a,JSON.stringify(t)),window.localStorage.setItem(o,c||``))},[t,c]),(0,r.useEffect)(()=>{F.current?.scrollIntoView({behavior:`smooth`,block:`end`})},[I?.messages,T,D,k]),(0,r.useEffect)(()=>{if(!k?.resetAt)return;M(_(k.resetAt));let e=window.setInterval(()=>{let e=_(k.resetAt);M(e),e.total<=0&&(A(null),O(``))},1e3);return()=>window.clearInterval(e)},[k?.resetAt]);function B(e){n(t=>t.map(t=>{if(t.id!==c)return t;let n=e(t);return{...t,...n,updatedAt:f()}}))}function V(e,t,n={}){let r={id:d(e),role:e,content:t};B(i=>({messages:[...i.messages,r],title:n.retitle||e===`user`&&(!i.title||i.title===`جلسة جديدة`)?m(t):i.title}))}function H(e){let t=s.find(t=>t.id===e)||s[0];B(()=>({modeId:t.id})),w(e=>e||t.prompt)}function U(e=L?.id||`job_description`){let t=x(e);n(e=>[t,...e]),h(t.id),w(``),O(``),A(null)}function W(e){n(t=>{let n=t.filter(t=>t.id!==e);if(!n.length){let e=x();return h(e.id),[e]}return e===c&&h(n[0].id),n})}function G(){B(e=>({title:`جلسة جديدة`,messages:[u],modeId:e.modeId||`job_description`})),w(``),O(``),A(null)}async function K(e){let t=String(e||C||``).trim();if(!t){O(`اكتب الطلب أو الحالة أولًا.`);return}if(z){O(l);return}let n=I?.messages||[];E(!0),O(``),w(``),V(`user`,t,{retitle:!0});try{let e=n.slice(-6).map(e=>({role:e.role,content:e.content})),r=await fetch(`/api/mentor`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({message:t,mode:L?.id,modeTitle:L?.title,history:e,messages:e})}),i=await r.json().catch(()=>({}));if(r.status===429||i?.code===`AI_QUOTA_EXCEEDED`){let e=g(i,r),t=i?.message||l;A({resetAt:e,message:t}),V(`assistant`,`${t}\n\nالعودة المتوقعة: بعد الساعة ${v(e)} بتوقيت السعودية.`);return}if(!r.ok){let e=i?.error||i?.message||`تعذر تشغيل الموجه الآن. جرّب بعد قليل.`;if(y(e)){let e=g(i,r);A({resetAt:e,message:l}),V(`assistant`,`${l}\n\nالعودة المتوقعة: بعد الساعة ${v(e)} بتوقيت السعودية.`);return}O(e);return}V(`assistant`,b(i?.reply||i?.answer||i?.response||i?.text||`وصلني طلبك، لكن الرد لم يكن واضحًا. أعد صياغته بتفاصيل أكثر.`))}catch(e){O(e?.message||`تعذر الاتصال بـ Gemini الآن. تأكد من نشر Worker مع GEMINI_API_KEY وGEMINI_MODEL ثم جرّب مرة أخرى.`)}finally{E(!1)}}return(0,i.jsxs)(`section`,{className:`ai-command-page`,dir:`rtl`,children:[(0,i.jsx)(`style`,{children:`
        .ai-command-page {
          min-height: 100vh;
          padding: 30px 14px 72px;
          color: #18102e;
          background:
            radial-gradient(circle at 10% 8%, rgba(139, 92, 246, 0.16), transparent 30%),
            radial-gradient(circle at 92% 13%, rgba(245, 158, 11, 0.15), transparent 28%),
            radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.10), transparent 36%),
            linear-gradient(135deg, #f4f0fb 0%, #efe9fb 52%, #fff7ed 100%);
        }

        .ai-command-wrap {
          width: min(1280px, 100%);
          margin: 0 auto;
        }

        .command-hero {
          position: relative;
          overflow: hidden;
          border-radius: 40px;
          padding: 32px;
          color: #fff;
          background:
            radial-gradient(circle at 18% 18%, rgba(129, 140, 248, .28), transparent 30%),
            radial-gradient(circle at 82% 8%, rgba(245, 158, 11, .20), transparent 30%),
            linear-gradient(135deg, #0c0717, #1e1b4b 58%, #3b1d6e);
          box-shadow: 0 28px 82px rgba(28, 17, 48, .22);
        }

        .command-hero::before {
          content: "";
          position: absolute;
          inset: -70px;
          opacity: .30;
          background-image:
            linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 46px 46px;
          transform: rotate(-8deg);
        }

        .command-hero-inner {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 20px;
          align-items: center;
        }

        .command-kicker {
          display: inline-flex;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.16);
          color: #fde68a;
          font-size: 12px;
          font-weight: 950;
        }

        .command-hero h1 {
          margin: 16px 0 12px;
          font-size: clamp(34px, 5vw, 62px);
          line-height: 1.14;
          font-weight: 950;
          letter-spacing: -1.1px;
        }

        .command-hero p {
          margin: 0;
          max-width: 820px;
          color: rgba(196, 181, 253, .92);
          line-height: 2.05;
          font-size: 15px;
          font-weight: 760;
        }

        .command-live-card {
          min-width: 235px;
          border-radius: 28px;
          padding: 18px;
          background: rgba(255, 255, 255, .11);
          border: 1px solid rgba(255,255,255,.16);
          backdrop-filter: blur(16px);
        }

        .command-live-card span {
          display: block;
          color: #c9bdf0;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 8px;
        }

        .command-live-card strong {
          display: block;
          color: #fff;
          font-size: 20px;
          line-height: 1.5;
          font-weight: 950;
        }

        .command-live-card small {
          display: block;
          margin-top: 8px;
          color: #fde68a;
          font-size: 12px;
          line-height: 1.7;
          font-weight: 850;
        }

        .command-layout {
          display: grid;
          grid-template-columns: 290px minmax(0, 1fr) 320px;
          gap: 16px;
          margin-top: 18px;
        }

        .command-panel {
          border-radius: 32px;
          padding: 20px;
          background: rgba(255,255,255,.92);
          border: 1px solid rgba(255,255,255,.92);
          box-shadow: 0 22px 60px rgba(28, 17, 48,.08);
          backdrop-filter: blur(18px);
        }

        .command-panel h2 {
          margin: 0 0 8px;
          color: #18102e;
          font-size: 22px;
          line-height: 1.45;
          font-weight: 950;
        }

        .command-panel p {
          margin: 0;
          color: #7a6c9a;
          line-height: 1.85;
          font-size: 12.5px;
          font-weight: 760;
        }

        .mode-grid {
          display: grid;
          gap: 9px;
          margin-top: 14px;
        }

        .mode-button {
          border: 1px solid rgba(167, 139, 250, .22);
          border-radius: 22px;
          padding: 13px;
          display: grid;
          grid-template-columns: 42px minmax(0, 1fr);
          gap: 10px;
          align-items: center;
          background: #fff;
          color: #18102e;
          cursor: pointer;
          text-align: right;
          font-family: inherit;
          transition: .18s ease;
          overflow: hidden;
        }

        .mode-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 34px rgba(28, 17, 48,.08);
        }

        .mode-button.active {
          border-color: rgba(139, 92, 246,.36);
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.12), transparent 34%),
            #fff;
        }

        .mode-badge {
          width: 42px;
          height: 42px;
          min-width: 42px;
          max-width: 42px;
          min-height: 42px;
          max-height: 42px;
          flex: 0 0 42px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: #ffffff;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          font-size: 12px;
          line-height: 1;
          font-weight: 950;
          letter-spacing: 0;
          direction: ltr;
          unicode-bidi: isolate;
          white-space: nowrap;
          overflow: hidden;
          box-sizing: border-box;
          font-family: Arial, sans-serif;
        }

        .mode-copy {
          min-width: 0;
          display: block;
          overflow: hidden;
        }

        .mode-button strong {
          display: block;
          font-size: 13px;
          line-height: 1.6;
          font-weight: 950;
        }

        .mode-button span {
          display: block;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.65;
          font-weight: 750;
        }


        .mode-copy > span {
          display: block;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.65;
          font-weight: 750;
          overflow-wrap: anywhere;
        }

        .chat-panel {
          min-height: 680px;
          display: grid;
          grid-template-rows: auto 1fr auto;
        }

        .chat-header {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: flex-start;
          margin-bottom: 14px;
        }

        .chat-title strong {
          display: block;
          color: #18102e;
          font-size: 22px;
          line-height: 1.45;
          font-weight: 950;
        }

        .chat-title span {
          display: block;
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.8;
          font-weight: 760;
        }

        .header-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .soft-button {
          border: 0;
          border-radius: 999px;
          padding: 9px 13px;
          background: #efe9fb;
          color: #463c63;
          font-family: inherit;
          font-size: 12px;
          font-weight: 900;
          cursor: pointer;
        }

        .messages-box {
          overflow: auto;
          max-height: 560px;
          display: grid;
          gap: 12px;
          padding: 14px;
          border-radius: 28px;
          background:
            linear-gradient(180deg, rgba(248,250,252,.96), rgba(241,245,249,.84));
          border: 1px solid rgba(167, 139, 250,.16);
        }

        .message {
          display: grid;
          gap: 5px;
          max-width: 88%;
          animation: fadeIn .18s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .message.user {
          margin-right: auto;
        }

        .message.assistant {
          margin-left: auto;
        }

        .message-label {
          color: #9d8fc0;
          font-size: 11px;
          font-weight: 900;
        }

        .message-bubble {
          white-space: pre-wrap;
          overflow-wrap: anywhere;
          word-break: normal;
          border-radius: 24px;
          padding: 14px 16px;
          line-height: 1.95;
          font-size: 13px;
          font-weight: 780;
          box-shadow: 0 12px 30px rgba(28, 17, 48,.05);
        }

        .message.user .message-bubble {
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          border-top-left-radius: 10px;
        }

        .message.assistant .message-bubble {
          direction: rtl;
          text-align: right;
          unicode-bidi: plaintext;
          color: #281748;
          background: #fff;
          border: 1px solid rgba(167, 139, 250,.22);
          border-top-right-radius: 10px;
        }

        .typing {
          display: inline-flex;
          gap: 5px;
          align-items: center;
        }

        .typing i {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          background: #9d8fc0;
          animation: bounce 1s infinite ease-in-out;
        }

        .typing i:nth-child(2) { animation-delay: .12s; }
        .typing i:nth-child(3) { animation-delay: .24s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: .45; }
          40% { transform: translateY(-5px); opacity: 1; }
        }

        .quota-card,
        .error-card {
          margin-bottom: 12px;
          border-radius: 22px;
          padding: 14px;
          line-height: 1.85;
          font-size: 12px;
          font-weight: 850;
        }

        .quota-card {
          color: #78350f;
          background: #fffbeb;
          border: 1px solid #fde68a;
        }

        .error-card {
          color: #9f1239;
          background: #fff1f2;
          border: 1px solid #fecdd3;
        }

        .quota-timer {
          display: inline-flex;
          margin-top: 9px;
          padding: 8px 12px;
          border-radius: 999px;
          background: #fff;
          color: #92400e;
          font-size: 12px;
          font-weight: 950;
        }

        .composer {
          margin-top: 14px;
          display: grid;
          gap: 10px;
        }

        .composer textarea {
          width: 100%;
          min-height: 120px;
          resize: vertical;
          border-radius: 24px;
          border: 1px solid #c9bdf0;
          padding: 15px;
          background: #fff;
          color: #18102e;
          outline: none;
          font-family: inherit;
          font-size: 14px;
          line-height: 1.9;
          font-weight: 760;
          box-sizing: border-box;
        }

        .composer textarea:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246,.09);
        }

        .composer-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .composer-footer small {
          color: #7a6c9a;
          line-height: 1.7;
          font-size: 11px;
          font-weight: 780;
        }

        .send-button {
          border: 0;
          min-height: 46px;
          border-radius: 18px;
          padding: 0 18px;
          color: #fff;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          cursor: pointer;
          font-family: inherit;
          font-weight: 950;
          box-shadow: 0 16px 35px rgba(139, 92, 246,.22);
        }

        .send-button:disabled {
          cursor: not-allowed;
          opacity: .55;
          box-shadow: none;
        }

        .archive-search {
          width: 100%;
          box-sizing: border-box;
          margin-top: 14px;
          min-height: 42px;
          border-radius: 16px;
          border: 1px solid #c9bdf0;
          padding: 0 12px;
          font-family: inherit;
          font-weight: 800;
          outline: none;
        }

        .archive-list {
          display: grid;
          gap: 9px;
          margin-top: 12px;
          max-height: 520px;
          overflow: auto;
          padding-left: 2px;
        }

        .archive-item {
          border: 1px solid rgba(167, 139, 250,.22);
          border-radius: 20px;
          padding: 12px;
          background: #fff;
          cursor: pointer;
          text-align: right;
          font-family: inherit;
          transition: .16s ease;
        }

        .archive-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 14px 32px rgba(28, 17, 48,.07);
        }

        .archive-item.active {
          border-color: rgba(139, 92, 246,.36);
          background: #efe9fb;
        }

        .archive-item strong {
          display: block;
          color: #18102e;
          font-size: 13px;
          line-height: 1.65;
          font-weight: 950;
        }

        .archive-item span {
          display: block;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.65;
          margin-top: 4px;
          font-weight: 740;
        }

        .archive-item-footer {
          display: flex;
          justify-content: space-between;
          gap: 8px;
          align-items: center;
          margin-top: 8px;
        }

        .delete-mini {
          border: 0;
          border-radius: 999px;
          padding: 5px 8px;
          background: #fff1f2;
          color: #be123c;
          font-family: inherit;
          font-size: 10px;
          font-weight: 900;
          cursor: pointer;
        }

        @media (max-width: 1180px) {
          .command-layout {
            grid-template-columns: 1fr;
          }

          .command-hero-inner {
            grid-template-columns: 1fr;
          }

          .command-live-card {
            min-width: 0;
          }

          .message {
            max-width: 100%;
          }
        }

        @media (max-width: 560px) {
          .ai-command-page {
            padding: 18px 10px 46px;
          }

          .command-hero,
          .command-panel {
            border-radius: 26px;
            padding: 20px;
          }

          .chat-header,
          .composer-footer {
            display: block;
          }

          .header-actions {
            margin-top: 10px;
          }

          .send-button {
            width: 100%;
            margin-top: 10px;
          }
        }
      `}),(0,i.jsxs)(`div`,{className:`ai-command-wrap`,children:[(0,i.jsx)(`header`,{className:`command-hero`,children:(0,i.jsxs)(`div`,{className:`command-hero-inner`,children:[(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`span`,{className:`command-kicker`,children:`الموجه الذكي`}),(0,i.jsx)(`h1`,{children:`الموجه الذكي`}),(0,i.jsx)(`p`,{children:`غرفة عمل ذكية داخل قسم الموجه الذكي: اكتب طلبك كما هو؛ وصف وظيفي، مشكلة أداء، تدخل تنظيمي، أو موقف تغيير. الموجه يعطيك إطار عمل واضحًا، ثم يسألك فقط عما يلزم لتخصيصه.`})]}),(0,i.jsxs)(`div`,{className:`command-live-card`,children:[(0,i.jsx)(`span`,{children:`حالة المختبر`}),(0,i.jsx)(`strong`,{children:z?`استراحة مؤقتة`:T?`يبني الرد...`:`جاهز للعمل`}),(0,i.jsx)(`small`,{children:z?`يعود تقريبًا بعد الساعة ${v(k.resetAt)}`:`المحادثات محفوظة تلقائيًا في الأرشيف.`})]})]})}),(0,i.jsxs)(`div`,{className:`command-layout`,children:[(0,i.jsxs)(`aside`,{className:`command-panel`,children:[(0,i.jsx)(`h2`,{children:`أدوات جاهزة`}),(0,i.jsx)(`p`,{children:`اختر نوع المهمة، وسيضبط الموجه طريقة الرد بدل إجابات عامة.`}),(0,i.jsx)(`div`,{className:`mode-grid`,children:s.map((e,t)=>(0,i.jsxs)(`button`,{type:`button`,className:`mode-button ${L.id===e.id?`active`:``}`,onClick:()=>H(e.id),children:[(0,i.jsx)(`span`,{className:`mode-badge`,children:t+1}),(0,i.jsxs)(`span`,{className:`mode-copy`,children:[(0,i.jsx)(`strong`,{children:e.title}),(0,i.jsx)(`span`,{children:e.subtitle})]})]},e.id))})]}),(0,i.jsxs)(`main`,{className:`command-panel chat-panel`,children:[(0,i.jsxs)(`div`,{className:`chat-header`,children:[(0,i.jsxs)(`div`,{className:`chat-title`,children:[(0,i.jsx)(`strong`,{children:I?.title||`جلسة جديدة`}),(0,i.jsxs)(`span`,{children:[L.title,` · محفوظ تلقائيًا · آخر تحديث:`,` `,p(I?.updatedAt)]})]}),(0,i.jsxs)(`div`,{className:`header-actions`,children:[(0,i.jsx)(`button`,{type:`button`,className:`soft-button`,onClick:()=>U(),children:`جلسة جديدة`}),(0,i.jsx)(`button`,{type:`button`,className:`soft-button`,onClick:G,children:`مسح هذه الجلسة`})]})]}),(0,i.jsxs)(`div`,{children:[z&&(0,i.jsxs)(`div`,{className:`quota-card`,role:`status`,"aria-live":`polite`,children:[(0,i.jsx)(`strong`,{children:`الموجه مزدحم مؤقتًا.`}),(0,i.jsx)(`div`,{children:k.message||l}),(0,i.jsxs)(`span`,{className:`quota-timer`,children:[`يعود تقريبًا بعد: `,j.label||`قليل`]})]}),D&&(0,i.jsx)(`div`,{className:`error-card`,role:`alert`,"aria-live":`assertive`,children:D}),(0,i.jsxs)(`div`,{className:`messages-box`,"aria-live":`polite`,children:[(I?.messages||[]).map((e,t)=>(0,i.jsxs)(`div`,{className:`message ${e.role}`,children:[(0,i.jsx)(`span`,{className:`message-label`,children:e.role===`user`?`أنت`:`الموجه`}),(0,i.jsx)(`div`,{className:`message-bubble`,children:e.content})]},e.id||`${e.role}-${t}`)),T&&(0,i.jsxs)(`div`,{className:`message assistant`,children:[(0,i.jsx)(`span`,{className:`message-label`,children:`الموجه`}),(0,i.jsx)(`div`,{className:`message-bubble`,children:(0,i.jsxs)(`span`,{className:`typing`,children:[(0,i.jsx)(`i`,{}),(0,i.jsx)(`i`,{}),(0,i.jsx)(`i`,{})]})})]}),(0,i.jsx)(`div`,{ref:F})]})]}),(0,i.jsxs)(`form`,{className:`composer`,onSubmit:e=>{e.preventDefault(),K()},children:[(0,i.jsx)(`textarea`,{value:C,onChange:e=>w(e.target.value),placeholder:`مثال: كيف أبني وصفًا وظيفيًا احترافيًا لأي دور؟ أو: عندي دوران مرتفع في قسم محدد وأريد تشخيص السبب...`,disabled:T||z}),(0,i.jsxs)(`div`,{className:`composer-footer`,children:[(0,i.jsx)(`small`,{children:`محفوظ محليًا في هذا المتصفح. لا تدخل بيانات سرية أو أسماء أشخاص حقيقية داخل المحادثة.`}),(0,i.jsx)(`button`,{type:`submit`,className:`send-button`,disabled:T||z||!C.trim(),children:T?`يبني الرد...`:`إرسال للموجه`})]})]})]}),(0,i.jsxs)(`aside`,{className:`command-panel`,children:[(0,i.jsx)(`h2`,{children:`أرشيف المحادثات`}),(0,i.jsx)(`p`,{children:`ابحث في محادثاتك السابقة أو ارجع لأي جلسة محفوظة.`}),(0,i.jsx)(`input`,{className:`archive-search`,value:N,onChange:e=>P(e.target.value),placeholder:`ابحث بكلمة أو فكرة...`}),(0,i.jsx)(`div`,{className:`archive-list`,children:R.map(e=>(0,i.jsxs)(`button`,{type:`button`,className:`archive-item ${e.id===c?`active`:``}`,onClick:()=>h(e.id),children:[(0,i.jsx)(`strong`,{children:e.title||`جلسة بدون عنوان`}),(0,i.jsx)(`span`,{children:p(e.updatedAt)}),(0,i.jsxs)(`div`,{className:`archive-item-footer`,children:[(0,i.jsxs)(`span`,{children:[Math.max(0,(e.messages?.length||1)-1),` رسالة`]}),(0,i.jsx)(`button`,{type:`button`,className:`delete-mini`,onClick:t=>{t.stopPropagation(),W(e.id)},children:`حذف`})]})]},e.id))})]})]})]})]})}export{C as default};