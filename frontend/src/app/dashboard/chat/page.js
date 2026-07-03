"use client";

import React, { useState, useEffect, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { translations } from "@/lib/i18n";
import { 
  MessageSquare, 
  Send, 
  Trash2, 
  Plus, 
  Scale, 
  ExternalLink,
  BookOpen,
  User,
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  VolumeX
} from "lucide-react";

export default function AIChat() {
  const { lang, token, dir } = useApp();
  const t = translations[lang];

  // Chat Sessions States
  const [chats, setChats] = useState([]);
  const [activeChatId, setActiveChatId] = useState("");
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  
  // Loading & UI States
  const [loadingChats, setLoadingChats] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  
  // Voice Assist States
  const [isListening, setIsListening] = useState(false);
  const [speakResponse, setSpeakResponse] = useState(false);
  
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

  // Speech synthesis utility
  const speakText = (text, language) => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const langMapping = {
        en: "en-US",
        ar: "ar-AE",
        hi: "hi-IN",
        ur: "ur-PK",
        ml: "ml-IN",
        ta: "ta-IN",
        te: "te-IN",
        bn: "bn-BD",
        fil: "fil-PH",
        zh: "zh-CN"
      };
      utterance.lang = langMapping[language] || "en-US";
      window.speechSynthesis.speak(utterance);
    }
  };

  // Speech recognition handler
  const toggleListening = () => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert(lang === "ar" ? "المتصفح لا يدعم ميزة التعرف على الصوت." : "Browser Speech Recognition is not supported.");
        return;
      }

      if (isListening) {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
        setIsListening(false);
      } else {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        const langMapping = {
          en: "en-US",
          ar: "ar-AE",
          hi: "hi-IN",
          ur: "ur-PK",
          ml: "ml-IN",
          ta: "ta-IN",
          te: "te-IN",
          bn: "bn-BD",
          fil: "fil-PH",
          zh: "zh-CN"
        };
        rec.lang = langMapping[lang] || "en-US";
        rec.interimResults = false;

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          setInputText(prev => prev ? prev + " " + transcript : transcript);
        };

        rec.onerror = (e) => {
          console.error("Speech recognition error:", e);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
        rec.start();
      }
    }
  };

  // 1. Fetch Chats on mount
  useEffect(() => {
    fetchChats();
  }, []);

  // 2. Fetch Messages when activeChatId changes
  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    } else {
      setMessages([]);
    }
  }, [activeChatId]);

  // 3. Scroll to bottom of message feeds
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChats = async () => {
    setLoadingChats(true);
    try {
      const res = await fetch(`${API_BASE}/chats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setChats(data);
        if (data.length > 0 && !activeChatId) {
          setActiveChatId(data[0].id);
        }
      }
    } catch (err) {
      console.log("Offline or loading local mock chats:", err);
      // Simulate Mock Chats
      const mockChats = [
        {
          id: "11111111-1111-1111-1111-111111111111",
          user_id: "00000000-0000-0000-0000-000000000000",
          title: lang === "ar" ? "نزاع عدم دفع الراتب - وزارة العمل" : "Unpaid Salary Dispute MOHRE Guidance",
          created_at: new Date().toISOString()
        }
      ];
      setChats(mockChats);
      setActiveChatId(mockChats[0].id);
    } finally {
      setLoadingChats(false);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const res = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.log("Loading mock messages for chat:", chatId);
      // Simulate Mock History
      if (chatId === "11111111-1111-1111-1111-111111111111") {
        setMessages([
          {
            id: "m-1",
            role: "user",
            content: lang === "ar" ? "صاحب العمل لم يدفع راتبي منذ شهرين. ماذا أفعل؟" : "My employer has not paid my salary for two months. What should I do?",
            citations: [],
            created_at: new Date().toISOString()
          },
          {
            id: "m-2",
            role: "assistant",
            content: lang === "ar"
              ? "طبقاً لقانون العمل الإماراتي (المرسوم بقانون اتحادي رقم 33 لسنة 2021)، يجب على أصحاب العمل دفع الرواتب في تاريخ استحقاقها من خلال نظام حماية الأجور (WPS).\n\nبما أن الراتب متأخر لشهرين، يحق لك تقديم شكوى رسمية:\n1. **تقديم الشكوى**: عبر موقع أو تطبيق وزارة الموارد البشرية والتوطين (MOHRE).\n2. **التسوية الودية**: تقوم الوزارة بمناقشة الشكوى للتوصل لتسوية ودية خلال 14 يوماً.\n3. **المحكمة العمالية**: إذا تعذر الحل، تحال القضية رسمياً للمحكمة العمالية."
              : "Under UAE Labour Law (Federal Decree-Law No. 33 of 2021), employers must pay salaries on time. Since it is delayed by two months, you are entitled to file a complaint.\n\nHere are the recommended steps:\n1. **Submit Dispute**: Open a case on the MOHRE Smart Portal or App.\n2. **Mediation**: MOHRE attempts an amicable settlement within 14 days.\n3. **Court Referral**: If mediation fails, the case is referred to the UAE Labour Court.",
            citations: [
              { source: lang === "ar" ? "وزارة الموارد البشرية والتوطين (MOHRE)" : "Ministry of Labour (MOHRE)", link: "https://www.mohre.gov.ae/" }
            ],
            created_at: new Date().toISOString()
          }
        ]);
      } else {
        setMessages([]);
      }
    }
  };

  const handleCreateChat = async () => {
    const title = lang === "ar" ? "جلسة استشارة جديدة" : "New Legal Query";
    try {
      const res = await fetch(`${API_BASE}/chats`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ title })
      });
      if (res.ok) {
        const newChat = await res.json();
        setChats([newChat, ...chats]);
        setActiveChatId(newChat.id);
      }
    } catch (err) {
      console.log("Mocking chat creation");
      const mockNewChat = {
        id: "mock-chat-" + Math.floor(Math.random() * 100000),
        user_id: "00000000-0000-0000-0000-000000000000",
        title: `${title} #${chats.length + 1}`,
        created_at: new Date().toISOString()
      };
      setChats([mockNewChat, ...chats]);
      setActiveChatId(mockNewChat.id);
    }
  };

  const handleDeleteChat = async (chatId, e) => {
    e.stopPropagation();
    e.preventDefault();
    
    try {
      const res = await fetch(`${API_BASE}/chats/${chatId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        removeChatFromState(chatId);
      }
    } catch (err) {
      console.log("Mocking chat deletion");
      removeChatFromState(chatId);
    }
  };

  const removeChatFromState = (chatId) => {
    const updated = chats.filter(c => c.id !== chatId);
    setChats(updated);
    if (activeChatId === chatId) {
      if (updated.length > 0) {
        setActiveChatId(updated[0].id);
      } else {
        setActiveChatId("");
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() || sendingMessage) return;

    const userText = inputText;
    setInputText("");
    setSendingMessage(true);

    let currentChatId = activeChatId;

    // 1. If no active chat, create one first!
    if (!currentChatId) {
      try {
        const title = userText.length > 25 ? userText.substring(0, 25) + "..." : userText;
        const res = await fetch(`${API_BASE}/chats`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ title })
        });
        
        if (res.ok) {
          const newChat = await res.json();
          setChats(prevChats => [newChat, ...prevChats]);
          setActiveChatId(newChat.id);
          currentChatId = newChat.id;
        } else {
          throw new Error("Failed to create chat");
        }
      } catch (err) {
        console.log("Mocking chat creation for auto-start");
        const mockNewChat = {
          id: "mock-chat-" + Math.floor(Math.random() * 100000),
          user_id: "00000000-0000-0000-0000-000000000000",
          title: userText.length > 25 ? userText.substring(0, 25) + "..." : userText,
          created_at: new Date().toISOString()
        };
        setChats(prevChats => [mockNewChat, ...prevChats]);
        setActiveChatId(mockNewChat.id);
        currentChatId = mockNewChat.id;
      }
    }

    // 2. Instantly append user message to feed
    const tempUserMsg = {
      id: "temp-user-" + Date.now(),
      role: "user",
      content: userText,
      citations: [],
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const res = await fetch(`${API_BASE}/chats/${currentChatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          content: userText,
          lang: lang
        })
      });

      if (!res.ok) {
        throw new Error("Failed to send message to API");
      }

      const assistantMsg = await res.json();
      setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), tempUserMsg, assistantMsg]);
      if (speakResponse) {
        speakText(assistantMsg.content, lang);
      }
    } catch (err) {
      console.log("Falling back to local AI simulated response:", err);
      
      // Simulate AI response logic matching config
      setTimeout(() => {
        const query = userText.toLowerCase();
        let content = "";
        let citations = [];

        if (query.includes("salary") || query.includes("employer") || query.includes("paid") || query.includes("راتب") || query.includes("عمل")) {
          citations.push({ source: "MOHRE UAE Portal", link: "https://www.mohre.gov.ae/" });
          content = lang === "ar"
            ? "بناءً على قانون العمل الإماراتي (المرسوم بقانون اتحادي رقم 33 لسنة 2021)، يُلزم صاحب العمل بسداد الرواتب شهرياً كحد أقصى. يُرجى التقدم بشكوى عمالية عبر بوابة وزارة الموارد البشرية والتوطين (MOHRE)."
            : "Under UAE Labour Law (Decree-Law 33 of 2021), employers must pay salaries on their due dates. You are recommended to submit an unpaid salary dispute case on the MOHRE official smart service portal.";
        } else if (query.includes("evict") || query.includes("rent") || query.includes("ejari") || query.includes("إيجار") || query.includes("إخلاء")) {
          citations.push({ source: "Dubai Land Department", link: "https://dubailand.gov.ae/" });
          content = lang === "ar"
            ? "بموجب قانون الإيجارات بدبي (رقم 26 لسنة 2007)، تتطلب دعاوى الإخلاء تقديم إخطار رسمي قبل 12 شهراً عبر الكاتب العدل. لمزيد من الاستفسار أو رفع دعوى يرجى مراجعة مركز فض المنازعات الإيجارية (RDC)."
            : "Pursuant to Dubai Tenancy Law No. 26 of 2007, eviction notice orders mandate a 12-month advance warning served via Notary Public. Tenants can file dispute cases at the Dubai Land Department RDC Center.";
        } else {
          content = lang === "ar"
            ? "تم استلام استفسارك. يرجى توضيح ما إذا كان هذا السؤال يتعلق بعقد توظيف مسجل لدى وزارة العمل (MOHRE) أو إيجاري عقاري في دبي (DLD) أو لوائح الهوية الرقمية لتزويدك بالتوجيه والخطوات القانونية الرسمية الدقيقة."
            : "Your inquiry is noted. Please clarify if this relates to a MOHRE labour contract, tenancy Ejari details under the Dubai Land Department, or commercial license guidelines for exact UAE regulatory next steps.";
        }

        const simulatedAssistantMsg = {
          id: "sim-assist-" + Date.now(),
          role: "assistant",
          content,
          citations,
          created_at: new Date().toISOString()
        };

        setMessages(prev => [...prev.filter(m => m.id !== tempUserMsg.id), tempUserMsg, simulatedAssistantMsg]);
        if (speakResponse) {
          speakText(simulatedAssistantMsg.content, lang);
        }
      }, 1000);
    } finally {
      setSendingMessage(false);
    }
  };

  const handleQuickConsult = (text) => {
    setInputText(text);
  };

  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-80px)] flex flex-col md:flex-row gap-6 relative select-none">
      
      {/* Sessions Panel - Left Side */}
      <div className="w-full md:w-64 glass-panel rounded-2xl p-4 flex flex-col justify-between shrink-0 h-48 md:h-full">
        <div className="space-y-4 overflow-hidden flex flex-col flex-1">
          <div className="flex justify-between items-center pb-2 border-b border-legal-border/40">
            <span className="text-xs font-bold uppercase tracking-wider text-legal-textPrimary">{lang === "ar" ? "جلسات الاستشارة" : "Chat History"}</span>
            <button 
              onClick={handleCreateChat}
              className="p-1 rounded-lg bg-legal-emerald/10 border border-legal-emerald/20 text-legal-emerald hover:bg-legal-emerald hover:text-white transition-all duration-200"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Sessions List */}
          <div className="overflow-y-auto space-y-1.5 flex-1 pr-1">
            {loadingChats ? (
              <div className="text-center py-4 text-[10px] text-legal-textSecondary font-light">Loading chats...</div>
            ) : chats.length === 0 ? (
              <div className="text-center py-8 text-[10px] text-legal-textSecondary font-light">{"No sessions. Click '+' to start."}</div>
            ) : (
              chats.map((chat) => {
                const isActive = chat.id === activeChatId;
                return (
                  <div
                    key={chat.id}
                    onClick={() => setActiveChatId(chat.id)}
                    className={`flex justify-between items-center px-3 py-2.5 rounded-xl cursor-pointer text-xs font-medium border border-transparent transition-all duration-150 group ${
                      isActive
                        ? "bg-legal-card border-legal-emerald/20 text-legal-emerald"
                        : "text-legal-textSecondary hover:bg-legal-card/25 hover:text-legal-textPrimary"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <MessageSquare className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{chat.title}</span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteChat(chat.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-md text-legal-textSecondary hover:text-red-400 hover:bg-red-950/20 transition-all duration-150"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Chat Pane - Main Panel */}
      <div className="flex-1 glass-panel rounded-2xl flex flex-col justify-between overflow-hidden shadow-lg border border-legal-border/50 h-[calc(100%-210px)] md:h-full">
        
        {/* Chat Pane Header */}
        <div className="px-6 py-4 border-b border-legal-border/50 flex justify-between items-center bg-legal-card/30">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-legal-emerald/10 border border-legal-emerald/20 flex items-center justify-center text-legal-emerald">
              <Scale className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-xs font-bold tracking-tight text-legal-textPrimary">{lang === "ar" ? "المستشار القانوني الذكي لدولة الإمارات" : "UAE Legal RAG Assistant"}</h3>
              <p className="text-[10px] text-legal-textSecondary font-light mt-0.5">{lang === "ar" ? "قاعدة معرفة نشطة ومتكاملة مع MOHRE و DLD" : "Active AI agent linked to MOHRE & DLD parameters"}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSpeakResponse(!speakResponse)}
              className={`p-1.5 rounded-lg border text-[10px] font-semibold uppercase flex items-center gap-1.5 transition-all duration-200 ${
                speakResponse
                  ? "bg-legal-emerald/20 border-legal-emerald/30 text-legal-emerald"
                  : "bg-legal-card border-legal-border text-legal-textSecondary hover:text-legal-textPrimary"
              }`}
              title={lang === "ar" ? "تفعيل القراءة الصوتية" : "Toggle voice responses"}
            >
              {speakResponse ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
              <span>{lang === "ar" ? "الصوت" : "Voice"}</span>
            </button>
            <div className="flex items-center gap-1 text-[10px] text-legal-gold bg-legal-gold/10 px-2 py-0.5 rounded-md border border-legal-gold/20 font-semibold uppercase">
              <Sparkles className="h-3 w-3" />
              <span>AI Expert</span>
            </div>
          </div>
        </div>

        {/* Message Feed Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-legal-bg/25">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-full max-w-sm mx-auto space-y-4">
              <div className="p-4 rounded-full bg-legal-emerald/10 text-legal-emerald animate-bounce">
                <Scale className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-xs">{lang === "ar" ? "ابدأ جلستك الاستشارية" : "Initiate UAE Law Dialogue"}</h4>
                <p className="text-[10px] text-legal-textSecondary font-light leading-relaxed">
                  {lang === "ar" 
                    ? "اختر سؤالاً سريعاً من المقترحات أدناه أو اكتب تفاصيل استفسارك القانوني في مربع النص لمباشرة المحادثة." 
                    : "Select a pre-populated dispute prompt below or type your inquiry directly to consult UAE statutory guidelines."}
                </p>
              </div>

              {/* Suggestions Grid */}
              <div className="grid grid-cols-1 gap-2 w-full pt-3">
                <button
                  onClick={() => handleQuickConsult(t.askSalaryDispute)}
                  className="text-[10px] text-left p-3 rounded-xl border border-legal-border bg-legal-card/30 hover:border-legal-emerald hover:bg-legal-emerald/5 transition-all duration-150"
                  style={{ textAlign: dir === "rtl" ? "right" : "left" }}
                >
                  💼 {t.askSalaryDispute}
                </button>
                <button
                  onClick={() => handleQuickConsult(t.askTenancyNotice)}
                  className="text-[10px] text-left p-3 rounded-xl border border-legal-border bg-legal-card/30 hover:border-legal-emerald hover:bg-legal-emerald/5 transition-all duration-150"
                  style={{ textAlign: dir === "rtl" ? "right" : "left" }}
                >
                  🏠 {t.askTenancyNotice}
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => {
              const isAssistant = msg.role === "assistant";
              return (
                <div 
                  key={msg.id || idx} 
                  className={`flex gap-3 max-w-[85%] ${isAssistant ? "" : "ml-auto"}`}
                  style={{ 
                    marginLeft: isAssistant ? "0" : "auto", 
                    marginRight: isAssistant ? "auto" : "0",
                    flexDirection: isAssistant ? "row" : "row-reverse"
                  }}
                >
                  {/* Avatar Icon */}
                  <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 shadow-sm ${
                    isAssistant 
                      ? "bg-legal-emerald/10 border-legal-emerald/30 text-legal-emerald" 
                      : "bg-legal-card border-legal-border text-legal-textSecondary"
                  }`}>
                    {isAssistant ? <Scale className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>

                  {/* Bubble content */}
                  <div className={`p-4 rounded-2xl border space-y-3 ${
                    isAssistant 
                      ? "bg-legal-card/80 border-legal-border/50 text-legal-textPrimary rounded-tl-none" 
                      : "bg-gradient-to-tr from-legal-emerald to-emerald-700 border-legal-emerald/30 text-white rounded-tr-none"
                  }`}
                  style={{
                    borderRadius: isAssistant 
                      ? (dir === "rtl" ? "1rem 0 1rem 1rem" : "0 1rem 1rem 1rem")
                      : (dir === "rtl" ? "0 1rem 1rem 1rem" : "1rem 0 1rem 1rem")
                  }}
                  >
                    <p className="text-xs font-light leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    
                    {/* Citations block */}
                    {isAssistant && msg.citations && msg.citations.length > 0 && (
                      <div className="border-t border-legal-border/50 pt-2.5 mt-2 space-y-1.5">
                        <span className="text-[10px] text-legal-gold font-bold block">{t.citations}:</span>
                        <div className="space-y-1">
                          {msg.citations.map((cite, cIdx) => (
                            <a 
                              key={cIdx} 
                              href={cite.link} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[9px] text-legal-emerald hover:text-emerald-400 font-semibold"
                            >
                              <BookOpen className="h-3 w-3" />
                              <span>{cite.source}</span>
                              <ExternalLink className="h-2.5 w-2.5" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {sendingMessage && (
            <div className="flex gap-3 max-w-[80%]">
              <div className="h-8 w-8 rounded-full bg-legal-emerald/10 border border-legal-emerald/20 flex items-center justify-center text-legal-emerald animate-pulse">
                <Scale className="h-4 w-4" />
              </div>
              <div className="p-4 rounded-2xl bg-legal-card border border-legal-border/50 flex items-center gap-2 rounded-tl-none">
                <span className="h-2 w-2 rounded-full bg-legal-emerald animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="h-2 w-2 rounded-full bg-legal-emerald animate-bounce" style={{ animationDelay: "150ms" }}></span>
                <span className="h-2 w-2 rounded-full bg-legal-emerald animate-bounce" style={{ animationDelay: "300ms" }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Text Input Box */}
        <div className="px-6 py-4 border-t border-legal-border/50 bg-legal-card/20">
          <form onSubmit={handleSendMessage} className="relative flex items-center w-full">
            <button
              type="button"
              onClick={toggleListening}
              disabled={sendingMessage}
              className={`absolute p-2 rounded-lg border transition-all duration-150 shrink-0 ${
                isListening 
                  ? "bg-red-500/20 border-red-500/30 text-red-400 animate-pulse" 
                  : "bg-legal-card/40 border-legal-border/30 text-legal-textSecondary hover:text-legal-textPrimary hover:border-legal-border"
              }`}
              style={{
                left: dir === "rtl" ? "auto" : "0.5rem",
                right: dir === "rtl" ? "0.5rem" : "auto"
              }}
              title={lang === "ar" ? "تحدث بالصوت" : "Speak via voice"}
            >
              {isListening ? <MicOff className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            </button>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={sendingMessage}
              placeholder={isListening ? (lang === "ar" ? "جاري الاستماع... تحدث الآن" : "Listening... Speak now") : t.chatPlaceholder}
              className="w-full glass-input px-4 py-3.5 text-xs rounded-xl transition-all duration-200"
              style={{
                paddingRight: dir === "rtl" ? "3rem" : "3.5rem",
                paddingLeft: dir === "rtl" ? "3.5rem" : "3rem"
              }}
            />
            <button
              type="submit"
              disabled={!inputText.trim() || sendingMessage}
              className="absolute p-2.5 rounded-lg bg-legal-emerald hover:bg-legal-emeraldHover disabled:opacity-40 disabled:hover:bg-legal-emerald text-white transition-all duration-150"
              style={{
                right: dir === "rtl" ? "auto" : "0.5rem",
                left: dir === "rtl" ? "0.5rem" : "auto"
              }}
            >
              <Send className="h-3.5 w-3.5" style={{ transform: dir === "rtl" ? "rotate(180deg)" : "none" }} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
