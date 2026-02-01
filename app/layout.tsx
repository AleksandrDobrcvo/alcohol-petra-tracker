import "./globals.css";
import type { Metadata } from "next";
import { SessionProvider } from "@/components/SessionProvider";
import { Header } from "@/components/Header";
import Footer from "@/components/ui/Footer";
import BeerLoading from "@/components/ui/BeerLoading";
import { ToastProvider } from "@/components/ui/Toast";
import { BanGuard } from "@/components/BanGuard";

export const metadata: Metadata = {
  title: {
    default: "Sobranie Clan Tracker - Учет Алко и Петры",
    template: "%s | Sobranie Clan Tracker"
  },
  description: "Алко / Петра — учёт сдач и выплат клана Sobranie.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="min-h-screen bg-clan text-zinc-50 flex flex-col">
        {/* Animated Particles */}
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
          <div className="particle" style={{ left: '10%', top: '20%', width: '4px', height: '4px', animationDelay: '0s', animationDuration: '15s', backgroundColor: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }} />
          <div className="particle" style={{ left: '25%', top: '60%', width: '6px', height: '6px', animationDelay: '2s', animationDuration: '18s', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
          <div className="particle" style={{ left: '45%', top: '30%', width: '3px', height: '3px', animationDelay: '4s', animationDuration: '12s', backgroundColor: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }} />
          <div className="particle" style={{ left: '70%', top: '70%', width: '5px', height: '5px', animationDelay: '6s', animationDuration: '20s', backgroundColor: '#f59e0b', boxShadow: '0 0 10px #f59e0b' }} />
          <div className="particle" style={{ left: '85%', top: '15%', width: '4px', height: '4px', animationDelay: '8s', animationDuration: '14s', backgroundColor: '#10b981', boxShadow: '0 0 10px #10b981' }} />
          <div className="particle" style={{ left: '55%', top: '85%', width: '7px', height: '7px', animationDelay: '10s', animationDuration: '16s', backgroundColor: '#3b82f6', boxShadow: '0 0 10px #3b82f6' }} />
        </div>
        <SessionProvider>
          <ToastProvider>
            <BanGuard>
              <Header />
              <main className="flex-1 w-full">
                {children}
              </main>
              <Footer />
            </BanGuard>
          </ToastProvider>
        </SessionProvider>
        <BeerLoading />
      </body>
    </html>
  );
}

