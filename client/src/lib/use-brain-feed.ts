import { useBrain } from "./brain-context";

export function useBrainFeed() {
  const { openBrain } = useBrain();

  const ask = (question: string) => {
    openBrain(question);
  };

  return { ask };
}
