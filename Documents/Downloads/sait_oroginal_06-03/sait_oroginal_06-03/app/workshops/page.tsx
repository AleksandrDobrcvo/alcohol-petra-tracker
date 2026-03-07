import { Metadata } from "next";
import WorkshopsClient from "@/components/WorkshopsClient";

export const metadata: Metadata = {
  title: "Цехи",
  description: "Бронювання цехів клану SOBRANIE - дивись хто працює, займай місце в черзі!",
};

export default function WorkshopsPage() {
  return <WorkshopsClient />;
}
