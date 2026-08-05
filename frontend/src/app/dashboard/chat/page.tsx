"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Send,
  Plus,
  Loader2,
  Leaf,
  MessageSquare,
  Sparkles,
  Paperclip,
  FileText,
  Mic,
  PieChart,
  TrendingUp,
  Target,
  FileSpreadsheet,
  ArrowRight,
  Info,
  Crown,
  ChevronDown
} from "lucide-react";
import {
  chatSend,
  chatHistory,
  chatConversation,
  type ChatResponse,
  type ConversationSummary,
  type ChatMessage,
  getProfile,
} from "@/lib/api";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  model_tier?: "fast" | "strong" | null;
}

const QUICK_ACTIONS = [
  {
    title: "Create Monthly Budget",
    desc: "Plan your income and expenses smartly",
    icon: PieChart,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    route: "/dashboard/budgets"
  },
  {
    title: "Analyze Expenses",
    desc: "Understand where your money goes",
    icon: TrendingUp,
    color: "text-blue-500",
    bg: "bg-blue-50",
    route: "/dashboard/expenses"
  },
  {
    title: "Plan SIP Investment",
    desc: "Build wealth through systematic investing",
    icon: Target,
    color: "text-orange-500",
    bg: "bg-orange-50",
    prompt: "I want to plan a SIP investment. Where should I start?"
  },
  {
    title: "Upload Bank Statement",
    desc: "Get AI insights from your bank statements",
    icon: FileSpreadsheet,
    color: "text-purple-500",
    bg: "bg-purple-50",
    prompt: "Help me upload and analyze my bank statement."
  }
];

const SUGGESTED_QUESTIONS = [
  "How can I reduce my expenses?",
  "Best investment for 3 years?",
  "Plan a vacation with ₹50,000",
  "How much can I save annually?"
];

