"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Send,
  Plus,
  Loader2,
  Leaf,
  Zap,
  Brain,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import {
  chatSend,
  chatHistory,
  chatConversation,
  type ChatResponse,
  type ConversationSummary,
  type ChatMessage,
} from "@/lib/api";

interface DisplayMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  model_tier?: "fast" | "strong" | null;
}

const SUGGESTED_PROMPTS = [
  "Help me create a monthly budget",
  "What is an SIP and how do I start?",
  "Analyze my spending habits",
  "How to build an emergency fund?",
];

export default function ChatPage() {
  const { getToken } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // State
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);

  // Load conversation history
  useEffect(() => {
    async function loadHistory() {
      try {
        const history = await chatHistory(() => getToken());
        setConversations(history);
      } catch {
        // Silent fail — history is non-critical
      } finally {
        setLoadingHistory(false);
      }
    }
    loadHistory();
  }, [getToken]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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
      // Failed to load — ignore
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

    // Add user message immediately
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

      // Set conversation ID for future messages
      if (!conversationId) {
        setConversationId(response.conversation_id);
        // Refresh history to show new conversation
        const history = await chatHistory(() => getToken());
        setConversations(history);
      }

      // Add assistant message
      const assistantMsg: DisplayMessage = {
        id: response.message_id || crypto.randomUUID(),
        role: "assistant",
        content: response.response,
        model_tier: response.model_tier,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      // Add error message
      const errorMsg: DisplayMessage = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: `Sorry, I couldn't process that. ${err instanceof Error ? err.message : "Please try again."}`,
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-[calc(100vh-120px)] -m-8 gap-0">
      {/* Conversation sidebar */}
      {showSidebar && (
        <div className="w-[280px] border-r border-white/10 flex flex-col bg-[var(--background)]">
          {/* New Chat button */}
          <div className="p-3">
            <button
              onClick={startNewChat}
              className="
                w-full flex items-center justify-center gap-2
                px-4 py-2.5 rounded-xl
                border border-white/15 text-sm font-medium
                text-[var(--foreground)]/80 hover:bg-white/5
                transition-all
              "
            >
              <Plus className="w-4 h-4" />
              New Chat
            </button>
          </div>

          {/* Conversation list */}
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {loadingHistory ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-4 h-4 text-[var(--foreground)]/30 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <p className="text-xs text-[var(--foreground)]/30 text-center py-8">
                No conversations yet
              </p>
            ) : (
              <div className="space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => loadConversation(conv.id)}
                    className={`
                      w-full text-left px-3 py-2.5 rounded-xl
                      text-sm transition-all
                      ${
                        conversationId === conv.id
                          ? "bg-[var(--foreground)]/10 text-[var(--foreground)]"
                          : "text-[var(--foreground)]/50 hover:bg-white/5 hover:text-[var(--foreground)]/70"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <MessageSquare className="w-3.5 h-3.5 shrink-0 opacity-50" />
                      <span className="truncate font-medium">
                        {conv.title || "New conversation"}
                      </span>
                    </div>
                    {conv.last_message && (
                      <p className="text-xs opacity-50 mt-0.5 truncate ml-5.5">
                        {conv.last_message.slice(0, 50)}
                      </p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {/* Toggle sidebar on mobile */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          className="lg:hidden absolute top-2 left-2 z-10 p-2 rounded-lg bg-white/5 text-[var(--foreground)]/60"
        >
          <MessageSquare className="w-4 h-4" />
        </button>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {messages.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-[var(--foreground)]/10 flex items-center justify-center">
                <Leaf className="w-8 h-8 text-[var(--foreground)]/60" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                  How can I help today?
                </h2>
                <p className="text-sm text-[var(--foreground)]/50">
                  Ask me anything about personal finance — budgeting, saving,
                  investing, or understanding financial concepts.
                </p>
              </div>

              {/* Suggested prompts */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="
                      flex items-center gap-2 px-4 py-3 rounded-xl
                      border border-white/10 bg-white/5
                      text-sm text-[var(--foreground)]/70 text-left
                      hover:bg-white/[0.08] hover:border-white/15
                      transition-all
                    "
                  >
                    <Sparkles className="w-3.5 h-3.5 shrink-0 opacity-50" />
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message thread */
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${
                    msg.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-8 h-8 rounded-xl bg-[var(--foreground)]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Leaf className="w-4 h-4 text-[var(--foreground)]/60" />
                    </div>
                  )}

                  <div
                    className={`
                      max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed
                      ${
                        msg.role === "user"
                          ? "bg-[var(--foreground)] text-[var(--background)] rounded-br-md"
                          : "bg-white/5 border border-white/10 text-[var(--foreground)]/90 rounded-bl-md"
                      }
                    `}
                  >
                    {/* Render content with line breaks */}
                    <div className="whitespace-pre-wrap">{msg.content}</div>

                    {/* Model tier badge */}
                    {msg.role === "assistant" && msg.model_tier && (
                      <div className="mt-2 pt-2 border-t border-white/5">
                        <span
                          className={`
                            inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium
                            ${
                              msg.model_tier === "fast"
                                ? "bg-blue-500/10 text-blue-300"
                                : "bg-purple-500/10 text-purple-300"
                            }
                          `}
                        >
                          {msg.model_tier === "fast" ? (
                            <>
                              <Zap className="w-2.5 h-2.5" /> Quick
                            </>
                          ) : (
                            <>
                              <Brain className="w-2.5 h-2.5" /> Deep Analysis
                            </>
                          )}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {sending && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-xl bg-[var(--foreground)]/10 flex items-center justify-center shrink-0">
                    <Leaf className="w-4 h-4 text-[var(--foreground)]/60" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                    <div className="flex gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-[var(--foreground)]/30 animate-bounce [animation-delay:0ms]" />
                      <div className="w-2 h-2 rounded-full bg-[var(--foreground)]/30 animate-bounce [animation-delay:150ms]" />
                      <div className="w-2 h-2 rounded-full bg-[var(--foreground)]/30 animate-bounce [animation-delay:300ms]" />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input bar */}
        <div className="border-t border-white/10 p-4 bg-[var(--background)]">
          <div className="max-w-3xl mx-auto relative">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Grove anything..."
              disabled={sending}
              className="
                w-full pl-5 pr-14 py-3.5 rounded-2xl
                bg-white/5 border border-white/10
                text-[var(--foreground)] text-sm
                placeholder-[var(--foreground)]/30
                focus:outline-none focus:border-[var(--foreground)]/20
                disabled:opacity-50 transition-colors
              "
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || sending}
              className="
                absolute right-2 top-1/2 -translate-y-1/2
                w-9 h-9 rounded-xl
                bg-[var(--foreground)] text-[var(--background)]
                flex items-center justify-center
                hover:opacity-90 disabled:opacity-30
                transition-all
              "
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
          <p className="text-center text-[10px] text-[var(--foreground)]/25 mt-2">
            Grove provides educational guidance, not professional financial advice.
          </p>
        </div>
      </div>
    </div>
  );
}
