"use client";

import React from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { translations } from "@/lib/i18n";
import { 
  MessageSquare, 
  Gavel, 
  FileText, 
  Sparkles,
  TrendingUp,
  FileCheck,
  BookmarkCheck,
  ChevronRight
} from "lucide-react";

export default function Dashboard() {
  const { lang, user, dir } = useApp();
  const t = translations[lang];

  const stats = [
    { name: t.activeChats, value: "3", icon: MessageSquare, color: "text-legal-emerald bg-legal-emerald/10 border-legal-emerald/20" },
    { name: t.uploadedDocs, value: "1", icon: FileText, color: "text-teal-400 bg-teal-400/10 border-teal-400/20" },
    { name: t.savedAnswers, value: "4", icon: FileCheck, color: "text-legal-gold bg-legal-gold/10 border-legal-gold/20" }
  ];

  const quickLinks = [
    {
      title: lang === "ar" ? "استشر المساعد القانوني" : "Consult AI Legal Assistant",
      desc: lang === "ar" ? "اطرح أسئلة حول عقود العمل، الأجور، أو نزاعات الإيجار" : "Ask questions regarding labour disputes, contract rules, or RERA calculator",
      icon: MessageSquare,
      path: "/dashboard/chat",
      color: "border-legal-emerald/40 hover:bg-legal-emerald/5 hover:border-legal-emerald"
    },
    {
      title: lang === "ar" ? "البحث عن خدمة حكومية" : "Search UAE Government Service",
      desc: lang === "ar" ? "ابحث عن خطوات التقديم على الإقامات، التراخيص، ودفع المخالفات" : "Find documents required, service links, and official fees for UAE authorities",
      icon: Gavel,
      path: "/dashboard/services",
      color: "border-legal-gold/40 hover:bg-legal-gold/5 hover:border-legal-gold"
    },
    {
      title: lang === "ar" ? "تحليل وتلخيص عقد" : "Upload & Analyze a Contract",
      desc: lang === "ar" ? "ارفع عقد إيجار أو عمل لاستخراج الالتزامات والتحقق من الامتثال" : "Upload tenancy or labour contracts to outline highlights and regulatory citations",
      icon: FileText,
      path: "/dashboard/documents",
      color: "border-teal-400/40 hover:bg-teal-400/5 hover:border-teal-400"
    }
  ];

  return (
    <div className="space-y-8 select-none">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden shadow-xl border border-legal-border/50">
        <div className="absolute top-0 right-0 h-40 w-40 bg-legal-emerald/10 blur-[85px] rounded-full"></div>
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-legal-gold" />
              <span className="text-xs font-bold text-legal-gold uppercase tracking-wider">{lang === "ar" ? "المساعد القانوني الشخصي" : "Corporate Legal Portal"}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              {lang === "ar" ? `أهلاً بك، ${user.full_name}` : `Welcome back, ${user.full_name}`}
            </h2>
            <p className="text-xs text-legal-textSecondary font-light leading-relaxed">
              {lang === "ar" 
                ? "سيفي مايند AI نشط الآن. تصفح القوانين الإماراتية، وراجع معاملاتك الحكومية بدقة."
                : "CiviMind AI is active and indexed. Consult legal frameworks with compliance guidelines."}
            </p>
          </div>
          <div className="px-4 py-2 rounded-xl bg-legal-card border border-legal-border/60 text-xs font-semibold flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-legal-emerald animate-pulse"></span>
            <span>{lang === "ar" ? "قاعدة المعرفة: محدثة لعام 2026" : "Knowledge Base: Updated 2026"}</span>
          </div>
        </div>
      </div>

      {/* Grid Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-panel p-6 rounded-2xl flex items-center justify-between shadow-md">
              <div className="space-y-1">
                <p className="text-[11px] text-legal-textSecondary font-bold tracking-wider uppercase">{stat.name}</p>
                <p className="text-3xl font-extrabold tracking-tight">{stat.value}</p>
              </div>
              <div className={`h-12 w-12 rounded-xl border flex items-center justify-center ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Actions */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold tracking-wider text-legal-gold uppercase">{lang === "ar" ? "الوصول السريع للخدمات" : "Quick Actions Hub"}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickLinks.map((link, idx) => {
            const Icon = link.icon;
            return (
              <Link 
                key={idx}
                href={link.path}
                className={`glass-panel p-6 rounded-2xl border flex flex-col justify-between space-y-4 transition-all duration-300 shadow-sm transform hover:-translate-y-0.5 group ${link.color}`}
              >
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-legal-card border border-legal-border flex items-center justify-center text-legal-textSecondary group-hover:text-legal-emerald transition-all duration-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-sm text-legal-textPrimary group-hover:text-legal-emerald transition-all duration-200">{link.title}</h4>
                    <p className="text-[11px] text-legal-textSecondary font-light leading-relaxed">{link.desc}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-legal-gold group-hover:text-amber-500 pt-2 transition-all duration-200">
                  <span>{lang === "ar" ? "افتح الخدمة" : "Open Tool"}</span>
                  <ChevronRight className="h-3 w-3" style={{ transform: dir === "rtl" ? "rotate(180deg)" : "none" }} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Legal News Feed / Alert Updates Banner */}
      <div className="glass-panel p-6 rounded-2xl bg-legal-card/30 space-y-4 shadow-inner">
        <div className="flex items-center gap-2 pb-2 border-b border-legal-border/50">
          <TrendingUp className="h-4.5 w-4.5 text-legal-emerald" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-legal-textPrimary">{lang === "ar" ? "تحديثات تشريعية هامة بدولة الإمارات" : "Important UAE Regulatory Bulletins"}</h3>
        </div>
        <div className="space-y-3 text-xs">
          <div className="p-3 bg-legal-bg/50 border border-legal-border/40 rounded-xl flex justify-between items-start gap-4">
            <div>
              <p className="font-bold text-legal-textPrimary">{lang === "ar" ? "قرار وزاري بشأن التوطين في الشركات الصغيرة" : "New MOHRE Emiratisation Targets"}</p>
              <p className="text-[10px] text-legal-textSecondary font-light mt-0.5">{lang === "ar" ? "ألزم القرار الشركات التي تضم من 20 إلى 49 عاملاً بتعيين إماراتي واحد على الأقل لتجنب الغرامات السنوية." : "MOHRE details compliance targets for firms with 20 to 49 workers to hire at least one UAE national."}</p>
            </div>
            <span className="text-[9px] bg-legal-emerald/10 text-legal-emerald px-2 py-0.5 rounded-md border border-legal-emerald/20 font-bold shrink-0">{lang === "ar" ? "جديد" : "NEW"}</span>
          </div>

          <div className="p-3 bg-legal-bg/50 border border-legal-border/40 rounded-xl flex justify-between items-start gap-4">
            <div>
              <p className="font-bold text-legal-textPrimary">{lang === "ar" ? "حاسبة مؤشر الإيجارات لهيئة تنظيم العقارات (RERA)" : "Updated Dubai RERA Rental Index Calculator"}</p>
              <p className="text-[10px] text-legal-textSecondary font-light mt-0.5">{lang === "ar" ? "تحديث مؤشرات الزيادات العقارية في دبي لعام 2026. ينصح بالاستعلام قبل توقيع عقود التجديد." : "RERA calculator databases updated. Check legal caps prior to signing renewal Ejari contracts."}</p>
            </div>
            <span className="text-[9px] bg-legal-border text-legal-textSecondary px-2 py-0.5 rounded-md font-bold shrink-0">{lang === "ar" ? "نشط" : "ACTIVE"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