export default function ChatPage() {
  const { getToken, isLoaded } = useAuth();
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // State
  const [userName, setUserName] = useState("User");
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!isLoaded) return;
      try {
        const [history, profile] = await Promise.all([
          chatHistory(() => getToken()),
          getProfile(() => getToken())
        ]);
        setConversations(history);
        setUserName(profile.name || "User");
      } catch {
        // Silent fail
      } finally {
        setLoadingHistory(false);
      }
    }
    loadData();
  }, [getToken, isLoaded]);

  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const loadConversation = async (id: string) => {
    try {
      const detail = await chatConversation(id, () => getToken());
      setConversationId(id);
      setMessages(
        detail.messages.map((m: ChatMessage) => ({
          id: m.id || crypto.randomUUID(),
          role: m.role,
          content: m.content,
        }))
      );
    } catch {
      // Failed to load
    }
  };

  const startNewChat = () => {
    setConversationId(null);
    setMessages([]);
    inputRef.current?.focus();
  };

  const sendMessage = async (text?: string) => {
    const message = text || input.trim();
    if (!message || sending) return;

    setInput("");
    setSending(true);

    const userMsg: DisplayMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: message,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const response: ChatResponse = await chatSend(
        message,
        () => getToken(),
        conversationId || undefined
      );

      if (!conversationId) {
        setConversationId(response.conversation_id);
        const history = await chatHistory(() => getToken());
        setConversations(history);
      }

      const assistantMsg: DisplayMessage = {
        id: response.message_id || crypto.randomUUID(),
        role: "assistant",
        content: response.response,
        model_tier: response.model_tier,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const errorMsg: DisplayMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Sorry, I couldn't process that. ${err instanceof Error ? err.message : "Please try again."}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
      if (messages.length > 0) {
        inputRef.current?.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleActionClick = (action: typeof QUICK_ACTIONS[0]) => {
    if (action.route) {
      router.push(action.route);
    } else if (action.prompt) {
      sendMessage(action.prompt);
    }
  };

  return (
    <div className="flex h-full w-full">
      {/* Secondary Sidebar: Recent Conversations */}
      <div className="w-[300px] h-full bg-white/40 border-r border-white/50 flex flex-col shrink-0 backdrop-blur-md">
        <div className="p-6">
          <button
            onClick={startNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-[#164132] rounded-xl font-bold text-sm shadow-sm border border-white/60 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-4 pb-6 scroll-smooth">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-[#164132]/50 mb-3 ml-2">
            Recent Conversations
          </h3>
          {loadingHistory ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 text-[#164132]/30 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="py-8 text-center text-[13px] font-medium text-[#164132]/40">
              No conversations yet
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => loadConversation(conv.id)}
                  className={`
                    w-full text-left p-4 rounded-xl transition-all
                    ${conversationId === conv.id 
                      ? 'bg-white shadow-sm border border-white/60' 
                      : 'hover:bg-white/40 border border-transparent'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${conversationId === conv.id ? 'text-emerald-600' : 'text-[#164132]/40'}`} />
                    <span className={`truncate font-bold text-[13px] ${conversationId === conv.id ? 'text-[#164132]' : 'text-[#164132]/70'}`}>
                      {conv.title || "New conversation"}
                    </span>
                  </div>
                  {conv.last_message && (
                    <p className={`text-[11px] mt-1.5 truncate ml-7 font-medium ${conversationId === conv.id ? 'text-[#164132]/60' : 'text-[#164132]/40'}`}>
                      {conv.last_message.slice(0, 40)}...
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 border-t border-white/30">
          <button className="w-full py-3 text-[12px] font-bold text-[#164132]/60 hover:text-[#164132] transition-colors flex items-center justify-center gap-2">
            View All Conversations <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col relative overflow-hidden">
        {messages.length === 0 ? (
          // ==========================================
          // AI DASHBOARD EMPTY STATE
          // ==========================================
          <div className="flex-1 overflow-y-auto p-10 pb-20 relative">
            
            {/* Header */}
            <div className="flex justify-between items-start mb-10 relative z-10">
              <div>
                <h1 className="text-4xl font-extrabold text-[#164132] tracking-tight">Good afternoon, {userName} 👋</h1>
                <p className="text-lg font-medium text-[#164132]/60 mt-1">Your financial clarity starts here.</p>
              </div>
              <button className="flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-white/60 text-[#164132] text-sm font-bold hover:shadow-md transition-all">
                <Crown className="w-4 h-4 text-amber-500" />
                Pro Plan
                <ChevronDown className="w-4 h-4 text-[#164132]/40" />
              </button>
            </div>

            {/* Input Box */}
            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-[#164132]/5 border border-white/60 relative z-10 overflow-hidden mb-12">
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600" />
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask Grove anything about finance..."
                className="w-full text-xl font-bold text-[#164132] placeholder-[#164132]/30 bg-transparent outline-none mb-6"
                disabled={sending}
              />
              <div className="flex items-center gap-3 mb-6">
                {['Budgeting', 'Investing', 'Saving', 'Tax'].map(tag => (
                  <button key={tag} onClick={() => setInput(`Help me with ${tag.toLowerCase()} `)} className="px-3 py-1.5 rounded-lg bg-[#164132]/5 text-[#164132]/70 text-[12px] font-bold hover:bg-[#164132]/10 transition-colors flex items-center gap-1.5">
                    <FileText className="w-3 h-3" />
                    {tag}
                  </button>
                ))}
                <button className="px-3 py-1.5 rounded-lg bg-[#164132]/5 text-[#164132]/70 text-[12px] font-bold hover:bg-[#164132]/10 transition-colors flex items-center gap-1">
                  More <ChevronDown className="w-3 h-3" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button className="text-[#164132]/40 hover:text-[#164132] transition-colors"><Paperclip className="w-5 h-5" /></button>
                  <button className="text-[#164132]/40 hover:text-[#164132] transition-colors"><FileText className="w-5 h-5" /></button>
                  <button className="text-[#164132]/40 hover:text-[#164132] transition-colors"><Mic className="w-5 h-5" /></button>
                </div>
                <button 
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || sending}
                  className="w-12 h-12 rounded-xl bg-[#164132] flex items-center justify-center text-white shadow-lg hover:bg-[#164132]/90 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                >
                  {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 ml-1" />}
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#164132]">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  Quick Actions
                </div>
                <button className="text-[12px] font-bold text-emerald-600 flex items-center gap-1">Customize <Plus className="w-3 h-3" /></button>
              </div>
              <div className="grid grid-cols-4 gap-4">
                {QUICK_ACTIONS.map((action, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleActionClick(action)}
                    className="bg-white p-5 rounded-2xl border border-white/60 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all text-left group relative overflow-hidden"
                  >
                    <div className={`w-10 h-10 rounded-xl ${action.bg} ${action.color} flex items-center justify-center mb-4`}>
                      <action.icon className="w-5 h-5" />
                    </div>
                    <h4 className="text-[14px] font-bold text-[#164132] mb-1 leading-tight">{action.title}</h4>
                    <p className="text-[12px] font-medium text-[#164132]/60 leading-relaxed pr-2">{action.desc}</p>
                    <div className="absolute bottom-5 right-5 w-8 h-8 rounded-lg bg-[#164132]/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className={`w-4 h-4 ${action.color}`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Dashboard Bottom Row */}
            <div className="grid grid-cols-3 gap-6 mb-10">
              {/* Snapshot */}
              <div className="col-span-2 bg-white rounded-3xl p-6 border border-white/60 shadow-sm">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#164132] mb-6">
                  Today's Financial Snapshot
                  <Info className="w-3.5 h-3.5 text-[#164132]/40" />
                </div>
                <div className="grid grid-cols-4 gap-6 items-center">
                  <div className="flex flex-col items-center">
                    <p className="text-[11px] font-bold text-[#164132]/50 mb-3">Budget Progress</p>
                    <div className="relative w-20 h-20 rounded-full border-8 border-emerald-500 border-r-gray-100 flex items-center justify-center transform -rotate-45">
                      <span className="transform rotate-45 text-lg font-extrabold text-[#164132]">68%</span>
                    </div>
                    <p className="text-[10px] font-bold text-[#164132]/40 mt-3">₹27,240 / ₹40,000</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#164132]/50 mb-2">Monthly Spending</p>
                    <div className="flex items-center gap-2 mb-2"><div className="w-5 h-5 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center"><TrendingUp className="w-3 h-3" /></div><span className="text-xl font-extrabold text-[#164132]">₹21,340</span></div>
                    <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded w-fit inline-flex items-center gap-1">↓ 12% <span className="text-[#164132]/40 font-medium bg-transparent">vs last month</span></p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#164132]/50 mb-2">Savings This Month</p>
                    <div className="flex items-center gap-2 mb-2"><div className="w-5 h-5 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center"><Target className="w-3 h-3" /></div><span className="text-xl font-extrabold text-[#164132]">₹8,560</span></div>
                    <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded w-fit inline-flex items-center gap-1">↑ 18% <span className="text-[#164132]/40 font-medium bg-transparent">vs last month</span></p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#164132]/50 mb-2">Net Worth</p>
                    <div className="flex items-center gap-2 mb-2"><div className="w-5 h-5 rounded bg-blue-50 text-blue-500 flex items-center justify-center"><PieChart className="w-3 h-3" /></div><span className="text-xl font-extrabold text-[#164132]">₹4,82,000</span></div>
                    <p className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded w-fit inline-flex items-center gap-1">↑ 7.3% <span className="text-[#164132]/40 font-medium bg-transparent">vs last month</span></p>
                  </div>
                </div>
              </div>

              {/* Side insights */}
              <div className="col-span-1 flex flex-col gap-4">
                <div className="bg-white rounded-2xl p-5 border border-white/60 shadow-sm flex-1">
                  <div className="flex items-center gap-2 text-[12px] font-bold text-[#164132] mb-3">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    AI Insight for You
                  </div>
                  <p className="text-[13px] font-medium text-[#164132]/80 leading-relaxed mb-4">
                    You've spent 18% less on dining out this month. Great job! 🎉
                  </p>
                  <button className="text-[12px] font-bold text-emerald-600 flex items-center gap-1">See More Insights <ArrowRight className="w-3 h-3" /></button>
                </div>
                <div className="bg-white rounded-2xl p-5 border border-white/60 shadow-sm flex-1 flex justify-between items-end overflow-hidden relative">
                  <div>
                    <div className="flex items-center gap-2 text-[12px] font-bold text-[#164132] mb-1">
                      <span className="text-orange-500">🔥</span> Savings Streak
                    </div>
                    <p className="text-lg font-extrabold text-[#164132]">12 weeks</p>
                    <p className="text-[10px] font-medium text-[#164132]/50">Keep it up!</p>
                  </div>
                  {/* Fake tiny sparkline */}
                  <svg className="w-20 h-8 text-emerald-500 absolute bottom-4 right-4" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M0,25 L20,20 L40,28 L60,15 L80,22 L100,5" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Suggested Questions */}
            <div>
              <div className="flex items-center gap-2 text-[13px] font-bold text-[#164132] mb-4">
                <MessageSquare className="w-4 h-4 text-[#164132]/40" />
                Suggested Questions
              </div>
              <div className="flex gap-3 flex-wrap">
                {SUGGESTED_QUESTIONS.map(q => (
                  <button key={q} onClick={() => sendMessage(q)} className="px-5 py-2.5 bg-white border border-white/60 shadow-sm rounded-full text-[13px] font-bold text-[#164132]/70 hover:text-[#164132] hover:shadow-md hover:-translate-y-0.5 transition-all">
                    {q}
                  </button>
                ))}
              </div>
            </div>

          </div>
        ) : (
          // ==========================================
          // ACTIVE CHAT THREAD
          // ==========================================
          <div className="flex-1 flex flex-col relative h-full">
            {/* Header */}
            <div className="px-8 py-5 border-b border-[#164132]/5 bg-white/40 backdrop-blur-md flex justify-between items-center z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                  <Leaf className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold text-[#164132]">Grove AI</h2>
                  <p className="text-[11px] font-medium text-[#164132]/50">Your personal financial copilot</p>
                </div>
              </div>
              <button onClick={startNewChat} className="px-4 py-2 bg-white rounded-lg shadow-sm text-[12px] font-bold text-[#164132] border border-[#164132]/10 hover:bg-[#164132]/5">
                Clear Chat
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-8 scroll-smooth pb-32">
              <div className="max-w-4xl mx-auto space-y-6">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-4 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    {msg.role === "assistant" && (
                      <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                        <Leaf className="w-4 h-4 text-white" />
                      </div>
                    )}

                    <div
                      className={`
                        max-w-[75%] px-6 py-4 text-[14px] font-medium leading-relaxed tracking-wide shadow-sm border
                        ${msg.role === "user" 
                          ? "bg-[#164132] text-white rounded-[24px] rounded-tr-[4px] border-[#164132]" 
                          : "bg-white text-[#164132] rounded-[24px] rounded-tl-[4px] border-[#164132]/5"}
                      `}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {msg.role === "assistant" && msg.model_tier && (
                        <div className="mt-3 pt-3 border-t border-[#164132]/5">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-[#164132]/5 text-[#164132]/70`}>
                            {msg.model_tier === "fast" ? "⚡ Fast" : "🧠 Deep Analysis"}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {sending && (
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0 shadow-sm">
                      <Leaf className="w-4 h-4 text-white" />
                    </div>
                    <div className="px-6 py-5 bg-white text-[#164132] rounded-[24px] rounded-tl-[4px] border border-[#164132]/5 shadow-sm">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#164132]/30 animate-bounce [animation-delay:0ms]" />
                        <div className="w-2 h-2 rounded-full bg-[#164132]/30 animate-bounce [animation-delay:150ms]" />
                        <div className="w-2 h-2 rounded-full bg-[#164132]/30 animate-bounce [animation-delay:300ms]" />
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Sticky Input Bar at Bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[var(--background)] via-[var(--background)] to-transparent pt-12 z-20">
              <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-[0_8px_30px_rgba(22,65,50,0.08)] border border-[#164132]/10 p-2 flex items-center gap-2">
                <button className="w-10 h-10 flex items-center justify-center text-[#164132]/40 hover:text-[#164132] hover:bg-[#164132]/5 rounded-xl transition-colors">
                  <Plus className="w-5 h-5" />
                </button>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Reply to Grove..."
                  disabled={sending}
                  className="flex-1 bg-transparent px-2 py-3 text-[#164132] font-bold text-[14px] placeholder-[#164132]/30 outline-none"
                />
                <button
                  onClick={() => sendMessage()}
                  disabled={!input.trim() || sending}
                  className="w-10 h-10 rounded-xl bg-[#164132] flex items-center justify-center text-white shadow-md hover:bg-[#164132]/90 transition-colors disabled:opacity-50"
                >
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 ml-0.5" />}
                </button>
              </div>
              <p className="text-center text-[10px] font-bold tracking-wide uppercase text-[#164132]/40 mt-3">
                Grove provides educational guidance, not professional financial advice.
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
