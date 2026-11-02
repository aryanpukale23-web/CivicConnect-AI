"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { apiFetch } from "@/lib/api";
import {
  MessageSquare, Send, Mic, MicOff, ThumbsUp, ThumbsDown,
  Globe, MapPin, Sparkles, ShieldCheck, RotateCcw,
  Phone, AlertCircle, Check, ChevronDown, ChevronUp,
  Trash2, Zap, Droplets, Bus, Trees, GraduationCap,
  Receipt, Megaphone, FileText, HeartPulse, LandPlot
} from "lucide-react";

interface ChatMessage {
  id: number;
  sender: "user" | "ai";
  message: string;
  intent?: string;
  sources?: any[];
  is_fallback?: boolean;
  feedback?: { rating: number; comment?: string };
}

// ─── Categorised question panel data per language ───────────────────
const QUESTION_CATEGORIES: Record<string, { label: string; icon: React.ReactNode; color: string; questions: string[] }[]> = {
  en: [
    {
      label: "Garbage", icon: <Trash2 className="w-3.5 h-3.5" />, color: "text-green-400 bg-green-900/30 border-green-700/40",
      questions: [
        "When is garbage collected in my area?",
        "How to segregate dry and wet waste?",
        "What is the penalty for not segregating waste?",
        "E-waste collection schedule?"
      ]
    },
    {
      label: "Bus / Transport", icon: <Bus className="w-3.5 h-3.5" />, color: "text-blue-400 bg-blue-900/30 border-blue-700/40",
      questions: [
        "Show bus timings.",
        "PMPML bus routes in my area?",
        "How to get a PMPML smart card?",
        "Bus route from Kothrud to Pune Station?"
      ]
    },
    {
      label: "Water", icon: <Droplets className="w-3.5 h-3.5" />, color: "text-cyan-400 bg-cyan-900/30 border-cyan-700/40",
      questions: [
        "Is there a water supply notice today?",
        "Water supply timings in my area?",
        "How to report a pipeline leakage?",
        "How to get a water tanker?"
      ]
    },
    {
      label: "Electricity", icon: <Zap className="w-3.5 h-3.5" />, color: "text-yellow-400 bg-yellow-900/30 border-yellow-700/40",
      questions: [
        "Any power cut notice today?",
        "MSEDCL helpline number?",
        "Load shedding schedule?",
        "How to dispute my electricity bill?"
      ]
    },
    {
      label: "Emergency", icon: <Phone className="w-3.5 h-3.5" />, color: "text-red-400 bg-red-900/30 border-red-700/40",
      questions: [
        "What are emergency helpline numbers?",
        "Police control room number?",
        "Ambulance service number?",
        "Women safety helpline?"
      ]
    },
    {
      label: "Healthcare", icon: <HeartPulse className="w-3.5 h-3.5" />, color: "text-pink-400 bg-pink-900/30 border-pink-700/40",
      questions: [
        "Nearest hospital in my area?",
        "Free health camp schedule?",
        "Blood bank contact number?",
        "Free vaccination centers?"
      ]
    },
    {
      label: "Roads", icon: <LandPlot className="w-3.5 h-3.5" />, color: "text-orange-400 bg-orange-900/30 border-orange-700/40",
      questions: [
        "How can I report a pothole?",
        "Street light not working - how to complain?",
        "Road repair helpline number?",
        "How to track my complaint?"
      ]
    },
    {
      label: "Parks", icon: <Trees className="w-3.5 h-3.5" />, color: "text-lime-400 bg-lime-900/30 border-lime-700/40",
      questions: [
        "Tell me about parks near me.",
        "Timings for Empress Garden?",
        "Entry fee for Katraj Zoo?",
        "How to report park damage?"
      ]
    },
    {
      label: "Tax", icon: <Receipt className="w-3.5 h-3.5" />, color: "text-purple-400 bg-purple-900/30 border-purple-700/40",
      questions: [
        "How do I pay property tax?",
        "Property tax due date?",
        "What is the late penalty for property tax?",
        "How to get a tax receipt?"
      ]
    },
    {
      label: "Education", icon: <GraduationCap className="w-3.5 h-3.5" />, color: "text-indigo-400 bg-indigo-900/30 border-indigo-700/40",
      questions: [
        "Municipal school admission process?",
        "How to apply for scholarship?",
        "Library membership details?",
        "RTE admission details?"
      ]
    },
    {
      label: "Notices", icon: <Megaphone className="w-3.5 h-3.5" />, color: "text-amber-400 bg-amber-900/30 border-amber-700/40",
      questions: [
        "Any new announcements?",
        "Latest community notices?",
        "Any road closure notice?",
        "Upcoming events in my area?"
      ]
    },
    {
      label: "Documents", icon: <FileText className="w-3.5 h-3.5" />, color: "text-slate-400 bg-slate-800/50 border-slate-600/40",
      questions: [
        "Rules for waste segregation?",
        "Civic grievance guidelines?",
        "PMC citizen charter rules?",
        "Building permission regulations?"
      ]
    },
  ],
  hi: [
    {
      label: "कचरा", icon: <Trash2 className="w-3.5 h-3.5" />, color: "text-green-400 bg-green-900/30 border-green-700/40",
      questions: [
        "कचरा कब उठाया जाता है?",
        "सूखा और गीला कचरा कैसे अलग करें?",
        "कचरा न अलग करने पर जुर्माना?",
        "ई-कचरा कलेक्शन कब है?"
      ]
    },
    {
      label: "बस / यातायात", icon: <Bus className="w-3.5 h-3.5" />, color: "text-blue-400 bg-blue-900/30 border-blue-700/40",
      questions: [
        "बस का समय बताओ।",
        "मेरे क्षेत्र में PMPML बस मार्ग?",
        "PMPML स्मार्ट कार्ड कैसे बनाएं?",
        "कोथरुड से पुणे स्टेशन बस?"
      ]
    },
    {
      label: "पानी", icon: <Droplets className="w-3.5 h-3.5" />, color: "text-cyan-400 bg-cyan-900/30 border-cyan-700/40",
      questions: [
        "क्या आज पानी की कटौती है?",
        "मेरे क्षेत्र में पानी का समय?",
        "पाइप लीक की शिकायत कैसे करें?",
        "पानी टैंकर कैसे मंगाएं?"
      ]
    },
    {
      label: "बिजली", icon: <Zap className="w-3.5 h-3.5" />, color: "text-yellow-400 bg-yellow-900/30 border-yellow-700/40",
      questions: [
        "आज बिजली कटौती की सूचना?",
        "MSEDCL हेल्पलाइन नंबर?",
        "लोड शेडिंग टाइमटेबल?",
        "बिजली बिल विवाद कैसे करें?"
      ]
    },
    {
      label: "आपातकाल", icon: <Phone className="w-3.5 h-3.5" />, color: "text-red-400 bg-red-900/30 border-red-700/40",
      questions: [
        "आपातकालीन हेल्पलाइन नंबर?",
        "पुलिस कंट्रोल रूम नंबर?",
        "एम्बुलेंस का नंबर?",
        "महिला सुरक्षा हेल्पलाइन?"
      ]
    },
    {
      label: "स्वास्थ्य", icon: <HeartPulse className="w-3.5 h-3.5" />, color: "text-pink-400 bg-pink-900/30 border-pink-700/40",
      questions: [
        "नजदीकी अस्पताल कौन सा है?",
        "मुफ्त स्वास्थ्य शिविर का समय?",
        "ब्लड बैंक का नंबर?",
        "मुफ्त टीकाकरण केंद्र?"
      ]
    },
    {
      label: "सड़क", icon: <LandPlot className="w-3.5 h-3.5" />, color: "text-orange-400 bg-orange-900/30 border-orange-700/40",
      questions: [
        "सड़क में गड्ढे की शिकायत कैसे करें?",
        "स्ट्रीट लाइट नहीं है - शिकायत?",
        "सड़क मरम्मत हेल्पलाइन?",
        "मेरी शिकायत का स्टेटस?"
      ]
    },
    {
      label: "पार्क", icon: <Trees className="w-3.5 h-3.5" />, color: "text-lime-400 bg-lime-900/30 border-lime-700/40",
      questions: [
        "पास में पार्क कहाँ है?",
        "एम्प्रेस गार्डन का समय?",
        "कटराज चिड़ियाघर की टिकट?",
        "पार्क में नुकसान की शिकायत?"
      ]
    },
    {
      label: "कर", icon: <Receipt className="w-3.5 h-3.5" />, color: "text-purple-400 bg-purple-900/30 border-purple-700/40",
      questions: [
        "संपत्ति कर कैसे भरें?",
        "संपत्ति कर की अंतिम तारीख?",
        "देर से भुगतान पर जुर्माना?",
        "टैक्स रसीद कैसे पाएं?"
      ]
    },
    {
      label: "शिक्षा", icon: <GraduationCap className="w-3.5 h-3.5" />, color: "text-indigo-400 bg-indigo-900/30 border-indigo-700/40",
      questions: [
        "नगरपालिका स्कूल में दाखिला?",
        "छात्रवृत्ति के लिए आवेदन?",
        "पुस्तकालय सदस्यता?",
        "RTE दाखिला कब होगा?"
      ]
    },
    {
      label: "सूचनाएं", icon: <Megaphone className="w-3.5 h-3.5" />, color: "text-amber-400 bg-amber-900/30 border-amber-700/40",
      questions: [
        "कोई नई घोषणा है?",
        "ताज़ा सामुदायिक सूचनाएं?",
        "सड़क बंद होने की सूचना?",
        "मेरे क्षेत्र में आने वाले कार्यक्रम?"
      ]
    },
    {
      label: "दस्तावेज", icon: <FileText className="w-3.5 h-3.5" />, color: "text-slate-400 bg-slate-800/50 border-slate-600/40",
      questions: [
        "कचरा अलग करने के नियम?",
        "नागरिक शिकायत दिशानिर्देश?",
        "PMC नागरिक चार्टर क्या है?",
        "भवन अनुमति नियम?"
      ]
    },
  ],
  mr: [
    {
      label: "कचरा", icon: <Trash2 className="w-3.5 h-3.5" />, color: "text-green-400 bg-green-900/30 border-green-700/40",
      questions: [
        "कचरा कधी गोळा केला जातो?",
        "ओला आणि सुका कचरा कसा वेगळा करावा?",
        "कचरा न वेगळ्या केल्यावर दंड?",
        "ई-कचरा संकलन कधी होते?"
      ]
    },
    {
      label: "बस / वाहतूक", icon: <Bus className="w-3.5 h-3.5" />, color: "text-blue-400 bg-blue-900/30 border-blue-700/40",
      questions: [
        "बसचे वेळापत्रक दाखवा.",
        "माझ्या परिसरात PMPML बस मार्ग?",
        "PMPML स्मार्ट कार्ड कसे काढावे?",
        "कोथरूड ते पुणे स्टेशन बस?"
      ]
    },
    {
      label: "पाणी", icon: <Droplets className="w-3.5 h-3.5" />, color: "text-cyan-400 bg-cyan-900/30 border-cyan-700/40",
      questions: [
        "आज पाणीपुरवठा बंद आहे का?",
        "माझ्या परिसरात पाण्याची वेळ?",
        "पाईप गळतीची तक्रार कशी करावी?",
        "पाण्याचा टँकर कसा मागवावा?"
      ]
    },
    {
      label: "वीज", icon: <Zap className="w-3.5 h-3.5" />, color: "text-yellow-400 bg-yellow-900/30 border-yellow-700/40",
      questions: [
        "आज भार नियमनाची सूचना?",
        "MSEDCL हेल्पलाईन क्रमांक?",
        "लोड शेडिंग वेळापत्रक?",
        "वीज बिल तक्रार कशी करावी?"
      ]
    },
    {
      label: "आपत्काल", icon: <Phone className="w-3.5 h-3.5" />, color: "text-red-400 bg-red-900/30 border-red-700/40",
      questions: [
        "आपत्कालीन हेल्पलाइन क्रमांक?",
        "पोलीस कंट्रोल रूम नंबर?",
        "रुग्णवाहिका सेवेचा नंबर?",
        "महिला सुरक्षा हेल्पलाईन?"
      ]
    },
    {
      label: "आरोग्य", icon: <HeartPulse className="w-3.5 h-3.5" />, color: "text-pink-400 bg-pink-900/30 border-pink-700/40",
      questions: [
        "जवळचे रुग्णालय कुठे आहे?",
        "मोफत आरोग्य शिबिराची वेळ?",
        "रक्तपेढीचा नंबर?",
        "मोफत लसीकरण केंद्रे?"
      ]
    },
    {
      label: "रस्ते", icon: <LandPlot className="w-3.5 h-3.5" />, color: "text-orange-400 bg-orange-900/30 border-orange-700/40",
      questions: [
        "खड्ड्यांची तक्रार कशी करावी?",
        "पथदिवे बंद - तक्रार कशी?",
        "रस्ता दुरुस्ती हेल्पलाईन?",
        "माझ्या तक्रारीचे स्टेटस?"
      ]
    },
    {
      label: "उद्याने", icon: <Trees className="w-3.5 h-3.5" />, color: "text-lime-400 bg-lime-900/30 border-lime-700/40",
      questions: [
        "जवळचे उद्यान कोठे आहे?",
        "एम्प्रेस गार्डनची वेळ?",
        "कात्रज चिडियाघर प्रवेश शुल्क?",
        "उद्यानातील नुकसानाची तक्रार?"
      ]
    },
    {
      label: "कर", icon: <Receipt className="w-3.5 h-3.5" />, color: "text-purple-400 bg-purple-900/30 border-purple-700/40",
      questions: [
        "मालमत्ता कर कसा भरावा?",
        "मालमत्ता कराची अंतिम तारीख?",
        "उशिरा भरण्यावर दंड?",
        "कर पावती कशी मिळवावी?"
      ]
    },
    {
      label: "शिक्षण", icon: <GraduationCap className="w-3.5 h-3.5" />, color: "text-indigo-400 bg-indigo-900/30 border-indigo-700/40",
      questions: [
        "महापालिका शाळेत प्रवेश?",
        "शिष्यवृत्तीसाठी अर्ज?",
        "ग्रंथालय सदस्यत्व?",
        "RTE प्रवेश कधी?"
      ]
    },
    {
      label: "घोषणा", icon: <Megaphone className="w-3.5 h-3.5" />, color: "text-amber-400 bg-amber-900/30 border-amber-700/40",
      questions: [
        "नवीन घोषणा आहेत का?",
        "ताज्या सामुदायिक सूचना?",
        "रस्ता बंद सूचना?",
        "माझ्या परिसरातील कार्यक्रम?"
      ]
    },
    {
      label: "कागदपत्रे", icon: <FileText className="w-3.5 h-3.5" />, color: "text-slate-400 bg-slate-800/50 border-slate-600/40",
      questions: [
        "कचरा वेगळा करण्याचे नियम?",
        "नागरिक तक्रार मार्गदर्शन?",
        "PMC नागरिक सनद काय आहे?",
        "बांधकाम परवाना नियम?"
      ]
    },
  ],
};

