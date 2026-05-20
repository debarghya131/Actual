import AiInsightsWorkspace from "@/app/(main)/dashboard/_components/ai-insights-workspace";

export default function DemoAiInsightsPage() {
  return (
    <section className="min-h-full w-full overflow-x-hidden px-3 py-4 min-[420px]:px-4 sm:px-5 sm:py-6 lg:px-6 xl:px-8">
      <div className="mx-auto w-full max-w-[1500px]">
        <AiInsightsWorkspace demoMode />
      </div>
    </section>
  );
}
