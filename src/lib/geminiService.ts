import { supabase } from '@/integrations/supabase/client';

interface DrawnCardForAI {
  cardName: string;
  orientation: string;
  position: string;
  uprightMeaning: string;
  reversedMeaning: string;
  keywords?: string[];
}

export async function generateTarotInterpretation(
  drawnCards: DrawnCardForAI[],
  spreadName: string
): Promise<string> {
  const { data, error } = await supabase.functions.invoke('tarot-interpret', {
    body: { drawnCards, spreadName },
  });

  if (error) {
    console.error('Edge function error:', error);
    throw new Error('Không thể kết nối AI. Vui lòng thử lại.');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return data?.interpretation || 'Không thể tạo luận giải.';
}
