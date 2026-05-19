import AiInsightsWorkspace from "@/app/(main)/dashboard/_components/ai-insights-workspace";

export default function AiInsightsPage() {
  return (
    <section className="min-h-full w-full px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-[1500px]">
        <AiInsightsWorkspace />
      </div>
    </section>
  );
}
