import "./globals.css";
import type { Metadata } from "next";
import { SessionProvider } from "@/components/SessionProvider";
import { Header } from "@/components/Header";
import BeerLoading from "@/components/ui/BeerLoading";
import Footer from "@/components/ui/Footer";

export const metadata: Metadata = {
  title: "Clan Tracker",
  description: "Алко / Петра — учёт сдач и выплат",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uk">
      <body className="min-h-screen bg-clan text-zinc-50 flex flex-col">
        <SessionProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </SessionProvider>
        <BeerLoading />
      </body>
    </html>
  );
}

