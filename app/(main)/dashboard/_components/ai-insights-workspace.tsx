"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { BrainCircuit, Loader2, MessageSquareText } from "lucide-react";

import { chatWithKubera } from "@/app/actions/ai-insights";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import useFetch from "@/hooks/use-fetch";
import { showDemoModeToast } from "@/lib/demo-mode";
import { cn } from "@/lib/utils";

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
        className="grid min-w-0 gap-4 md:gap-5 xl:grid-cols-[minmax(16rem,21.25rem)_minmax(0,1fr)] xl:items-stretch"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
      <m.div whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: "easeOut" }} className="min-w-0">
      <Card className="group min-w-0 overflow-hidden border-0 bg-[radial-gradient(circle_at_top,_rgba(217,163,59,0.28),_rgba(32,21,14,0.98)_44%,_rgba(19,13,10,1)_100%)] text-amber-50 shadow-[0_30px_80px_-42px_rgba(74,34,5,0.9)] transition duration-300 hover:shadow-[0_36px_90px_-40px_rgba(116,54,10,0.95)]">
        <CardContent className="relative flex min-h-[34rem] flex-col overflow-hidden px-4 py-5 min-[420px]:px-5 sm:min-h-[36rem] sm:px-6 sm:py-7 xl:min-h-[49rem]">
          <div className="pointer-events-none absolute inset-x-6 top-8 h-32 rounded-full bg-[radial-gradient(circle,_rgba(250,204,21,0.18),_transparent_72%)] opacity-80 blur-2xl transition duration-500 group-hover:opacity-100 sm:inset-x-8 sm:top-10 sm:h-40" />
          <m.div
            className="mx-auto flex aspect-square w-[min(58vw,11rem)] items-center justify-center rounded-full border border-amber-300/35 bg-[radial-gradient(circle,_rgba(250,204,21,0.08),_transparent_70%)] shadow-[0_0_80px_rgba(245,158,11,0.12)] sm:w-56"
            animate={{ boxShadow: ["0 0 60px rgba(245,158,11,0.10)", "0 0 86px rgba(245,158,11,0.18)", "0 0 60px rgba(245,158,11,0.10)"] }}
            transition={{ duration: 4.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          >
            <Image
              src="/kuberlogo.png?v=20260519"
              alt="Kubera logo"
              width={180}
              height={180}
              unoptimized
              sizes="180px"
              className="h-[78%] w-[78%] object-contain"
            />
          </m.div>

          <div className="mt-6 text-center sm:mt-8">
            <p className="text-xs uppercase tracking-[0.32em] text-amber-300/80 sm:tracking-[0.42em]">
             Lord Kubera 
            </p>
            <h2 className="mt-3 text-[clamp(2rem,9vw,2.5rem)] font-semibold leading-tight tracking-tight text-amber-50 sm:mt-4">
              I Am Kubera
            </h2>
            <p className="mx-auto mt-4 max-w-72 text-sm leading-7 text-amber-50/72 sm:mt-5">
              Your personal finance guide for clearer spending, smarter
              savings, and sharper money decisions.
            </p>
          </div>

          <div className="mt-6 grid gap-3 sm:mt-8">
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

          <div className="mt-6 border-t border-amber-200/10 pt-5 text-center sm:mt-auto sm:pt-6">
            <p className="text-sm italic text-amber-100/50">
              &ldquo;Savings today become financial strength tomorrow.&rdquo;
            </p>
          </div>
        </CardContent>
      </Card>
      </m.div>

      <m.div whileHover={{ y: -4 }} transition={{ duration: 0.2, ease: "easeOut" }} className="min-w-0">
      <Card className="min-w-0 overflow-hidden border-violet-100 bg-white/95 shadow-[0_24px_70px_-44px_rgba(91,33,182,0.25)] transition duration-300 hover:shadow-[0_30px_78px_-40px_rgba(91,33,182,0.34)]">
        {mode === "insights" ? (
          <CardHeader className="border-b border-violet-100/70 p-4 pb-5 min-[420px]:p-5 min-[420px]:pb-5">
            <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="min-w-0 break-words text-xl font-semibold text-slate-950">
                Kubera Insights
              </CardTitle>
              <ComingSoonBadge />
            </div>
            <p className="text-sm leading-7 text-violet-950/60">
              Browse focused insight themes designed to turn your financial
              data into disciplined action.
            </p>
          </CardHeader>
        ) : null}

        <CardContent className="min-w-0 p-4 min-[420px]:p-5 lg:p-6">
          {mode === "chat" ? <ChatView demoMode={demoMode} /> : <InsightsView />}
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
      transition={{ duration: 0.18, ease: "easeOut" }}
      className={cn(
        "flex min-h-14 items-center justify-between rounded-2xl border px-3 py-3 text-left transition duration-300 min-[420px]:px-4 min-[420px]:py-4",
        active
          ? "border-amber-400/35 bg-amber-400/14 text-amber-100 shadow-[0_20px_44px_-30px_rgba(245,158,11,0.55),inset_0_0_0_1px_rgba(251,191,36,0.18)]"
          : "border-amber-100/10 bg-white/4 text-amber-50/76 hover:border-amber-200/15 hover:bg-white/7 hover:shadow-[0_18px_38px_-30px_rgba(255,255,255,0.18)]"
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            active ? "bg-amber-300/16" : "bg-white/7"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 break-words text-sm font-medium">{label}</span>
      </span>
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
  const {
    loading,
    fn: sendKuberaMessage,
  } = useFetch(chatWithKubera);

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
    } catch {
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
    <m.div
      className="min-w-0 space-y-5 md:space-y-6"
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
    >
      <m.div
        className="min-w-0 rounded-2xl border border-violet-100 bg-[linear-gradient(180deg,_rgba(250,245,255,0.92)_0%,_rgba(255,255,255,0.98)_100%)] p-3 min-[420px]:p-4 sm:rounded-3xl lg:p-6"
        initial={{ opacity: 0, scale: 0.985 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.42, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
      >
        <m.div
          className="grid min-w-0 gap-3 sm:grid-cols-[auto_minmax(0,1fr)] lg:grid-cols-[auto_minmax(0,1fr)_auto] lg:items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.34, delay: 0.12, ease: "easeOut" }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <MessageSquareText className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="break-words text-base font-semibold leading-snug text-slate-950">
              Start a conversation with Kubera
            </p>
            <p className="mt-1 text-sm leading-6 text-violet-950/60">
              Pick a prompt to begin your guided financial chat.
            </p>
          </div>
          <ComingSoonBadge />
        </m.div>

        <div className="mt-5 grid min-w-0 gap-3 md:grid-cols-3 lg:mt-6">
          {starterPrompts.map((prompt, index) => (
            <m.div
              key={prompt}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.32, delay: 0.18 + index * 0.05, ease: "easeOut" }}
            >
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-auto min-h-14 w-full justify-start whitespace-normal rounded-2xl border-violet-200 px-4 py-3 text-left text-sm leading-6 text-violet-950 hover:bg-violet-50 md:min-h-20 md:py-4"
              onClick={() =>
                demoMode
                  ? showDemoModeToast("using AI prompts")
                  : void submitMessage(prompt)
              }
              disabled={loading}
            >
              {prompt}
            </Button>
            </m.div>
          ))}
        </div>

        <m.div
          className="mt-5 min-w-0 rounded-2xl border border-violet-100 bg-white p-3 shadow-[0_18px_45px_-34px_rgba(91,33,182,0.24)] min-[420px]:p-4 sm:rounded-3xl lg:mt-6"
          initial={{ opacity: 0, y: 18, scale: 0.99 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.42, delay: 0.28, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="h-[clamp(18rem,52vh,24rem)] min-w-0 space-y-4 overflow-y-auto pr-1 min-[420px]:pr-2">
            {messages.map((message, index) => (
              <m.div
                key={`${message.role}-${index}`}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: index === 0 ? 0.42 : 0, ease: "easeOut" }}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[92%] rounded-3xl px-3 py-3 text-sm leading-7 shadow-sm min-[420px]:max-w-[85%] min-[420px]:px-4",
                    message.role === "user"
                      ? "rounded-br-md bg-violet-700 text-white"
                      : "rounded-bl-md border border-violet-100 bg-violet-50/70 text-violet-950"
                  )}
                >
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">
                    {message.role === "user" ? "You" : "Kubera"}
                  </p>
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              </m.div>
            ))}

            {loading ? (
              <m.div
                className="flex justify-start"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, ease: "easeOut" }}
              >
                <div className="rounded-3xl rounded-bl-md border border-violet-100 bg-violet-50/70 px-4 py-3 text-sm text-violet-950">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Kubera is thinking...</span>
                  </div>
                </div>
              </m.div>
            ) : null}

            <div ref={bottomRef} />
          </div>

          <m.form
            onSubmit={handleSubmit}
            className="mt-4 grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.48, ease: "easeOut" }}
          >
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={
                demoMode
                  ? "Demo mode is read-only. Sign in to use Kubera chat."
                  : "Ask Kubera about your spending, savings, or budget..."
              }
              className="h-12 min-w-0 rounded-2xl border-violet-200 bg-violet-50/45 px-4 text-sm"
              disabled={loading}
            />
            <Button
              type="submit"
              size="lg"
              className="h-12 w-full rounded-2xl bg-violet-700 px-5 text-white hover:bg-violet-800 sm:w-auto"
              onClick={() => {
                if (demoMode) {
                  showDemoModeToast("chatting with Kubera");
                }
              }}
              disabled={loading || !draft.trim()}
            >
              Send
            </Button>
          </m.form>
        </m.div>
      </m.div>
    </m.div>
  );
}

