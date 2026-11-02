import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata: Metadata = {
  title: "CivicConnect AI – AI-Powered Community Query & Civic Assistance",
  description: "Ask natural language questions about garbage pickup, bus schedules, water notices, and report civic problems with real-time status tracking.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0A0D0C] text-[#F3F7F5] flex flex-col min-h-screen selection:bg-[#00C896]/30 selection:text-[#F3F7F5]">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {children}
          </main>
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
