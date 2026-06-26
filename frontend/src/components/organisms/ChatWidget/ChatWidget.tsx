import React, { useState } from 'react';
import { MessageSquare, X, Send, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUIStore } from '../../../store/useUIStore';
import { useLanguageStore } from '../../../store/useLanguageStore';

export const ChatWidget: React.FC = () => {
  const { isChatOpen, toggleChat } = useUIStore();
  const { language } = useLanguageStore();
  
  const [messages, setMessages] = useState<Array<{ sender: 'user' | 'assistant'; text: string }>>([
    {
      sender: 'assistant',
      text: language === 'sw' 
        ? "Habari 👋\n\nKaribu kwenye Ofisi ya Kidijitali ya Denis Chamkaga.\n\nMimi ni Msaidizi wa Denis (Denis Assistant).\n\nNamsaidia mgeni kuelewa changamoto zake za kiutendaji, kupendekeza suluhisho sahihi za kiteknolojia, kujibu maswali kuhusu huduma za Denis, na kuwaunganisha wateja makini moja kwa moja na Denis. Ninaweza kukusaidia vipi leo?"
        : "Hello 👋\n\nWelcome to Denis Chamkaga's Digital Office.\n\nI am Denis Assistant.\n\nI help visitors understand their business challenges, recommend suitable technology solutions, answer questions about Denis's services, and connect serious clients directly with Denis. How can I help you today?"
    }
  ]);
  const [inputVal, setInputVal] = useState('');

  const suggestedQuestions = language === 'sw'
    ? [
        "Msaidizi wa Denis anafanya nini?",
        "Huduma za Denis Chamkaga",
        "Jinsi mifumo inavyosaidia biashara",
        "Weka miadi na Denis"
      ]
    : [
        "What does Denis Assistant do?",
        "Denis Chamkaga's services",
        "How systems help businesses grow",
        "Schedule a consult with Denis"
      ];

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: 'user', text }]);
    setInputVal('');

    // Simulate mock assistant response immediately
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: language === 'sw'
            ? "Asante. Msaidizi wa Denis atakuwa tayari hivi karibuni baada ya usajili wa Llama 3 kukamilika. Wasiliana na Denis moja kwa moja kupitia ukurasa wa Mawasiliano au tuma ujumbe!"
            : "Thank you. Denis Assistant will be fully active soon once the Llama 3 local backend is registered. Please send a message on the Contact page to reach Denis directly!"
        }
      ]);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Floating Chat Bubble Toggle */}
      <AnimatePresence>
        {!isChatOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => toggleChat(true)}
            className="p-4 rounded-full bg-accent-violet hover:bg-accent-violet-hover text-white shadow-2xl cursor-pointer transition-colors duration-200"
            aria-label="Open Chat Assistant"
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded Chat Window */}
      <AnimatePresence>
        {isChatOpen && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 50 }}
            className="w-[380px] sm:w-[400px] h-[550px] rounded-2xl border glass-panel shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-4 border-b dark:border-zinc-800/80 light:border-slate-200 flex items-center justify-between dark:bg-[#0c0c0e] light:bg-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-accent-violet flex items-center justify-center text-white font-bold text-sm">
                  <img src="/images/assistant/bot_portrait.webp" alt="Denis Assistant" className="w-full h-full object-cover" />
                </div>
                <div className="text-left">
                  <h3 className="text-sm font-semibold dark:text-white light:text-slate-800">
                    Denis Assistant
                  </h3>
                  <span className="text-xs text-green-500 flex items-center gap-1 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    Business & Technology Advisor
                  </span>
                </div>
              </div>
              <button
                onClick={() => toggleChat(false)}
                className="p-1 rounded-full hover:bg-zinc-800/40 cursor-pointer dark:text-zinc-400 light:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages Frame */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 flex flex-col text-left">
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-3.5 max-w-[85%] ${
                    msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.sender === 'user' 
                      ? 'bg-zinc-700 text-white' 
                      : 'bg-accent-violet text-white'
                  }`}>
                    {msg.sender === 'user' ? <User size={14} /> : <span className="font-semibold text-xs">AI</span>}
                  </div>
                  <div className={`p-3.5 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'dark:bg-accent-violet dark:text-white light:bg-light-accent light:text-white rounded-tr-none'
                      : 'dark:bg-zinc-800/80 dark:text-zinc-100 light:bg-slate-100 light:text-slate-800 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Suggestions Panel */}
            <div className="p-3 bg-zinc-950/20 border-t dark:border-zinc-800/80 light:border-slate-200">
              <div className="flex flex-wrap gap-2 justify-start">
                {suggestedQuestions.map((q) => (
                  <button
                    key={q}
                    onClick={() => handleSend(q)}
                    className="text-xs py-1.5 px-3 rounded-full border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900/60 light:bg-white dark:text-zinc-300 light:text-slate-600 dark:hover:bg-zinc-800 light:hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input Block */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputVal);
              }}
              className="p-3 border-t dark:border-zinc-800/80 light:border-slate-200 flex gap-2 dark:bg-[#0c0c0e] light:bg-slate-50"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={language === 'sw' ? "Uliza chochote..." : "Ask anything..."}
                className="flex-1 px-4 py-2 text-sm rounded-lg border dark:border-zinc-800 light:border-slate-200 dark:bg-zinc-900 light:bg-white dark:text-white light:text-slate-800 focus:outline-none focus:ring-1 focus:ring-accent-violet"
              />
              <button
                type="submit"
                className="p-2.5 rounded-lg bg-accent-violet hover:bg-accent-violet-hover text-white cursor-pointer transition-colors"
              >
                <Send size={16} />
              </button>
            </form>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
