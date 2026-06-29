import{b as e,p as t,y as n}from"./index-r2YaTxdB.js";var r=e(n(),1),i=t(),a=180,o=.019,s={outside:{title:`لست داخل مجال الموارد البشرية بعد`,shortTitle:`خارج المجال`,description:`هذه القراءة مناسبة لمن يريد فهم المجال أو الانتقال إليه دون افتراض أنه يملك خبرة مباشرة في الموارد البشرية.`,baseRange:{low:6e3,mid:7600,high:9500},defaultOutcome:`enter`},inside:{title:`داخل مجال الموارد البشرية أو قريب منه`,shortTitle:`داخل المجال`,description:`هذه القراءة مناسبة لمن يعمل في الموارد البشرية أو التدريب أو شؤون الموظفين أو أدوار قريبة من إدارة الناس.`,baseRange:{low:8500,mid:12500,high:17e3},defaultOutcome:`promotion`},leader:{title:`أعمل في قيادة أو إدارة وأريد فهم الناس والمنظمة كأداة قرار`,shortTitle:`قائد أو مدير`,description:`هذه القراءة مناسبة لمن لا يريد بالضرورة وظيفة موارد بشرية، بل يريد فهم الأداء والثقافة والهيكل والفرق لتحسين قراراته القيادية.`,baseRange:{low:12e3,mid:18e3,high:26e3},defaultOutcome:`leadership`},consultant:{title:`أمارس الاستشارات أو أريد بناء مسار استشاري`,shortTitle:`مسار استشاري`,description:`هذه القراءة مناسبة لمن يريد تحويل المعرفة إلى منهجية تشخيصية وتدخلات ومخرجات قابلة للبيع أو التأثير.`,baseRange:{low:1e4,mid:16e3,high:24e3},defaultOutcome:`consulting`}},c={outside:[{id:`explorer`,title:`مستكشف`,description:`لا تعرف المجال بعد وتريد بناء تصور واضح قبل اختيار المسار.`,factor:.78,score:8},{id:`career-switcher`,title:`منتقل مهنيا`,description:`تعمل في مجال آخر وتريد الدخول للموارد البشرية أو التطوير التنظيمي.`,factor:.88,score:12},{id:`first-job`,title:`باحث عن أول فرصة`,description:`تستهدف أول وظيفة أو تدريب مهني في المجال.`,factor:.94,score:15},{id:`competition-ready`,title:`جاهز للمنافسة`,description:`لديك معرفة أولية وتريد تقوية المقابلات والأدوات واللغة المهنية.`,factor:1,score:18}],inside:[{id:`coordinator`,title:`منسق أو مساعد`,description:`تتعامل مع أعمال تشغيلية وتريد فهم الصورة المهنية الأكبر.`,factor:.9,score:13},{id:`specialist`,title:`أخصائي`,description:`تمارس أدوارا محددة وتريد الانتقال من التنفيذ إلى التحليل المهني.`,factor:1,score:17},{id:`senior-specialist`,title:`أخصائي أول أو مشرف`,description:`تحتاج إلى ربط الممارسات بالنتائج والمؤشرات ومشكلات العمل.`,factor:1.12,score:21},{id:`business-partner`,title:`شريك أعمال أو مدير قسم`,description:`تحتاج إلى لغة أعمال وتحليل منظمة وتدخلات أكثر نضجا.`,factor:1.24,score:24},{id:`hr-leader`,title:`مدير موارد بشرية أو قائد وظيفة`,description:`تحتاج إلى قراءة استراتيجية للمنظمة والناس والقدرة المؤسسية.`,factor:1.38,score:27}],leader:[{id:`team-lead`,title:`قائد فريق`,description:`تدير مجموعة صغيرة وتحتاج إلى فهم السلوك والأداء والتغذية الراجعة.`,factor:.95,score:15},{id:`supervisor`,title:`مشرف تشغيلي`,description:`تحتاج إلى ربط الناس بالعملية والانضباط والتعلم اليومي.`,factor:1.04,score:18},{id:`department-manager`,title:`مدير قسم`,description:`تتعامل مع نتائج وفرق وتحتاج إلى قراءة أعمق للأدوار والثقافة.`,factor:1.16,score:22},{id:`director`,title:`مدير إدارة`,description:`تحتاج إلى فهم العلاقة بين الاستراتيجية والهيكل والقدرات.`,factor:1.3,score:25},{id:`executive`,title:`قائد تنفيذي`,description:`تحتاج إلى قراءة نظامية عالية تساعدك على قرارات أثرها واسع.`,factor:1.5,score:29}],consultant:[{id:`consulting-learner`,title:`متعلم استشاري`,description:`تريد تعلم لغة التشخيص وصناعة الفرضيات قبل تقديم الحلول.`,factor:.9,score:14},{id:`diagnostic-analyst`,title:`محلل أو باحث تشخيصي`,description:`تركز على جمع البيانات وتحليل الأنماط وبناء الاستنتاجات.`,factor:1.05,score:18},{id:`junior-consultant`,title:`مستشار مبتدئ`,description:`تحتاج إلى تحويل التحليل إلى توصيات ومخرجات قابلة للتطبيق.`,factor:1.15,score:22},{id:`practicing-consultant`,title:`مستشار ممارس`,description:`تحتاج إلى إدارة العلاقة الاستشارية والتدخل وقياس الأثر.`,factor:1.32,score:26},{id:`trusted-advisor`,title:`مستشار خبير أو شريك موثوق`,description:`تتعامل مع قضايا غامضة وسياسية واستراتيجية وتحتاج إلى نزاهة تشخيص عالية.`,factor:1.52,score:30}]},l={hr_general:{title:`الموارد البشرية العامة`,description:`سياسات، إجراءات، عمليات، وقرارات يومية مرتبطة بالموظفين.`,factor:.98,gap:`ترتيب الممارسات وربطها بأثر واضح.`},performance_rewards:{title:`الأداء والمكافآت`,description:`الأهداف، المحادثات، المساءلة، الحوافز، والعدالة الداخلية.`,factor:1.04,gap:`ربط القياس بالسلوك لا بالنماذج فقط.`},learning_development:{title:`التعلم والتطوير`,description:`تحليل الاحتياج، بناء البرامج، نقل أثر التعلم إلى العمل.`,factor:1.02,gap:`تحويل التدريب من حضور إلى أثر.`},employee_experience:{title:`تجربة الموظف والثقافة`,description:`الثقة، المناخ، الصمت التنظيمي، السلوك اليومي، ومعنى العمل.`,factor:1.03,gap:`قراءة الثقافة من السلوك لا من الشعارات.`},od:{title:`التطوير التنظيمي`,description:`تشخيص، تدخل، تغيير، قدرة مؤسسية، واستدامة.`,factor:1.08,gap:`بناء فرضيات نظامية قبل اقتراح الحل.`},structures_roles:{title:`الهياكل والأدوار والصلاحيات`,description:`تصميم العمل، حقوق القرار، التداخل، الحوكمة، والمسؤوليات.`,factor:1.06,gap:`توضيح من يقرر ومتى وكيف.`},leadership_teams:{title:`القيادة وإدارة الفرق`,description:`المساءلة، التعاون، الصراع، الأمان النفسي، وجودة القرار.`,factor:1.05,gap:`تحويل القيادة من نوايا إلى سلوك قابل للملاحظة.`},strategy_transformation:{title:`الاستراتيجية والتحول`,description:`المواءمة، المبادرات، التحول، القياس، وفقدان التركيز.`,factor:1.1,gap:`ربط المبادرات بالقدرة التنفيذية لا بالخطة فقط.`},discover:{title:`لا أعرف بعد، اقترح لي المسار الأنسب`,description:`قراءة استكشافية تساعدك على رؤية المسار الأقرب لك.`,factor:.97,gap:`تحديد العدسة الأنسب قبل التخصص.`}},u={enter:{title:`دخول المجال لأول مرة`,description:`هدفك بناء بوابة دخول واضحة للمجال.`,factor:.95},interview:{title:`رفع فرصي في المقابلات`,description:`هدفك بناء لغة مهنية وأمثلة عملية تقنع جهات التوظيف.`,factor:1},promotion:{title:`ترقية أو انتقال لدور أعلى`,description:`هدفك تحويل التعلم إلى جاهزية لدور أوسع ومسؤوليات أعلى.`,factor:1.06},salary:{title:`تحسين الراتب`,description:`هدفك قراءة موقعك من السوق وبناء مبررات مهنية للتحسن.`,factor:1.03},tools:{title:`بناء أدوات ونماذج عملية`,description:`هدفك الخروج بقوالب ومنتجات عمل يمكن استخدامها.`,factor:1.04},leadership:{title:`تحسين قراراتي كقائد`,description:`هدفك فهم الناس والمنظمة لاتخاذ قرارات أفضل.`,factor:1.08},consulting:{title:`بناء مسار استشاري`,description:`هدفك تحويل المعرفة إلى تشخيص وتوصية ومخرجات قابلة للبيع أو التأثير.`,factor:1.1},deep_understanding:{title:`فهم المنظمات بعمق`,description:`هدفك بناء عدسة مهنية تقرأ النظام خلف السلوك.`,factor:1.02}},d={conservative:{title:`جهة صغيرة أو بداية محافظة`,multiplier:.92,text:`قراءة حذرة تناسب البدايات أو الجهات ذات الميزانيات المحدودة.`},balanced:{title:`سوق متوازن`,multiplier:1,text:`قراءة وسطية محافظة تناسب أغلب الفرص المهنية.`},competitive:{title:`جهة كبرى أو سوق تنافسي`,multiplier:1.12,text:`قراءة أعلى قليلا، لكنها تظل مشروطة بجودة الخبرة والمقابلة والتطبيق.`}},f=[{value:1,title:`أقرأ فقط`,short:`استهلاك`,description:`تتعرف على المفاهيم دون تحويلها إلى ممارسة.`,multiplier:.62},{value:2,title:`أدون وألخص`,short:`تنظيم`,description:`تحول التعلم إلى ملاحظات ولغة مهنية مرتبة.`,multiplier:.76},{value:3,title:`أحلل حالات`,short:`تحليل`,description:`تستخدم المفاهيم في قراءة مواقف ومشكلات حقيقية.`,multiplier:.9},{value:4,title:`أبني نماذج عمل`,short:`إنتاج`,description:`تخرج من التعلم بقوالب وأدوات قابلة للاستخدام.`,multiplier:1},{value:5,title:`أطبق وأوثق الأثر`,short:`أثر`,description:`تربط التعلم بسلوك وقرار ونتيجة قابلة للقياس.`,multiplier:1.12}],p=[{name:`الهيئة العامة للإحصاء`,type:`المرجع الرسمي للإحصاءات في السعودية`,year:`2025 - 2026`,url:`https://www.stats.gov.sa`},{name:`نشرة سوق العمل من الهيئة العامة للإحصاء`,type:`مؤشرات العمل والأجور والبطالة`,year:`2025`,url:`https://www.stats.gov.sa/documents/d/guest/labor-market-statistics-q2-2025-en`},{name:`مؤشر أسعار المستهلك من الهيئة العامة للإحصاء`,type:`تضخم وقيمة حقيقية للدخل`,year:`2025`,url:`https://www.stats.gov.sa/en/w/news/116`},{name:`منصة البيانات السعودية`,type:`مؤشرات وطنية مساندة`,year:`2025 - 2026`,url:`https://datasaudi.sa`},{name:`وزارة الموارد البشرية والتنمية الاجتماعية`,type:`تنظيمات العمل والتوطين`,year:`2025 - 2026`,url:`https://hrsd.gov.sa`},{name:`منصة قوى`,type:`منصة رسمية للعقود والعمل والخدمات`,year:`2025 - 2026`,url:`https://www.qiwa.sa`},{name:`قرار احتساب السعودي في نطاقات`,type:`حد تنظيمي مرجعي لا يعبر وحده عن راتب السوق`,year:`مرجع تنظيمي`,url:`https://www.spa.gov.sa/2160616`},{name:`Cooper Fitch KSA Salary Guide`,type:`دليل رواتب السعودية`,year:`2026`,url:`https://cooperfitch.ae/2026-ksa-salary-guide/`},{name:`Cooper Fitch Saudi Arabia Salary Guide`,type:`منهجية وتعويضات وسوق السعودية`,year:`سنوي`,url:`https://cooperfitch.ae/salary-guides/kingdom-of-saudi-arabia/`},{name:`Hays Saudi Arabia Salary Guide`,type:`أكثر من 200 دور ومؤشرات توظيف`,year:`2026`,url:`https://www.hays.ae/salary-guide/saudi-arabia-salary-guide`},{name:`Robert Walters Saudi Arabia Salary Survey`,type:`استطلاع رواتب واتجاهات مهنية`,year:`2026`,url:`https://www.robertwalters.ae/our-services/saudi-arabia-salary-survey.html`},{name:`Mercer Total Remuneration Survey`,type:`تعويضات ومزايا ومقارنات سوقية`,year:`2025 - 2026`,url:`https://www.mercer.com/en-sa/insights/events/mercer-compensation-and-benefits-survey/`},{name:`Mercer Global Compensation Data`,type:`قاعدة بيانات عالمية للتعويضات والمزايا`,year:`2025 - 2026`,url:`https://www.mercer.com/en-sa/solutions/talent-and-rewards/rewards-strategy/global-compensation-and-benefits-data/`},{name:`Michael Page Saudi Arabia Jobs and Salary Guide`,type:`سوق التوظيف وروابط أدلة الرواتب`,year:`2026`,url:`https://www.michaelpage.ae/jobs/saudi-arabia`},{name:`CIPD Profession Map`,type:`مستويات الأثر المهني وتطور مهنة الناس`,year:`2025 - 2026`,url:`https://www.cipd.org/en/the-people-profession/the-profession-map/explore-the-profession-map/`},{name:`SHRM Certification`,type:`إطار كفاءات وممارسات الموارد البشرية`,year:`2025 - 2026`,url:`https://www.shrm.org/credentials/certification`}];function m(e){let t=Number(e||0);return new Intl.NumberFormat(`ar-SA`,{style:`currency`,currency:`SAR`,maximumFractionDigits:0}).format(Math.max(0,Math.round(t)))}function h(e){return new Intl.NumberFormat(`ar-SA`,{maximumFractionDigits:0}).format(Math.max(0,Math.round(Number(e||0))))}function g(e,t,n){let r=Number(e||0);return Number.isNaN(r)?t:Math.min(n,Math.max(t,r))}function _(e){let t=g(e,0,25);return t<1?{label:`بداية مهنية`,factor:.9,score:8,description:`خبرتك ما زالت في البداية، لذلك تقرأ الحاسبة النطاق بحذر أكبر.`}:t<3?{label:`خبرة ناشئة`,factor:.98,score:12,description:`لديك بداية خبرة تساعدك على فهم بيئة العمل، لكنها تحتاج إلى توثيق وتطبيق.`}:t<6?{label:`خبرة متوسطة`,factor:1.08,score:16,description:`خبرتك تساعدك على ربط التعلم بسياقات العمل ومشكلات المنظمات.`}:t<10?{label:`خبرة ناضجة`,factor:1.18,score:19,description:`لديك رصيد مهني يساعدك على تحويل التعلم إلى أحكام أعمق ومخرجات أقوى.`}:{label:`خبرة قيادية أو ممتدة`,factor:1.28,score:21,description:`خبرتك الكبيرة تجعل أثر التعلم أعلى عندما تربطه بالتشخيص والقيادة وصناعة القرار.`}}function v(e,t){return e<=0?{label:`راتب غير مدخل`,text:`ستقرأ النتيجة دون مقارنة راتب مباشرة. هذا مناسب للخريج أو من لا يريد مشاركة راتبه.`}:e<t.low?{label:`أقل من النطاق المحافظ`,text:`توجد فجوة بين وضعك الحالي والحد الأدنى المحافظ للنطاق المستهدف.`}:e<=t.high?{label:`داخل النطاق السوقي`,text:`أنت داخل النطاق المتوقع تقريبا، والعائد يعتمد على انتقالك داخل النطاق لا مجرد دخوله.`}:{label:`أعلى من النطاق المحافظ`,text:`راتبك الحالي أعلى من النطاق المحافظ، لذلك لا يصح تقديم النتيجة كزيادة مباشرة.`}}function y(e){return e<30?`تقدمك الحالي يعطي لمحة تأسيسية، لكنه لا يكفي وحده لصناعة نقلة مهنية واضحة.`:e<90?`تقدمك جيد كبداية، لكنه يحتاج استمرار حتى يظهر أثر أقوى في اللغة المهنية والحكم الاستشاري.`:e<180?`أنت في منطقة جدية. الاقتراب من إتمام الرحلة يزيد موثوقية الأثر المهني المتوقع.`:`أكملت عامل الالتزام الكامل. هذه أعلى جاهزية تعليمية داخل الحاسبة.`}function ee(e){return e>=86?`جاهزية عالية`:e>=70?`جاهزية قوية`:e>=54?`جاهزية نامية`:e>=36?`جاهزية أولية`:`جاهزية محدودة`}function b(e,t,n,r){return e<36?`ابدأ بتثبيت الأساس: أكمل أول شهر، واكتب ملخصا عمليا بعد كل درس، ولا تتعجل مقارنة نفسك بالسوق.`:e<54?`انتقل من القراءة إلى التحليل: اختر حالة من المحاكاة يوميا، واكتب فرضية وبيانات وتدخل ومؤشر أثر.`:e<70?`ابن ملفا مهنيا صغيرا: وصف وظيفي، نموذج تشخيص، مصفوفة صلاحيات، ومؤشر قياس أثر.`:t===`outside`&&n===`enter`?`جهز قصة دخولك للمجال: لماذا هذا المسار؟ ما الذي تعلمته؟ وما أول دور تستهدفه؟`:t===`consultant`||n===`consulting`?`ابن محفظة استشارية صغيرة: حالة تشخيص، خريطة أصحاب مصلحة، توصية، ومؤشر أثر.`:r===`od`||r===`structures_roles`?`وثق أداة واحدة قابلة للاستخدام: نموذج تشخيص، مصفوفة أدوار، أو خريطة تدخل تنظيمي.`:`ركز الآن على السيرة المهنية، أمثلة المقابلات، وتوثيق تطبيقات صغيرة تثبت فهمك.`}function x(e){return(c[e]||c.outside)[0]?.id||``}function S(e,t){let n=c[e]||c.outside;return n.find(e=>e.id===t)||n[0]}function C({completedDays:e=0,totalDays:t=a}){let n=Math.max(1,Number(t||a)),C=g(e,0,n),[w,T]=(0,r.useState)(`inside`),[E,D]=(0,r.useState)(x(`inside`)),[O,k]=(0,r.useState)(`od`),[A,j]=(0,r.useState)(`promotion`),[M,N]=(0,r.useState)(2),[P,F]=(0,r.useState)(8e3),[I,L]=(0,r.useState)(3),[R,z]=(0,r.useState)(`balanced`),[B,V]=(0,r.useState)(!0),[H,U]=(0,r.useState)(C||30),[W,G]=(0,r.useState)(!1),K=s[w],q=S(w,E),J=l[O],Y=u[A],X=d[R],Z=f.find(e=>e.value===Number(I))||f[2],Q=B?C:g(H,1,n);function te(e){T(e),D(x(e));let t=s[e]?.defaultOutcome;t&&u[t]&&j(t)}let $=(0,r.useMemo)(()=>{let e=g(Q/n,0,1),t=_(M),r=K.baseRange,i=.74+e*.26,a=1.019,o=t.factor*q.factor*J.factor*Y.factor*Z.multiplier*X.multiplier,s=r.low*o*i,c=r.mid*o*(.8+e*.2),l=r.high*o*(.82+e*.18),u=s/a,d=c/a,f=l/a,p=Number(P||0),m=Math.max(0,u-p),h=`direct`;(w===`outside`||w===`leader`)&&p>u&&(h=`non-direct`,m=0);let x=v(p,{low:u,mid:d,high:f}),S=e*34,C=t.score,T=Math.min(22,q.score),E=Number(I)/5*18,D=p<=f?5:3,k=Math.round(g(S+C+T+E+D,0,100));return{progressFactor:e,readinessPercent:Math.round(e*100),readinessScore:k,readinessLabel:ee(k),nextMove:b(k,w,A,O),experienceStage:t,nominalLow:s,nominalMid:c,nominalHigh:l,realLow:u,realMid:d,realHigh:f,monthlyOpportunity:m,annualOpportunity:m*12,valueMode:h,position:x,commitmentMessage:y(Q)}},[Z,q,J,X,Y,K,I,P,Q,O,A,w,n,M]),ne=`${q.title} · ${J.title}`;return(0,i.jsxs)(`section`,{className:`roi-page`,dir:`rtl`,children:[(0,i.jsx)(`style`,{children:`
        .roi-page {
          min-height: 100vh;
          padding: 34px 16px 70px;
          color: #18102e;
          background:
            radial-gradient(circle at 10% 10%, rgba(139, 92, 246,.12), transparent 30%),
            radial-gradient(circle at 94% 14%, rgba(245,158,11,.13), transparent 28%),
            radial-gradient(circle at 48% 96%, rgba(16,185,129,.10), transparent 34%),
            linear-gradient(135deg, #f4f0fb 0%, #efe9fb 54%, #fff7ed 100%);
        }

        .roi-wrap {
          width: min(1200px, 100%);
          margin: 0 auto;
        }

        .roi-hero {
          position: relative;
          overflow: hidden;
          border-radius: 42px;
          padding: 34px;
          color: white;
          background:
            radial-gradient(circle at 15% 18%, rgba(129,140,248,.26), transparent 32%),
            radial-gradient(circle at 85% 15%, rgba(245,158,11,.17), transparent 30%),
            linear-gradient(135deg, #18102e, #1e1b4b 58%, #3b1d6e);
          box-shadow: 0 26px 80px rgba(28, 17, 48, 0.20);
        }

        .roi-hero::before {
          content: "";
          position: absolute;
          inset: -60px;
          opacity: .30;
          background-image:
            linear-gradient(rgba(255,255,255,.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.07) 1px, transparent 1px);
          background-size: 48px 48px;
          transform: rotate(-8deg);
        }

        .roi-hero-inner {
          position: relative;
          z-index: 1;
          display: grid;
          grid-template-columns: 1.12fr .88fr;
          gap: 24px;
          align-items: center;
        }

        .roi-kicker {
          display: inline-flex;
          padding: 8px 13px;
          border-radius: 999px;
          color: #fde68a;
          background: rgba(255, 255, 255, .11);
          border: 1px solid rgba(255, 255, 255, .16);
          font-size: 12px;
          font-weight: 950;
        }

        .roi-hero h1 {
          margin: 16px 0 12px;
          font-size: clamp(34px, 5vw, 64px);
          line-height: 1.16;
          font-weight: 950;
          letter-spacing: -1.1px;
          padding-top: 4px;
          overflow: visible;
        }

        .roi-hero h1 span {
          display: block;
          color: transparent;
          background: linear-gradient(90deg, #fff, #c3b5e8, #fde68a);
          -webkit-background-clip: text;
          background-clip: text;
          padding-top: 3px;
        }

        .roi-hero p {
          margin: 0;
          max-width: 780px;
          color: rgba(196, 181, 253,.9);
          font-size: 15px;
          line-height: 2.05;
          font-weight: 750;
        }

        .roi-orbit {
          display: grid;
          place-items: center;
          min-height: 310px;
        }

        .roi-orbit-card {
          position: relative;
          width: min(300px, 100%);
          aspect-ratio: 1;
          border-radius: 999px;
          display: grid;
          place-items: center;
          background:
            conic-gradient(#10b981 ${$.readinessScore*3.6}deg, rgba(255,255,255,.13) 0deg);
          box-shadow:
            inset 0 0 0 15px rgba(28, 17, 48,.42),
            0 24px 70px rgba(0,0,0,.20);
        }

        .roi-orbit-inner {
          width: 205px;
          height: 205px;
          border-radius: 999px;
          display: grid;
          place-items: center;
          text-align: center;
          background: #18102e;
          border: 1px solid rgba(255,255,255,.14);
          padding: 18px;
        }

        .roi-orbit-inner span {
          color: #9d8fc0;
          font-size: 12px;
          font-weight: 900;
        }

        .roi-orbit-inner strong {
          display: block;
          color: #fff;
          font-size: 48px;
          line-height: 1;
          font-weight: 950;
          margin: 8px 0;
        }

        .roi-orbit-inner b {
          color: #fde68a;
          font-size: 13px;
          font-weight: 950;
        }

        .roi-grid {
          display: grid;
          grid-template-columns: .95fr 1.05fr;
          gap: 18px;
          margin-top: 18px;
        }

        .roi-panel {
          border-radius: 32px;
          padding: 24px;
          background: rgba(255,255,255,.88);
          border: 1px solid rgba(255,255,255,.92);
          box-shadow: 0 22px 60px rgba(28, 17, 48,.08);
          backdrop-filter: blur(18px);
        }

        .roi-panel h2 {
          margin: 0 0 8px;
          color: #18102e;
          font-size: 26px;
          font-weight: 950;
          line-height: 1.35;
        }

        .roi-panel > p {
          margin: 0 0 18px;
          color: #7a6c9a;
          line-height: 1.9;
          font-size: 13px;
          font-weight: 750;
        }

        .roi-field {
          margin-bottom: 16px;
        }

        .roi-field label {
          display: block;
          margin-bottom: 8px;
          color: #463c63;
          font-size: 13px;
          font-weight: 950;
        }

        .roi-field select,
        .roi-field input[type="number"] {
          width: 100%;
          min-height: 48px;
          border-radius: 18px;
          border: 1px solid #c9bdf0;
          background: #fff;
          color: #18102e;
          padding: 0 14px;
          font-family: inherit;
          font-size: 14px;
          font-weight: 850;
          outline: none;
        }

        .roi-field select:focus,
        .roi-field input[type="number"]:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246,.09);
        }

        .roi-range {
          width: 100%;
          accent-color: #8b5cf6;
        }

        .roi-switch {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          padding: 7px;
          border-radius: 22px;
          background: #efe9fb;
          margin-bottom: 16px;
        }

        .roi-switch button {
          border: 0;
          cursor: pointer;
          border-radius: 16px;
          min-height: 42px;
          padding: 10px 12px;
          color: #5b4f78;
          background: transparent;
          font-family: inherit;
          font-weight: 950;
        }

        .roi-switch button.active {
          color: white;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          box-shadow: 0 12px 28px rgba(139, 92, 246,.20);
        }

        .application-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 8px;
          margin-top: 8px;
        }

        .application-pill {
          border: 1px solid rgba(167, 139, 250,.22);
          border-radius: 16px;
          padding: 10px 8px;
          background: #fff;
          color: #463c63;
          cursor: pointer;
          font-family: inherit;
          font-size: 11px;
          font-weight: 950;
          line-height: 1.5;
          min-height: 58px;
        }

        .application-pill.active {
          color: white;
          background: linear-gradient(135deg, #8b5cf6, #3b1d6e);
          border-color: transparent;
        }

        .roi-result-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .roi-result-card {
          position: relative;
          overflow: hidden;
          border-radius: 24px;
          padding: 18px;
          background: #fff;
          border: 1px solid rgba(167, 139, 250,.20);
          box-shadow: 0 14px 38px rgba(28, 17, 48,.06);
        }

        .roi-result-card::before {
          content: "";
          position: absolute;
          top: -70px;
          right: -70px;
          width: 150px;
          height: 150px;
          border-radius: 999px;
          background: rgba(139, 92, 246,.10);
        }

        .roi-result-card.gold::before {
          background: rgba(245,158,11,.15);
        }

        .roi-result-card.green::before {
          background: rgba(16,185,129,.14);
        }

        .roi-result-card.red::before {
          background: rgba(244,63,94,.13);
        }

        .roi-result-card span {
          position: relative;
          z-index: 1;
          display: block;
          color: #7a6c9a;
          font-size: 12px;
          font-weight: 950;
          margin-bottom: 9px;
        }

        .roi-result-card strong {
          position: relative;
          z-index: 1;
          display: block;
          color: #18102e;
          font-size: 21px;
          line-height: 1.35;
          font-weight: 950;
        }

        .roi-result-card p {
          position: relative;
          z-index: 1;
          margin: 9px 0 0;
          color: #7a6c9a;
          font-size: 12px;
          line-height: 1.85;
          font-weight: 750;
        }

        .value-map {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-top: 14px;
        }

        .value-step {
          border-radius: 22px;
          padding: 15px;
          background: #f4f0fb;
          border: 1px solid rgba(167, 139, 250,.20);
        }

        .value-step b {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          color: white;
          background: #8b5cf6;
          margin-bottom: 8px;
          font-size: 11px;
          line-height: 1;
        }

        .value-step strong {
          display: block;
          color: #18102e;
          font-size: 13px;
          font-weight: 950;
          line-height: 1.6;
        }

        .value-step span {
          display: block;
          margin-top: 5px;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.75;
          font-weight: 750;
        }

        .roi-reading {
          margin-top: 14px;
          border-radius: 26px;
          padding: 18px;
          color: #281748;
          background:
            radial-gradient(circle at 100% 0%, rgba(139, 92, 246,.10), transparent 34%),
            #ffffff;
          border: 1px solid rgba(167, 139, 250,.22);
        }

        .roi-reading h3 {
          margin: 0 0 10px;
          color: #18102e;
          font-size: 19px;
          font-weight: 950;
        }

        .roi-reading p {
          margin: 0;
          color: #5b4f78;
          line-height: 2;
          font-size: 13px;
          font-weight: 800;
        }

        .roi-sources {
          margin-top: 18px;
        }

        .roi-sources-toggle {
          display: flex;
          justify-content: center;
          margin-top: 14px;
        }

        .roi-sources-toggle button {
          border: 0;
          cursor: pointer;
          border-radius: 18px;
          padding: 12px 16px;
          color: #fff;
          background: #18102e;
          font-family: inherit;
          font-size: 12px;
          font-weight: 950;
        }

        .roi-sources-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          margin-top: 14px;
        }

        .roi-source {
          text-decoration: none;
          border-radius: 20px;
          padding: 13px;
          background: rgba(255,255,255,.82);
          border: 1px solid rgba(167, 139, 250,.22);
          color: #18102e;
          transition: .2s ease;
        }

        .roi-source:hover {
          transform: translateY(-2px);
          box-shadow: 0 16px 36px rgba(28, 17, 48,.08);
        }

        .roi-source strong {
          display: block;
          font-size: 12px;
          line-height: 1.6;
          font-weight: 950;
        }

        .roi-source span {
          display: block;
          margin-top: 5px;
          color: #7a6c9a;
          font-size: 11px;
          line-height: 1.6;
          font-weight: 750;
        }

        .roi-source small {
          display: inline-flex;
          margin-top: 8px;
          padding: 4px 8px;
          border-radius: 999px;
          color: #6d28d9;
          background: #efe9fb;
          font-size: 10px;
          font-weight: 950;
        }

        .roi-disclaimer {
          margin-top: 16px;
          border-radius: 24px;
          padding: 16px;
          background: #fffbeb;
          border: 1px solid #fde68a;
          color: #78350f;
          font-size: 12px;
          line-height: 1.95;
          font-weight: 850;
        }

        @media (max-width: 980px) {
          .roi-hero-inner,
          .roi-grid,
          .roi-result-grid,
          .roi-sources-grid,
          .value-map {
            grid-template-columns: 1fr;
          }

          .application-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 560px) {
          .roi-page {
            padding: 18px 10px 46px;
          }

          .roi-hero,
          .roi-panel {
            border-radius: 26px;
            padding: 20px;
          }

          .roi-switch {
            grid-template-columns: 1fr;
          }

          .roi-orbit-card {
            width: 240px;
          }

          .roi-orbit-inner {
            width: 165px;
            height: 165px;
          }
        }
      `}),(0,i.jsxs)(`div`,{className:`roi-wrap`,children:[(0,i.jsx)(`header`,{className:`roi-hero`,children:(0,i.jsxs)(`div`,{className:`roi-hero-inner`,children:[(0,i.jsxs)(`div`,{children:[(0,i.jsx)(`span`,{className:`roi-kicker`,children:`حاسبة العائد من التعلم`}),(0,i.jsxs)(`h1`,{children:[`التعلم مجاني`,(0,i.jsx)(`span`,{children:`لكن قيمته المهنية تقرأ بذكاء`})]}),(0,i.jsx)(`p`,{children:`تبدأ الحاسبة من علاقتك بمجال الموارد البشرية والتطوير التنظيمي، ثم تقرأ مستواك وعدستك وهدفك وتقدمك الفعلي لتنتج قراءة مهنية محافظة، لا وعدا وظيفيا.`})]}),(0,i.jsx)(`div`,{className:`roi-orbit`,"aria-label":`مؤشر الجاهزية المهنية`,children:(0,i.jsx)(`div`,{className:`roi-orbit-card od-circular-indicator od-indicator-readiness`,style:{"--roi-readiness-deg":`${$.readinessScore*3.6}deg`,"--od-indicator-progress":`${$.readinessScore}%`},children:(0,i.jsxs)(`div`,{className:`roi-orbit-inner`,children:[(0,i.jsx)(`span`,{children:`مؤشر الجاهزية`}),(0,i.jsxs)(`strong`,{children:[$.readinessScore,`%`]}),(0,i.jsx)(`b`,{children:$.readinessLabel})]})})})]})}),(0,i.jsxs)(`div`,{className:`roi-grid`,children:[(0,i.jsxs)(`aside`,{className:`roi-panel`,children:[(0,i.jsx)(`h2`,{children:`مدخلات القراءة`}),(0,i.jsx)(`p`,{children:`اختر علاقتك بالمجال أولا، ثم سيظهر مستوى مناسب لهذه العلاقة بدون تكرار أو خلط بين المسارات.`}),(0,i.jsxs)(`div`,{className:`roi-field`,children:[(0,i.jsx)(`label`,{children:`أولا: أين تقف من مجال الموارد البشرية والتطوير التنظيمي؟`}),(0,i.jsx)(`select`,{value:w,onChange:e=>te(e.target.value),children:Object.entries(s).map(([e,t])=>(0,i.jsx)(`option`,{value:e,children:t.title},e))})]}),(0,i.jsxs)(`div`,{className:`roi-field`,children:[(0,i.jsx)(`label`,{children:`ثانيا: ما المستوى الأقرب لوضعك الحالي؟`}),(0,i.jsx)(`select`,{value:E,onChange:e=>D(e.target.value),children:(c[w]||[]).map(e=>(0,i.jsx)(`option`,{value:e.id,children:e.title},e.id))})]}),(0,i.jsxs)(`div`,{className:`roi-field`,children:[(0,i.jsx)(`label`,{children:`ثالثا: ما العدسة التي تريد تقويتها؟`}),(0,i.jsx)(`select`,{value:O,onChange:e=>k(e.target.value),children:Object.entries(l).map(([e,t])=>(0,i.jsx)(`option`,{value:e,children:t.title},e))})]}),(0,i.jsxs)(`div`,{className:`roi-field`,children:[(0,i.jsx)(`label`,{children:`رابعا: ما العائد الذي تبحث عنه من هذه الرحلة؟`}),(0,i.jsx)(`select`,{value:A,onChange:e=>j(e.target.value),children:Object.entries(u).map(([e,t])=>(0,i.jsx)(`option`,{value:e,children:t.title},e))})]}),(0,i.jsxs)(`div`,{className:`roi-field`,children:[(0,i.jsx)(`label`,{children:`سنوات الخبرة العملية`}),(0,i.jsx)(`input`,{type:`number`,min:`0`,max:`25`,value:M,onChange:e=>N(Number(e.target.value))})]}),(0,i.jsxs)(`div`,{className:`roi-field`,children:[(0,i.jsx)(`label`,{children:`راتبك الشهري الحالي - اختياري`}),(0,i.jsx)(`input`,{type:`number`,min:`0`,max:`50000`,value:P,onChange:e=>F(Number(e.target.value))})]}),(0,i.jsxs)(`div`,{className:`roi-field`,children:[(0,i.jsx)(`label`,{children:`بيئة السوق المستهدفة`}),(0,i.jsx)(`select`,{value:R,onChange:e=>z(e.target.value),children:Object.entries(d).map(([e,t])=>(0,i.jsx)(`option`,{value:e,children:t.title},e))})]}),(0,i.jsxs)(`div`,{className:`roi-field`,children:[(0,i.jsx)(`label`,{children:`كيف تطبق ما تتعلمه؟`}),(0,i.jsx)(`div`,{className:`application-grid`,children:f.map(e=>(0,i.jsx)(`button`,{type:`button`,className:`application-pill ${e.value===Number(I)?`active`:``}`,onClick:()=>L(e.value),title:e.description,children:e.short},e.value))})]}),(0,i.jsxs)(`div`,{className:`roi-switch`,"aria-label":`مصدر عامل الالتزام`,children:[(0,i.jsx)(`button`,{type:`button`,className:B?`active`:``,onClick:()=>V(!0),children:`تقدمي الفعلي`}),(0,i.jsx)(`button`,{type:`button`,className:B?``:`active`,onClick:()=>V(!1),children:`سيناريو افتراضي`})]}),!B&&(0,i.jsxs)(`div`,{className:`roi-field`,children:[(0,i.jsxs)(`label`,{children:[`أيام الالتزام الافتراضية: `,h(Q),` يوم`]}),(0,i.jsx)(`input`,{className:`roi-range`,type:`range`,min:`1`,max:n,value:H,onChange:e=>U(Number(e.target.value))})]}),(0,i.jsxs)(`div`,{className:`roi-reading`,children:[(0,i.jsx)(`h3`,{children:K.shortTitle}),(0,i.jsx)(`p`,{children:K.description})]})]}),(0,i.jsxs)(`main`,{className:`roi-panel`,children:[(0,i.jsx)(`h2`,{children:`قراءة النتيجة`}),(0,i.jsxs)(`p`,{children:[`القراءة محافظة، وتستخدم تضخما افتراضيا قدره`,` `,(o*100).toFixed(1),`% لعرض القيمة الحقيقية.`]}),(0,i.jsxs)(`div`,{className:`roi-result-grid`,children:[(0,i.jsxs)(`div`,{className:`roi-result-card`,children:[(0,i.jsx)(`span`,{children:`تموضعك المهني`}),(0,i.jsx)(`strong`,{children:ne}),(0,i.jsx)(`p`,{children:q.description})]}),(0,i.jsxs)(`div`,{className:`roi-result-card gold`,children:[(0,i.jsx)(`span`,{children:`فجوة التعلم الأقرب`}),(0,i.jsx)(`strong`,{children:J.gap}),(0,i.jsx)(`p`,{children:J.description})]}),(0,i.jsxs)(`div`,{className:`roi-result-card green`,children:[(0,i.jsx)(`span`,{children:`النطاق الحقيقي المحافظ`}),(0,i.jsxs)(`strong`,{children:[m($.realLow),` - `,m($.realHigh)]}),(0,i.jsx)(`p`,{children:`نطاق تقديري بعد أثر التضخم، وليس ضمانا للدخل.`})]}),(0,i.jsxs)(`div`,{className:`roi-result-card`,children:[(0,i.jsx)(`span`,{children:`موقعك الحالي من النطاق`}),(0,i.jsx)(`strong`,{children:$.position.label}),(0,i.jsx)(`p`,{children:$.position.text})]}),(0,i.jsxs)(`div`,{className:`roi-result-card green`,children:[(0,i.jsx)(`span`,{children:`فرصة التحسن الشهرية المحافظة`}),(0,i.jsx)(`strong`,{children:m($.monthlyOpportunity)}),(0,i.jsx)(`p`,{children:`تظهر عندما يكون الراتب الحالي أقل من الحد المحافظ للنطاق.`})]}),(0,i.jsxs)(`div`,{className:`roi-result-card red`,children:[(0,i.jsx)(`span`,{children:`قيمة التعلم المجاني`}),(0,i.jsx)(`strong`,{children:$.annualOpportunity>0?m($.annualOpportunity):`قيمة غير مالية مباشرة`}),(0,i.jsx)(`p`,{children:`القيمة قد تكون مالية، أو مهنية مثل تقليل التخبط ورفع الجاهزية.`})]})]}),(0,i.jsxs)(`div`,{className:`roi-reading`,children:[(0,i.jsx)(`h3`,{children:`التفسير المهني`}),(0,i.jsx)(`p`,{children:$.valueMode===`non-direct`?`لأن وضعك الحالي لا يقرأ كزيادة راتب مباشرة، فالقيمة هنا تظهر في وضوح المسار، ونضج الحكم المهني، وتقليل التخبط، وبناء لغة ومخرجات قابلة للاستخدام.`:`${Y.description} ${X.text}`})]}),(0,i.jsxs)(`div`,{className:`roi-reading`,children:[(0,i.jsx)(`h3`,{children:`حركة واحدة ترفع نتيجتك`}),(0,i.jsx)(`p`,{children:$.nextMove})]}),(0,i.jsxs)(`div`,{className:`roi-reading`,children:[(0,i.jsx)(`h3`,{children:`خريطة القيمة`}),(0,i.jsxs)(`div`,{className:`value-map`,children:[(0,i.jsxs)(`div`,{className:`value-step`,children:[(0,i.jsx)(`b`,{children:`01`}),(0,i.jsx)(`strong`,{children:`علاقة بالمجال`}),(0,i.jsx)(`span`,{children:K.shortTitle})]}),(0,i.jsxs)(`div`,{className:`value-step`,children:[(0,i.jsx)(`b`,{children:`02`}),(0,i.jsx)(`strong`,{children:`مستوى مهني`}),(0,i.jsx)(`span`,{children:q.title})]}),(0,i.jsxs)(`div`,{className:`value-step`,children:[(0,i.jsx)(`b`,{children:`03`}),(0,i.jsx)(`strong`,{children:`عدسة التعلم`}),(0,i.jsx)(`span`,{children:J.title})]}),(0,i.jsxs)(`div`,{className:`value-step`,children:[(0,i.jsx)(`b`,{children:`04`}),(0,i.jsx)(`strong`,{children:`تقدم فعلي`}),(0,i.jsxs)(`span`,{children:[h(Q),` من `,h(n),` يوم`]})]})]})]})]})]}),(0,i.jsxs)(`section`,{className:`roi-panel roi-sources`,children:[(0,i.jsx)(`h2`,{children:`منهجية الحاسبة ومصادر البيانات`}),(0,i.jsx)(`p`,{children:`هذه المصادر لا تعني أن الأرقام وعد نهائي، لكنها تجعل القراءة أقرب إلى السوق وأكثر تحفظا. آخر تحديث منهجي مستهدف: 2025 - 2026.`}),(0,i.jsx)(`div`,{className:`roi-sources-toggle`,children:(0,i.jsx)(`button`,{type:`button`,onClick:()=>G(e=>!e),children:W?`إخفاء المراجع`:`عرض المراجع الموسعة`})}),W&&(0,i.jsx)(`div`,{className:`roi-sources-grid`,children:p.map(e=>(0,i.jsxs)(`a`,{className:`roi-source`,href:e.url,target:`_blank`,rel:`noreferrer`,children:[(0,i.jsx)(`strong`,{children:e.name}),(0,i.jsx)(`span`,{children:e.type}),(0,i.jsx)(`small`,{children:e.year})]},e.name))}),(0,i.jsx)(`div`,{className:`roi-disclaimer`,children:`تنويه: هذه الحاسبة أداة تقديرية محافظة، ولا تمثل وعدا وظيفيا أو ضمانا للدخل. النتائج الفعلية تتأثر بتوفيق الله، ثم المدينة، نوع الجهة، سنوات الخبرة، جودة السيرة الذاتية، المقابلات، مستوى التطبيق، والظروف السوقية وقت التقديم.`})]})]})]})}export{C as default};