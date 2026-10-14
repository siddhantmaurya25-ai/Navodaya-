import { createFileRoute } from "@tanstack/react-router";
import { VijetaApp } from "@/components/vijeta/app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <VijetaApp />;
}
