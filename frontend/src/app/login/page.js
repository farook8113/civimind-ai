"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { translations } from "@/lib/i18n";
import { Scale, ShieldAlert, ArrowLeft, ArrowRight, Languages } from "lucide-react";

export default function Login() {
  const { lang, toggleLanguage, loginUser, dir } = useApp();
  const t = translations[lang];
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg(lang === "ar" ? "يرجى ملء جميع الحقول" : "Please fill in all fields");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

      // Build form body for FastAPI OAuth2 compatibility
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch(`${API_BASE}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Authentication failed");
      }

      const data = await response.json();
      const token = data.access_token;

      // Fetch user details with JWT token
      const profileRes = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!profileRes.ok) {
        throw new Error("Could not fetch user profile details");
      }

      const userProfile = await profileRes.json();

      // Log user in context
      loginUser(userProfile, token);
      router.push("/dashboard");
    } catch (err) {
      console.log("Network error, falling back to mock user session: ", err.message);
      
      // Fallback for mock/local demo if API is offline
      if (email.toLowerCase() === "test@civimind.ae" && password === "testpassword") {
        const mockUser = {
          id: "00000000-0000-0000-0000-000000000000",
          email: "test@civimind.ae",
          full_name: "Saeed Al Mansoori",
          preferred_lang: "en",
          created_at: new Date().toISOString()
        };
        loginUser(mockUser, "mock-jwt-token-12345");
        router.push("/dashboard");
      } else {
        setErrorMsg(
          lang === "ar" 
            ? "البريد الإلكتروني أو كلمة المرور غير صحيحة (استخدم: test@civimind.ae و testpassword)" 
            : "Invalid credentials. (Hint: use test@civimind.ae and testpassword)"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-legal-gradient flex flex-col justify-center py-12 sm:px-6 lg:px-8 text-legal-textPrimary select-none" style={{ fontFamily: lang === "ar" ? "'Noto Kufi Arabic', sans-serif" : "'Inter', sans-serif" }}>
      
      {/* Header Utilities */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-xs font-semibold text-legal-textSecondary hover:text-legal-emerald transition-all duration-200"
        >
          {lang === "en" ? <ArrowLeft className="h-4 w-4" /> : <ArrowRight className="h-4 w-4" />}
          <span>{lang === "ar" ? "العودة للرئيسية" : "Back to Home"}</span>
        </Link>
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-legal-border bg-legal-card/40 text-xs hover:border-legal-emerald transition-all duration-200"
        >
          <Languages className="h-3.5 w-3.5" />
          <span>{lang === "en" ? "العربية" : "English"}</span>
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="inline-flex justify-center bg-gradient-to-tr from-legal-emerald to-legal-gold p-3 rounded-2xl shadow-xl mx-auto">
          <Scale className="h-8 w-8 text-white animate-pulse" />
        </div>
        <h2 className="text-3xl font-extrabold tracking-tight glow-emerald">{t.welcomeBack}</h2>
        <p className="text-xs text-legal-textSecondary max-w-sm mx-auto">{t.tagline}</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="glass-panel py-8 px-6 sm:px-10 rounded-3xl shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 h-40 w-40 bg-legal-gold/5 blur-[85px] rounded-full"></div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-400 text-xs flex items-start gap-2.5">
              <ShieldAlert className="h-4.5 w-4.5 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-legal-textSecondary mb-2">{t.email}</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="saeed@civimind.ae"
                className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-legal-textSecondary mb-2">{t.password}</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input px-4 py-3 rounded-xl text-sm"
                required
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input 
                  id="remember-me" 
                  type="checkbox" 
                  className="h-4 w-4 rounded bg-legal-bg border-legal-border text-legal-emerald focus:ring-legal-emerald"
                  defaultChecked
                />
                <label htmlFor="remember-me" className="ml-2 text-xs font-light text-legal-textSecondary block cursor-pointer" style={{ marginLeft: dir === "rtl" ? "auto" : "0.5rem", marginRight: dir === "rtl" ? "0.5rem" : "auto" }}>
                  {lang === "ar" ? "تذكرني على هذا الجهاز" : "Remember me"}
                </label>
              </div>

              <a href="#" className="text-xs font-semibold text-legal-gold hover:text-amber-500 transition-all duration-200">
                {lang === "ar" ? "نسيت كلمة المرور؟" : "Forgot Password?"}
              </a>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-legal-emerald to-emerald-500 hover:shadow-lg hover:shadow-legal-emerald/20 text-white font-bold text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span>{t.login}</span>
              )}
            </button>
          </form>

          <div className="border-t border-legal-border/40 pt-6 text-center text-xs">
            <span className="text-legal-textSecondary">{t.dontHaveAccount} </span>
            <Link href="/register" className="font-semibold text-legal-emerald hover:text-emerald-400 transition-all duration-200">
              {t.register}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
