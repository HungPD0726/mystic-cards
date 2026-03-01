import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, User, Bot, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChatApiMessage } from '@/lib/aiService';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const STORAGE_KEY = 'mystic_chat_history';
const INITIAL_MESSAGE: Message = {
  role: 'model',
  text: 'Xin chào. Mình là trợ lý Tarot của bạn. Hãy hỏi mình về Tarot, cảm xúc hoặc điều bạn đang băn khoăn.',
};

let aiServiceModulePromise: Promise<typeof import('@/lib/aiService')> | null = null;

function loadAiService() {
  if (!aiServiceModulePromise) {
    aiServiceModulePromise = import('@/lib/aiService');
  }
  return aiServiceModulePromise;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const savedChat = sessionStorage.getItem(STORAGE_KEY);
      if (!savedChat) {
        setMessages([INITIAL_MESSAGE]);
        return;
      }

      const parsed = JSON.parse(savedChat);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setMessages(parsed);
      } else {
        setMessages([INITIAL_MESSAGE]);
      }
    } catch {
      setMessages([INITIAL_MESSAGE]);
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    }
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen]);

  const handleClearChat = () => {
    const resetMessages: Message[] = [INITIAL_MESSAGE];
    setMessages(resetMessages);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(resetMessages));
  };

  const toChatApiHistory = (chatMessages: Message[]): ChatApiMessage[] => {
    return chatMessages.slice(-20).map((message) => ({
      role: message.role === 'model' ? 'assistant' : 'user',
      content: message.text,
    }));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue.trim();
    setInputValue('');

    const nextMessages = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(nextMessages);
    setIsLoading(true);

    try {
      const { generateTarotChatReplyAI } = await loadAiService();
      const reply = await generateTarotChatReplyAI(toChatApiHistory(nextMessages));

      setMessages((prev) => [...prev, { role: 'model', text: reply }]);
    } catch (err: unknown) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text:
            err instanceof Error && err.message
              ? `Kết nối AI thất bại: ${err.message}`
              : 'Có lỗi xảy ra khi kết nối AI. Vui lòng thử lại sau.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/40 flex items-center justify-center text-white border border-white/20"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 md:right-6 z-50 w-[90vw] md:w-[400px] h-[500px] max-h-[70vh] flex flex-col bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-full">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold tracking-wide" style={{ fontFamily: 'Cinzel, serif' }}>
                    Mystic Guide
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] opacity-80 uppercase tracking-widest font-semibold">
                      Online
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClearChat}
                className="text-white/70 hover:text-white transition-colors p-1"
                title="Xóa cuộc hội thoại"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-card/50 scroll-smooth">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-secondary text-muted-foreground'
                        : 'bg-purple-500/20 text-purple-400'
                    }`}
                  >
                    {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  <div
                    className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.role === 'user'
                        ? 'bg-purple-600 text-white rounded-tr-none'
                        : 'bg-card border border-border text-foreground rounded-tl-none shadow-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
                    <span className="text-xs text-muted-foreground ml-2 italic">Đang suy nghĩ...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-border bg-background">
              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Hỏi về Tarot, tâm linh..."
                  disabled={isLoading}
                  className="w-full pl-4 pr-12 py-3 rounded-xl bg-card border-transparent focus:bg-background border focus:border-purple-500 focus:ring-0 outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 p-2 rounded-lg bg-purple-600 text-white disabled:opacity-50 disabled:bg-muted-foreground transition-colors hover:bg-purple-700"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatWidget;
