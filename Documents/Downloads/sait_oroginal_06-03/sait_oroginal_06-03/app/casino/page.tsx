import { Metadata } from "next";
import CasinoClient from "@/components/CasinoClient";

export const metadata: Metadata = {
  title: "Щоденна Рулетка",
  description: "Крути колесо раз на день та виграй до 100 000 ₴! Щоденна рулетка клану SOBRANIE.",
};

export default function CasinoPage() {
  return <CasinoClient />;
}
