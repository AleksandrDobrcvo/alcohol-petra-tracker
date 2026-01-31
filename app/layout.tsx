import "./globals.css";
import type { Metadata } from "next";
import { SessionProvider } from "@/components/SessionProvider";
import { Header } from "@/components/Header";
import BeerLoading from "@/components/ui/BeerLoading";
import Footer from "@/components/ui/Footer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export const metadata: Metadata = {
  title: {
    default: "Sobranie Clan Tracker - Учет Алко и Петры",
    template: "%s | Sobranie Clan Tracker"
  },
  description: "Алко / Петра — учёт сдач и выплат клана Sobranie. Отслеживание статистики, управление выплатами, система заявок.",
  keywords: ["clan", "алко", "петра", "учет", "выплаты", "sobranie", "гильдия", "статистика"],
  authors: [{ name: "Саня Космос" }],
  creator: "Саня Космос",
  publisher: "Sobranie Clan",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Sobranie Clan Tracker",
    description: "Алко / Петра — учёт сдач и выплат клана Sobranie",
    url: "https://your-domain.com",
    siteName: "Sobranie Clan Tracker",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sobranie Clan Tracker",
      },
    ],
    locale: "uk_UA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sobranie Clan Tracker",
    description: "Алко / Петра — учёт сдач и выплат клана Sobranie",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://your-domain.com",
  },
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
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 6 + 2}px`,
                height: `${Math.random() * 6 + 2}px`,
                animationDelay: `${Math.random() * 15}s`,
                animationDuration: `${Math.random() * 10 + 10}s`,
                backgroundColor: i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#10b981' : '#3b82f6',
                boxShadow: `0 0 10px ${i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#10b981' : '#3b82f6'}`,
              }}
            />
          ))}
        </div>
        <SessionProvider>
          <ErrorBoundary>
            <Header />
            <main className="flex-1 w-full">
              {children}
            </main>
            <Footer />
          </ErrorBoundary>
        </SessionProvider>
        {/* <Analytics /> */}
        <BeerLoading />
      </body>
    </html>
  );
}