const AREAS = [
  "Shivaji Nagar", "Kothrud", "Hadapsar", "Viman Nagar",
  "Central Ward", "Aundh", "Baner", "Deccan", "Camp",
  "Kalyani Nagar", "Wakad", "Pimpri", "Chinchwad", "Koregaon Park"
];

export default function ChatPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [selectedArea, setSelectedArea] = useState<string>("Shivaji Nagar");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");
  const [isListening, setIsListening] = useState(false);
  const [feedbackDialogMsgId, setFeedbackDialogMsgId] = useState<number | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(1);
  const [feedbackComment, setFeedbackComment] = useState("");
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<number, boolean>>({});
  const [showQuestions, setShowQuestions] = useState(true);
  const [activeCategory, setActiveCategory] = useState(0);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const categories = QUESTION_CATEGORIES[selectedLanguage] || QUESTION_CATEGORIES["en"];

  useEffect(() => {
    if (user) {
      if (user.area) setSelectedArea(user.area);
      if (user.preferred_language) setSelectedLanguage(user.preferred_language);
    }
  }, [user]);

  // Greeting message updates when area changes
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{
        id: 0, sender: "ai",
        message: getGreeting(selectedLanguage, user?.name, selectedArea),
        intent: "GENERAL_QUERY", sources: []
      }]);
    }
  }, [selectedArea]);

  // Reset active category when language changes (keep within bounds)
  useEffect(() => {
    setActiveCategory(0);
  }, [selectedLanguage]);

  useEffect(() => {
    const initialQuery = searchParams.get("q");
    if (initialQuery && messages.length <= 1) sendMessage(initialQuery);
  }, [searchParams]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  function getGreeting(lang: string, name?: string, area?: string) {
    const greetName = name ? name.split(" ")[0] : "Citizen";
    if (lang === "hi") return `नमस्ते ${greetName}! मैं **CivicConnect AI** हूं — ${area} के लिए आपका नागरिक सहायक।\n\nमैं कचरा संग्रहण, बस का समय, आपातकालीन नंबर, पानी-बिजली, पार्क, संपत्ति कर और नागरिक शिकायतों में मदद कर सकता हूं।\n\nनीचे श्रेणी चुनें या अपना प्रश्न टाइप करें।`;
    if (lang === "mr") return `नमस्कार ${greetName}! मी **CivicConnect AI** आहे — ${area} साठी आपला नागरिक सहाय्यक.\n\nकचरा संकलन, बस वेळापत्रक, आपत्कालीन हेल्पलाईन, पाणी-वीज, उद्याने, मालमत्ता कर आणि नागरिक तक्रारींसाठी मी मदत करू शकतो.\n\nखाली श्रेणी निवडा किंवा प्रश्न टाइप करा.`;
    return `Hello ${greetName}! I am **CivicConnect AI**, your community assistant for **${area}**.\n\nI can help with garbage schedules, bus timings, emergency helplines, water & electricity, parks, property tax, and civic complaints.\n\nPick a category below or type your question!`;
  }

  const sendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || loading) return;
    setInput("");
    const tempId = Date.now();
    setMessages(prev => [...prev, { id: tempId, sender: "user", message: query }]);
    setLoading(true);
    try {
      const response = await apiFetch<any>("/chat", {
        method: "POST",
        body: JSON.stringify({ message: query, conversation_id: conversationId, area: selectedArea, language: selectedLanguage })
      });
      if (!conversationId) setConversationId(response.conversation_id);
      setMessages(prev => [...prev, {
        id: response.ai_message_id, sender: "ai",
        message: response.reply, intent: response.intent,
        sources: response.sources, is_fallback: response.is_fallback
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1, sender: "ai",
        message: "Sorry, I encountered an issue. Please try again or call PMC helpline 1800-103-0222.",
        is_fallback: true
      }]);
    } finally {
      setLoading(false);
    }
  };

  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) { alert("Voice input not supported. Please type your query."); return; }
    if (isListening) { setIsListening(false); return; }
    const recognition = new SR();
    recognition.lang = selectedLanguage === "hi" ? "hi-IN" : selectedLanguage === "mr" ? "mr-IN" : "en-IN";
    recognition.continuous = false; recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const t = event.results[0][0].transcript;
      setInput(t); sendMessage(t);
    };
    recognition.start();
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackDialogMsgId) return;
    try {
      await apiFetch("/chat/feedback", {
        method: "POST",
        body: JSON.stringify({ message_id: feedbackDialogMsgId, rating: feedbackRating, comment: feedbackComment.trim() || undefined })
      });
      setFeedbackSubmitted(prev => ({ ...prev, [feedbackDialogMsgId]: true }));
      setFeedbackDialogMsgId(null); setFeedbackComment("");
    } catch { /* silent */ }
  };

  const startNewChat = () => {
    setConversationId(null);
    setMessages([{ id: Date.now(), sender: "ai", message: getGreeting(selectedLanguage, user?.name, selectedArea), intent: "GENERAL_QUERY" }]);
  };

  const panelLabel = selectedLanguage === "hi" ? "विषय चुनें:" : selectedLanguage === "mr" ? "विषय निवडा:" : "Choose a topic:";
  const questionsLabel = selectedLanguage === "hi" ? "प्रश्न चुनें:" : selectedLanguage === "mr" ? "प्रश्न निवडा:" : "Select a question:";
  const quickLabel = selectedLanguage === "hi" ? "त्वरित प्रश्न" : selectedLanguage === "mr" ? "त्वरित प्रश्न" : "Quick Questions";

  return (
    <div className="max-w-5xl mx-auto flex flex-col h-[calc(100vh-140px)] rounded-3xl bg-[#121A17] border border-[#26352F] overflow-hidden shadow-2xl">

      {/* Top Header */}
      <div className="px-5 py-3.5 bg-[#101614] border-b border-[#26352F] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#00C896] to-[#A3E635] flex items-center justify-center shadow-md shadow-[#00C896]/20">
            <Sparkles className="w-5 h-5 text-[#0A0D0C]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-[#F3F7F5]">CivicConnect AI Assistant</h2>
              <span className="flex items-center gap-1 text-[10px] text-[#00C896] bg-[#00C896]/10 px-2 py-0.5 rounded-full border border-[#00C896]/20 font-semibold">
                <ShieldCheck className="w-3 h-3" /> Verified
              </span>
            </div>
            <p className="text-[11px] text-[#9AAEA5]">Zero Hallucination · 15 Intents · EN / हिंदी / मराठी</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 text-xs bg-[#121A17] border border-[#26352F] px-2.5 py-1.5 rounded-xl text-[#F3F7F5]">
            <MapPin className="w-3.5 h-3.5 text-[#00C896]" />
            <select value={selectedArea} onChange={e => setSelectedArea(e.target.value)}
              className="bg-transparent text-xs focus:outline-none cursor-pointer">
              {AREAS.map(a => <option key={a} value={a} className="bg-[#121A17] text-[#F3F7F5]">{a}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-1 text-xs bg-[#121A17] border border-[#26352F] px-2.5 py-1.5 rounded-xl text-[#F3F7F5]">
            <Globe className="w-3.5 h-3.5 text-[#00C896]" />
            <select value={selectedLanguage} onChange={e => setSelectedLanguage(e.target.value)}
              className="bg-transparent text-xs focus:outline-none cursor-pointer">
              <option value="en" className="bg-[#121A17]">English</option>
              <option value="hi" className="bg-[#121A17]">हिंदी</option>
              <option value="mr" className="bg-[#121A17]">मराठी</option>
            </select>
          </div>
          <button onClick={startNewChat} title="New Chat"
            className="p-1.5 rounded-xl bg-[#121A17] hover:bg-[#18231F] border border-[#26352F] text-[#9AAEA5] hover:text-[#00C896] transition-colors">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Layout: Chat + Question Panel side by side */}
      <div className="flex flex-1 overflow-hidden">

        {/* ─── Chat Messages ─── */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}>
              <div className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-md ${
                msg.sender === "user"
                  ? "bg-[#00C896] text-[#0A0D0C] font-medium rounded-br-none"
                  : "bg-[#18231F] text-[#F3F7F5] border border-[#26352F] rounded-bl-none"
              }`}>
                {msg.intent && msg.sender === "ai" && (
                  <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-[#26352F]">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#101614] text-[#00C896] border border-[#00C896]/30">
                      {msg.intent}
                    </span>
                    {msg.is_fallback && (
                      <span className="text-[10px] text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Fallback
                      </span>
                    )}
                  </div>
                )}
                <div>{msg.message}</div>
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-[#26352F] space-y-1.5">
                    <div className="text-[11px] font-semibold text-[#00C896] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> Verified Sources:
                    </div>
                    {msg.sources.map((src: any, i: number) => (
                      <div key={i} className="text-[11px] text-[#9AAEA5] bg-[#101614] p-2 rounded-lg border border-[#26352F]/70">
                        <span className="font-medium text-[#F3F7F5]">{src.title}</span>
                        {src.contact && <div className="text-[#00C896] flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3" /> {src.contact}</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {msg.sender === "ai" && msg.id !== 0 && (
                <div className="flex items-center gap-3 mt-1.5 px-2 text-xs text-[#9AAEA5]">
                  <span className="text-[11px]">Helpful?</span>
                  {feedbackSubmitted[msg.id] ? (
                    <span className="text-[11px] text-[#00C896] flex items-center gap-1"><Check className="w-3 h-3" /> Thanks!</span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => { setFeedbackDialogMsgId(msg.id); setFeedbackRating(1); }}
                        className="p-1 rounded hover:bg-[#18231F] hover:text-[#00C896] transition-colors">
                        <ThumbsUp className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { setFeedbackDialogMsgId(msg.id); setFeedbackRating(-1); }}
                        className="p-1 rounded hover:bg-[#18231F] hover:text-red-400 transition-colors">
                        <ThumbsDown className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#9AAEA5] p-3 rounded-xl bg-[#18231F] w-fit border border-[#26352F]">
              <div className="w-3.5 h-3.5 border-2 border-[#00C896] border-t-transparent rounded-full animate-spin" />
              <span>Consulting civic knowledge base...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* ─── Question Panel (right sidebar) ─── */}
        <div className={`${showQuestions ? "w-72" : "w-10"} flex-shrink-0 border-l border-[#26352F] bg-[#0D1410] flex flex-col transition-all duration-300 overflow-hidden`}>
          {/* Panel toggle header */}
          <button onClick={() => setShowQuestions(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2.5 border-b border-[#26352F] hover:bg-[#18231F] transition-colors">
            {showQuestions ? (
              <>
                <span className="text-[11px] font-semibold text-[#00C896] uppercase tracking-wider">{quickLabel}</span>
                <ChevronUp className="w-3.5 h-3.5 text-[#9AAEA5]" />
              </>
            ) : (
              <MessageSquare className="w-4 h-4 text-[#9AAEA5] mx-auto" />
            )}
          </button>

          {showQuestions && (
            <div className="flex flex-col flex-1 overflow-hidden">
              {/* Category tabs - scrollable */}
              <div className="p-2 border-b border-[#26352F]">
                <p className="text-[10px] text-[#9AAEA5] mb-1.5 px-1">{panelLabel}</p>
                <div className="flex flex-wrap gap-1">
                  {categories.map((cat, i) => (
                    <button key={i} onClick={() => setActiveCategory(i)}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border transition-all ${
                        activeCategory === i
                          ? `${cat.color} border-opacity-100`
                          : "text-[#9AAEA5] bg-[#121A17] border-[#26352F] hover:border-[#3a4a42]"
                      }`}>
                      {cat.icon}
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Questions for active category */}
              <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                <p className="text-[10px] text-[#9AAEA5] px-1 mb-1">{questionsLabel}</p>
                {categories[activeCategory]?.questions.map((q, i) => (
                  <button key={i} onClick={() => sendMessage(q)}
                    disabled={loading}
                    className="w-full text-left px-3 py-2 rounded-xl text-[11px] text-[#C8DDD5] bg-[#18231F] hover:bg-[#1e2e27] border border-[#26352F] hover:border-[#00C896]/40 hover:text-[#00C896] transition-all leading-relaxed disabled:opacity-40">
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chat Input */}
      <div className="p-3 sm:p-4 bg-[#101614] border-t border-[#26352F]">
        <form onSubmit={e => { e.preventDefault(); sendMessage(); }} className="flex items-center gap-2">
          <button type="button" onClick={toggleVoiceInput} title={isListening ? "Stop" : "Speak"}
            className={`p-3 rounded-2xl border transition-all ${
              isListening ? "bg-red-500 text-white border-red-600 animate-pulse"
                          : "bg-[#18231F] hover:bg-[#26352F] border-[#26352F] text-[#9AAEA5] hover:text-[#00C896]"
            }`}>
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            placeholder={
              selectedLanguage === "hi" ? `${selectedArea} के बारे में हिंदी/मराठी/अंग्रेजी में पूछें...`
              : selectedLanguage === "mr" ? `${selectedArea} बद्दल मराठी/हिंदी/इंग्रजीत विचारा...`
              : `Ask about ${selectedArea} in English, हिंदी, or मराठी...`
            }
            className="flex-1 px-4 py-3 rounded-2xl bg-[#121A17] border border-[#26352F] text-sm text-[#F3F7F5] placeholder-[#9AAEA5]/60 focus:outline-none focus:border-[#00C896] focus:ring-1 focus:ring-[#00C896]/30 transition-all" />
          <button type="submit" disabled={!input.trim() || loading}
            className="p-3 rounded-2xl bg-[#00C896] hover:bg-[#00b284] disabled:opacity-40 text-[#0A0D0C] font-semibold transition-all shadow-md shadow-[#00C896]/20">
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* Feedback Modal */}
      {feedbackDialogMsgId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl bg-[#121A17] border border-[#26352F] p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#F3F7F5] flex items-center gap-2">
              {feedbackRating === 1 ? <><ThumbsUp className="w-4 h-4 text-[#00C896]" /><span>Helpful Response</span></>
                                    : <><ThumbsDown className="w-4 h-4 text-amber-400" /><span>Could be improved</span></>}
            </h3>
            <textarea rows={3} value={feedbackComment} onChange={e => setFeedbackComment(e.target.value)}
              placeholder="Optional: Was timing accurate? Was info missing?"
              className="w-full p-3 rounded-xl bg-[#101614] border border-[#26352F] text-xs text-[#F3F7F5] placeholder-[#9AAEA5]/50 focus:outline-none focus:border-[#00C896]" />
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setFeedbackDialogMsgId(null)} className="px-4 py-2 rounded-xl text-xs text-[#9AAEA5] hover:text-[#F3F7F5]">Cancel</button>
              <button onClick={handleFeedbackSubmit} className="px-4 py-2 rounded-xl bg-[#00C896] hover:bg-[#00b284] text-[#0A0D0C] font-semibold text-xs">Submit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}