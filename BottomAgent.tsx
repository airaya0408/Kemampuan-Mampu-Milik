
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { PropertyChatAgent } from '../services/chatService';

interface Message {
  role: 'user' | 'agent';
  text: string;
}

const BottomAgent: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'agent', text: 'Saya Ejen AI Hartanah anda. Tanya saya apa-apa tentang trend atau harga rumah 2024.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatAgent = useRef<PropertyChatAgent | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [messages, isTyping]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsTyping(true);

    if (!chatAgent.current) {
      chatAgent.current = new PropertyChatAgent();
    }

    try {
      let fullResponse = '';
      setMessages(prev => [...prev, { role: 'agent', text: '' }]);
      
      const stream = chatAgent.current.sendMessage(userMessage);
      for await (const chunk of stream) {
        fullResponse += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1].text = fullResponse;
          return newMessages;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'agent', text: 'Maaf, ralat teknikal berlaku.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white border-t border-slate-200 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-30">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex flex-col gap-4">
          {/* Messages Row - Scrollable Horizontal */}
          <div 
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide items-end h-24"
          >
            {messages.map((m, i) => (
              <div 
                key={i} 
                className={`flex-shrink-0 max-w-sm p-3 rounded-2xl text-xs ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none ml-auto' 
                    : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200'
                }`}
              >
                <ReactMarkdown className="prose prose-xs max-w-none text-inherit leading-relaxed">
                  {m.text}
                </ReactMarkdown>
              </div>
            ))}
            {isTyping && !messages[messages.length-1].text && (
              <div className="flex-shrink-0 bg-slate-100 p-3 rounded-2xl border border-slate-200 flex gap-1">
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            )}
          </div>

          {/* Input Row */}
          <form onSubmit={handleSend} className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <div className="pl-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white text-[10px] font-bold">AI</div>
            </div>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tanya Ejen AI tentang harga median atau trend 2024..."
              className="flex-1 bg-transparent border-none py-2 text-sm focus:ring-0 outline-none text-slate-700 placeholder:text-slate-400 font-medium"
            />
            <button 
              type="submit" 
              disabled={isTyping || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 disabled:opacity-30 flex items-center gap-2"
            >
              <span>Hantar</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BottomAgent;
