import { Metadata } from "next";
import CasinoClient from "@/components/CasinoClient";

export const metadata: Metadata = {
  title: "Казино | SOBRANIE",
  description: "Міні-казино клану SOBRANIE — випробуй удачу!",
};

export default function CasinoPage() {
  return <CasinoClient />;
}
