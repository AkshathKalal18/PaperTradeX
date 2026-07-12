import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { Bot, Send, User as UserIcon, Loader2, Sparkles } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
}

export const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: "👋 Hello! I'm your **PaperTradeX AI Advisor**.\n\nI can help you with stock analysis, portfolio allocation advice, or market concept explanations. Ask me something like 'How should I diversify my portfolio?' or 'Tell me about Apple stock'!" }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue('');
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setLoading(true);

    try {
      const res = await api.post('/ai/chat', { message: userText });
      if (res.data.success) {
        setMessages(prev => [...prev, { sender: 'ai', text: res.data.data.reply }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { sender: 'ai', text: 'Sorry, I encountered an issue compiling a response. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const renderMessageText = (text: string) => {
    // Simple markdown-to-html formatter for bolding, bullet points
    return text.split('\n').map((line, index) => {
      let content = line;
      // Bold mapping
      content = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      // Bullet mapping
      if (content.startsWith('• ') || content.startsWith('* ')) {
        return (
          <li key={index} className="ml-4 list-disc text-sm py-0.5" dangerouslySetInnerHTML={{ __html: content.substring(2) }} />
        );
      }
      return (
        <p key={index} className="text-sm min-h-4" dangerouslySetInnerHTML={{ __html: content }} />
      );
    });
  };

  return (
    <div className="h-[75vh] flex flex-col justify-between glass-card rounded-2xl overflow-hidden relative">
      {/* Header */}
      <div className="h-14 border-b border-white/5 px-6 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">AI Advisor</h3>
            <span className="text-[10px] text-success font-semibold flex items-center space-x-1">
              <span className="w-1 h-1 rounded-full bg-success inline-block animate-ping" />
              <span>Agent Online</span>
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] text-primary bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full font-bold">
          <Sparkles className="w-3 h-3" />
          <span>PRO ASSISTANT</span>
        </div>
      </div>

      {/* Message Feed */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : ''}`}>
            {msg.sender === 'ai' && (
              <div className="w-8 h-8 rounded-full bg-[#111827] border border-white/10 flex items-center justify-center shrink-0">
                <Bot className="w-4.5 h-4.5 text-primary" />
              </div>
            )}
            <div className={`p-4 rounded-2xl max-w-[80%] leading-relaxed ${
              msg.sender === 'user'
                ? 'bg-secondary text-text rounded-tr-none shadow-lg shadow-secondary/10'
                : 'bg-[#111827]/60 border border-white/5 rounded-tl-none space-y-2'
            }`}>
              {renderMessageText(msg.text)}
            </div>
            {msg.sender === 'user' && (
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <UserIcon className="w-4 h-4 text-secondary" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-[#111827] border border-white/10 flex items-center justify-center shrink-0">
              <Bot className="w-4.5 h-4.5 text-primary" />
            </div>
            <div className="bg-[#111827]/60 border border-white/5 p-4 rounded-2xl rounded-tl-none">
              <Loader2 className="w-4 h-4 text-primary animate-spin" />
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-[#111827]/20 flex items-center space-x-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Ask about AAPL valuation, stock diversification, market trends..."
          className="flex-1 bg-[#0B1020]/80 border border-white/10 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition"
        />
        <button
          type="submit"
          disabled={loading || !inputValue.trim()}
          className="p-2.5 bg-primary hover:bg-primary/95 text-black rounded-xl shadow-lg transition flex items-center justify-center disabled:opacity-50"
        >
          <Send className="w-4.5 h-4.5" />
        </button>
      </form>
    </div>
  );
};
