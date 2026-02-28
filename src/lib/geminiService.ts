import { DrawnCardForAI, generateTarotInterpretationAI } from '@/lib/aiService';

export async function generateTarotInterpretation(
  drawnCards: DrawnCardForAI[],
  spreadName: string,
): Promise<string> {
  return generateTarotInterpretationAI(drawnCards, spreadName);
}
