import { SignUp } from "@clerk/nextjs";

const Page = () => {
  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center px-3 py-8 min-[420px]:px-4 sm:p-6">
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        fallbackRedirectUrl="/dashboard"
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "rounded-3xl border border-violet-100 bg-white/92 shadow-[0_30px_90px_-40px_rgba(91,33,182,0.4)]",
            headerTitle: "text-slate-950",
            headerSubtitle: "text-violet-950/60",
            socialButtonsBlockButton:
              "border-violet-200 text-violet-900 hover:bg-violet-50",
            formButtonPrimary:
              "bg-violet-700 hover:bg-violet-800 text-white shadow-none",
            footerActionLink: "text-violet-700 hover:text-violet-900",
            formFieldInput:
              "border-violet-200 focus:border-violet-400 focus:ring-violet-400",
            identityPreviewText: "text-violet-950",
            identityPreviewEditButton: "text-violet-700",
          },
        }}
      />
    </div>
  );
};

export default Page;
