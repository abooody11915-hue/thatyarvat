import { useState, useCallback, useEffect } from "react";

// ====== Supabase Config ======
const SUPABASE_URL = "https://ecewlmuozqvxmehnrpov.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVjZXdsbXVvenF2eG1laG5ycG92Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA4OTEwMDcsImV4cCI6MjA5NjQ2NzAwN30.bXtM1vZDFSR_dTYaXxvW3-lRAlqu0qD0ar9HgFjfGfM";
const BUCKET = "Arfat";

const HEADERS = {
  "Authorization": `Bearer ${SUPABASE_KEY}`,
  "apikey": SUPABASE_KEY,
};

const sb = {
  async upload(path, file) {
    try {
      const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(path)}`;
      console.log("Uploading to:", url);
      console.log("File:", file.name, file.size, file.type);
      const res = await fetch(url, {
        method: "POST",
        headers: { ...HEADERS, "x-upsert": "true", "Content-Type": file.type || "application/octet-stream" },
        body: file,
      });
      const text = await res.text();
      console.log("Upload status:", res.status, "response:", text);
      if (!res.ok) {
        // جرب PUT بدل POST
        const res2 = await fetch(url, {
          method: "PUT",
          headers: { ...HEADERS, "x-upsert": "true", "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        const text2 = await res2.text();
        console.log("PUT status:", res2.status, "response:", text2);
        return res2.ok ? { path } : null;
      }
      return { path };
    } catch(e) { console.error("upload error:", e); return null; }
  },
  async remove(path) {
    try {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${encodeURIComponent(path)}`, {
        method: "DELETE",
        headers: HEADERS,
      });
      return res.ok;
    } catch(e) { return false; }
  },
  publicUrl(path) {
    return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
  },
  async list(prefix) {
    try {
      const res = await fetch(`${SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
        method: "POST",
        headers: { ...HEADERS, "Content-Type": "application/json" },
        body: JSON.stringify({ prefix: prefix || "", limit: 1000, sortBy: { column: "created_at", order: "desc" } }),
      });
      const data = await res.json().catch(() => []);
      console.log("list response:", res.status, data?.length, "items");
      return Array.isArray(data) ? data : [];
    } catch(e) { console.error("list error:", e); return []; }
  },
};


const LEVEL_COLOR = {
  "تميز":   { bg: "#dcfce7", text: "#15803d", border: "#86efac" },
  "تقدم":   { bg: "#dbeafe", text: "#1d4ed8", border: "#93c5fd" },
  "انطلاق": { bg: "#fef3c7", text: "#b45309", border: "#fcd34d" },
  "تهيئة":  { bg: "#fee2e2", text: "#b91c1c", border: "#fca5a5" },
};

const DOMAINS = [
  {
    id:"admin", num:"1", name:"الإدارة المدرسية", icon:"🏫", color:"#1a4b8c", light:"#e8f0fb",
    indicators:[
      {id:"1-1-1-1",name:"تضع المدرسة خطة تشغيلية شاملة وفق أهداف تطويرية محددة",pct:73.50,level:"انطلاق",reason:"الخطة تفتقر لمبادرات نوعية وأهداف طموحة ومؤشرات أداء مزمّنة واضحة",doc:"الخطة التشغيلية موقّعة ومعتمدة"},
      {id:"1-1-1-2",name:"تتابع المدرسة تنفيذ خطتها التشغيلية وتطورها بما يضمن تحقيق أهدافها",pct:51.75,level:"انطلاق",reason:"غياب أساليب متابعة منتظمة ومتنوعة وفق مؤشرات أداء محددة",doc:"تقارير متابعة تنفيذ الخطة التشغيلية دورياً"},
      {id:"1-2-1-1",name:"تعزز المدرسة القيم الإسلامية والهوية الوطنية",pct:69.75,level:"انطلاق",reason:"الأنشطة والبرامج غير متنوعة وغير مبتكرة بما يكفي",doc:"خطة التوجيه الطلابي + تقارير برامج القيم والهوية الوطنية"},
      {id:"1-2-1-2",name:"تطبق المدرسة قيم مهنة التعليم وأخلاقياتها وتتابع الالتزام بها",pct:85.25,level:"تقدم",reason:"يحتاج تعزيز التوعية بأخلاقيات المهنة بأساليب مبتكرة",doc:"وثيقة توزيع المهام + سجل متابعة الالتزام بأخلاقيات المهنة"},
      {id:"1-2-1-3",name:"تطبق المدرسة إجراءات محددة لدعم الانضباط المدرسي وتتابع الالتزام بها",pct:82.75,level:"تقدم",reason:"يحتاج تنويع أساليب المتابعة وتحديد توقعات سلوك المتعلمين",doc:"خطة التوجيه + سجل المخالفات السلوكية والغياب"},
      {id:"1-2-1-4",name:"تنفذ المدرسة برامج وأنشطة تربوية داعمة للسلوك الإيجابي لدى المتعلمين ومنهم ذوو الإعاقة والموهوبون وتتابعها",pct:54.50,level:"انطلاق",reason:"البرامج غير مرتبطة بتشخيص المشكلات السلوكية ولا تُقوَّم بانتظام",doc:"خطة التوجيه + تقارير البرامج الوقائية والعلاجية للسلوك"},
      {id:"1-2-1-5",name:"تنفذ المدرسة برامج وأنشطة إثرائية لتطوير مواهب المتعلمين وتهيئهم للمستقبل وتتابعها",pct:49.75,level:"تهيئة",reason:"لا توجد آليات كشف عن المواهب ولا أنشطة إثرائية مبنية على تقويم القدرات",doc:"خطة الأنشطة الإثرائية + تقارير المسابقات والمواهب"},
      {id:"1-3-1-1",name:"تعزز المدرسة بناء العلاقات الإيجابية والتعاون في المجتمع المدرسي",pct:74.75,level:"انطلاق",reason:"المهام التعاونية غير متنوعة ولا تُتابع باستدامة",doc:"خطة التعاون المدرسي + محاضر الاجتماعات الداخلية"},
      {id:"1-3-1-2",name:"تعزز المدرسة مشاركة الأسرة في تعلم أبنائهم والتحضير لمستقبلهم",pct:69.50,level:"انطلاق",reason:"قنوات التواصل مع الأسرة غير متنوعة ولا تُشرك الأسرة في تقويم الخدمات",doc:"خطة مشاركة الأسرة + تقارير مجالس أولياء الأمور"},
      {id:"1-3-1-3",name:"تعزز المدرسة الشراكة المجتمعية لدعم التعلم والتأثير الإيجابي في المجتمع",pct:55.00,level:"انطلاق",reason:"الشراكات المجتمعية محدودة ولا تستثمر إمكانات المؤسسات الوطنية",doc:"وثائق الشراكات المجتمعية + تقارير الفعاليات التوعوية"},
      {id:"1-4-1-1",name:"توفر المدرسة كادرًا تعليميًّا مكتملاً ومؤهلاً بما يتسق مع المهام الموكلة له",doc:"كشوف الكادر التعليمي + مؤهلاتهم ومهامهم الموكلة"},
      {id:"1-4-1-2",name:"توفر المدرسة كادرًا إداريًّا مكتملاً ومؤهلاً بما يتسق مع المهام الموكلة له",doc:"كشوف الكادر الإداري + مؤهلاتهم ومهامهم الموكلة"},
      {id:"1-4-1-3",name:"تظهر المدرسة الملاءة والاستدامة المالية",doc:"الخطة المالية السنوية + تقارير الميزانية"},
      {id:"1-4-1-4",name:"تدعم المدرسة منسوبيها للحصول على الرخصة المهنية وتتابعها",pct:58.00,level:"انطلاق",reason:"غياب برامج توعوية ومتابعة منتظمة وفق الرتب المهنية للمعلمين",doc:"كشف نتائج الرخص المهنية + خطة دعم الرخصة"},
      {id:"1-4-1-5",name:"تدعم المدرسة التطوير المهني لمنسوبيها وفقًا لنتائج تقويم الأداء الوظيفي وتحليل احتياجاتهم",pct:58.25,level:"انطلاق",reason:"خطة التطوير المهني غير مبنية على نتائج تقويم الأداء ولا تقيس أثرها",doc:"خطة التطوير المهني + تقارير قياس أثر التدريب"},
      {id:"1-4-1-6",name:"تطبق المدرسة التقويم الذاتيّ المبنيّ على المعايير المعتمدة من الهيئة بشكل مستمر",pct:89.00,level:"تقدم",reason:"يحتاج تعزيز ثقافة التقويم الذاتي ومشاركة النتائج مع المجتمع المدرسي",doc:"ملفات التقويم الذاتي + وثائق تشكيل الفريق وإجراءاته"},
      {id:"1-4-1-7",name:"تنفذ المدرسة خطة التحسين بناء على نتائج التقويم المدرسي وتتابعها",pct:72.75,level:"انطلاق",reason:"الخطة لا تحدد الأولويات المؤثرة في نواتج التعلم ولا تُتابع بانتظام",doc:"خطة التحسين مكتملة + تقارير متابعة مؤشرات الأداء"},
      {id:"1-5-1-1",name:"تلتزم المدرسة بالمحافظة على حقوق المتعلمين وحمايتهم",doc:"وثيقة حقوق المتعلم + إجراءات الحماية والإبلاغ"},
      {id:"1-5-1-2",name:"توفر المدرسة مناخًا آمنًا للتعلم والنمو نفسيًّا واجتماعيًّا",pct:77.75,level:"تقدم",reason:"يحتاج برامج وقائية وعلاجية للحد من التنمر",doc:"خطة التوجيه + تقارير برامج مكافحة التنمر والدعم النفسي"},
    ]
  },
  {
    id:"learning", num:"2", name:"التعليم والتعلم", icon:"📚", color:"#1e6b3a", light:"#e6f4ec",
    indicators:[
      {id:"2-1-1-1",name:"توفر المدرسة فرصًا متكافئة للتعلم تلبي احتياجات المتعلمين بمن فيهم ذوو الإعاقة والموهوبون",pct:70.25,level:"انطلاق",reason:"الفرص لا تستجيب لاحتياجات ذوي الإعاقة والموهوبين بانتظام",doc:"ملاحظات صفية تُثبت تنوع مصادر التعلم ومراعاة جميع الفئات"},
      {id:"2-1-1-2",name:"تدعم المدرسة تنفيذ المناهج لتحقيق نواتج التعلم المستهدفة",pct:86.00,level:"تقدم",reason:"يحتاج توفير أنشطة ومصادر متنوعة لدعم القيم المستهدفة في المحتوى",doc:"خطة سير المنهج + تقارير متابعة تنفيذ المناهج"},
      {id:"2-1-1-3",name:"تنوع المدرسة في إستراتيجيات التعليم والتعلم لتلبية احتياجات المتعلمين ودعم تعلمهم",pct:71.50,level:"انطلاق",reason:"الاستراتيجيات لا تراعي الفروق الفردية بما يكفي ولا تلبي احتياجات ذوي الإعاقة",doc:"ملاحظات صفية تُثبت تنوع استراتيجيات التدريس ومراعاة الفروق الفردية"},
      {id:"2-1-1-4",name:"تفعل المدرسة التقنية الرقمية لدعم تعلم المتعلمين وتلبية احتياجاتهم",pct:67.50,level:"انطلاق",reason:"غياب دمج التعلم الإلكتروني في التعليم اليومي وضعف المصادر التقنية",doc:"ملاحظات صفية + خطة التعلم الإلكتروني وإجراءات الطوارئ"},
      {id:"2-1-1-5",name:"تنفذ المدرسة أنشطة تعلم تطبيقية ترتبط بحياة المتعلمين",pct:68.00,level:"انطلاق",reason:"الأنشطة لا تشجع على البحث والتجريب وربط المعرفة بمواقف الحياة",doc:"ملاحظات صفية + نماذج أنشطة تطبيقية مرتبطة بالحياة"},
      {id:"2-1-1-6",name:"تنمي المدرسة المهارات القرائية والعددية الأساسية لدى المتعلمين",pct:75.50,level:"تقدم",reason:"يحتاج خطة مركزة طويلة المدى وأنشطة إثرائية مبتكرة في القراءة والكتابة",doc:"عينة ملفات إنجاز المتعلمين + أنشطة علاجية وإثرائية للقراءة والحساب"},
      {id:"2-1-1-7",name:"تنمي المدرسة مهارات التفكير والبحث والابتكار لدى المتعلمين",pct:55.25,level:"انطلاق",reason:"غياب أنشطة تستهدف التحليل والاستنتاج والإبداع وحل المشكلات",doc:"عينة ملفات إنجاز + أنشطة تفكير ناقد وإبداعي مدمجة في الدروس"},
      {id:"2-1-1-8",name:"تنمي المدرسة المهارات العاطفية والاجتماعية لدى المتعلمين",pct:83.75,level:"تقدم",reason:"يحتاج تعزيز ضبط الانفعالات وتشجيع التعاون والحوار الفعال",doc:"ملاحظات صفية تُثبت بيئة تعلم تعاونية وتعزز المهارات العاطفية"},
      {id:"2-1-1-9",name:"تنمي المدرسة المهارات الرقمية لدى المتعلمين",pct:63.75,level:"انطلاق",reason:"ضعف في تنمية استخدام التطبيقات التقنية والبحث في مصادر المعرفة الموثوقة",doc:"ملاحظات صفية + خطة تنمية المهارات الرقمية"},
      {id:"2-1-1-10",name:"تعزز المدرسة دافعية المتعلمين للتعلم والاستمتاع به",pct:83.25,level:"تقدم",reason:"يحتاج أنشطة تراعي ميول المتعلمين وتثير الفضول وتحقق الرفاه",doc:"ملاحظات صفية تُثبت استخدام أساليب تحفيز متنوعة"},
      {id:"2-2-1-1",name:"تطبق المدرسة أساليب وأدوات تقويم متنوعة للكشف عن مستويات أداء المتعلمين المختلفة",pct:68.75,level:"انطلاق",reason:"عدم التمايز في أساليب التقويم وضعف إشراك المتعلمين في تقويم أنفسهم",doc:"عينة نماذج تقويم أداء المتعلمين (تشخيصي وتكويني) + ملاحظات صفية"},
      {id:"2-2-1-2",name:"تطبق المدرسة أساليب وأدوات متنوعة لتقويم نواتج التعلم المستهدفة في مناهج التعليم",pct:76.75,level:"تقدم",reason:"يحتاج تحديد الفجوة وأسبابها وبناء خطط علاجية وإثرائية",doc:"عينة سجلات متابعة أداء المتعلمين + خطط علاجية مبنية على التقويم"},
      {id:"2-2-1-3",name:"تحلل المدرسة نتائج التقويم وتوظفها في تحسين عمليات التعليم والتعلم والتقويم",pct:76.75,level:"تقدم",reason:"يحتاج تحديد الفجوة وأسبابها وبناء خطط علاجية وإثرائية",doc:"خطط علاجية مبنية على نتائج التقويم + تقارير تحليل الأداء"},
      {id:"2-2-1-4",name:"تقدم المدرسة التغذية الراجعة للمتعلمين وأولياء أمورهم وتتابع تقدمهم بشكل مستمر",pct:86.25,level:"تقدم",reason:"يحتاج تنويع أساليب التغذية الراجعة وتوضيح مستوى التقدم نحو التميز",doc:"سجلات التغذية الراجعة للمتعلمين + تقارير التواصل مع أولياء الأمور"},
    ]
  },
  {
    id:"outcomes", num:"3", name:"نواتج التعلم", icon:"🎯", color:"#6b2d8b", light:"#f3eaf9",
    indicators:[
      {id:"3-1-1-1",name:"يحقق المتعلمون نتائج متقدمة في الاختبارات التحصيلية للمرحلة الثانوية",pct:82.40,level:"تقدم",reason:"يحتاج تعزيز الاستعداد الدراسي لتحقيق مستويات متقدمة في التحصيل",doc:"تقرير نتائج التحصيلي + تحليل الفجوات ومقترحات التحسين"},
      {id:"3-1-1-2",name:"يحقق المتعلمون نتائج متقدمة في اختبارات القدرات العامة للمرحلة الثانوية",pct:84.09,level:"تقدم",reason:"يحتاج التركيز على القدرة التحليلية والاستدلالية وحل المشكلات الرياضية",doc:"تقرير نتائج القدرات العامة + تحليل الفجوات ومقترحات التحسين"},
      {id:"3-2-1-1",name:"يظهر المتعلمون الاعتزاز بالقيم والهوية الوطنية",pct:95.25,level:"تميز",reason:"الاستمرار في الاستثمار الأمثل للمناسبات الوطنية بأساليب مبتكرة",doc:"ملاحظة بيئة التعلم (رموز وطنية) + نتائج الاستبانات"},
      {id:"3-2-1-2",name:"يظهر المتعلمون اتجاهات إيجابية نحو ذواتهم والآخرين",pct:91.25,level:"تميز",reason:"الاستمرار في تعزيز الرفاه والتعبير عن السعادة والرضا عن الحياة",doc:"نتائج استبانات المتعلمين والأسرة + ملاحظات صفية"},
      {id:"3-2-1-3",name:"يظهر المتعلمون التزامًا بالممارسات الصحية السليمة",pct:87.75,level:"تقدم",reason:"يحتاج تطوير برامج تشجع النشاط البدني والغذاء الصحي",doc:"نتائج استبانات الممارسات الصحية + ملاحظة بيئة التعلم"},
      {id:"3-2-1-4",name:"يشارك المتعلمون في الأنشطة المجتمعية والأعمال التطوعية",pct:65.75,level:"انطلاق",reason:"ضعف في تحفيز المتعلمين على التطوع وتوظيف ما تعلموه لخدمة المجتمع",doc:"سجل التطوع في المنصة + تقارير الأنشطة المجتمعية"},
      {id:"3-2-1-5",name:"يلتزم المتعلمون بقواعد السلوك والانضباط المدرسي",pct:96.25,level:"تميز",reason:"الاستمرار وتطوير برامج متنوعة ومبتكرة لتجسيد المسؤولية الذاتية",doc:"تقارير الانضباط المدرسي (نسب الغياب والمخالفات) + ملاحظات صفية"},
      {id:"3-2-1-6",name:"يظهر المتعلمون الاستقلالية والقدرة على التعلم الذاتي",pct:76.75,level:"تقدم",reason:"يحتاج مهام أدائية ترتبط بالحياة وتنمي إدارة الوقت وتحمل المسؤولية",doc:"ملاحظات صفية تُثبت دافعية ذاتية وبحثاً مستقلاً لدى المتعلمين"},
      {id:"3-2-1-7",name:"يظهر المتعلمون اعتزازًا بثقافتهم واحترامًا للتنوع الثقافي في المجتمع",pct:92.25,level:"تميز",reason:"الاستمرار في تعزيز الفخر باللغة العربية واحترام ثقافات الشعوب الأخرى",doc:"ملاحظة بيئة التعلم (تنوع ثقافي) + نتائج الاستبانات"},
    ]
  },
  {
    id:"environment", num:"4", name:"البيئة المدرسية", icon:"🏗️", color:"#8b2c2c", light:"#fceaea",
    indicators:[
      {id:"4-1-1-1",name:"توفر المدرسة مبنى تعليمياً يستوفي المواصفات والاشتراطات المعتمدة",doc:"نماذج التجهيزات + وثائق الاشتراطات المعتمدة"},
      {id:"4-1-1-2",name:"تنظيم مبنى المدرسة ملائم لعدد المتعلمين وخصائص المرحلة العمرية ومنهم ذوو الإعاقة",pct:36.25,level:"تهيئة",reason:"المبنى لا يناسب الأعداد ولا يراعي خصائص المرحلة العمرية",doc:"ملاحظة بيئة التعلم + وثائق مقترحات تطوير المبنى"},
      {id:"4-1-1-3",name:"تتوافر فصول ومعامل ملائمة للعملية التعليمية تلبي احتياجات المتعلمين بمن فيهم ذوو الإعاقة",pct:49.25,level:"تهيئة",reason:"الفصول والمعامل لا تستوفي المعايير ولا تلبي احتياجات ذوي الإعاقة",doc:"ملاحظة بيئة التعلم (الفصول والمعامل) + استبانة المعلم والمتعلم"},
      {id:"4-1-1-4",name:"تلبي المرافق والتجهيزات والخدمات المساندة احتياجات المتعلمين ومنهم ذوو الإعاقة",pct:31.25,level:"تهيئة",reason:"المرافق لا تلبي احتياجات المتعلمين ولا تحقق الرفاه لذوي الإعاقة",doc:"ملاحظة بيئة التعلم (المرافق ودورات المياه والمقصف) + استبانة المعلم"},
      {id:"4-2-1-1",name:"تتوافر في مبنى المدرسة ومرافقها جميع متطلبات الأمن والسلامة",pct:41.00,level:"تهيئة",reason:"ضعف في متابعة تجهيزات الأمن والسلامة وثقافة التوعية بالمخاطر",doc:"خطة الأمن والسلامة + خطط الإخلاء + تقرير السلامة ساري المفعول"},
      {id:"4-2-1-2",name:"تتابع المدرسة صيانة المبنى وجميع مرافقه وتجهيزاته بشكل دوري",pct:29.50,level:"تهيئة",reason:"غياب خطط الصيانة الوقائية والعلاجية المنتظمة للمرافق والتجهيزات",doc:"تقارير الصيانة الدورية + سجل البلاغات الفنية ومعالجاتها"},
      {id:"4-2-1-3",name:"تتابع المدرسة نظافة المبنى المدرسي وجميع مرافقه بشكل مستمر",pct:61.25,level:"انطلاق",reason:"النظافة غير منتظمة وأدوات النظافة غير متوفرة في أماكن ملائمة",doc:"استمارة متابعة نظافة دورات المياه + ملاحظة ميدانية للنظافة"},
    ]
  },
];

// ====== مكونات UI ======
const ProgressRing = ({ value, size = 56, color }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (value / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={6} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={circ} strokeDashoffset={offset}
        style={{ transition: "stroke-dashoffset 0.6s ease" }} />
    </svg>
  );
};

const StatusBadge = ({ count, total }) => {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  const color = pct === 100 ? "#16a34a" : pct > 50 ? "#d97706" : "#dc2626";
  return (
    <span style={{
      background: pct === 100 ? "#dcfce7" : pct > 50 ? "#fef3c7" : "#fee2e2",
      color, fontSize: 12, fontWeight: 700, padding: "2px 10px", borderRadius: 20
    }}>
      {count}/{total} مكتمل
    </span>
  );
};

// ====== التطبيق الرئيسي ======
export default function App() {
  const [files, setFiles] = useState({});
  const [view, setView] = useState("dashboard");
  const [activeDomain, setActiveDomain] = useState(null);
  const [activeIndicator, setActiveIndicator] = useState(null);
  const [uploaderName, setUploaderName] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAllFiles(); }, []);

  const loadAllFiles = async () => {
    setLoading(true);
    try {
      const allItems = await sb.list("");
      const grouped = {};
      allItems.forEach(item => {
        if (!item.name) return;
        const parts = item.name.split("/");
        if (parts.length < 2) return;
        const indId = parts[0];
        const rest = parts.slice(1).join("/");
        const sepIdx = rest.indexOf("__");
        const uploader = sepIdx > -1 ? rest.slice(0, sepIdx) : "غير محدد";
        const fileName = sepIdx > -1 ? rest.slice(sepIdx + 2) : rest;
        if (!grouped[indId]) grouped[indId] = [];
        grouped[indId].push({
          id: item.id || item.name,
          name: decodeURIComponent(fileName),
          uploader,
          date: item.created_at ? new Date(item.created_at).toLocaleDateString("ar-SA") : "–",
          size: item.metadata?.size || 0,
          path: item.name,
          url: sb.publicUrl(item.name),
        });
      });
      setFiles(grouped);
    } catch(e) { console.error(e); }
    setLoading(false);
  };

  const getFiles = (indId) => files[indId] || [];
  const hasFiles = (indId) => getFiles(indId).length > 0;

  const totalIndicators = DOMAINS.reduce((s, d) => s + d.indicators.length, 0);
  const completedIndicators = DOMAINS.reduce((s, d) =>
    s + d.indicators.filter(i => hasFiles(i.id)).length, 0);
  const overallPct = Math.round((completedIndicators / totalIndicators) * 100);

  const handleUpload = useCallback(async (newFiles) => {
    if (!activeIndicator || newFiles.length === 0) return;
    const uploader = uploaderName.trim() || "غير محدد";
    setUploading(true); setUploadError("");
    const uploaded = [];
    for (const file of Array.from(newFiles)) {
      const safeName = file.name.replace(/[^\w.\-\u0600-\u06FF]/g, "_");
      const path = `${activeIndicator.id}/${uploader}__${safeName}`;
      const result = await sb.upload(path, file);
      if (result) {
        uploaded.push({
          id: path, name: file.name, uploader,
          date: new Date().toLocaleDateString("ar-SA"),
          size: file.size, path, url: sb.publicUrl(path),
        });
      }
    }
    if (uploaded.length > 0) {
      setFiles(prev => ({
        ...prev,
        [activeIndicator.id]: [...(prev[activeIndicator.id] || []), ...uploaded],
      }));
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
    } else {
      setUploadError(`❌ فشل الرفع — تأكد من: 1) اسم الـ bucket صحيح 2) الـ Policies تسمح للـ anon`);
    }
    setUploading(false);
  }, [activeIndicator, uploaderName]);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); setDragOver(false);
    handleUpload(e.dataTransfer.files);
  }, [handleUpload]);

  const removeFile = async (indId, fileId) => {
    const file = (files[indId] || []).find(f => f.id === fileId);
    if (!file) return;
    await sb.remove(file.path);
    setFiles(prev => ({
      ...prev,
      [indId]: (prev[indId] || []).filter(f => f.id !== fileId),
    }));
  };

  const filteredDomains = DOMAINS.map(d => ({
    ...d,
    indicators: d.indicators.filter(i =>
      !searchTerm || i.name.includes(searchTerm) || i.id.includes(searchTerm)
    )
  })).filter(d => !searchTerm || d.indicators.length > 0);

  // ====== STYLES ======
  const S = {
    app: {
      minHeight: "100vh", background: "#f8fafc", fontFamily: "'Tajawal', 'Cairo', sans-serif",
      direction: "rtl", color: "#1e293b"
    },
    header: {
      background: "linear-gradient(135deg, #0f2d5e 0%, #1a4b8c 60%, #1e6b3a 100%)",
      padding: "20px 28px", display: "flex", alignItems: "center",
      justifyContent: "space-between", boxShadow: "0 4px 24px rgba(0,0,0,0.18)"
    },
    headerTitle: { color: "#fff", fontSize: 20, fontWeight: 800, margin: 0 },
    headerSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, margin: "2px 0 0" },
    nav: {
      background: "#fff", borderBottom: "1px solid #e2e8f0",
      display: "flex", gap: 4, padding: "0 24px"
    },
    navBtn: (active) => ({
      padding: "12px 18px", border: "none", background: "none",
      cursor: "pointer", fontSize: 14, fontWeight: active ? 700 : 500,
      color: active ? "#1a4b8c" : "#64748b", fontFamily: "inherit",
      borderBottom: active ? "3px solid #1a4b8c" : "3px solid transparent",
      transition: "all 0.2s"
    }),
    container: { maxWidth: 1100, margin: "0 auto", padding: "24px 16px" },
    card: {
      background: "#fff", borderRadius: 16, padding: 20,
      boxShadow: "0 2px 12px rgba(0,0,0,0.06)", border: "1px solid #e2e8f0"
    },
    statsGrid: {
      display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24
    },
    statCard: (color, light) => ({
      background: light, borderRadius: 14, padding: "18px 20px",
      borderRight: `4px solid ${color}`, display: "flex", alignItems: "center", gap: 14
    }),
    domainGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 },
    domainCard: (color, light, hover) => ({
      background: hover ? light : "#fff", borderRadius: 16, padding: 20, cursor: "pointer",
      border: `2px solid ${hover ? color : "#e2e8f0"}`,
      boxShadow: hover ? `0 4px 20px ${color}22` : "0 2px 8px rgba(0,0,0,0.05)",
      transition: "all 0.2s"
    }),
    indicatorRow: (hasFile, color) => ({
      display: "flex", alignItems: "center", gap: 10, padding: "12px 14px",
      borderRadius: 10, marginBottom: 8, cursor: "pointer",
      background: hasFile ? "#f0fdf4" : "#f8fafc",
      border: `1px solid ${hasFile ? "#86efac" : "#e2e8f0"}`,
      transition: "all 0.15s"
    }),
    uploadArea: (drag) => ({
      border: `2px dashed ${drag ? "#1a4b8c" : "#cbd5e1"}`,
      borderRadius: 14, padding: "36px 24px", textAlign: "center",
      background: drag ? "#eff6ff" : "#f8fafc", cursor: "pointer",
      transition: "all 0.2s"
    }),
    btn: (color, light) => ({
      background: color, color: "#fff", border: "none", borderRadius: 10,
      padding: "10px 22px", cursor: "pointer", fontSize: 14, fontWeight: 700,
      fontFamily: "inherit", transition: "all 0.2s"
    }),
    chip: { background: "#e2e8f0", borderRadius: 20, padding: "3px 10px", fontSize: 12, color: "#475569" },
    input: {
      width: "100%", padding: "10px 14px", borderRadius: 10, border: "1px solid #e2e8f0",
      fontSize: 14, fontFamily: "inherit", background: "#f8fafc", outline: "none",
      boxSizing: "border-box", direction: "rtl"
    },
  };

  // ====== VIEWS ======

  // داش بورد
  const DashboardView = () => {
    const [hoveredDomain, setHoveredDomain] = useState(null);
    return (
      <div style={S.container}>
        {/* إجمالي */}
        <div style={{ ...S.card, marginBottom: 24, display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
          <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <ProgressRing value={overallPct} size={80} color={overallPct === 100 ? "#16a34a" : overallPct > 50 ? "#d97706" : "#1a4b8c"} />
            <span style={{ position: "absolute", fontSize: 16, fontWeight: 800, color: "#1e293b" }}>{overallPct}%</span>
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1e293b" }}>ثانوية عرفات – التقويم الذاتي 1447هـ</div>
            <div style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>
              {completedIndicators} مؤشراً مكتملاً من أصل {totalIndicators} مؤشراً عبر المجالات الأربعة
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8 }}>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>مدير المدرسة:</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1a4b8c", background: "#e8f0fb", padding: "2px 12px", borderRadius: 20 }}>
                أ. أحمد الحازمي
              </span>
            </div>
          </div>
          <div style={{ marginRight: "auto", display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { label: "مكتمل", count: completedIndicators, color: "#16a34a", bg: "#dcfce7" },
              { label: "لم يبدأ", count: totalIndicators - completedIndicators, color: "#dc2626", bg: "#fee2e2" },
            ].map(s => (
              <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "8px 16px", textAlign: "center" }}>
                <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: 12, color: s.color }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* شبكة المجالات */}
        <div style={S.domainGrid}>
          {DOMAINS.map(domain => {
            const done = domain.indicators.filter(i => hasFiles(i.id)).length;
            const pct = Math.round((done / domain.indicators.length) * 100);
            const hov = hoveredDomain === domain.id;
            return (
              <div key={domain.id}
                style={S.domainCard(domain.color, domain.light, hov)}
                onClick={() => { setActiveDomain(domain); setView("domain"); }}
                onMouseEnter={() => setHoveredDomain(domain.id)}
                onMouseLeave={() => setHoveredDomain(null)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <span style={{ fontSize: 28 }}>{domain.icon}</span>
                    <div style={{ fontSize: 16, fontWeight: 800, color: domain.color, marginTop: 4 }}>
                      المجال {domain.num}
                    </div>
                    <div style={{ fontSize: 14, color: "#374151", fontWeight: 600 }}>{domain.name}</div>
                  </div>
                  <div style={{ position: "relative" }}>
                    <ProgressRing value={pct} size={56} color={domain.color} />
                    <span style={{
                      position: "absolute", top: "50%", left: "50%",
                      transform: "translate(-50%,-50%)", fontSize: 12, fontWeight: 800, color: domain.color
                    }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ height: 6, borderRadius: 3, background: "#e5e7eb", overflow: "hidden", marginBottom: 10 }}>
                  <div style={{
                    height: "100%", borderRadius: 3, background: domain.color,
                    width: `${pct}%`, transition: "width 0.6s ease"
                  }} />
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <StatusBadge count={done} total={domain.indicators.length} />
                  <span style={{ fontSize: 12, color: "#94a3b8" }}>{domain.indicators.length} مؤشر ←</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* آخر الرفوعات */}
        {Object.keys(files).length > 0 && (
          <div style={{ ...S.card, marginTop: 24 }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: "#1e293b" }}>📋 آخر الملفات المرفوعة</div>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: "#f1f5f9" }}>
                    {["المؤشر", "اسم الملف", "الرافع", "التاريخ"].map(h => (
                      <th key={h} style={{ padding: "8px 12px", textAlign: "right", fontWeight: 700, color: "#475569" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(files).flatMap(([indId, fList]) =>
                    fList.map(f => {
                      const ind = DOMAINS.flatMap(d => d.indicators).find(i => i.id === indId);
                      return (
                        <tr key={f.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                          <td style={{ padding: "8px 12px" }}>
                            <span style={S.chip}>{indId}</span>
                            <span style={{ marginRight: 6, color: "#374151" }}>{ind?.name}</span>
                          </td>
                          <td style={{ padding: "8px 12px", color: "#1a4b8c", fontWeight: 600 }}>📄 {f.name}</td>
                          <td style={{ padding: "8px 12px", color: "#64748b" }}>{f.uploader}</td>
                          <td style={{ padding: "8px 12px", color: "#94a3b8" }}>{f.date}</td>
                        </tr>
                      );
                    })
                  ).slice(-10).reverse()}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ===== دالة توليد HTML للطباعة =====
  const printDomain = (domain) => {
    const LEVEL_STYLES = {
      "تميز":   { bg: "#d1fae5", text: "#065f46", border: "#6ee7b7" },
      "تقدم":   { bg: "#dbeafe", text: "#1e40af", border: "#93c5fd" },
      "انطلاق": { bg: "#fef3c7", text: "#92400e", border: "#fcd34d" },
      "تهيئة":  { bg: "#fee2e2", text: "#991b1b", border: "#fca5a5" },
    };

    const domainStats = {
      "1": { pct: "67.75", level: "انطلاق" },
      "2": { pct: "74.00", level: "انطلاق" },
      "3": { pct: "83.75", level: "تقدم" },
      "4": { pct: "42.00", level: "تهيئة" },
    };
    const stat = domainStats[domain.num] || {};
    const done = domain.indicators.filter(i => hasFiles(i.id)).length;
    const total = domain.indicators.length;
    const currentPct = Math.round((done / total) * 100);

    // صفحة المؤشر
    const indPage = (ind, idx) => {
      const lv = LEVEL_STYLES[ind.level] || {};
      const indFiles = getFiles(ind.id);
      const filesRows = indFiles.length > 0
        ? indFiles.map((f, fi) => `
            <tr style="background:${fi % 2 === 0 ? '#f9fafb' : '#fff'}">
              <td style="padding:8px 12px;border:1px solid #e5e7eb;font-size:12px;">${fi + 1}</td>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;font-size:12px;font-weight:600;color:#1e40af;">📄 ${f.name}</td>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;font-size:12px;">${f.uploader}</td>
              <td style="padding:8px 12px;border:1px solid #e5e7eb;font-size:12px;">${f.date}</td>
            </tr>`).join("")
        : `<tr><td colspan="4" style="padding:16px;text-align:center;color:#9ca3af;font-size:13px;border:1px solid #e5e7eb;">
              ❌ لم يُرفع أي ملف بعد
           </td></tr>`;

      return `
        <div class="page">
          <!-- هيدر الصفحة -->
          <div class="page-header" style="background:${domain.color}">
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <div>
                <div style="font-size:11px;opacity:0.8;margin-bottom:2px;">ثانوية عرفات – مسارات | جدة | 1447هـ</div>
                <div style="font-size:14px;font-weight:800;">المجال ${domain.num}: ${domain.name}</div>
              </div>
              <div style="text-align:left;font-size:11px;opacity:0.8;">
                المؤشر ${idx + 1} / ${total}
              </div>
            </div>
          </div>

          <!-- بطاقة المؤشر -->
          <div class="ind-card">
            <!-- رقم + اسم المؤشر -->
            <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:14px;">
              <div style="background:${domain.color};color:#fff;border-radius:8px;padding:6px 12px;font-size:13px;font-weight:800;white-space:nowrap;flex-shrink:0;">
                ${ind.id}
              </div>
              <div style="font-size:16px;font-weight:800;color:#111827;line-height:1.5;">
                ${ind.name}
              </div>
            </div>

            <!-- شريط المعلومات -->
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:14px;">
              ${ind.level ? `
              <span style="background:${lv.bg};color:${lv.text};border:1px solid ${lv.border};border-radius:20px;padding:4px 14px;font-size:12px;font-weight:700;">
                مستوى الدورة السابقة: ${ind.level}
              </span>` : ""}
              ${ind.pct ? `
              <span style="background:#f1f5f9;color:#374151;border-radius:20px;padding:4px 14px;font-size:12px;font-weight:800;border:1px solid #e2e8f0;">
                النسبة: ${ind.pct}%
              </span>` : `
              <span style="background:#f1f5f9;color:#6b7280;border-radius:20px;padding:4px 14px;font-size:12px;border:1px solid #e2e8f0;">
                مؤشر جديد في الدورة الحالية
              </span>`}
              <span style="background:${done > 0 ? '#dcfce7' : '#fee2e2'};color:${done > 0 ? '#166534' : '#991b1b'};border-radius:20px;padding:4px 14px;font-size:12px;font-weight:700;border:1px solid ${done > 0 ? '#86efac' : '#fca5a5'};">
                ${hasFiles(ind.id) ? `✅ مكتمل (${indFiles.length} ملف)` : "❌ لم يُرفع"}
              </span>
            </div>

            <!-- سبب الضعف -->
            ${ind.reason ? `
            <div style="background:#fffbeb;border-right:4px solid #f59e0b;border-radius:0 8px 8px 0;padding:10px 14px;margin-bottom:14px;">
              <div style="font-size:11px;font-weight:700;color:#92400e;margin-bottom:4px;">⚠️ ملاحظة الدورة السابقة:</div>
              <div style="font-size:13px;color:#78350f;line-height:1.6;">${ind.reason}</div>
            </div>` : ""}

            <!-- الوثيقة المطلوبة -->
            <div style="background:#eff6ff;border-right:4px solid ${domain.color};border-radius:0 8px 8px 0;padding:10px 14px;margin-bottom:18px;">
              <div style="font-size:11px;font-weight:700;color:${domain.color};margin-bottom:4px;">📋 الشاهد / الوثيقة المطلوبة:</div>
              <div style="font-size:13px;color:#1e293b;font-weight:600;line-height:1.6;">${ind.doc}</div>
            </div>

            <!-- جدول الملفات -->
            <div style="font-size:12px;font-weight:700;color:#374151;margin-bottom:8px;">
              📂 الملفات المرفوعة (${indFiles.length}):
            </div>
            <table style="width:100%;border-collapse:collapse;font-family:'Tajawal',sans-serif;">
              <thead>
                <tr style="background:${domain.color};">
                  <th style="padding:8px 12px;color:#fff;font-size:12px;font-weight:700;border:1px solid ${domain.color};width:40px;">#</th>
                  <th style="padding:8px 12px;color:#fff;font-size:12px;font-weight:700;border:1px solid ${domain.color};">اسم الملف</th>
                  <th style="padding:8px 12px;color:#fff;font-size:12px;font-weight:700;border:1px solid ${domain.color};width:120px;">الرافع</th>
                  <th style="padding:8px 12px;color:#fff;font-size:12px;font-weight:700;border:1px solid ${domain.color};width:100px;">التاريخ</th>
                </tr>
              </thead>
              <tbody>${filesRows}</tbody>
            </table>

            <!-- مساحة التوقيع -->
            <div style="margin-top:20px;display:flex;gap:20px;">
              <div style="flex:1;border-top:1px dashed #d1d5db;padding-top:8px;">
                <div style="font-size:11px;color:#9ca3af;">توقيع المسؤول</div>
              </div>
              <div style="flex:1;border-top:1px dashed #d1d5db;padding-top:8px;">
                <div style="font-size:11px;color:#9ca3af;">ملاحظات</div>
              </div>
            </div>
          </div>

          <!-- فوتر الصفحة -->
          <div class="page-footer">
            <span>ثانوية عرفات – مسارات | جدة</span>
            <span>هيئة تقويم التعليم والتدريب | الدورة 1447هـ</span>
          </div>
        </div>`;
    };

    // الغلاف
    const cover = `
      <div class="page cover-page">
        <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:0;">

          <!-- شعار وعنوان -->
          <div style="text-align:center;margin-bottom:40px;">
            <div style="font-size:64px;margin-bottom:16px;">${domain.icon}</div>
            <div style="font-size:13px;color:#6b7280;letter-spacing:2px;margin-bottom:8px;">
              هيئة تقويم التعليم والتدريب | 1447هـ
            </div>
            <div style="font-size:13px;color:#6b7280;margin-bottom:32px;">
              ملف شواهد التقويم الذاتي
            </div>
            <div style="background:${domain.color};color:#fff;border-radius:16px;padding:24px 48px;display:inline-block;margin-bottom:16px;">
              <div style="font-size:15px;opacity:0.85;margin-bottom:6px;">المجال ${domain.num}</div>
              <div style="font-size:28px;font-weight:800;">${domain.name}</div>
            </div>
          </div>

          <!-- بطاقة المدرسة -->
          <div style="width:100%;max-width:480px;background:#f8fafc;border-radius:16px;padding:24px;border:1px solid #e2e8f0;">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
              ${[
                ["مدير المدرسة", "أ. أحمد الحازمي"],
                ["اسم المدرسة", "ثانوية عرفات – مسارات"],
                ["المرحلة", "ثانوية – بنين"],
                ["المنطقة", "جدة"],
                ["العام الدراسي", "1447هـ"],
                ["نسبة المجال (سابق)", `${stat.pct || "–"}%`],
                ["المستوى (سابق)", stat.level || "–"],
                ["المؤشرات الكلية", `${total} مؤشر`],
                ["المكتمل حالياً", `${done} / ${total} (${currentPct}%)`],
              ].map(([k, v]) => `
                <div style="background:#fff;border-radius:10px;padding:12px;border:1px solid #e2e8f0;">
                  <div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">${k}</div>
                  <div style="font-size:14px;font-weight:700;color:#1e293b;">${v}</div>
                </div>`).join("")}
            </div>
          </div>

          <!-- تاريخ الطباعة -->
          <div style="margin-top:32px;font-size:12px;color:#9ca3af;">
            تاريخ الطباعة: ${new Date().toLocaleDateString("ar-SA", { year:"numeric", month:"long", day:"numeric" })}
          </div>
        </div>

        <div class="page-footer" style="position:static;margin-top:auto;">
          <span>ثانوية عرفات – مسارات | جدة</span>
          <span>هيئة تقويم التعليم والتدريب | الدورة 1447هـ</span>
        </div>
      </div>`;

    const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>شواهد المجال ${domain.num} – ${domain.name}</title>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Tajawal', 'Arial', sans-serif;
      background: #e5e7eb;
      direction: rtl;
    }
    .page {
      width: 210mm;
      min-height: 297mm;
      margin: 10mm auto;
      background: #fff;
      display: flex;
      flex-direction: column;
      position: relative;
      box-shadow: 0 4px 24px rgba(0,0,0,0.12);
    }
    .cover-page {
      padding: 20mm 20mm;
      justify-content: space-between;
    }
    .page-header {
      padding: 12px 20px;
      color: #fff;
      flex-shrink: 0;
    }
    .ind-card {
      padding: 20px 24px;
      flex: 1;
    }
    .page-footer {
      border-top: 1px solid #f1f5f9;
      padding: 10px 20px;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #9ca3af;
      flex-shrink: 0;
    }
    table { direction: rtl; }
    th, td { text-align: right; }
    @media print {
      body { background: #fff; }
      .page {
        width: 210mm;
        min-height: 297mm;
        margin: 0;
        box-shadow: none;
        page-break-after: always;
      }
      .page:last-child { page-break-after: avoid; }
      @page {
        size: A4;
        margin: 0;
      }
    }
    @media screen {
      .print-btn {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%);
        background: #1a4b8c;
        color: #fff;
        border: none;
        border-radius: 12px;
        padding: 14px 36px;
        font-size: 16px;
        font-family: 'Tajawal', sans-serif;
        font-weight: 700;
        cursor: pointer;
        box-shadow: 0 4px 20px rgba(26,75,140,0.4);
        z-index: 999;
      }
      .print-btn:hover { background: #1e3a6e; }
    }
  </style>
</head>
<body>
  <button class="print-btn" onclick="window.print()">🖨️ طباعة / حفظ PDF</button>
  ${cover}
  ${domain.indicators.map((ind, idx) => indPage(ind, idx)).join("")}
</body>
</html>`;

    const win = window.open("", "_blank");
    win.document.write(html);
    win.document.close();
  };

  // عرض المجال
  const DomainView = () => {
    if (!activeDomain) return null;
    const filtered = activeDomain.indicators.filter(i =>
      !searchTerm || i.name.includes(searchTerm) || i.id.includes(searchTerm)
    );
    return (
      <div style={S.container}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={() => setView("dashboard")} style={{
            background: "#f1f5f9", border: "none", borderRadius: 8, padding: "8px 16px",
            cursor: "pointer", fontFamily: "inherit", fontSize: 14, color: "#475569"
          }}>← رجوع</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: activeDomain.color }}>
              {activeDomain.icon} المجال {activeDomain.num}: {activeDomain.name}
            </div>
            <StatusBadge
              count={activeDomain.indicators.filter(i => hasFiles(i.id)).length}
              total={activeDomain.indicators.length}
            />
          </div>
          <button
            onClick={() => printDomain(activeDomain)}
            style={{
              background: activeDomain.color, color: "#fff", border: "none",
              borderRadius: 10, padding: "10px 20px", cursor: "pointer",
              fontFamily: "inherit", fontSize: 14, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 8
            }}>
            🖨️ طباعة المجال
          </button>
        </div>

        <input style={{ ...S.input, marginBottom: 16 }}
          placeholder="🔍 ابحث عن مؤشر..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)} />

        {filtered.map(ind => {
          const indFiles = getFiles(ind.id);
          return (
            <div key={ind.id} style={{ ...S.card, marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6, flexWrap: "wrap" }}>
                    <span style={{ ...S.chip, background: activeDomain.light, color: activeDomain.color, fontWeight: 700 }}>
                      {ind.id}
                    </span>
                    {ind.level && (() => {
                      const lc = LEVEL_COLOR[ind.level] || {};
                      return (
                        <span style={{ background: lc.bg, color: lc.text, border: `1px solid ${lc.border}`, fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20 }}>
                          {ind.level}
                        </span>
                      );
                    })()}
                    {ind.pct && (
                      <span style={{ background: "#f1f5f9", color: "#374151", fontSize: 12, fontWeight: 800, padding: "2px 10px", borderRadius: 20 }}>
                        {ind.pct}%
                      </span>
                    )}
                    {hasFiles(ind.id)
                      ? <span style={{ fontSize: 12, color: "#16a34a", fontWeight: 700 }}>✅ مكتمل</span>
                      : <span style={{ fontSize: 12, color: "#dc2626", fontWeight: 700 }}>❌ لم يُرفع</span>
                    }
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 4 }}>{ind.name}</div>
                  {ind.reason && (
                    <div style={{ fontSize: 12, color: "#92400e", background: "#fef3c7", borderRadius: 6, padding: "4px 10px", marginBottom: 4, borderRight: "3px solid #f59e0b" }}>
                      ⚠️ {ind.reason}
                    </div>
                  )}
                  <div style={{ fontSize: 12, color: "#64748b" }}>📋 {ind.doc}</div>
                </div>
                <button style={S.btn(activeDomain.color)}
                  onClick={() => { setActiveIndicator(ind); setView("upload"); }}>
                  ⬆️ رفع ملف
                </button>
              </div>

              {indFiles.length > 0 && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #f1f5f9" }}>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6, fontWeight: 600 }}>
                    الملفات المرفوعة ({indFiles.length}):
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {indFiles.map(f => (
                      <div key={f.id} style={{
                        background: "#f0fdf4", border: "1px solid #86efac", borderRadius: 8,
                        padding: "6px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 8
                      }}>
                        <span>📄 {f.name}</span>
                        <span style={{ color: "#94a3b8" }}>| {f.uploader}</span>
                        <button onClick={() => removeFile(ind.id, f.id)} style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "#dc2626", fontSize: 14, padding: 0, lineHeight: 1
                        }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  // نافذة الرفع
  const UploadView = () => {
    if (!activeIndicator) return null;
    const domain = DOMAINS.find(d => d.indicators.some(i => i.id === activeIndicator.id));
    const indFiles = getFiles(activeIndicator.id);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState("");
    const [editUploader, setEditUploader] = useState("");
    const [editNote, setEditNote] = useState("");
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);

    const startEdit = (f) => {
      setEditingId(f.id);
      setEditName(f.name);
      setEditUploader(f.uploader);
      setEditNote(f.note || "");
    };

    const saveEdit = (indId) => {
      setFiles(prev => ({
        ...prev,
        [indId]: (prev[indId] || []).map(f =>
          f.id === editingId
            ? { ...f, name: editName.trim() || f.name, uploader: editUploader.trim() || f.uploader, note: editNote }
            : f
        )
      }));
      setEditingId(null);
    };

    const confirmDelete = (indId, fileId) => {
      removeFile(indId, fileId);
      setDeleteConfirmId(null);
    };

    return (
      <div style={S.container}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <button onClick={() => { setView("domain"); setActiveIndicator(null); }} style={{
            background: "#f1f5f9", border: "none", borderRadius: 8, padding: "8px 16px",
            cursor: "pointer", fontFamily: "inherit", fontSize: 14, color: "#475569"
          }}>← رجوع</button>
          <div style={{ fontSize: 18, fontWeight: 800, color: domain?.color }}>
            رفع شاهد – {activeIndicator.id}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* معلومات المؤشر */}
          <div style={S.card}>
            <div style={{ fontSize: 13, color: "#64748b", marginBottom: 4, fontWeight: 600 }}>المؤشر</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#1e293b", marginBottom: 10 }}>
              {activeIndicator.name}
            </div>
            <div style={{ background: domain?.light, borderRadius: 10, padding: 14, borderRight: `3px solid ${domain?.color}` }}>
              <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>الوثيقة المطلوبة:</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: domain?.color }}>{activeIndicator.doc}</div>
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>
                اسمك (اختياري)
              </label>
              <input style={S.input} placeholder="مثال: أحمد العمري"
                value={uploaderName} onChange={e => setUploaderName(e.target.value)} />
            </div>
          </div>

          {/* منطقة الرفع */}
          <div>
            <div style={S.uploadArea(dragOver)}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && document.getElementById("fileInput").click()}>
              <div style={{ fontSize: 48, marginBottom: 10 }}>{uploading ? "⏳" : "📁"}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
                {uploading ? "جارٍ الرفع..." : "اسحب وأفلت الملفات هنا"}
              </div>
              <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 16 }}>
                {uploading ? "يرجى الانتظار" : "أو اضغط لاختيار الملفات"}
              </div>
              {!uploading && <button style={S.btn(domain?.color || "#1a4b8c")}>اختر ملفات</button>}
              <input id="fileInput" type="file" multiple style={{ display: "none" }}
                onChange={e => handleUpload(e.target.files)} />
            </div>
            {uploadSuccess && (
              <div style={{ marginTop: 12, background: "#dcfce7", borderRadius: 10, padding: "12px 16px", color: "#16a34a", fontWeight: 700, fontSize: 14, textAlign: "center" }}>
                ✅ تم الرفع وحفظه في Supabase!
              </div>
            )}
            {uploadError && (
              <div style={{ marginTop: 12, background: "#fee2e2", borderRadius: 10, padding: "12px 16px", color: "#dc2626", fontWeight: 700, fontSize: 14, textAlign: "center" }}>
                {uploadError}
              </div>
            )}
          </div>
        </div>

        {/* الملفات المرفوعة مع عرض وتعديل وحذف */}
        {indFiles.length > 0 && (
          <div style={{ ...S.card, marginTop: 20 }}>
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
              📂 الملفات المرفوعة ({indFiles.length})
              <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 400 }}>محفوظة في Supabase</span>
            </div>

            {indFiles.map(f => (
              <div key={f.id}>
                {editingId !== f.id && deleteConfirmId !== f.id && (
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", borderRadius: 12, background: "#f0fdf4",
                    border: "1px solid #86efac", marginBottom: 10, gap: 12
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 24, flexShrink: 0 }}>📄</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name}</div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                          👤 {f.uploader} | 📅 {f.date} | 📦 {(f.size/1024).toFixed(0)} KB
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                      {f.url && (
                        <a href={f.url} target="_blank" rel="noreferrer" style={{
                          background: "#dbeafe", border: "1px solid #93c5fd", borderRadius: 8,
                          padding: "6px 12px", color: "#1d4ed8", fontWeight: 700, fontSize: 12,
                          textDecoration: "none"
                        }}>👁️ عرض</a>
                      )}
                      <button onClick={() => startEdit(f)} style={{
                        background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8,
                        padding: "6px 12px", cursor: "pointer", color: "#1d4ed8",
                        fontFamily: "inherit", fontWeight: 600, fontSize: 12
                      }}>✏️ تعديل</button>
                      <button onClick={() => setDeleteConfirmId(f.id)} style={{
                        background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8,
                        padding: "6px 12px", cursor: "pointer", color: "#dc2626",
                        fontFamily: "inherit", fontWeight: 600, fontSize: 12
                      }}>🗑️ حذف</button>
                    </div>
                  </div>
                )}
                  <div style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "12px 16px", borderRadius: 12, background: "#f0fdf4",
                    border: "1px solid #86efac", marginBottom: 10, gap: 12
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 24, flexShrink: 0 }}>📄</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#1e293b", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {f.name}
                        </div>
                        <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                          👤 {f.uploader} &nbsp;|&nbsp; 📅 {f.date} &nbsp;|&nbsp; 📦 {(f.size / 1024).toFixed(0)} KB
                          {f.note && <span style={{ marginRight: 8, color: "#6366f1" }}>💬 {f.note}</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                      <button onClick={() => startEdit(f)} style={{
                        background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8,
                        padding: "6px 14px", cursor: "pointer", color: "#1d4ed8",
                        fontFamily: "inherit", fontWeight: 600, fontSize: 12
                      }}>✏️ تعديل</button>
                      <button onClick={() => setDeleteConfirmId(f.id)} style={{
                        background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: 8,
                        padding: "6px 14px", cursor: "pointer", color: "#dc2626",
                        fontFamily: "inherit", fontWeight: 600, fontSize: 12
                      }}>🗑️ حذف</button>
                    </div>
                  </div>
                )}

                {/* وضع التعديل */}
                {editingId === f.id && (
                  <div style={{
                    padding: "16px", borderRadius: 12, background: "#eff6ff",
                    border: "2px solid #93c5fd", marginBottom: 10
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1d4ed8", marginBottom: 12 }}>
                      ✏️ تعديل بيانات الملف
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                      <div>
                        <label style={{ fontSize: 12, color: "#374151", fontWeight: 600, display: "block", marginBottom: 4 }}>اسم الملف</label>
                        <input style={S.input} value={editName} onChange={e => setEditName(e.target.value)} />
                      </div>
                      <div>
                        <label style={{ fontSize: 12, color: "#374151", fontWeight: 600, display: "block", marginBottom: 4 }}>اسم الرافع</label>
                        <input style={S.input} value={editUploader} onChange={e => setEditUploader(e.target.value)} />
                      </div>
                    </div>
                    <div style={{ marginBottom: 12 }}>
                      <label style={{ fontSize: 12, color: "#374151", fontWeight: 600, display: "block", marginBottom: 4 }}>ملاحظة (اختياري)</label>
                      <input style={S.input} placeholder="مثال: نسخة محدثة..." value={editNote} onChange={e => setEditNote(e.target.value)} />
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => saveEdit(activeIndicator.id)} style={{
                        background: "#1d4ed8", color: "#fff", border: "none", borderRadius: 8,
                        padding: "8px 20px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13
                      }}>💾 حفظ التعديل</button>
                      <button onClick={() => setEditingId(null)} style={{
                        background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 8,
                        padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13
                      }}>إلغاء</button>
                    </div>
                  </div>
                )}

                {/* تأكيد الحذف */}
                {deleteConfirmId === f.id && (
                  <div style={{
                    padding: "16px", borderRadius: 12, background: "#fff7f7",
                    border: "2px solid #fca5a5", marginBottom: 10
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#dc2626", marginBottom: 4 }}>
                      🗑️ هل تريد حذف هذا الملف؟
                    </div>
                    <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 14 }}>
                      "{f.name}" – لا يمكن التراجع عن الحذف.
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => confirmDelete(activeIndicator.id, f.id)} style={{
                        background: "#dc2626", color: "#fff", border: "none", borderRadius: 8,
                        padding: "8px 20px", cursor: "pointer", fontFamily: "inherit", fontWeight: 700, fontSize: 13
                      }}>نعم، احذف</button>
                      <button onClick={() => setDeleteConfirmId(null)} style={{
                        background: "#f1f5f9", color: "#475569", border: "none", borderRadius: 8,
                        padding: "8px 16px", cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 13
                      }}>تراجع</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // رفع سريع – جميع المجالات
  const QuickUploadView = () => (
    <div style={S.container}>
      <div style={{ fontSize: 20, fontWeight: 800, color: "#1e293b", marginBottom: 20 }}>
        ⬆️ رفع سريع – اختر المجال والمؤشر
      </div>
      <input style={{ ...S.input, marginBottom: 20 }}
        placeholder="🔍 ابحث عن مؤشر بالاسم أو الرقم..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)} />
      {filteredDomains.map(domain => (
        <div key={domain.id} style={{ marginBottom: 24 }}>
          <div style={{
            fontSize: 16, fontWeight: 800, color: domain.color, marginBottom: 10,
            padding: "8px 14px", background: domain.light, borderRadius: 10, display: "inline-block"
          }}>
            {domain.icon} المجال {domain.num}: {domain.name}
          </div>
          {domain.indicators.map(ind => (
            <div key={ind.id}
              style={S.indicatorRow(hasFiles(ind.id), domain.color)}
              onClick={() => { setActiveIndicator(ind); setView("upload"); }}>
              <span style={{ fontSize: 18 }}>{hasFiles(ind.id) ? "✅" : "📋"}</span>
              <div style={{ flex: 1 }}>
                <span style={{ ...S.chip, background: domain.light, color: domain.color, fontWeight: 700, marginLeft: 8 }}>
                  {ind.id}
                </span>
                <span style={{ fontSize: 14, fontWeight: 600, color: "#1e293b" }}>{ind.name}</span>
              </div>
              <span style={{ fontSize: 12, color: "#94a3b8" }}>
                {getFiles(ind.id).length > 0 ? `${getFiles(ind.id).length} ملف` : "اضغط للرفع"}
              </span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  return (
    <div style={S.app}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
        @keyframes progress { 0%{width:0%} 50%{width:80%} 100%{width:100%} }
        * { box-sizing: border-box; }
        body { margin: 0; }
        button:hover { opacity: 0.88; transform: translateY(-1px); }
      `}</style>

      {/* Header */}
      <div style={S.header}>
        <div>
          <div style={S.headerTitle}>🏫 منصة شواهد التقويم الذاتي</div>
          <div style={S.headerSub}>ثانوية عرفات – جدة | 1447هـ</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            background: "rgba(255,255,255,0.15)", borderRadius: 10, padding: "8px 16px",
            color: "#fff", fontSize: 14, fontWeight: 700
          }}>
            {overallPct}% مكتمل
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={S.nav}>
        {[
          { key: "dashboard", label: "📊 لوحة التحكم" },
          { key: "domain", label: "📂 المجالات", onClick: () => { setView("domain"); if (!activeDomain) setActiveDomain(DOMAINS[0]); } },
          { key: "quickupload", label: "⬆️ رفع سريع" },
        ].map(n => (
          <button key={n.key} style={S.navBtn(view === n.key)}
            onClick={n.onClick || (() => setView(n.key))}>
            {n.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {view === "dashboard" && <DashboardView />}
      {(view === "domain") && <DomainView />}
      {view === "upload" && <UploadView />}
      {view === "quickupload" && <QuickUploadView />}
    </div>
  );
}
