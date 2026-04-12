import { ClarificationAnswer } from '@/data/clarifyQuestions';
import { DrawnCardForAI, generateTarotInterpretationAI } from '@/lib/aiService';

export async function generateTarotInterpretation(
  drawnCards: DrawnCardForAI[],
  spreadName: string,
  focusQuestion?: string | null,
  clarificationAnswers?: ClarificationAnswer[] | null,
): Promise<string> {
  return generateTarotInterpretationAI(drawnCards, spreadName, focusQuestion, clarificationAnswers);
}
