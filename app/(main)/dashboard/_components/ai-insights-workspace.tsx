"use client";

import Image from "next/image";
import { FormEvent, useEffect, useRef, useState } from "react";
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
    <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)] xl:items-stretch">
      <Card className="overflow-hidden border-0 bg-[radial-gradient(circle_at_top,_rgba(217,163,59,0.28),_rgba(32,21,14,0.98)_44%,_rgba(19,13,10,1)_100%)] text-amber-50 shadow-[0_30px_80px_-42px_rgba(74,34,5,0.9)]">
        <CardContent className="flex min-h-[760px] flex-col px-6 py-7">
          <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-full border border-amber-300/35 bg-[radial-gradient(circle,_rgba(250,204,21,0.08),_transparent_70%)] shadow-[0_0_80px_rgba(245,158,11,0.12)]">
            <Image
              src="/kuberlogo.png?v=20260519"
              alt="Kubera logo"
              width={180}
              height={180}
              unoptimized
              sizes="180px"
              className="h-44 w-44 object-contain"
            />
          </div>

          <div className="mt-8 text-center">
            <p className="text-xs uppercase tracking-[0.42em] text-amber-300/80">
             Lord Kubera 
            </p>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-amber-50">
              I Am Kubera
            </h2>
            <p className="mt-5 text-sm leading-7 text-amber-50/72">
              Your personal finance guide for clearer spending, smarter
              savings, and sharper money decisions.
            </p>
          </div>

          <div className="mt-8 grid gap-3">
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

          <div className="mt-auto border-t border-amber-200/10 pt-6 text-center">
            <p className="text-sm italic text-amber-100/50">
              "Savings today become financial strength tomorrow."
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-violet-100 bg-white/95 shadow-[0_24px_70px_-44px_rgba(91,33,182,0.25)]">
        {mode === "insights" ? (
          <CardHeader className="border-b border-violet-100/70 pb-5">
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-xl font-semibold text-slate-950">
                Kubera Insights
              </CardTitle>
              <p className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
                Full Features Coming Soon
              </p>
            </div>
            <p className="text-sm leading-7 text-violet-950/60">
              Browse focused insight themes designed to turn your financial
              data into disciplined action.
            </p>
          </CardHeader>
        ) : null}

        <CardContent className="p-6">
          {mode === "chat" ? <ChatView demoMode={demoMode} /> : <InsightsView />}
        </CardContent>
      </Card>
    </div>
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
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-2xl border px-4 py-4 text-left transition",
        active
          ? "border-amber-400/35 bg-amber-400/14 text-amber-100 shadow-[inset_0_0_0_1px_rgba(251,191,36,0.18)]"
          : "border-amber-100/10 bg-white/4 text-amber-50/76 hover:bg-white/7"
      )}
    >
      <span className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl",
            active ? "bg-amber-300/16" : "bg-white/7"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="text-sm font-medium">{label}</span>
      </span>
    </button>
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
    <div className="space-y-6">
      <div className="rounded-3xl border border-violet-100 bg-[linear-gradient(180deg,_rgba(250,245,255,0.92)_0%,_rgba(255,255,255,0.98)_100%)] p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <MessageSquareText className="h-5 w-5" />
          </div>
          <div className="mr-auto">
            <p className="text-base font-semibold text-slate-950">
              Start a conversation with Kubera
            </p>
            <p className="text-sm text-violet-950/60">
              Pick a prompt to begin your guided financial chat.
            </p>
          </div>
          <p className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Full Features Coming Soon
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {starterPrompts.map((prompt) => (
            <Button
              key={prompt}
              type="button"
              variant="outline"
              size="lg"
              className="h-auto min-h-20 justify-start rounded-2xl border-violet-200 px-4 py-4 text-left text-sm text-violet-950 hover:bg-violet-50"
              onClick={() =>
                demoMode
                  ? showDemoModeToast("using AI prompts")
                  : void submitMessage(prompt)
              }
              disabled={loading}
            >
              {prompt}
            </Button>
          ))}
        </div>

        <div className="mt-6 rounded-3xl border border-violet-100 bg-white p-4 shadow-[0_18px_45px_-34px_rgba(91,33,182,0.24)]">
          <div className="h-[380px] space-y-4 overflow-y-auto pr-2">
            {messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={cn(
                  "flex",
                  message.role === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-3xl px-4 py-3 text-sm leading-7 shadow-sm",
                    message.role === "user"
                      ? "rounded-br-md bg-violet-700 text-white"
                      : "rounded-bl-md border border-violet-100 bg-violet-50/70 text-violet-950"
                  )}
                >
                  <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.14em] opacity-70">
                    {message.role === "user" ? "You" : "Kubera"}
                  </p>
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}

            {loading ? (
              <div className="flex justify-start">
                <div className="rounded-3xl rounded-bl-md border border-violet-100 bg-violet-50/70 px-4 py-3 text-sm text-violet-950">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Kubera is thinking...</span>
                  </div>
                </div>
              </div>
            ) : null}

            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
            <Input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={
                demoMode
                  ? "Demo mode is read-only. Sign in to use Kubera chat."
                  : "Ask Kubera about your spending, savings, or budget..."
              }
              className="h-12 rounded-2xl border-violet-200 bg-violet-50/45 px-4 text-sm"
              disabled={loading}
            />
            <Button
              type="submit"
              size="lg"
              className="h-12 rounded-2xl bg-violet-700 px-5 text-white hover:bg-violet-800"
              onClick={() => {
                if (demoMode) {
                  showDemoModeToast("chatting with Kubera");
                }
              }}
              disabled={loading || !draft.trim()}
            >
              Send
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

function InsightsView() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      {insightThemes.map((theme) => (
        <div
          key={theme.title}
          className="rounded-3xl border border-violet-100 bg-[linear-gradient(180deg,_rgba(250,245,255,0.95)_0%,_rgba(255,255,255,1)_100%)] p-5"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
            <BrainCircuit className="h-5 w-5" />
          </div>
          <p className="mt-5 text-lg font-semibold text-slate-950">
            {theme.title}
          </p>
          <p className="mt-3 text-sm leading-7 text-violet-950/62">
            {theme.description}
          </p>
        </div>
      ))}
    </div>
  );
}
