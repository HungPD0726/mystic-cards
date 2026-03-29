import { DrawnCardForAI, generateTarotInterpretationAI } from '@/lib/aiService';

export async function generateTarotInterpretation(
  drawnCards: DrawnCardForAI[],
  spreadName: string,
  focusQuestion?: string | null,
): Promise<string> {
  return generateTarotInterpretationAI(drawnCards, spreadName, focusQuestion);
}
