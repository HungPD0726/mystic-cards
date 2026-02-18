import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, User, Bot, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface Message {
  role: 'user' | 'model';
  text: string;
}

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load chat from session storage
  useEffect(() => {
    try {
      const savedChat = sessionStorage.getItem('mystic_chat_history');
      if (savedChat) {
        setMessages(JSON.parse(savedChat));
      } else {
        setMessages([{ role: 'model', text: '✨ Xin chào! Tôi là trợ lý Tarot huyền bí. Hãy hỏi tôi bất cứ điều gì về Tarot, tâm linh hay cuộc sống nhé!' }]);
      }
    } catch {
      setMessages([{ role: 'model', text: '✨ Xin chào! Tôi là trợ lý Tarot huyền bí. Hãy hỏi tôi bất cứ điều gì về Tarot, tâm linh hay cuộc sống nhé!' }]);
    }
  }, []);

  // Save chat to session storage
  useEffect(() => {
    if (messages.length > 0) {
      sessionStorage.setItem('mystic_chat_history', JSON.stringify(messages));
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen]);

  const handleClearChat = () => {
    const resetMsg: Message[] = [{ role: 'model', text: '✨ Xin chào! Tôi là trợ lý Tarot huyền bí. Hãy hỏi tôi bất cứ điều gì về Tarot, tâm linh hay cuộc sống nhé!' }];
    setMessages(resetMsg);
    sessionStorage.setItem('mystic_chat_history', JSON.stringify(resetMsg));
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMsg = inputValue.trim();
    setInputValue('');
    const newMessages = [...messages, { role: 'user' as const, text: userMsg }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
      if (!apiKey) throw new Error('API Key missing');

      const genAI = new GoogleGenerativeAI(apiKey);

      const systemPrompt = 'Bạn là một người hướng dẫn Tarot huyền bí, khôn ngoan và nhân hậu. Hãy trả lời các câu hỏi về tâm linh, ý nghĩa lá bài Tarot và cuộc sống. Hãy ngắn gọn nhưng sâu sắc. Trả lời bằng tiếng Việt.';

      const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        systemInstruction: systemPrompt,
      });

      const historyMessages = newMessages.slice(0, -1).map(m => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

      const chat = model.startChat({ history: historyMessages });
      const result = await chat.sendMessage(userMsg);
      const aiText = result.response.text() || '';
      setMessages(prev => [...prev, { role: 'model', text: aiText }]);
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'model', text: '⚠️ Có lỗi xảy ra. Vui lòng thử lại sau.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
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

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 right-4 md:right-6 z-50 w-[90vw] md:w-[400px] h-[500px] max-h-[70vh] flex flex-col bg-background border border-border rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-700 text-white flex items-center justify-between shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-full">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-bold tracking-wide" style={{ fontFamily: 'Cinzel, serif' }}>Mystic Guide</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    <span className="text-[10px] opacity-80 uppercase tracking-widest font-semibold">Online</span>
                  </div>
                </div>
              </div>
              <button onClick={handleClearChat} className="text-white/70 hover:text-white transition-colors p-1" title="Xóa cuộc hội thoại">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-card/50 scroll-smooth">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === 'user'
                      ? 'bg-secondary text-muted-foreground'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
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

            {/* Input Area */}
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
