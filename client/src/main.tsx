import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/production-init";

// Register PWA Service Worker
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ Simpleton PWA: Service Worker registered successfully:', registration);
      })
      .catch((error) => {
        console.error('❌ Simpleton PWA: Service Worker registration failed:', error);
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
