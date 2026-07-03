"use client";

import React, { useState, useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { translations } from "@/lib/i18n";
import { 
  Search, 
  Gavel, 
  ExternalLink, 
  FileCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ClipboardList
} from "lucide-react";

export default function GovServices() {
  const { lang, token, dir } = useApp();
  const t = translations[lang];

  // Services State
  const [services, setServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [expandedServiceId, setExpandedServiceId] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  // Categories list
  const categories = ["Visa", "Labour", "Rental", "Business"];

  useEffect(() => {
    fetchServices();
  }, [searchQuery, selectedCategory]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      let url = `${API_BASE}/services?`;
      if (searchQuery) url += `query=${encodeURIComponent(searchQuery)}&`;
      if (selectedCategory) url += `category=${encodeURIComponent(selectedCategory)}&`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (err) {
      console.log("Offline or loading local mock services catalog:", err);
      // Simulate local mock services based on mock_db.py
      const mockServices = [
        {
          id: 1,
          category: "Labour",
          title_en: "Filing a Labour Dispute / Unpaid Salary Complaint",
          title_ar: "تقديم شكوى عمالية / عدم دفع الراتب",
          description_en: "Official service by MOHRE allowing employees to lodge a formal complaint against employers for non-payment of salary, contract breaches, or arbitrary termination.",
          description_ar: "الخدمة الرسمية من وزارة الموارد البشرية والتوطين التي تتيح للموظفين تقديم شكوى رسمية ضد أصحاب العمل بسبب عدم دفع الرواتب أو الإخلال بالعقد أو الفصل التعسفي.",
          authority_en: "Ministry of Human Resources & Emiratisation (MOHRE)",
          authority_ar: "وزارة الموارد البشرية والتوطين",
          url: "https://www.mohre.gov.ae/",
          steps_en: [
            "Register and log in on MOHRE portal or app using UAE PASS.",
            "Navigate to services and select 'Register Labour Complaint'.",
            "Enter contract details, dispute reasons (e.g., unpaid salary), and claim amount.",
            "Submit the complaint. MOHRE will call both parties for amicable settlement within 14 days.",
            "If no agreement is reached, MOHRE issues a referral letter to the Labour Court."
          ],
          steps_ar: [
            "قم بالتسجيل وتسجيل الدخول على بوابة وزارة الموارد البشرية والتوطين باستخدام الهوية الرقمية.",
            "انتقل إلى الخدمات واختر 'تسجيل شكوى عمالية'.",
            "أدخل تفاصيل العقد، وأسباب النزاع (مثال: راتب غير مدفوع)، ومبلغ المطالبة.",
            "أرسل الشكوى. ستقوم الوزارة بالاتصال بالطرفين للتسوية الودية في غضون 14 يومًا.",
            "في حال عدم التوصل لاتفاق، تصدر الوزارة خطاب إحالة إلى المحكمة العمالية."
          ],
          docs_required_en: ["MOHRE Labour Contract copy", "Emirates ID copy", "Bank statements showing unpaid months", "Written proof of communication with employer"],
          docs_required_ar: ["نسخة من عقد العمل المعتمد", "نسخة من الهوية الرقمية / الهوية الإماراتية", "كشف حساب بنكي يوضح الأشهر غير المدفوعة", "إثبات كتابي للتواصل مع صاحب العمل"]
        },
        {
          id: 2,
          category: "Visa",
          title_en: "UAE Golden Visa Application",
          title_ar: "طلب الإقامة الذهبية في دولة الإمارات",
          description_en: "Long-term 10-year residency visa for investors, entrepreneurs, exceptional talents, researchers, outstanding students, and frontline heroes.",
          description_ar: "تأشيرة إقامة طويلة الأجل لمدة 10 سنوات للمستثمرين، ورواد الأعمال، وأصحاب المواهب الاستثنائية، والباحثين، والطلاب المتفوقين، وأبطال الخطوط الأمامية.",
          authority_en: "Federal Authority for Identity, Citizenship, Customs and Port Security (ICP) / GDRFA Dubai",
          authority_ar: "الهيئة الاتحادية للهوية والجنسية والجمارك وأمن المنافذ / إقامة دبي",
          url: "https://smartservices.icp.gov.ae/",
          steps_en: [
            "Check eligibility categories (e.g., Property Investor minimum AED 2 Million).",
            "Apply for a nominative or initial approval online via ICP or GDRFA portal.",
            "Upload required investment, academic, or professional certificates.",
            "Pay application fees and undergo medical fitness screening in the UAE.",
            "Cancel current visa and get the Golden residency permit issued."
          ],
          steps_ar: [
            "التحقق من فئات الأهلية (مثال: مستثمر عقاري بقيمة لا تقل عن 2 مليون درهم).",
            "التقدم بطلب للحصول على ترشيح أو موافقة مبدئية عبر بوابة الهيئة أو إقامة دبي.",
            "تحميل شهادات الاستثمار أو الشهادات الأكاديمية أو المهنية المطلوبة.",
            "دفع رسوم الطلب وإجراء الفحص الطبي في دولة الإمارات.",
            "إلغاء التأشيرة الحالية وإصدار الإقامة الذهبية."
          ],
          docs_required_en: ["Title deed of property (for real estate investors) or academic degree equivalency", "Valid Passport copy", "Emirates ID copy (if resident)", "Health Insurance policy valid in UAE"],
          docs_required_ar: ["سند ملكية العقار (للمستثمرين العقاريين) أو معادلة الشهادات الأكاديمية", "نسخة من جواز سفر ساري المفعول", "نسخة من الهوية الإماراتية (للمقيمين)", "تأمين صحي ساري المفعول في الدولة"]
        },
        {
          id: 3,
          category: "Rental",
          title_en: "Tenancy Dispute Filing (Rental Dispute Center)",
          title_ar: "رفع دعوى نزاع إيجاري (مركز فض المنازعات الإيجارية)",
          description_en: "Service to resolve disputes arising between landlords and tenants in Dubai, such as unfair eviction notice or unjustified rent increases exceeding RERA calculator bounds.",
          description_ar: "خدمة لحل النزاعات التي تنشأ بين الملاك والمستأجرين في دبي، مثل إنذار الإخلاء غير القانوني أو زيادة الإيجار غير المبررة التي تتجاوز حاسبة إيجارات أراضي دبي.",
          authority_en: "Dubai Land Department - Rental Dispute Center (RDC)",
          authority_ar: "دائرة الأراضي والأملاك بدبي - مركز فض المنازعات الإيجارية",
          url: "https://dubailand.gov.ae/",
          steps_en: [
            "Attempt amicable settlement or check RERA Index first.",
            "Log in to DLD portal and open RDC portal.",
            "File a 'Rental Dispute Case' and upload Ejari contract details.",
            "Pay RDC filing fee (usually 3.5% of the annual rent, min AED 500, max AED 20,000).",
            "Attend the mediation sessions or arbitration hearings online."
          ],
          steps_ar: [
            "محاولة التسوية الودية أو التحقق من مؤشر الإيجارات أولاً.",
            "تسجيل الدخول إلى بوابة دائرة الأراضي والأملاك وفتح بوابة مركز فض المنازعات.",
            "رفع 'دعوى نزاع إيجاري' وتحميل تفاصيل عقد إيجاري.",
            "دفع رسوم تسجيل القضية (عادة 3.5% من الإيجار السنوي، بحد أدنى 500 درهم وبحد أقصى 20,000 درهم).",
            "حضور جلسات الوساطة أو جلسات التحكيم عبر الإنترنت."
          ],
          docs_required_en: ["Ejari certificate", "Tenancy Contract copy", "Copy of Passport & Emirates ID of applicant", "Proof of rent payments (cheques, bank transfers)", "Correspondence/eviction notice copies"],
          docs_required_ar: ["شهادة تسجيل إيجاري", "نسخة من عقد الإيجار", "نسخة من جواز السفر والهوية الإماراتية لمقدم الطلب", "إثبات دفعات الإيجار (شيكات، تحويلات بنكية)", "نسخ من المراسلات / إنذارات الإخلاء"]
        },
        {
          id: 4,
          category: "Business",
          title_en: "Commercial Trade License Registration",
          title_ar: "تأسيس رخصة تجارية جديدة",
          description_en: "Service by the Department of Economy and Tourism (DET) or Free Zone authorities to establish a new corporate entity or commercial trade license in the UAE.",
          description_ar: "خدمة من دائرة الاقتصاد والسياحة أو سلطات المناطق الحرة لتأسيس كيان تجاري جديد أو إصدار رخصة تجارية في دولة الإمارات العربية المتحدة.",
          authority_en: "Department of Economy and Tourism (DET) / Free Zone Authorities",
          authority_ar: "دائرة الاقتصاد والسياحة / سلطات المناطق الحرة",
          url: "https://ded.ae/",
          steps_en: [
            "Choose business legal form and business activity.",
            "Register trade name and receive initial approval.",
            "Draft and sign the Memorandum of Association (MOA) or Service Agent agreement.",
            "Establish business address (rent physical office space with Ejari).",
            "Submit application, pay licensing fee, and receive commercial license."
          ],
          steps_ar: [
            "تحديد الشكل القانوني للشركة والنشاط الاقتصادي.",
            "حجز الاسم التجاري والحصول على الموافقة المبدئية.",
            "إعداد وتوقيع عقد التأسيس (MOA) أو اتفاقية وكيل الخدمات.",
            "تحديد موقع الشركة (استئجار مكتب أو مقر عمل وتسجيل إيجاري).",
            "تقديم الطلب ودفع الرسوم المقررة واستلام الرخصة التجارية."
          ],
          docs_required_en: ["Passport copy of all partners", "Emirates ID copy (if applicable)", "Trade Name reservation certificate", "Initial Approval certificate", "Ejari contract of physical office"],
          docs_required_ar: ["نسخة من جواز سفر جميع الشركاء", "نسخة من الهوية الإماراتية (إن وجدت)", "شهادة حجز الاسم التجاري", "شهادة الموافقة المبدئية", "عقد إيجاري لمقر العمل"]
        }
      ];

      // Perform local filtering based on options
      let results = mockServices;
      if (selectedCategory) {
        results = results.filter(s => s.category.toLowerCase() === selectedCategory.toLowerCase());
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        results = results.filter(s => 
          s.title_en.toLowerCase().includes(q) || 
          s.title_ar.includes(q) ||
          s.description_en.toLowerCase().includes(q) ||
          s.description_ar.includes(q)
        );
      }
      setServices(results);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedServiceId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight">{t.navServices}</h2>
          <p className="text-xs text-legal-textSecondary font-light">{lang === "ar" ? "تفاصيل العقود وعمليات التقديم للجهات الرسمية بالدولة" : "Step-by-step applying procedures for UAE official authorities"}</p>
        </div>
      </div>

      {/* Search and Categories bar */}
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchGovPlaceholder}
            className="w-full glass-input px-4 py-3.5 pr-12 text-xs rounded-xl"
            style={{
              paddingRight: dir === "rtl" ? "1rem" : "3rem",
              paddingLeft: dir === "rtl" ? "3rem" : "1rem"
            }}
          />
          <div 
            className="absolute top-3.5 text-legal-textSecondary"
            style={{
              right: dir === "rtl" ? "auto" : "1rem",
              left: dir === "rtl" ? "1rem" : "auto"
            }}
          >
            <Search className="h-4.5 w-4.5" />
          </div>
        </div>

        {/* Categories custom tabs */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory("")}
            className={`text-[10px] font-bold px-3 py-2 rounded-xl border transition-all duration-150 ${
              selectedCategory === ""
                ? "bg-legal-emerald/20 border-legal-emerald/40 text-legal-emerald"
                : "border-legal-border text-legal-textSecondary hover:text-legal-textPrimary hover:bg-legal-card/20"
            }`}
          >
            {lang === "ar" ? "الكل" : "All Services"}
          </button>
          {categories.map((cat) => {
            const labelKey = `category${cat}`;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] font-bold px-3 py-2 rounded-xl border transition-all duration-150 ${
                  selectedCategory === cat
                    ? "bg-legal-emerald/20 border-legal-emerald/40 text-legal-emerald"
                    : "border-legal-border text-legal-textSecondary hover:text-legal-textPrimary hover:bg-legal-card/20"
                }`}
              >
                {t[labelKey] || cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Services List Grid */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 flex flex-col items-center justify-center gap-2">
            <div className="h-7 w-7 border-2 border-legal-emerald border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs text-legal-textSecondary font-light">{t.loading}</span>
          </div>
        ) : services.length === 0 ? (
          <div className="glass-panel p-12 text-center rounded-2xl text-xs text-legal-textSecondary font-light">
            {lang === "ar" ? "لم نعثر على خدمات مطابقة للبحث." : "No matching government services found."}
          </div>
        ) : (
          services.map((service) => {
            const isExpanded = service.id === expandedServiceId;
            const title = lang === "ar" ? service.title_ar : service.title_en;
            const desc = lang === "ar" ? service.description_ar : service.description_en;
            const authority = lang === "ar" ? service.authority_ar : service.authority_en;
            const steps = lang === "ar" ? service.steps_ar : service.steps_en;
            const docs = lang === "ar" ? service.docs_required_ar : service.docs_required_en;
            
            return (
              <div 
                key={service.id}
                className={`glass-panel rounded-2xl overflow-hidden transition-all duration-200 border ${
                  isExpanded ? "border-legal-emerald/50 bg-legal-card/40" : "border-legal-border/50 bg-legal-card/20"
                }`}
              >
                {/* Accordion Trigger */}
                <div 
                  onClick={() => toggleExpand(service.id)}
                  className="px-6 py-5 flex justify-between items-center cursor-pointer select-none"
                >
                  <div className="space-y-1.5 min-w-0 flex-1 pr-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[9px] bg-legal-emerald/10 text-legal-emerald px-2 py-0.5 rounded-md border border-legal-emerald/20 font-bold uppercase tracking-wider">
                        {service.category}
                      </span>
                      <span className="text-[10px] text-legal-gold font-medium">
                        {authority}
                      </span>
                    </div>
                    <h3 className="font-bold text-xs text-legal-textPrimary tracking-tight">{title}</h3>
                  </div>
                  <div className="text-legal-textSecondary shrink-0 ml-2">
                    {isExpanded ? <ChevronUp className="h-4.5 w-4.5" /> : <ChevronDown className="h-4.5 w-4.5" />}
                  </div>
                </div>

                {/* Accordion Content */}
                {isExpanded && (
                  <div className="px-6 pb-6 border-t border-legal-border/50 pt-5 space-y-6 text-xs font-light">
                    {/* Description */}
                    <div className="space-y-1.5">
                      <h4 className="font-bold text-legal-textPrimary flex items-center gap-1.5">
                        <Gavel className="h-3.5 w-3.5 text-legal-gold" />
                        <span>{lang === "ar" ? "نبذة عن الخدمة" : "Service Overview"}</span>
                      </h4>
                      <p className="text-legal-textSecondary leading-relaxed pl-5">{desc}</p>
                    </div>

                    {/* Step-by-Step applying directions */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-legal-textPrimary flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5 text-legal-emerald" />
                        <span>{lang === "ar" ? "خطوات التقديم الرسمية" : "Official Step-by-Step Procedure"}</span>
                      </h4>
                      <ol className="list-decimal pl-9 space-y-1.5 text-legal-textSecondary leading-relaxed">
                        {steps.map((step, sIdx) => (
                          <li key={sIdx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Required Documents checklist */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-legal-textPrimary flex items-center gap-1.5">
                        <ClipboardList className="h-3.5 w-3.5 text-teal-400" />
                        <span>{lang === "ar" ? "المستندات المطلوبة" : "Documents Required Checklist"}</span>
                      </h4>
                      <ul className="list-disc pl-9 space-y-1.5 text-legal-textSecondary leading-relaxed">
                        {docs.map((doc, dIdx) => (
                          <li key={dIdx} className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>
                            <span>{doc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Official link URL */}
                    {service.url && (
                      <div className="pt-2 border-t border-legal-border/30 flex justify-end">
                        <a 
                          href={service.url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-4 py-2 rounded-xl bg-legal-emerald hover:bg-legal-emeraldHover text-white font-semibold flex items-center gap-2 transition-all duration-150 text-[10px]"
                        >
                          <span>{t.officialLink}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
