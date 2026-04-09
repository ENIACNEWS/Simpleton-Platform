// UNIFIED: legacy AIAssistant is now a forwarding shim.
// All chat/assistant UX is handled by the Brain system (BrainPanel + BrainTrigger),
// mounted once globally in App.tsx. This shim keeps existing page imports compiling
// and forwards any `isOpen` prop to the global BrainPanel via BrainContext, so
// legacy "Talk to Simplicity" buttons still work without rendering a second
// conflicting assistant.

import { useEffect } from "react";
import { useBrain } from "@/lib/brain-context";

interface AIAssistantProps {
  isOpen?: boolean;
  onClose?: () => void;
  expertPersona?: string;
}

export function AIAssistant({ isOpen, onClose }: AIAssistantProps) {
  const { openBrain, closeBrain, isOpen: brainIsOpen } = useBrain();

  useEffect(() => {
    if (isOpen) {
      openBrain();
    }
  }, [isOpen, openBrain]);

  // When the Brain panel closes, let the legacy parent reset its state.
  useEffect(() => {
    if (isOpen && !brainIsOpen && onClose) {
      onClose();
    }
  }, [brainIsOpen, isOpen, onClose]);

  return null;
}
