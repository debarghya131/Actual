import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";


const inter = Inter({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Actual",
  description: "AI Powered Personal Finance Analytics",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (

    <ClerkProvider>

    <html
      lang="en"
      
    >
      <body className={`${inter.className} `}>
        
        {/*header*/}
        <Header />
        
        <main className="min-h-screen ">{children}</main>
        
        {/*footer*/}
        <footer className="border-t border-violet-100 bg-violet-50/70 py-12">

        <div className="container mx-auto text-center text-violet-950/60">
          <p>Made With 💜 by Debarghya Bandyopadhyay</p>
        </div>
        </footer>
        
        </body>
    </html>
    </ClerkProvider>
  );
}
