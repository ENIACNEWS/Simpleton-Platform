import { Brain, Sparkles, HelpCircle } from "lucide-react";
import { useBrain } from "@/lib/brain-context";

interface AskBrainProps {
  question: string;
  label?: string;
  variant?: "pill" | "icon" | "inline";
  className?: string;
}

export function AskBrain({ question, label, variant = "pill", className = "" }: AskBrainProps) {
  const { openBrain } = useBrain();

  if (variant === "icon") {
    return (
      <button
        onClick={() => openBrain(question)}
        className={`inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#2E5090]/10 hover:bg-[#2E5090]/20 text-[#2E5090] transition-colors ${className}`}
        title={label || question}
      >
        <Brain className="w-3.5 h-3.5" />
      </button>
    );
  }

  if (variant === "inline") {
    return (
      <button
        onClick={() => openBrain(question)}
        className={`inline-flex items-center gap-1 text-[#2E5090] hover:text-[#1a3560] text-sm font-medium transition-colors ${className}`}
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span>{label || "Ask Simplicity"}</span>
      </button>
    );
  }

  return (
    <button
      onClick={() => openBrain(question)}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2E5090]/10 hover:bg-[#2E5090]/20 text-[#2E5090] text-xs font-medium transition-colors border border-[#2E5090]/20 ${className}`}
    >
      <Brain className="w-3 h-3" />
      <span>{label || "Ask Simplicity"}</span>
    </button>
  );
}
