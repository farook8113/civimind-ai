"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { translations } from "@/lib/i18n";
import { 
  Scale, 
  Home, 
  MessageSquare, 
  Gavel, 
  FileText, 
  LogOut, 
  Languages, 
  User,
  Menu,
  X,
  Compass
} from "lucide-react";

export default function DashboardLayout({ children }) {
  const { lang, setLang, dir, user, logoutUser, loading } = useApp();
  const t = translations[lang];
  const pathname = usePathname();
  const router = useRouter();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Route protection
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-legal-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-legal-emerald border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-legal-textSecondary font-light">Loading profile security context...</span>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: t.navDashboard, icon: Home, path: "/dashboard" },
    { name: t.navChat, icon: MessageSquare, path: "/dashboard/chat" },
    { name: t.navServices, icon: Gavel, path: "/dashboard/services" },
    { name: t.navDocuments, icon: FileText, path: "/dashboard/documents" },
    { name: lang === "ar" ? "مسارات الحياة" : "Life Events", icon: Compass, path: "/dashboard/life-events" }
  ];

  const handleLogout = () => {
    logoutUser();
    router.push("/login");
  };

  return (
    <div 
      className="min-h-screen bg-legal-bg text-legal-textPrimary flex flex-col md:flex-row relative" 
      style={{ fontFamily: lang === "ar" ? "'Noto Kufi Arabic', sans-serif" : "'Inter', sans-serif" }}
    >
      {/* Mobile Top Header */}
      <header className="md:hidden flex justify-between items-center bg-legal-card border-b border-legal-border px-6 py-4 z-20 w-full">
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-legal-emerald" />
          <span className="font-bold text-sm glow-emerald">{t.appName}</span>
        </div>
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 rounded-lg border border-legal-border bg-legal-bg text-legal-textSecondary hover:text-legal-textPrimary transition-all duration-150"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* Sidebar - Desktop Layout */}
      <aside 
        className={`fixed inset-y-0 z-30 flex flex-col justify-between w-64 glass-panel border-r border-legal-border/40 p-6 md:sticky md:top-0 md:h-screen transition-transform duration-300 transform md:transform-none ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{ 
          left: dir === "rtl" ? "auto" : "0", 
          right: dir === "rtl" ? "0" : "auto",
          borderRightWidth: dir === "rtl" ? "0" : "1px",
          borderLeftWidth: dir === "rtl" ? "1px" : "0"
        }}
      >
        {/* Sidebar Header */}
        <div className="space-y-8">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-legal-emerald to-legal-gold p-1.5 rounded-lg shadow-md">
              <Scale className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-sm tracking-tight glow-emerald">{t.appName}</h1>
              <p className="text-[9px] text-legal-textSecondary leading-none mt-0.5">{lang === "ar" ? "لوحة الإجراءات والامتثال" : "Compliance Portal"}</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 border border-transparent ${
                    isActive
                      ? "bg-gradient-to-r from-legal-emerald/20 to-teal-500/5 text-legal-emerald border-legal-emerald/30 shadow-inner shadow-legal-emerald/5"
                      : "text-legal-textSecondary hover:bg-legal-card/40 hover:text-legal-textPrimary hover:border-legal-border/30"
                  }`}
                >
                  <Icon className={`h-4.5 w-4.5 ${isActive ? "text-legal-emerald" : "text-legal-textSecondary"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer (Profile / Language Switcher / Logout) */}
        <div className="space-y-5 border-t border-legal-border/50 pt-5">
          {/* Language Selector Dropdown inside Sidebar */}
          <div className="relative w-full">
            <label className="text-[9px] uppercase tracking-wider font-bold text-legal-textSecondary block mb-1.5 px-1">
              {lang === "ar" ? "اختر اللغة" : "Select Language"}
            </label>
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border border-legal-border bg-legal-card/30 text-xs text-legal-textSecondary focus-within:border-legal-emerald/50 transition-all duration-200">
              <Languages className="h-4 w-4 text-legal-textSecondary shrink-0" />
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="w-full bg-transparent border-none text-xs text-legal-textPrimary focus:outline-none cursor-pointer pr-4"
              >
                <option value="en" className="bg-legal-card text-legal-textPrimary">🇬🇧 English</option>
                <option value="ar" className="bg-legal-card text-legal-textPrimary">🇦🇪 العربية (Arabic)</option>
                <option value="hi" className="bg-legal-card text-legal-textPrimary">🇮🇳 हिन्दी (Hindi)</option>
                <option value="ur" className="bg-legal-card text-legal-textPrimary">🇵🇰 اردو (Urdu)</option>
                <option value="ml" className="bg-legal-card text-legal-textPrimary">🇮🇳 മലയാളം (Malayalam)</option>
                <option value="ta" className="bg-legal-card text-legal-textPrimary">🇮🇳 தமிழ் (Tamil)</option>
                <option value="te" className="bg-legal-card text-legal-textPrimary">🇮🇳 తెలుగు (Telugu)</option>
                <option value="bn" className="bg-legal-card text-legal-textPrimary">🇧🇩 বাংলা (Bengali)</option>
                <option value="fil" className="bg-legal-card text-legal-textPrimary">🇵🇭 Filipino</option>
                <option value="zh" className="bg-legal-card text-legal-textPrimary">🇨🇳 中文 (Chinese)</option>
              </select>
            </div>
          </div>

          {/* User Details */}
          <div className="flex items-center gap-3 px-2 py-1 bg-legal-card/25 rounded-xl border border-legal-border/30">
            <div className="h-9 w-9 rounded-full bg-legal-border/80 border border-legal-emerald/40 flex items-center justify-center text-legal-emerald shadow-inner">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-legal-textPrimary truncate leading-tight">{user.full_name}</p>
              <p className="text-[10px] text-legal-textSecondary truncate">{user.email}</p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-950/20 hover:text-red-300 border border-transparent hover:border-red-500/20 transition-all duration-200"
          >
            <LogOut className="h-4.5 w-4.5 text-red-400" />
            <span>{t.logout}</span>
          </button>
        </div>
      </aside>

      {/* Main Panel Content Area */}
      <main className="flex-1 p-6 md:p-10 max-w-6xl mx-auto w-full min-h-[calc(100vh-64px)] md:min-h-screen">
        {children}
      </main>

      {/* Mobile Menu Backdrop */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 md:hidden z-10"
        ></div>
      )}
    </div>
  );
}
