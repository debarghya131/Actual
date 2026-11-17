"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { BrainCircuit, Loader2, MessageSquareText, Sparkles } from "lucide-react";

import { chatWithKubera } from "@/app/actions/ai-insights";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/use-fetch";
import { showDemoModeToast } from "@/lib/demo-mode";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type InsightMode = "chat" | "insights";
type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const starterPrompts = [
  "Where am I overspending this month?",
  "How should I improve my monthly budget?",
  "How can I save more consistently each month?",
];

const withDemoModeHint = (message: string) =>
  `${message} Explore Try Demo mode.`;

const insightThemes = [
  {
    title: "Smart Savings Summary",
    description:
      "Get a focused summary of how much you are saving, where savings can improve, and what deserves your attention first.",
  },
  {
    title: "Detect Spending Pattern",
    description:
      "Spot recurring expense behavior, category spikes, and monthly spending trends before they start affecting your balance.",
  },
  {
    title: "Next 5 Months Prediction",
    description:
      "See a forward-looking view of your next 5 months with guidance around projected expenses, savings flow, and likely budget pressure.",
  },
];

export default function AiInsightsWorkspace({
  demoMode = false,
}: {
  demoMode?: boolean;
}) {
  const [mode, setMode] = useState<InsightMode>("chat");

  return (
    <LazyMotion features={domAnimation}>
      <m.div
        className="flex flex-1 flex-col min-w-0 min-h-0 lg:h-full lg:min-h-0 xl:grid xl:grid-cols-[minmax(18rem,21rem)_minmax(0,1fr)] xl:items-stretch gap-3.5 sm:gap-4 md:gap-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Left Column: Lord Kubera Card */}
        <m.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="flex min-w-0 flex-col xl:h-full xl:min-h-0 shrink-0"
        >
          <Card className="group relative flex h-full min-w-0 flex-col overflow-hidden border-0 bg-[radial-gradient(circle_at_top,_rgba(217,163,59,0.28),_rgba(32,21,14,0.98)_44%,_rgba(19,13,10,1)_100%)] text-amber-50 shadow-[0_24px_70px_-40px_rgba(74,34,5,0.85)] rounded-2xl sm:rounded-3xl">
            <CardContent className="relative flex flex-1 min-h-0 flex-col justify-between overflow-y-auto modern-scrollbar p-4 sm:p-5 xl:p-6 gap-3">
              <div className="pointer-events-none absolute inset-x-6 top-6 h-28 rounded-full bg-[radial-gradient(circle,_rgba(250,204,21,0.18),_transparent_72%)] opacity-80 blur-2xl transition duration-500 group-hover:opacity-100" />

              {/* Avatar & Title */}
              <div className="text-center pt-1">
                <m.div
                  className="mx-auto flex aspect-square w-20 min-[420px]:w-24 sm:w-28 xl:w-32 items-center justify-center rounded-full border border-amber-300/35 bg-[radial-gradient(circle,_rgba(250,204,21,0.08),_transparent_70%)] shadow-[0_0_60px_rgba(245,158,11,0.12)]"
                  animate={{
                    boxShadow: [
                      "0 0 40px rgba(245,158,11,0.10)",
                      "0 0 60px rgba(245,158,11,0.18)",
                      "0 0 40px rgba(245,158,11,0.10)",
                    ],
                  }}
                  transition={{
                    duration: 4.8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <Image
                    src="/kuberlogo.webp"
                    alt="Kubera logo"
                    width={130}
                    height={130}
                    sizes="130px"
                    className="h-[78%] w-[78%] object-contain"
                  />
                </m.div>

                <p className="mt-3 text-[10px] sm:text-xs uppercase tracking-[0.3em] text-amber-300/80 font-semibold">
                  Lord Kubera
                </p>
                <h2 className="mt-1 text-xl sm:text-2xl font-bold tracking-tight text-amber-50 leading-tight">
                  I Am Kubera
                </h2>
                <p className="mx-auto mt-2 max-w-[260px] text-xs sm:text-sm leading-relaxed text-amber-50/70">
                  Your personal finance guide for clearer spending, smarter
                  savings, and sharper money decisions.
                </p>
              </div>

              {/* Mode switch buttons */}
              <div className="my-1 sm:my-2 grid gap-2 sm:gap-2.5">
                <ModeButton
                  active={mode === "insights"}
                  icon={BrainCircuit}
                  label="Insights"
                  onClick={() => setMode("insights")}
                />
                <ModeButton
                  active={mode === "chat"}
                  icon={MessageSquareText}
                  label="Chat with Kubera"
                  onClick={() => setMode("chat")}
                />
              </div>

              {/* Quote */}
              <div className="border-t border-amber-200/10 pt-2.5 sm:pt-3 text-center shrink-0">
                <p className="text-[11px] sm:text-xs italic text-amber-100/50">
                  &ldquo;Savings today become financial strength tomorrow.&rdquo;
                </p>
              </div>
            </CardContent>
          </Card>
        </m.div>

        {/* Right Column: Workspace View */}
        <m.div
          whileHover={{ y: -2 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="flex min-w-0 flex-1 flex-col xl:h-full xl:min-h-0"
        >
          <Card className="flex flex-1 min-h-0 flex-col overflow-hidden border border-violet-100/90 bg-white/95 shadow-[0_20px_60px_-36px_rgba(91,33,182,0.22)] backdrop-blur-md rounded-2xl sm:rounded-3xl">
            {mode === "insights" ? (
              <CardHeader className="border-b border-violet-100/80 px-4 py-3 sm:px-6 sm:py-4 shrink-0">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-base sm:text-lg font-bold text-slate-950 flex items-center gap-2">
                      <BrainCircuit className="h-4 w-4 sm:h-5 sm:w-5 text-violet-700" />
                      Kubera Insights
                    </CardTitle>
                    <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                      Focused financial themes turned into disciplined action.
                    </p>
                  </div>
                  <ComingSoonBadge />
                </div>
              </CardHeader>
            ) : null}

            <CardContent className="flex flex-1 min-h-0 flex-col p-3 min-[420px]:p-3.5 sm:p-5 lg:p-5.5 overflow-hidden">
              <div
                className={
                  mode === "chat"
                    ? "flex min-h-0 flex-1 flex-col"
                    : "hidden"
                }
                aria-hidden={mode !== "chat"}
              >
                <ChatView demoMode={demoMode} />
              </div>
              <div
                className={
                  mode === "insights"
                    ? "flex min-h-0 flex-1 flex-col"
                    : "hidden"
                }
                aria-hidden={mode !== "insights"}
              >
                <InsightsView />
              </div>
            </CardContent>
          </Card>
        </m.div>
      </m.div>
    </LazyMotion>
  );
}

function ModeButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: typeof BrainCircuit;
  label: string;
  onClick: () => void;
}) {
  return (
    <m.button
      type="button"
      onClick={onClick}
      whileHover={{ y: -2, scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className={cn(
        "flex min-h-12 items-center justify-between rounded-xl sm:rounded-2xl border px-3 py-2.5 text-left transition duration-200 min-[420px]:px-3.5",
        active
          ? "border-amber-400/40 bg-amber-400/15 text-amber-100 shadow-[0_16px_36px_-24px_rgba(245,158,11,0.5),inset_0_0_0_1px_rgba(251,191,36,0.2)]"
          : "border-amber-100/10 bg-white/4 text-amber-50/75 hover:border-amber-200/20 hover:bg-white/8 hover:shadow-xs"
      )}
    >
      <span className="flex min-w-0 items-center gap-2.5">
        <span
          className={cn(
            "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl",
            active ? "bg-amber-300/20 text-amber-200" : "bg-white/8 text-amber-100/70"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="truncate text-xs sm:text-sm font-semibold">{label}</span>
      </span>
      {active ? (
        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] shrink-0" />
      ) : null}
    </m.button>
  );
}

function ChatView({ demoMode = false }: { demoMode?: boolean }) {
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "I’m Kubera. Ask me about spending, savings, budgets, or category-wise analysis, and I’ll respond using your finance data.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const { loading, fn: sendKuberaMessage } = useFetch(chatWithKubera);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const submitMessage = async (messageText: string) => {
    const trimmedMessage = messageText.trim();
    if (!trimmedMessage || loading) {
      return;
    }

    if (demoMode) {
      showDemoModeToast("chatting with Kubera");
      return;
    }

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: trimmedMessage },
    ];

    setMessages(nextMessages);
    setDraft("");

    try {
      const result = await sendKuberaMessage({
        message: trimmedMessage,
        history: nextMessages,
      });

      setMessages([
        ...nextMessages,
        { role: "assistant", content: result.reply },
      ]);
    } catch (error) {
      toast.error(
        withDemoModeHint(
          error instanceof Error
            ? error.message
            : "I couldn’t answer that right now. Please try again in a moment."
        )
      );
      setMessages([
        ...nextMessages,
        {
          role: "assistant",
          content:
            "I couldn’t answer that right now. Please try again in a moment.",
        },
      ]);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitMessage(draft);
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-2.5 sm:gap-3.5 xl:h-full">
      {/* Suggestions Header Panel */}
      <div className="shrink-0 rounded-2xl border border-violet-100/90 bg-[linear-gradient(180deg,_rgba(250,245,255,0.92)_0%,_rgba(255,255,255,0.98)_100%)] p-3 sm:p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl bg-violet-100 text-violet-700 shadow-xs">
              <MessageSquareText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs sm:text-sm font-semibold text-slate-900 leading-tight">
                Start a conversation with Kubera
              </p>
              <p className="truncate text-[11px] sm:text-xs text-slate-500 font-medium">
                Pick a prompt to begin your guided financial chat.
              </p>
            </div>
          </div>
          <ComingSoonBadge />
        </div>

        {/* 3 Starter Prompts */}
        <div className="mt-2.5 sm:mt-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
          {starterPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() =>
                demoMode
                  ? showDemoModeToast("using AI prompts")
                  : void submitMessage(prompt)
              }
              disabled={loading}
              className="group text-left rounded-xl border border-violet-200/80 bg-white/90 px-3 py-2 text-xs font-semibold text-violet-950 transition hover:bg-violet-50 hover:border-violet-300 shadow-2xs leading-relaxed"
            >
              <span className="flex items-start gap-1.5">
                <Sparkles className="h-3 w-3 text-violet-500 shrink-0 mt-0.5 group-hover:scale-110 transition" />
                <span className="line-clamp-2">{prompt}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages + Input Box */}
      <div className="flex flex-1 min-h-[300px] xl:min-h-0 flex-col rounded-2xl border border-violet-100/90 bg-white shadow-xs p-3 sm:p-4 overflow-hidden">
        {/* Messages List with internal modern scrollbar */}
        <div className="flex-1 min-h-0 space-y-3 overflow-y-auto pr-1 sm:pr-2 modern-scrollbar">
          {messages.map((message, index) => (
            <m.div
              key={`${message.role}-${index}`}
              layout
              initial={{ opacity: 0, y: 10, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className={cn(
                "flex",
                message.role === "user" ? "justify-end" : "justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[90%] sm:max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed shadow-2xs",
                  message.role === "user"
                    ? "rounded-br-xs bg-violet-700 text-white font-medium"
                    : "rounded-bl-xs border border-violet-100 bg-violet-50/70 text-violet-950"
                )}
              >
                <p className="mb-0.5 text-[10px] font-bold uppercase tracking-wider opacity-70">
                  {message.role === "user" ? "You" : "Kubera"}
                </p>
                <p className="whitespace-pre-wrap break-words">{message.content}</p>
              </div>
            </m.div>
          ))}

          {loading ? (
            <div className="flex justify-start">
              <div className="rounded-2xl rounded-bl-xs border border-violet-100 bg-violet-50/70 px-3.5 py-2.5 text-xs text-violet-950 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-violet-700" />
                <span className="font-medium">Kubera is thinking...</span>
              </div>
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>

        {/* Pinned Input Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-2.5 sm:mt-3 pt-2.5 sm:pt-3 border-t border-violet-50 flex items-center gap-2 shrink-0"
        >
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={
              demoMode
                ? "Demo mode is read-only. Sign in to use Kubera chat."
                : "Ask Kubera about your spending, savings, or budget..."
            }
            className="h-10 sm:h-11 flex-1 rounded-xl border-violet-200 bg-violet-50/40 px-3 sm:px-4 text-xs sm:text-sm focus-visible:ring-violet-400"
            disabled={loading}
          />
          <Button
            type="submit"
            className="h-10 sm:h-11 rounded-xl bg-violet-700 px-4 sm:px-5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-violet-800 shrink-0"
            disabled={loading || !draft.trim()}
            onClick={() => {
              if (demoMode) showDemoModeToast("chatting with Kubera");
            }}
          >
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}

function ComingSoonBadge() {
  return (
    <div className="inline-flex min-h-6.5 w-fit items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50 px-2.5 py-0.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wide text-emerald-700 shadow-2xs shrink-0">
      <span className="relative flex h-2 w-2 items-center justify-center">
        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
        <span className="relative h-2 w-2 rounded-full bg-emerald-500 shadow-xs" />
      </span>
      <span>Full Features Coming Soon</span>
    </div>
  );
}

function InsightsView() {
  return (
    <div className="flex-1 min-h-0 overflow-y-auto modern-scrollbar pr-1 sm:pr-2">
      <div className="grid min-w-0 gap-3 sm:gap-4 md:grid-cols-2 xl:grid-cols-3">
        {insightThemes.map((theme) => (
          <div
            key={theme.title}
            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-violet-100 bg-[linear-gradient(180deg,_rgba(250,245,255,0.95)_0%,_rgba(255,255,255,1)_100%)] p-4 sm:p-5 shadow-xs transition duration-300 hover:border-violet-200 hover:shadow-md"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-violet-700 shadow-xs">
                <BrainCircuit className="h-5 w-5" />
              </div>
              <h3 className="mt-3.5 text-sm sm:text-base font-bold text-slate-900 leading-snug">
                {theme.title}
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                {theme.description}
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-violet-50 text-[11px] font-semibold text-violet-700">
              Analysis Model
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