function ComingSoonBadge() {
  return (
    <m.div
      className="inline-flex min-h-7 w-fit max-w-full items-center gap-2 rounded-full border border-emerald-200 bg-[linear-gradient(135deg,_rgba(236,253,245,1),_rgba(240,253,250,0.95))] px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700 shadow-[0_10px_30px_-22px_rgba(16,185,129,0.55)]"
      animate={{
        boxShadow: [
          "0 10px 30px -22px rgba(16,185,129,0.38)",
          "0 16px 38px -22px rgba(16,185,129,0.58)",
          "0 10px 30px -22px rgba(16,185,129,0.38)",
        ],
      }}
      transition={{ duration: 3.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
    >
      <span className="relative flex h-2.5 w-2.5 items-center justify-center">
        <m.span
          className="absolute inline-flex h-full w-full rounded-full bg-emerald-400/55"
          animate={{ scale: [1, 1.9, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "easeOut" }}
        />
        <span className="relative h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-[0_0_14px_rgba(16,185,129,0.65)]" />
      </span>
      <span className="break-words leading-5">Full Features Coming Soon</span>
    </m.div>
  );
}

function InsightsView() {
  return (
    <m.div
      className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-3"
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.09,
          },
        },
      }}
    >
      {insightThemes.map((theme, index) => (
        <m.div
          key={theme.title}
          variants={{
            hidden: { opacity: 0, y: 18 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1], delay: index * 0.03 }}
          whileHover={{ y: -7, scale: 1.012 }}
          className="group relative min-w-0 overflow-hidden rounded-2xl border border-violet-100 bg-[linear-gradient(180deg,_rgba(250,245,255,0.95)_0%,_rgba(255,255,255,1)_100%)] p-4 shadow-[0_18px_40px_-34px_rgba(91,33,182,0.18)] transition duration-300 hover:border-violet-200/80 hover:shadow-[0_28px_56px_-30px_rgba(91,33,182,0.28)] min-[420px]:p-5 sm:rounded-3xl"
        >
          <div className="pointer-events-none absolute inset-x-10 top-0 h-20 bg-[radial-gradient(circle,_rgba(168,85,247,0.12),_transparent_72%)] opacity-0 blur-2xl transition duration-300 group-hover:opacity-100" />
          <m.div
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700 shadow-[0_16px_34px_-24px_rgba(109,40,217,0.42)]"
            whileHover={{ rotate: -8, scale: 1.06 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <BrainCircuit className="h-5 w-5" />
          </m.div>
          <p className="mt-5 break-words text-lg font-semibold leading-snug text-slate-950">
            {theme.title}
          </p>
          <p className="mt-3 break-words text-sm leading-7 text-violet-950/62">
            {theme.description}
          </p>
        </m.div>
      ))}
    </m.div>
  );
}
