import { createRoot } from "react-dom/client";
import { VijetaApp } from "@/components/vijeta/app";
import "@/styles.css";

const root = document.getElementById("root");
if (!root) throw new Error("Capacitor app root is missing");

createRoot(root).render(<VijetaApp />);
