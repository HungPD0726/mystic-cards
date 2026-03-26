import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bot, Loader2, Maximize2, MessageSquare, Minimize2, Send, User, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatApiMessage, DrawnCardForAI, generateTarotChatReplyAI } from '@/lib/aiService';
import { cn } from '@/lib/utils';

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
          content: `Chào bạn! Tôi đã phân tích xong trải bài "${spreadName}". Bạn có thắc mắc nào thêm về ý nghĩa của các lá bài hay lời khuyên cho tình huống này không?`,
        },
      ]);
    }
  }, [initialInterpretation, spreadName, messages.length]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) {
      return;
    }

    const userMessage: ChatApiMessage = { role: 'user', content: inputValue.trim() };
    const apiMessages = [...messages, userMessage];

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const reply = await generateTarotChatReplyAI(apiMessages, {
        spreadName,
        interpretation: initialInterpretation,
        drawnCards,
      });

      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
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
            className="h-[500px] w-[350px] shadow-2xl sm:w-[400px]"
          >
            <Card className="flex h-full flex-col overflow-hidden rounded-[2rem] border-gold/30 bg-card/95 backdrop-blur-xl">
              <CardHeader className="flex flex-row items-center justify-between border-b border-gold/10 bg-gold/5 p-4">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                    <Bot className="h-4 w-4 text-gold" />
                  </div>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-gold" style={{ fontFamily: 'Cinzel, serif' }}>
                    Trò chuyện với AI
                  </CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsMinimized(true)}
                    className="h-8 w-8 text-muted-foreground hover:text-gold"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="flex flex-1 flex-col overflow-hidden p-0">
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {messages.map((msg, i) => (
                      <div key={i} className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                        <div
                          className={cn(
                            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border',
                            msg.role === 'user' ? 'border-primary/20 bg-primary/10' : 'border-gold/20 bg-gold/10',
                          )}
                        >
                          {msg.role === 'user' ? (
                            <User className="h-4 w-4 text-primary" />
                          ) : (
                            <Bot className="h-4 w-4 text-gold" />
                          )}
                        </div>
                        <div
                          className={cn(
                            'max-w-[80%] rounded-2xl p-3 text-sm leading-relaxed',
                            msg.role === 'user'
                              ? 'rounded-tr-none bg-primary/10 text-foreground'
                              : 'rounded-tl-none border border-gold/10 bg-gold/5 text-foreground/90',
                          )}
                        >
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
                          <Bot className="h-4 w-4 text-gold" />
                        </div>
                        <div className="flex items-center gap-2 rounded-2xl rounded-tl-none border border-gold/10 bg-gold/5 p-3 text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span className="text-xs">AI đang suy nghĩ...</span>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>

                <form onSubmit={handleSendMessage} className="border-t border-gold/10 bg-background/40 p-4">
                  <div className="flex gap-2">
                    <input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Hỏi thêm về trải bài này..."
                      className="flex-1 rounded-xl border border-gold/20 bg-background/50 px-4 py-2 text-sm outline-none transition-all focus:ring-2 focus:ring-gold/20"
                    />
                    <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()} className="glow-gold rounded-xl">
                      <Send className="h-4 w-4" />
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
            className="h-14 w-14 rounded-full border-2 border-gold/30 shadow-2xl glow-gold"
          >
            <Maximize2 className="h-6 w-6" />
          </Button>
        )}

        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="h-16 gap-3 rounded-full border-2 border-gold/30 px-6 font-bold shadow-2xl glow-gold"
          >
            <MessageSquare className="h-6 w-6" />
            Trò chuyện với AI
          </Button>
        )}
      </div>
    </div>
  );
};
