import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import AppFooter from "@/components/app-footer";
import AppMain from "@/components/app-main";
import { Toaster } from "@/components/ui/sonner";


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
        
        <AppMain>{children}</AppMain>
        <Toaster />
        
        {/*footer*/}
        <AppFooter />
        
        </body>
    </html>
    </ClerkProvider>
  );
}
