"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { 
  Briefcase, 
  Building, 
  Home, 
  Heart, 
  Users, 
  CheckCircle2, 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  ExternalLink,
  ShieldAlert,
  Compass
} from "lucide-react";

// Inline dictionary for life events localizations in all 10 languages
const eventTranslations = {
  en: {
    title: "Life Events Assistant",
    subtitle: "Checklist-based milestones for navigating UAE regulatory frameworks.",
    backBtn: "Back to Milestones",
    fees: "Estimated Fees",
    reqDocs: "Required Documents",
    officialPortal: "Official Portal",
    addReminder: "Add renewal alert",
    reminderAdded: "Added to Reminders!",
    checklist: "Step-by-Step Checklist",
    statusCompleted: "Completed",
    statusRemaining: "Remaining",
    milestones: {
      job: {
        title: "I got a new job",
        desc: "Labour permit registration, medical screening, and work visa stamp processes.",
        steps: [
          "MOHRE Offer Letter: Read carefully and sign the official job offer contract.",
          "Entry Permit: Wait for employer to issue the quota-based labour entry permit.",
          "Medical Fitness Check: Visit an authorized DHA/MOHAP health center for blood tests & X-ray.",
          "Emirates ID Fingerprints: Complete biometric scanning at an ICP customer happiness center.",
          "Labour Card & Residence Permit: Final signature of MOHRE contract and visa stamp issuance."
        ],
        docs: ["Passport copy", "Signed MOHRE offer letter", "Attested educational degrees", "Previous visa cancellation paper (if applicable)"],
        fees: "Free (Legally, the employer must cover all visa and onboarding costs)",
        linkName: "MOHRE Portal",
        url: "https://www.mohre.gov.ae/"
      },
      business: {
        title: "I want to start a business",
        desc: "Trade name reservation, mainland LLC vs free zone setup, and commercial license.",
        steps: [
          "Choose Legal Form & Activity: Select mainland/freezone setup and commercial/professional activities.",
          "Trade Name Reservation: Register name and secure Initial Approval from DET or Freezone Authority.",
          "Memorandum of Association: Draft and sign the MOA at a notary public or via digital signature.",
          "Establishment Card & Space: Secure physical office space, get Ejari, and apply for establishment card.",
          "Commercial License: Pay final fees to receive the trade license and join Chamber of Commerce."
        ],
        docs: ["Passport copies of partners", "Proposed trade name selection", "Lease agreement/Ejari", "Initial approval certificate"],
        fees: "AED 10,000 - AED 25,000+ (depending on jurisdiction, activities, and office lease)",
        linkName: "Dubai DET Portal",
        url: "https://ded.ae/"
      },
      move: {
        title: "I'm moving to a new apartment",
        desc: "Tenancy contract signing, Ejari registration, and utility connection activation.",
        steps: [
          "Sign Tenancy Contract: Agree on rental cheques, security deposit, and maintenance terms.",
          "Ejari Registration: Certify the tenancy contract online via DLD REST App or Ejari centers.",
          "DEWA Setup: Activate water and electricity connection (requires Ejari number).",
          "Building Move-in Permit: Apply for the community or building developer permit to access elevators."
        ],
        docs: ["Signed tenancy contract", "Landlord's passport & title deed copy", "Tenant's Emirates ID copy", "Security deposit receipt"],
        fees: "Ejari (AED 220), DEWA Deposit (AED 2,000 for apartments / AED 4,000 for villas)",
        linkName: "Dubai Land Department",
        url: "https://dubailand.gov.ae/"
      },
      marriage: {
        title: "I'm getting married",
        desc: "Premarital health tests, court marriage registration, and status attestation.",
        steps: [
          "Pre-Marital Health Screening: Visit a public clinic to complete mandatory medical exams.",
          "Court Ceremony Reservation: Book date at Dubai Courts, Abu Dhabi Judicial, or temple/church.",
          "Marriage Contract Signing: Execute contract with witnesses and local registrar (Ma'zoon).",
          "MOFA Attestation: Attest the certificate at the Ministry of Foreign Affairs for official use.",
          "Emirates ID Update: Formally update family books or sponsor spouse visa status."
        ],
        docs: ["Original passports & Emirates IDs of bride & groom", "Pre-marital medical certificate", "Emirates IDs of two witnesses"],
        fees: "Court Service (AED 300 - AED 1,000), MOFA Attestation (AED 150)",
        linkName: "Dubai Courts Portal",
        url: "https://www.dc.gov.ae/"
      },
      family: {
        title: "I'm bringing my family",
        desc: "Establishing sponsorship files, residency entry permits, and dependent visas.",
        steps: [
          "Sponsorship Eligibility: Ensure minimum salary (AED 4,000 or AED 3,000 + housing) is met.",
          "Sponsor File Activation: Open sponsor file via ICP Smart Services or GDRFA portal.",
          "Dependent Entry Permit: Submit visa request, upload certificates, and print entry permit.",
          "In-Country Status Change: Complete entry status modification if dependents are inside UAE.",
          "Medical & ID Stamping: Dependent medical checks, Emirates ID registration, and visa issuance."
        ],
        docs: ["Registered Ejari tenancy contract", "Salary certificate & employment contract", "Attested marriage & birth certificates", "Passports of dependents"],
        fees: "AED 2,500 - AED 4,500+ per dependent (excluding health insurance premiums)",
        linkName: "ICP Smart Services",
        url: "https://smartservices.icp.gov.ae/"
      }
    }
  },
  ar: {
    title: "مساعد مسارات الحياة",
    subtitle: "خطوات توجيهية وإجراءات للتعامل مع المتطلبات واللوائح الحكومية في دولة الإمارات.",
    backBtn: "العودة للمسارات",
    fees: "الرسوم التقديرية",
    reqDocs: "المستندات المطلوبة",
    officialPortal: "البوابة الرسمية",
    addReminder: "إضافة تنبيه تجديد",
    reminderAdded: "تم الإضافة للتنبيهات!",
    checklist: "قائمة الإجراءات خطوة بخطوة",
    statusCompleted: "مكتمل",
    statusRemaining: "متبقي",
    milestones: {
      job: {
        title: "حصلت على وظيفة جديدة",
        desc: "إجراءات استخراج تصريح العمل بوزارة الموارد البشرية، الفحص الطبي، وختم الإقامة.",
        steps: [
          "عرض عمل الوزارة (MOHRE): مراجعة وتوقيع عرض العمل الرسمي بشكل دقيق.",
          "تصريح الدخول: انتظار إصدار تصريح العمل لدخول الدولة المقدم من الكفيل.",
          "الفحص الطبي: زيارة مركز معتمد (DHA/MOHAP) لإجراء فحوصات الدم والأشعة الصدرية.",
          "البصمة للهوية: إتمام الفحوصات الحيوية والبصمات في مركز الهيئة الاتحادية للهوية والجنسية.",
          "تصريح الإقامة وبطاقة العمل: إصدار عقد العمل النهائي وختم تأشيرة الإقامة الرسمية."
        ],
        docs: ["نسخة من جواز السفر", "عرض العمل الموقع من الطرفين", "المؤهلات العلمية المصدقة", "أوراق إلغاء الإقامة السابقة (إن وجدت)"],
        fees: "مجاني (قانوناً، يجب على صاحب العمل تحمل كافة تكاليف التأشيرة والتوظيف)",
        linkName: "بوابة وزارة العمل",
        url: "https://www.mohre.gov.ae/"
      },
      business: {
        title: "أريد تأسيس شركة تجارية",
        desc: "حجز الاسم التجاري، وتحديد موقع التأسيس (داخل الدولة أو منطقة حرة)، واستلام الرخصة.",
        steps: [
          "تحديد النشاط والشكل القانوني: اختيار موقع الشركة (Mainland أو Free Zone) والأنشطة.",
          "حجز الاسم التجاري: تقديم طلب حجز الاسم والحصول على الموافقة المبدئية من DET أو هيئة المنطقة الحرة.",
          "عقد التأسيس (MOA): كتابة وتوقيع عقد التأسيس أمام الكاتب العدل أو إلكترونياً.",
          "تجهيز المقر وبطاقة المنشأة: استئجار مكتب وتوثيقه (إيجاري) والتقديم لبطاقة المنشأة.",
          "إصدار الرخصة التجارية: دفع الرسوم النهائية واستلام الرخصة والانضمام لغرفة التجارة."
        ],
        docs: ["جوازات سفر الشركاء", "الاسم التجاري المقترح", "عقد الإيجار الموثق (إيجاري)", "شهادة الموافقة المبدئية"],
        fees: "10,000 - 25,000 درهم+ (تعتمد على المنطقة الحرة أو البر الرئيسي ومساحة المكتب الأجرة)",
        linkName: "اقتصادية دبي (DET)",
        url: "https://ded.ae/"
      },
      move: {
        title: "أريد الانتقال لشقة جديدة",
        desc: "توقيع عقد الإيجار، توثيقه في نظام إيجاري المعتمد، وتوصيل خدمات الكهرباء والماء.",
        steps: [
          "توقيع عقد الإيجار: الاتفاق على عدد الشيكات وقيمة التأمين السنوي ومسؤوليات الصيانة.",
          "تسجيل إيجاري: توثيق العقد عبر تطبيق دبي ريست أو مراكز الطباعة المعتمدة.",
          "توصيل DEWA: تفعيل الكهرباء والمياه وربطها برقم إيجاري مباشرة.",
          "تصريح النقل والمغادرة: التقدم بطلب تصريح الانتقال وإدخال الأثاث لدى مطور المبنى."
        ],
        docs: ["عقد الإيجار الموقع", "جواز المالك وصورة سند الملكية", "الهوية الإماراتية للمستأجر", "إيصال دفع تأمين الإيجار"],
        fees: "توثيق إيجاري (220 درهم)، تأمين هيئة كهرباء ومياه دبي (2,000 درهم للشقق / 4,000 درهم للفلل)",
        linkName: "دائرة الأراضي والأملاك بدبي",
        url: "https://dubailand.gov.ae/"
      },
      marriage: {
        title: "أنا مقبل على الزواج",
        desc: "الفحوصات الطبية للمقبلين على الزواج، عقد القران بالمحكمة، وتصديق الشهادة.",
        steps: [
          "الفحص الطبي قبل الزواج: مراجعة مركز صحي حكومي لإصدار شهادة الفحص الإلزامية.",
          "حجز موعد المحكمة: التسجيل عبر محاكم دبي أو دائرة القضاء بأبوظبي أو الكنائس المرخصة.",
          "توقيع عقد القران: كتابة العقد بحضور المأذون والشهود واستيفاء الشروط.",
          "تصديق الخارجية: توثيق وتصديق شهادة الزواج بوزارة الخارجية الإماراتية.",
          "تحديث الهوية والإقامة: إجراء تعديل الحالة الاجتماعية بكفالة الزوجة وتحديث البيانات."
        ],
        docs: ["جوازات سفر الزوجين والشهود", "شهادة الفحص الطبي للزواج", "الهوية الإماراتية الأصلية للشهود والأطراف"],
        fees: "رسوم عقد القران (300 - 1,000 درهم)، تصديق وزارة الخارجية (150 درهم)",
        linkName: "بوابة محاكم دبي",
        url: "https://www.dc.gov.ae/"
      },
      family: {
        title: "أريد استقدام عائلتي وإقامتهم",
        desc: "تفعيل ملف الكفالة، التقديم على إذن الدخول، وإكمال فحوصات الإقامة السكنية.",
        steps: [
          "تأكيد الأهلية والراتب: استيفاء حد الراتب الأدنى (4,000 درهم شهرياً أو 3,000 + السكن).",
          "فتح ملف الكفيل: إنشاء وتفعيل ملف كفالة الأقارب ببرنامج الهيئة الاتحادية (ICP).",
          "طلب إذن الدخول: تقديم الطلبات وتصديق الشهادات العائلية لطباعة تصريح الدخول.",
          "تعديل الوضع الداخلي: دفع رسوم تعديل الوضع في حال كان أفراد العائلة داخل الدولة.",
          "الفحوصات الطبية والهوية: إتمام الفحص الطبي، وبصمة الهوية، وطباعة الإقامة."
        ],
        docs: ["عقد إيجار موثق (إيجاري)", "عقد العمل وشهادة الراتب السارية", "شهادة الزواج وشهادات ميلاد الأبناء المصدقة", "جوازات سفر المكفولين"],
        fees: "2,500 - 4,500 درهم+ لكل مكفول (بالإضافة لقيمة وثيقة التأمين الصحي السنوية)",
        linkName: "خدمات الهيئة الذكية (ICP)",
        url: "https://smartservices.icp.gov.ae/"
      }
    }
  }
};

