export type ClarifyCategory = 'emotion' | 'context' | 'action';
export type ClarifyAnswerChoice = 'yes' | 'no' | 'skip';

export interface ClarifyQuestion {
  id: string;
  text: string;
  category: ClarifyCategory;
}

export interface ClarificationAnswer {
  questionId: string;
  questionText: string;
  category: ClarifyCategory;
  answer: ClarifyAnswerChoice;
}

export const clarifyQuestions: ClarifyQuestion[] = [
  { id: 'q1', text: 'Bạn đang cảm thấy áp lực hoặc lo lắng về vấn đề này?', category: 'emotion' },
  { id: 'q2', text: 'Đã có người khác liên quan trực tiếp hoặc ảnh hưởng đến tình huống này chưa?', category: 'context' },
  { id: 'q3', text: 'Bạn đã thử hành động gì đó nhưng chưa thấy kết quả rõ ràng?', category: 'action' },
  { id: 'q4', text: 'Bạn đang giữ lại điều muốn nói vì sợ làm mọi chuyện căng thẳng hơn?', category: 'emotion' },
  { id: 'q5', text: 'Tình huống này đã kéo dài lâu hơn bạn mong đợi?', category: 'context' },
  { id: 'q6', text: 'Bạn có cảm giác mình đang phải gồng lên để kiểm soát mọi thứ?', category: 'emotion' },
  { id: 'q7', text: 'Có lựa chọn nào bạn đang né tránh vì sợ phải thay đổi không?', category: 'action' },
  { id: 'q8', text: 'Bạn có thiếu thông tin quan trọng trước khi đưa ra quyết định không?', category: 'context' },
  { id: 'q9', text: 'Bạn đang chờ một dấu hiệu rõ ràng từ người khác thay vì chủ động?', category: 'action' },
  { id: 'q10', text: 'Vấn đề này có chạm vào một nỗi sợ cũ hoặc ký ức cũ của bạn?', category: 'emotion' },
  { id: 'q11', text: 'Bạn đã nói thật với chính mình về điều mình muốn chưa?', category: 'emotion' },
  { id: 'q12', text: 'Có yếu tố tiền bạc, thời gian hoặc trách nhiệm đang làm bạn chùn bước?', category: 'context' },
  { id: 'q13', text: 'Bạn đang cân nhắc bắt đầu lại theo một hướng hoàn toàn mới?', category: 'action' },
  { id: 'q14', text: 'Bạn có cảm giác người khác chưa hiểu đúng ý định của mình?', category: 'context' },
  { id: 'q15', text: 'Bạn đang cần đóng lại một vòng lặp cũ để đi tiếp?', category: 'action' },
  { id: 'q16', text: 'Trực giác của bạn đã lên tiếng khá rõ nhưng bạn chưa dám tin?', category: 'emotion' },
  { id: 'q17', text: 'Bạn đang cố giữ hòa khí dù bản thân đã quá mệt?', category: 'emotion' },
  { id: 'q18', text: 'Bạn có cần một cuộc trò chuyện thẳng thắn để mọi thứ tiến triển?', category: 'action' },
];

export function pickRandomClarifyQuestions(count = 3) {
  return [...clarifyQuestions].sort(() => Math.random() - 0.5).slice(0, count);
}

