import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Loader2, MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { generateTarotChatReplyAI, ChatApiMessage, DrawnCardForAI } from '@/lib/aiService';
import { toast } from 'sonner';

interface TarotChatProps {
  drawnCards: DrawnCardForAI[];
  spreadName: string;
  initialInterpretation: string;
}

export const TarotChat = ({ drawnCards, spreadName, initialInterpretation }: TarotChatProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatApiMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isLoading, isOpen, isMinimized]);

  useEffect(() => {
    if (messages.length === 0 && initialInterpretation) {
      setMessages([
        {
          role: 'assistant',
          content: `Chào bạn! Tôi đã phân tích xong trải bài "${spreadName}". Bạn có thắc mắc nào thêm về ý nghĩa của các lá bài hay lời khuyên cho tình huống này không?`
        }
      ]);
    }
  }, [initialInterpretation, spreadName, messages.length]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatApiMessage = { role: 'user', content: inputValue.trim() };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Context for the AI to understand the current reading
      const cardInfo = drawnCards.map(c => `${c.position}: ${c.cardName} (${c.orientation === 'upright' ? 'Xuôi' : 'Ngược'})`).join(', ');
      const contextMessage: ChatApiMessage = { 
        role: 'user', 
        content: `[CONTEXT] Trải bài: ${spreadName}. Các lá bài: ${cardInfo}. Luận giải ban đầu: ${initialInterpretation.slice(0, 300)}... Hãy dựa vào ngữ cảnh này để trả lời các câu hỏi tiếp theo của tôi.`
      };
      
      const apiMessages: ChatApiMessage[] = [
        contextMessage,
        ...messages,
        userMessage
      ];

      const reply = await generateTarotChatReplyAI(apiMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Không thể nhận phản hồi từ AI. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-[350px] sm:w-[400px] h-[500px] shadow-2xl"
          >
            <Card className="h-full flex flex-col border-gold/30 bg-card/95 backdrop-blur-xl overflow-hidden rounded-[2rem]">
              <CardHeader className="p-4 border-b border-gold/10 bg-gold/5 flex flex-row items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
                    <Bot className="w-4 h-4 text-gold" />
                  </div>
                  <CardTitle className="text-sm font-bold text-gold uppercase tracking-widest" style={{ fontFamily: 'Cinzel, serif' }}>
                    Trò chuyện với AI
                  </CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setIsMinimized(true)} className="h-8 w-8 text-muted-foreground hover:text-gold">
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg, i) => (
                      <div key={i} className={cn("flex gap-3", msg.role === 'user' ? "flex-row-reverse" : "flex-row")}>
                        <div className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
                          msg.role === 'user' ? "bg-primary/10 border-primary/20" : "bg-gold/10 border-gold/20"
                        )}>
                          {msg.role === 'user' ? <User className="w-4 h-4 text-primary" /> : <Bot className="w-4 h-4 text-gold" />}
                        </div>
                        <div className={cn(
                          "max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed",
                          msg.role === 'user' ? "bg-primary/10 text-foreground rounded-tr-none" : "bg-gold/5 text-foreground/90 rounded-tl-none border border-gold/10"
                        )}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gold/10 flex items-center justify-center border border-gold/20">
                          <Bot className="w-4 h-4 text-gold" />
                        </div>
                        <div className="bg-gold/5 text-muted-foreground p-3 rounded-2xl rounded-tl-none border border-gold/10 flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span className="text-xs">AI đang suy nghĩ...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                <form onSubmit={handleSendMessage} className="p-4 border-t border-gold/10 bg-background/40">
                  <div className="flex gap-2">
                    <input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Hỏi thêm về trải bài này..."
                      className="flex-1 bg-background/50 border border-gold/20 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-gold/20 outline-none transition-all"
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} className="glow-gold rounded-xl">
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-3">
        {isOpen && isMinimized && (
          <Button 
            onClick={() => setIsMinimized(false)}
            className="rounded-full h-14 w-14 shadow-2xl glow-gold border-2 border-gold/30"
          >
            <Maximize2 className="w-6 h-6" />
          </Button>
        )}
        
        {!isOpen && (
          <Button 
            onClick={() => setIsOpen(true)}
            className="rounded-full h-16 px-6 gap-3 shadow-2xl glow-gold border-2 border-gold/30 font-bold"
          >
            <MessageSquare className="w-6 h-6" />
            Trò chuyện với AI
          </Button>
        )}
      </div>
    </div>
  );
};