// Simple Fallbacks for other 8 languages
const getLocalizedValue = (lang, eventKey, field) => {
  const dataset = eventTranslations[lang] || eventTranslations["en"];
  return dataset.milestones[eventKey][field];
};

export default function LifeEvents() {
  const { lang, dir } = useApp();
  const currentLang = eventTranslations[lang] ? lang : "en";
  const t = eventTranslations[currentLang];

  const [activeEvent, setActiveEvent] = useState(null);
  const [completedSteps, setCompletedSteps] = useState({});
  const [reminderStatus, setReminderStatus] = useState({});

  const milestonesData = [
    { key: "job", icon: Briefcase, color: "from-blue-500 to-indigo-600" },
    { key: "business", icon: Building, color: "from-amber-500 to-orange-600" },
    { key: "move", icon: Home, color: "from-emerald-500 to-teal-600" },
    { key: "marriage", icon: Heart, color: "from-pink-500 to-rose-600" },
    { key: "family", icon: Users, color: "from-purple-500 to-violet-600" }
  ];

  const toggleStep = (eventKey, stepIdx) => {
    const key = `${eventKey}-${stepIdx}`;
    setCompletedSteps(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const addReminderAlert = (eventKey) => {
    // Generate alert details
    const milestoneTitle = t.milestones[eventKey].title;
    const reminders = JSON.parse(localStorage.getItem("civimind_reminders") || "[]");
    
    // Add default 1 year renewal alert
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    const newReminder = {
      id: "rem-" + Date.now(),
      category: eventKey === "business" ? "Business" : eventKey === "move" ? "Rental" : "Visa",
      title: `${milestoneTitle} Renewal Alert`,
      date: expiryDate.toISOString().split("T")[0],
      daysRemaining: 365,
      alertOn: true
    };

    localStorage.setItem("civimind_reminders", JSON.stringify([...reminders, newReminder]));
    
    setReminderStatus(prev => ({
      ...prev,
      [eventKey]: true
    }));

    setTimeout(() => {
      setReminderStatus(prev => ({
        ...prev,
        [eventKey]: false
      }));
    }, 3000);
  };

  return (
    <div className="space-y-6" dir={dir}>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-legal-textPrimary flex items-center gap-2">
            <Compass className="h-5.5 w-5.5 text-legal-emerald animate-spin-slow" />
            <span>{t.title}</span>
          </h2>
          <p className="text-xs text-legal-textSecondary font-light mt-1 max-w-xl">
            {t.subtitle}
          </p>
        </div>
      </div>

      {!activeEvent ? (
        /* Milestones Selection Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {milestonesData.map((milestone) => {
            const data = t.milestones[milestone.key];
            const Icon = milestone.icon;
            return (
              <div 
                key={milestone.key}
                onClick={() => setActiveEvent(milestone.key)}
                className="glass-panel hover-card rounded-2xl p-6 border border-legal-border/40 bg-legal-card/25 flex flex-col justify-between cursor-pointer group"
              >
                <div className="space-y-4">
                  <div className={`h-11 w-11 rounded-xl bg-gradient-to-tr ${milestone.color} flex items-center justify-center text-white shadow-lg`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-legal-textPrimary group-hover:text-legal-emerald transition-colors duration-150">
                      {data.title}
                    </h3>
                    <p className="text-[10px] text-legal-textSecondary font-light leading-relaxed mt-2.5">
                      {data.desc}
                    </p>
                  </div>
                </div>
                <div className="pt-5 border-t border-legal-border/30 mt-6 flex justify-end">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-legal-emerald group-hover:underline">
                    {lang === "ar" ? "عرض الخطة الكاملة ←" : "View Checklist →"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Expanded Checklist Detail Panel */
        <div className="glass-panel border border-legal-border/50 rounded-2xl bg-legal-card/20 overflow-hidden">
          {/* Panel Header */}
          <div className="p-6 border-b border-legal-border/50 bg-legal-card/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <button 
              onClick={() => setActiveEvent(null)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-legal-border bg-legal-card/30 hover:text-legal-emerald hover:border-legal-emerald/40 text-[10px] font-semibold transition-all duration-150"
            >
              <ArrowLeft className="h-3.5 w-3.5" style={{ transform: dir === "rtl" ? "rotate(180deg)" : "none" }} />
              <span>{t.backBtn}</span>
            </button>
            <h3 className="text-sm font-bold text-legal-textPrimary">
              {t.milestones[activeEvent].title}
            </h3>
            <button
              onClick={() => addReminderAlert(activeEvent)}
              className={`px-3 py-1.5 rounded-xl border text-[10px] font-semibold transition-all duration-200 ${
                reminderStatus[activeEvent]
                  ? "bg-legal-emerald/20 border-legal-emerald/30 text-legal-emerald"
                  : "bg-legal-card border-legal-border hover:border-legal-emerald hover:text-legal-emerald text-legal-textSecondary"
              }`}
            >
              <Calendar className="h-3.5 w-3.5 inline mr-1.5 align-middle" />
              <span className="align-middle">{reminderStatus[activeEvent] ? t.reminderAdded : t.addReminder}</span>
            </button>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Steps Checklist - Left 2 Columns */}
            <div className="lg:col-span-2 space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-legal-textSecondary border-b border-legal-border/40 pb-2 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-legal-emerald" />
                <span>{t.checklist}</span>
              </h4>
              
              <div className="space-y-3.5">
                {t.milestones[activeEvent].steps.map((step, idx) => {
                  const isCompleted = completedSteps[`${activeEvent}-${idx}`];
                  const splitIndex = step.indexOf(":");
                  const stepHeader = splitIndex !== -1 ? step.substring(0, splitIndex) : `Step ${idx+1}`;
                  const stepBody = splitIndex !== -1 ? step.substring(splitIndex + 1).trim() : step;

                  return (
                    <div 
                      key={idx}
                      onClick={() => toggleStep(activeEvent, idx)}
                      className={`flex gap-4 p-4 rounded-xl border cursor-pointer select-none transition-all duration-150 ${
                        isCompleted
                          ? "bg-legal-emerald/5 border-legal-emerald/20 opacity-70"
                          : "bg-legal-card/20 border-legal-border/40 hover:border-legal-border/80"
                      }`}
                    >
                      <div className="pt-0.5 shrink-0">
                        <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center transition-all duration-150 ${
                          isCompleted
                            ? "bg-legal-emerald border-legal-emerald text-white"
                            : "border-legal-border/80 text-transparent"
                        }`}>
                          <CheckCircle2 className="h-3 w-3" />
                        </div>
                      </div>
                      <div>
                        <span className={`text-xs font-bold block ${isCompleted ? "text-legal-emerald line-through" : "text-legal-textPrimary"}`}>
                          {stepHeader}
                        </span>
                        <span className={`text-[10px] leading-relaxed block mt-1 ${isCompleted ? "text-legal-textSecondary line-through font-light" : "text-legal-textSecondary font-light"}`}>
                          {stepBody}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sidebar Details - Right 1 Column */}
            <div className="space-y-6">
              {/* Official Links */}
              <div className="p-5 rounded-2xl border border-legal-border/40 bg-legal-card/10 space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-legal-gold">
                  {t.officialPortal}
                </h4>
                <a 
                  href={t.milestones[activeEvent].url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex justify-between items-center px-4 py-3 rounded-xl bg-legal-emerald/10 border border-legal-emerald/20 text-legal-emerald hover:bg-legal-emerald hover:text-white transition-all duration-150"
                >
                  <span className="text-xs font-bold">{t.milestones[activeEvent].linkName}</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Estimate Fees */}
              <div className="p-5 rounded-2xl border border-legal-border/40 bg-legal-card/10 space-y-3.5">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-legal-gold flex items-center gap-1.5">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>{t.fees}</span>
                </h4>
                <p className="text-xs text-legal-textPrimary font-semibold leading-relaxed">
                  {t.milestones[activeEvent].fees}
                </p>
              </div>

              {/* Required Documents */}
              <div className="p-5 rounded-2xl border border-legal-border/40 bg-legal-card/10 space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-legal-gold flex items-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>{t.reqDocs}</span>
                </h4>
                <ul className="space-y-2.5">
                  {t.milestones[activeEvent].docs.map((doc, docIdx) => (
                    <li key={docIdx} className="text-[10px] text-legal-textSecondary font-light flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-legal-emerald shrink-0"></span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
