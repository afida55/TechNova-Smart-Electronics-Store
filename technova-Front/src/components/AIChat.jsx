import { useEffect, useRef, useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  X,
  MessageCircle,
  User,
  ArrowLeft,
} from "lucide-react";

import { sendAIMessage } from "../lib/ai";
import { useAuth } from "../lib/AuthContext";

const SUGGESTIONS = [
  "What laptop is best for programming?",
  "Compare your best smartphones",
  "What should I buy for gaming?",
  "Which products are under $500?",
];

export default function AIChat({
  fullPage = false,
  setPage,
}) {
  const { userId, isAuthenticated } = useAuth();

  const [open, setOpen] = useState(fullPage);
  const [message, setMessage] = useState("");

  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(false);

  const messagesContainerRef = useRef(null);
  const textareaRef = useRef(null);

  /*
   * ============================================================
   * USER-SPECIFIC CHAT STORAGE KEY
   * ============================================================
   */

  const chatStorageKey = userId
    ? `technova_ai_chat_messages_${userId}`
    : null;

  /*
   * ============================================================
   * LOAD USER'S CHAT HISTORY
   * ============================================================
   */

  useEffect(() => {
    if (!isAuthenticated || !userId || !chatStorageKey) {
      setMessages([]);
      return;
    }

    try {
      const savedMessages =
        localStorage.getItem(chatStorageKey);

      if (!savedMessages) {
        setMessages([]);
        return;
      }

      const parsedMessages =
        JSON.parse(savedMessages);

      setMessages(
        Array.isArray(parsedMessages)
          ? parsedMessages
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load TechNova AI chat:",
        error
      );

      setMessages([]);
    }
  }, [
    userId,
    isAuthenticated,
    chatStorageKey,
  ]);

  /*
   * ============================================================
   * KEEP FULL-PAGE MODE OPEN
   * ============================================================
   */

  useEffect(() => {
    if (fullPage) {
      setOpen(true);
    }
  }, [fullPage]);

  /*
   * ============================================================
   * SAVE USER'S CONVERSATION
   * ============================================================
   */

  useEffect(() => {
    if (
      !isAuthenticated ||
      !userId ||
      !chatStorageKey
    ) {
      return;
    }

    try {
      localStorage.setItem(
        chatStorageKey,
        JSON.stringify(messages)
      );
    } catch (error) {
      console.error(
        "Failed to save TechNova AI chat:",
        error
      );
    }
  }, [
    messages,
    userId,
    isAuthenticated,
    chatStorageKey,
  ]);

  /*
   * ============================================================
   * SCROLL ONLY INSIDE CHAT MESSAGE AREA
   * ============================================================
   */

  useEffect(() => {
    if (!open || messages.length === 0) {
      return;
    }

    requestAnimationFrame(() => {
      const container =
        messagesContainerRef.current;

      if (!container) {
        return;
      }

      container.scrollTo({
        top: container.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages, open]);

  /*
   * ============================================================
   * SEND MESSAGE
   * ============================================================
   */

  async function handleSend() {
    const text = message.trim();

    if (!text || loading) {
      return;
    }

    /*
     * Save current conversation before adding
     * the new user message.
     */
    const previousMessages = [...messages];

    setMessages((current) => [
      ...current,
      {
        role: "user",
        text,
      },
    ]);

    setMessage("");
    setLoading(true);

    /*
     * Keep textarea ready for next message.
     */
    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });

    try {
      const history = previousMessages.map(
        (item) => ({
          role: item.role,
          text: item.text,
        })
      );

      const data = await sendAIMessage(
        text,
        history
      );

      setMessages((current) => [
        ...current,
        {
          role: "model",
          text:
            data?.reply ||
            "I couldn't generate a response.",
        },
      ]);
    } catch (error) {
      console.error("AI chat error:", error);

      setMessages((current) => [
        ...current,
        {
          role: "model",
          text:
            error?.message ||
            "Sorry, I couldn't connect to TechNova AI.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);

      requestAnimationFrame(() => {
        textareaRef.current?.focus();
      });
    }
  }

  /*
   * ============================================================
   * ENTER KEY
   * ============================================================
   */

  function handleKeyDown(event) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      handleSend();
    }
  }

  /*
   * ============================================================
   * OPEN / CLOSE FLOATING CHAT
   * ============================================================
   */

  function openChat() {
    setOpen(true);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  function closeChat() {
    /*
     * Full-page AI cannot be minimized using
     * the floating close button.
     */
    if (fullPage) {
      return;
    }

    setOpen(false);
  }

  /*
   * ============================================================
   * SUGGESTION
   * ============================================================
   */

  function useSuggestion(text) {
    setMessage(text);

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  /*
   * ============================================================
   * FULL PAGE BACK
   * ============================================================
   */

  function goBack() {
    if (setPage) {
      setPage("home");
    }
  }

  /*
   * ============================================================
   * FULL PAGE VERSION
   * ============================================================
   */

  if (fullPage) {
    return (
      <div className="h-[calc(100vh-76px)] min-h-0 overflow-hidden bg-slate-50">
        <div className="mx-auto flex h-full min-h-0 w-full max-w-6xl flex-col px-4 py-4 sm:px-6 sm:py-5 lg:px-8">

          {/* ==================================================
              PAGE HEADER
          ================================================== */}

          <div className="mb-4 flex shrink-0 items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">

                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-sm">
                  <Sparkles
                    size={18}
                    strokeWidth={2.2}
                  />
                </div>

                <div className="min-w-0">
                  <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl">
                    TechNova AI
                  </h1>

                  <p className="hidden text-xs text-slate-500 sm:block">
                    Your intelligent shopping assistant
                  </p>
                </div>

              </div>
            </div>

            <button
              type="button"
              onClick={goBack}
              className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              <ArrowLeft size={16} />

              <span className="hidden sm:inline">
                Back to Dashboard
              </span>

              <span className="sm:hidden">
                Back
              </span>
            </button>
          </div>

          {/* ==================================================
              MAIN CHAT
          ================================================== */}

          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:rounded-3xl">

            {/* Chat header */}
            <div className="flex shrink-0 items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white sm:px-5">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Bot size={22} />
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold sm:text-base">
                  TechNova AI Assistant
                </h2>

                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-blue-100">
                  <span className="h-2 w-2 rounded-full bg-green-300" />
                  Online
                </div>
              </div>

            </div>

            {/* ==================================================
                FULL PAGE MESSAGES
            ================================================== */}

            <div
              ref={messagesContainerRef}
              className="min-h-0 flex-1 overflow-y-auto overscroll-contain bg-slate-50 p-3 sm:p-5"
            >
              {messages.length === 0 ? (
                <div className="flex min-h-full items-center justify-center py-8">

                  <div className="w-full max-w-2xl text-center">

                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                      <Sparkles size={30} />
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 sm:text-2xl">
                      How can I help you?
                    </h3>

                    <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
                      Ask me about TechNova products,
                      comparisons, recommendations,
                      prices, or what you should buy.
                    </p>

                    <div className="mt-6 grid grid-cols-1 gap-2 sm:grid-cols-2">

                      {SUGGESTIONS.map(
                        (suggestion) => (
                          <button
                            key={suggestion}
                            type="button"
                            onClick={() =>
                              useSuggestion(
                                suggestion
                              )
                            }
                            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                          >
                            {suggestion}
                          </button>
                        )
                      )}

                    </div>
                  </div>

                </div>
              ) : (
                <div className="mx-auto w-full max-w-3xl space-y-4">

                  {messages.map(
                    (item, index) => {
                      const isUser =
                        item.role === "user";

                      return (
                        <div
                          key={`${item.role}-${index}`}
                          className={`flex w-full gap-2.5 sm:gap-3 ${
                            isUser
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >

                          {!isUser && (
                            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                              <Bot size={17} />
                            </div>
                          )}

                          <div
                            className={`max-w-[85%] sm:max-w-[78%] ${
                              isUser
                                ? "order-first"
                                : ""
                            }`}
                          >
                            <div
                              className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${
                                isUser
                                  ? "rounded-br-md bg-blue-600 text-white"
                                  : item.error
                                    ? "rounded-bl-md border border-red-200 bg-red-50 text-red-700"
                                    : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                              }`}
                            >
                              <div className="whitespace-pre-wrap break-words">
                                {item.text}
                              </div>
                            </div>
                          </div>

                          {isUser && (
                            <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                              <User size={17} />
                            </div>
                          )}

                        </div>
                      );
                    }
                  )}

                  {/* Loading */}
                  {loading && (
                    <div className="flex items-start gap-2.5 sm:gap-3">

                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <Bot size={17} />
                      </div>

                      <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">

                        <div className="flex items-center gap-1">

                          <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" />

                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                            style={{
                              animationDelay:
                                "120ms",
                            }}
                          />

                          <span
                            className="h-2 w-2 animate-bounce rounded-full bg-slate-400"
                            style={{
                              animationDelay:
                                "240ms",
                            }}
                          />

                        </div>

                      </div>

                    </div>
                  )}

                  <div className="h-2" />

                </div>
              )}
            </div>

            {/* ==================================================
                FULL PAGE INPUT
            ================================================== */}

            <div className="shrink-0 border-t border-slate-200 bg-white p-3 sm:p-4">

              <div className="mx-auto flex w-full max-w-3xl items-end gap-2">

                <textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Ask TechNova AI..."
                  rows={1}
                  className="max-h-32 min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="button"
                  onClick={handleSend}
                  disabled={
                    !message.trim() || loading
                  }
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>

              </div>

              <p className="mx-auto mt-2 hidden max-w-3xl text-center text-[11px] text-slate-400 sm:block">
                Press Enter to send • Shift + Enter
                for a new line
              </p>

            </div>
          </div>
        </div>
      </div>
    );
  }

  /*
   * ============================================================
   * FLOATING CHAT VERSION
   * ============================================================
   */

  return (
    <>
      {open && (
        <div className="fixed bottom-5 right-3 z-[100] flex h-[min(620px,calc(100vh-6.5rem))] w-[calc(100vw-1.5rem)] max-w-[420px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:bottom-6 sm:right-6 sm:h-[600px] sm:w-[400px] sm:rounded-3xl">

          {/* ==================================================
              FLOATING HEADER
          ================================================== */}

          <div className="flex shrink-0 items-center justify-between bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3 text-white">

            <div className="flex min-w-0 items-center gap-3">

              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <Bot size={20} />
              </div>

              <div className="min-w-0">

                <h2 className="truncate text-sm font-semibold">
                  TechNova AI
                </h2>

                <div className="flex items-center gap-1.5 text-[11px] text-blue-100">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-300" />
                  Online
                </div>

              </div>
            </div>

            {/* Close / Minimize */}
            <button
              type="button"
              onClick={closeChat}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/80 transition hover:bg-white/10 hover:text-white"
              aria-label="Minimize TechNova AI"
              title="Minimize"
            >
              <X size={19} />
            </button>

          </div>

          {/* ==================================================
              FLOATING MESSAGES
          ================================================== */}

          <div
            ref={messagesContainerRef}
            className="min-h-0 flex-1 overflow-y-auto overscroll-auto bg-slate-50 p-3"
            style={{
              WebkitOverflowScrolling: "touch",
            }}
          >

            {messages.length === 0 ? (
              <div className="flex min-h-full items-center justify-center">

                <div className="w-full text-center">

                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                    <Sparkles size={26} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    Hi! How can I help?
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    Ask about products,
                    comparisons, or recommendations.
                  </p>

                  <div className="mt-4 space-y-2">

                    {SUGGESTIONS.map(
                      (suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() =>
                            useSuggestion(
                              suggestion
                            )
                          }
                          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-left text-xs text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        >
                          {suggestion}
                        </button>
                      )
                    )}

                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-3">

                {messages.map(
                  (item, index) => {
                    const isUser =
                      item.role === "user";

                    return (
                      <div
                        key={`${item.role}-${index}`}
                        className={`flex gap-2 ${
                          isUser
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >

                        {!isUser && (
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                            <Bot size={15} />
                          </div>
                        )}

                        <div
                          className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-5 shadow-sm ${
                            isUser
                              ? "rounded-br-md bg-blue-600 text-white"
                              : item.error
                                ? "rounded-bl-md border border-red-200 bg-red-50 text-red-700"
                                : "rounded-bl-md border border-slate-200 bg-white text-slate-700"
                          }`}
                        >
                          <div className="whitespace-pre-wrap break-words">
                            {item.text}
                          </div>
                        </div>

                        {isUser && (
                          <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                            <User size={15} />
                          </div>
                        )}

                      </div>
                    );
                  }
                )}

                {/* Loading */}
                {loading && (
                  <div className="flex items-start gap-2">

                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                      <Bot size={15} />
                    </div>

                    <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-3.5 py-2.5 shadow-sm">

                      <div className="flex items-center gap-1">

                        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400" />

                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                          style={{
                            animationDelay:
                              "120ms",
                          }}
                        />

                        <span
                          className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate-400"
                          style={{
                            animationDelay:
                              "240ms",
                          }}
                        />

                      </div>

                    </div>

                  </div>
                )}

                <div className="h-1" />

              </div>
            )}

          </div>

          {/* ==================================================
              FLOATING INPUT
          ================================================== */}

          <div className="shrink-0 border-t border-slate-200 bg-white p-3">

            <div className="flex items-end gap-2">

              <textarea
                ref={textareaRef}
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask TechNova AI..."
                rows={1}
                className="max-h-28 min-h-[42px] flex-1 resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={handleSend}
                disabled={
                  !message.trim() || loading
                }
                className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send size={17} />
              </button>

            </div>
          </div>

        </div>
      )}

      {/* ======================================================
          MINIMIZED CHAT BUBBLE
      ====================================================== */}

      {!open && (
        <button
          type="button"
          onClick={openChat}
          className="fixed bottom-5 right-4 z-[100] flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl transition hover:scale-105 hover:bg-blue-700 sm:bottom-6 sm:right-6"
          aria-label="Open TechNova AI"
          title="Open TechNova AI"
        >
          <MessageCircle size={25} />
        </button>
      )}
    </>
  );
}