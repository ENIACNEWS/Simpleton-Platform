import { Brain, Sparkles } from "lucide-react";
import { useBrain } from "@/lib/brain-context";

export function BrainTrigger() {
  const { isOpen, openBrain, suggestion, awareness } = useBrain();

  if (isOpen) return null;

  const hasActivity = !!(
    suggestion ||
    (awareness.calculator?.lastCalculation && awareness.calculator.lastCalculation > 0)
  );

  return (
    <button
      onClick={() => openBrain()}
      className={`fixed bottom-5 right-5 z-[9998] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group ${
        hasActivity
          ? "bg-[#2E5090] animate-pulse shadow-[#2E5090]/40"
          : "bg-[#2E5090] hover:bg-[#1a3560] shadow-[#2E5090]/30"
      }`}
      aria-label="Open Simpleton Brain"
    >
      <Brain className="w-6 h-6 text-white" />
      {suggestion && (
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
          <Sparkles className="w-2.5 h-2.5 text-yellow-900" />
        </span>
      )}
    </button>
  );
}
