"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { translations } from "@/lib/i18n";
import { 
  Scale, 
  FileText, 
  Search, 
  Languages, 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  BookOpen, 
  MessageSquare,
  Sparkles,
  Gavel
} from "lucide-react";

export default function Home() {
  const { lang, toggleLanguage, dir, user } = useApp();
  const t = translations[lang];

  // Interactive AI Demo State
  const [demoInput, setDemoInput] = useState("");
  const [demoResponse, setDemoResponse] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    if (!demoInput.trim()) return;

    setDemoLoading(true);
    setDemoResponse(null);

    // Simulate UAE legal expert answering after a short delay
    setTimeout(() => {
      const query = demoInput.toLowerCase();
      let responseText = "";
      let authority = "";
      let lawReference = "";

      if (query.includes("salary") || query.includes("employer") || query.includes("work") || query.includes("عمل") || query.includes("راتب")) {
        responseText = lang === "ar" 
          ? "وفقاً للمرسوم بقانون اتحادي رقم 33 لسنة 2021 بشأن تنظيم علاقات العمل بدولة الإمارات، يلزم صاحب العمل بدفع الأجور في مواعيد استحقاقها عبر نظام حماية الأجور (WPS). وفي حال التأخر لأكثر من 15 يوماً، يعتبر ذلك مخالفة." 
          : "Under UAE Decree-Law No. 33 of 2021 on Labour Relations, employers must pay salaries on time via the Wages Protection System (WPS). A delay exceeding 15 days constitutes a regulatory violation.";
        authority = lang === "ar" ? "وزارة الموارد البشرية والتوطين (MOHRE)" : "Ministry of Human Resources & Emiratisation (MOHRE)";
        lawReference = "Federal Decree-Law No. 33 of 2021";
      } else if (query.includes("rent") || query.includes("landlord") || query.includes("evict") || query.includes("إيجار") || query.includes("مالك")) {
        responseText = lang === "ar"
          ? "طبقاً للقانون رقم 26 لسنة 2007 لتنظيم العلاقة بين المؤجرين والمستأجرين بدبي، لا يمكن للمالك إخلاء المستأجر بشكل مفاجئ. يتطلب ذلك إخطاراً مسبقاً بـ 12 شهراً مرسلاً عن طريق الكاتب العدل أو البريد المسجل."
          : "Pursuant to Dubai Tenancy Law No. 26 of 2007, landlords cannot enforce immediate evictions. A 12-month notice served via Notary Public or Registered Mail is mandatory.";
        authority = lang === "ar" ? "مركز فض المنازعات الإيجارية - دائرة الأراضي والأملاك" : "Rental Dispute Center (RDC) - Dubai Land Department";
        lawReference = "Dubai Law No. 26 of 2007";
      } else if (query.includes("visa") || query.includes("golden") || query.includes("إقامة") || query.includes("ذهبية")) {
        responseText = lang === "ar"
          ? "تمنح الإقامة الذهبية في الإمارات لمدة 10 سنوات للمستثمرين العقاريين (بقيمة 2 مليون درهم فما فوق)، رواد الأعمال، النوابغ والمخترعين، وأوائل الطلبة، حيث تتيح الإقامة الكافية والملكية الكاملة للأعمال."
          : "The UAE 10-year Golden Visa is granted to property investors (property value AED 2M+), entrepreneurs, exceptional talents, and scientists, allowing 100% business ownership.";
        authority = lang === "ar" ? "الهيئة الاتحادية للهوية والجنسية والجمارك وأمن المنافذ (ICP)" : "Federal Authority for Identity, Citizenship, Customs and Port Security (ICP)";
        lawReference = "Cabinet Resolution No. 56 of 2018";
      } else {
        responseText = lang === "ar"
          ? "مرحباً بك. يرجى الاستفسار عن تفاصيل عقد العمل الخاص بك، أو نزاعات الإسكان وإيجاري، أو شروط تأسيس الشركات وسجل الخدمات التجارية في دولة الإمارات."
          : "Welcome. Please ask about labour disputes, tenancy Ejari guidelines, residency visa procedures, or mainland/free-zone corporate setup rules in the UAE.";
        authority = lang === "ar" ? "البوابة الرسمية لدولة الإمارات" : "UAE Government Portal";
        lawReference = "UAE Federal Laws";
      }

      setDemoResponse({ text: responseText, authority, law: lawReference });
      setDemoLoading(false);
    }, 1200);
  };

  const handleQuickQuestionClick = (qText) => {
    setDemoInput(qText);
  };

  return (
    <div className="min-h-screen bg-legal-gradient text-legal-textPrimary selection:bg-legal-emerald selection:text-white" style={{ fontFamily: lang === "ar" ? "'Noto Kufi Arabic', sans-serif" : "'Inter', sans-serif" }}>
      
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-legal-border/40 py-4 px-6 md:px-12 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-legal-emerald to-legal-gold p-2 rounded-xl shadow-lg">
            <Scale className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight glow-emerald">{t.appName}</h1>
            <p className="text-[10px] text-legal-textSecondary font-light leading-none mt-0.5">{t.tagline}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-legal-border bg-legal-card/40 text-sm hover:border-legal-emerald hover:text-legal-emerald transition-all duration-200"
          >
            <Languages className="h-4 w-4" />
            <span className="text-xs font-semibold">{lang === "en" ? "العربية" : "English"}</span>
          </button>

          {user ? (
            <Link 
              href="/dashboard"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-legal-emerald to-emerald-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-legal-emerald/20 transition-all duration-200"
            >
              {t.navDashboard}
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link 
                href="/login" 
                className="text-sm font-medium hover:text-legal-emerald transition-all duration-200 hidden sm:inline-block"
              >
                {t.login}
              </Link>
              <Link 
                href="/register"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-legal-emerald to-emerald-500 text-white font-semibold text-sm hover:shadow-lg hover:shadow-legal-emerald/20 transition-all duration-200"
              >
                {t.getStarted}
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 px-6 md:px-12 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side: Headline & Copy */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-legal-emerald/10 border border-legal-emerald/30 text-legal-emerald text-xs font-semibold">
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI-Driven UAE Compliance Engine v1.0</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            {t.heroTitle.split(" ").map((w, idx) => {
              if (idx > t.heroTitle.split(" ").length - 3) {
                return <span key={idx} className="bg-gradient-to-r from-legal-emerald to-teal-400 bg-clip-text text-transparent">{w} </span>;
              }
              return w + " ";
            })}
          </h2>

          <p className="text-legal-textSecondary text-base md:text-lg max-w-xl font-light leading-relaxed">
            {t.heroDesc}
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link 
              href="/register"
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-legal-emerald to-emerald-500 text-white font-bold text-base hover:shadow-lg hover:shadow-legal-emerald/25 transition-all duration-300 transform hover:-translate-y-0.5 flex items-center gap-2"
            >
              <span>{t.getStarted}</span>
              {lang === "en" ? <ArrowRight className="h-5 w-5" /> : <ArrowLeft className="h-5 w-5" />}
            </Link>
            <a 
              href="#demo"
              className="px-7 py-3.5 rounded-xl border border-legal-border bg-legal-card/30 font-semibold hover:border-legal-emerald transition-all duration-300 flex items-center justify-center"
            >
              {t.learnMore}
            </a>
          </div>

          {/* Quick trust metrics */}
          <div className="grid grid-cols-3 gap-6 border-t border-legal-border/30 pt-8 max-w-md">
            <div>
              <p className="text-2xl font-bold text-legal-emerald">100%</p>
              <p className="text-xs text-legal-textSecondary mt-0.5">{lang === "ar" ? "قوانين الإمارات المحدثة" : "UAE Laws Indexed"}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-legal-gold">Dual</p>
              <p className="text-xs text-legal-textSecondary mt-0.5">{lang === "ar" ? "ثنائي اللغة (إنجليزي/عربي)" : "EN / AR Support"}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-400">Secure</p>
              <p className="text-xs text-legal-textSecondary mt-0.5">{lang === "ar" ? "حماية وتشفير البيانات" : "AES Encrypted"}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Live AI Demo */}
        <div id="demo" className="lg:col-span-5">
          <div className="glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 h-40 w-40 bg-legal-emerald/10 blur-[80px] rounded-full"></div>
            
            <div className="flex items-center gap-2.5 pb-4 border-b border-legal-border/50">
              <div className="h-3 w-3 rounded-full bg-legal-emerald animate-pulse"></div>
              <h3 className="text-sm font-bold tracking-wider text-legal-emerald uppercase">{lang === "ar" ? "استشارة فورية تجريبية" : "Live Demo Consultation"}</h3>
            </div>

            <form onSubmit={handleDemoSubmit} className="mt-5 space-y-4">
              <div>
                <label className="text-xs font-semibold text-legal-textSecondary block mb-2">{t.demoQuestion}</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={demoInput}
                    onChange={(e) => setDemoInput(e.target.value)}
                    placeholder={lang === "ar" ? "مثال: عدم دفع الراتب، عقد إيجاري، الإقامة..." : "e.g., Unpaid salary MOHRE, Ejari eviction..."}
                    className="w-full glass-input px-4 py-3 rounded-xl pr-12 text-sm transition-all duration-200"
                  />
                  <button 
                    type="submit" 
                    className="absolute top-1.5 right-1.5 p-2 rounded-lg bg-legal-emerald hover:bg-legal-emeraldHover text-white transition-all duration-200"
                    style={{ right: dir === "rtl" ? "auto" : "0.375rem", left: dir === "rtl" ? "0.375rem" : "auto" }}
                  >
                    <Search className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Quick Questions buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                <button 
                  type="button" 
                  onClick={() => handleQuickQuestionClick(lang === "ar" ? "صاحب العمل لم يدفع راتبي" : "Employer did not pay salary")}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg bg-legal-border/40 hover:bg-legal-emerald/20 hover:text-legal-emerald transition-all duration-150 border border-transparent hover:border-legal-emerald/30"
                >
                  💼 {lang === "ar" ? "عدم دفع الراتب" : "Salary Dispute"}
                </button>
                <button 
                  type="button" 
                  onClick={() => handleQuickQuestionClick(lang === "ar" ? "كيفية التقديم على الإقامة الذهبية" : "How to get Golden Visa")}
                  className="text-[11px] px-2.5 py-1.5 rounded-lg bg-legal-border/40 hover:bg-legal-emerald/20 hover:text-legal-emerald transition-all duration-150 border border-transparent hover:border-legal-emerald/30"
                >
                  🇦🇪 {lang === "ar" ? "الإقامة الذهبية" : "Golden Visa"}
                </button>
              </div>

              {/* Demo Response Screen */}
              <div className="min-h-[140px] rounded-2xl bg-legal-bg/90 border border-legal-border/60 p-4 text-sm relative flex flex-col justify-between">
                {demoLoading ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-2">
                    <div className="h-6 w-6 border-2 border-legal-emerald border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-xs text-legal-textSecondary font-light">{t.loading}</span>
                  </div>
                ) : demoResponse ? (
                  <div className="space-y-3">
                    <p className="text-xs font-light text-legal-textSecondary leading-relaxed whitespace-pre-wrap">{demoResponse.text}</p>
                    <div className="border-t border-legal-border/40 pt-3">
                      <div className="flex justify-between items-start text-[10px]">
                        <div>
                          <span className="text-legal-emerald font-semibold block">{t.authority}:</span>
                          <span className="text-legal-textSecondary block">{demoResponse.authority}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-legal-gold font-semibold block">{lang === "ar" ? "المرجع القانوني" : "Law Citation"}:</span>
                          <span className="text-legal-textSecondary block">{demoResponse.law}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-center py-6 text-legal-textSecondary font-light space-y-2">
                    <MessageSquare className="h-8 w-8 text-legal-border/80" />
                    <p className="text-xs">{lang === "ar" ? "اسأل أو اختر سؤالاً سريعاً لتجربة محاكاة المساعد القانوني" : "Consult our AI to simulate instantaneous legal feedback"}</p>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* UAE Ministry & Official Authority Logos Grid */}
      <section className="bg-legal-card/25 border-y border-legal-border/30 py-12">
        <div className="max-w-7xl mx-auto px-6 text-center space-y-6">
          <p className="text-xs font-bold tracking-widest text-legal-gold uppercase">{lang === "ar" ? "مراجع السلطات الاتحادية والمحلية المشمولة" : "Government Authorities & Regulators Covered"}</p>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-80">
            <div className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-legal-card border border-legal-border flex items-center justify-center font-bold text-sm text-legal-emerald shadow-inner">MOHRE</div>
              <span className="text-[10px] text-legal-textSecondary mt-2">{lang === "ar" ? "وزارة الموارد البشرية" : "Ministry of Labour"}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-legal-card border border-legal-border flex items-center justify-center font-bold text-sm text-legal-gold shadow-inner">DLD</div>
              <span className="text-[10px] text-legal-textSecondary mt-2">{lang === "ar" ? "أراضي دبي (إيجاري)" : "Land Dept (Ejari)"}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-legal-card border border-legal-border flex items-center justify-center font-bold text-sm text-teal-400 shadow-inner">ICP</div>
              <span className="text-[10px] text-legal-textSecondary mt-2">{lang === "ar" ? "الهوية والجنسية" : "Identity & Visa (ICP)"}</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="h-14 w-14 rounded-full bg-legal-card border border-legal-border flex items-center justify-center font-bold text-sm text-amber-500 shadow-inner">DET</div>
              <span className="text-[10px] text-legal-textSecondary mt-2">{lang === "ar" ? "دائرة الاقتصاد والتنمية" : "Economy Dept (DED)"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <h2 className="text-3xl md:text-4xl font-extrabold">{lang === "ar" ? "المميزات الفائقة لمنصة سيفي مايند AI" : "Premium CiviMind AI Capabilities"}</h2>
          <p className="text-sm text-legal-textSecondary font-light">{lang === "ar" ? "صممت أدواتنا القانونية خصيصاً لتواكب اللوائح التنظيمية والقوانين المعمول بها بدولة الإمارات العربية المتحدة." : "Our systems are engineered directly to align with UAE regulatory statutes and decree-laws."}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Chat */}
          <div className="glass-panel p-8 rounded-3xl space-y-4 hover:border-legal-emerald transition-all duration-300 hover:shadow-lg hover:shadow-legal-emerald/5 group">
            <div className="h-12 w-12 rounded-2xl bg-legal-emerald/10 border border-legal-emerald/20 flex items-center justify-center text-legal-emerald group-hover:scale-110 transition-all duration-300">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">{t.navChat}</h3>
            <p className="text-xs text-legal-textSecondary font-light leading-relaxed">
              {lang === "ar" 
                ? "تحدث بلغة طبيعية (إنجليزية أو عربية) مع مستشارنا الذكي للحصول على تفاصيل المراسيم العمالية وحاسبة الإيجار وخطوات التقاضي."
                : "Converse in natural English or Arabic with our legal model. Secure quick references to MOHRE claims, tenancy laws, and legal references."}
            </p>
          </div>

          {/* Card 2: Gov Services */}
          <div className="glass-panel p-8 rounded-3xl space-y-4 hover:border-legal-gold transition-all duration-300 hover:shadow-lg hover:shadow-legal-gold/5 group">
            <div className="h-12 w-12 rounded-2xl bg-legal-gold/10 border border-legal-gold/20 flex items-center justify-center text-legal-gold group-hover:scale-110 transition-all duration-300">
              <Gavel className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">{t.navServices}</h3>
            <p className="text-xs text-legal-textSecondary font-light leading-relaxed">
              {lang === "ar" 
                ? "أداة بحث موحدة لكافة المعاملات الحكومية بالإمارات. استعلم عن شروط التأشيرات والمستندات المطلوبة ورسوم الدوائر الرسمية."
                : "Consolidated, fast search across UAE government procedures. Get step-by-step guidance, fees structures, and required document checklists."}
            </p>
          </div>

          {/* Card 3: Document AI */}
          <div className="glass-panel p-8 rounded-3xl space-y-4 hover:border-teal-400 transition-all duration-300 hover:shadow-lg hover:shadow-teal-400/5 group">
            <div className="h-12 w-12 rounded-2xl bg-teal-400/10 border border-teal-400/20 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-all duration-300">
              <FileText className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold">{t.navDocuments}</h3>
            <p className="text-xs text-legal-textSecondary font-light leading-relaxed">
              {lang === "ar" 
                ? "ارفع عقود الإيجار وعقود التوظيف (MOHRE). يقوم المساعد بتحليل المستند وتلخيصه واستخراج النقاط الحرجة للتأكد من امتثالها للوائح الإمارتية."
                : "Upload employment/tenancy contracts or agreements. The AI parses PDFs instantly to summarize obligations and flag warning points."}
            </p>
          </div>
        </div>
      </section>

      {/* UAE Security & Compliance Section */}
      <section className="bg-legal-card/45 border-t border-legal-border/30 py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-extrabold leading-tight">
              {lang === "ar" ? "خصوصية فائقة ومستويات أمان متوافقة" : "State-Of-The-Art Security & Encrypted Operations"}
            </h2>
            <p className="text-xs text-legal-textSecondary leading-relaxed font-light">
              {lang === "ar"
                ? "نحن نولي سرية مستنداتك أهمية قصوى. تخضع جميع عقود العمل والبيانات المدخلة للتشفير التام (AES-256) أثناء النقل والحفظ، كما تتوافق خوادمنا بالكامل مع سياسات الهيئة الوطنية للأمن السيبراني بدولة الإمارات."
                : "Your legal consultations and contract assets remain fully isolated. Under active encryption (AES-256) at rest and in transit. We implement standard Supabase JWT security protocols and align metadata with UAE federal data guidelines."}
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-legal-emerald" />
                <span className="text-xs font-semibold">{lang === "ar" ? "تشفير كامل للمستندات والملفات المرفوعة" : "End-to-End File Metadata Isolation"}</span>
              </div>
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-legal-emerald" />
                <span className="text-xs font-semibold">{lang === "ar" ? "تسجيل دخول آمن بالكامل عبر بروتوكولات JWT" : "Secure API Authentication (JWT Token Validation)"}</span>
              </div>
            </div>
          </div>
          <div className="glass-panel p-8 rounded-3xl text-center space-y-4">
            <div className="inline-block p-4 rounded-full bg-legal-emerald/10 text-legal-emerald">
              <BookOpen className="h-10 w-10 animate-bounce" />
            </div>
            <h4 className="text-lg font-bold">{lang === "ar" ? "مركز المعرفة والتشريعات" : "Regulatory Knowledge Vault"}</h4>
            <p className="text-xs text-legal-textSecondary font-light leading-relaxed">
              {lang === "ar"
                ? "تتكامل منصتنا دورياً مع تحديثات الجريدة الرسمية لدولة الإمارات العربية المتحدة ومصادر القرارات الوزارية الصادرة حديثاً."
                : "Integrated and periodically aligned with official UAE Cabinet resolutions and Gazette publication indexes for total accuracy."}
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="glass-panel border-t border-legal-border/40 py-12 px-6 md:px-12 text-center text-xs text-legal-textSecondary space-y-4">
        <div className="flex justify-center items-center gap-3">
          <Scale className="h-5 w-5 text-legal-emerald" />
          <span className="font-bold text-legal-textPrimary">{t.appName}</span>
        </div>
        <p className="max-w-md mx-auto font-light leading-relaxed">
          {t.heroDesc}
        </p>
        <div className="border-t border-legal-border/30 pt-6 mt-4">
          <p>{t.copyright}</p>
        </div>
      </footer>
    </div>
  );
}
