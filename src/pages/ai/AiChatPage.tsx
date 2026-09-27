import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Send, Mic, MicOff, Volume2, Trash2, 
  Sparkles, Bot, User, PhoneCall, AlertTriangle, 
  Heart, Droplets, Hospital, ShieldAlert, FileText, CheckCircle2 
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChatMessage, getSavedChatHistory, saveChatHistory, 
  clearChatHistory, getAiChatResponse 
} from '../../services/aiChatService';
import AiReportModal from '../../components/medical/AiReportModal';

const SUGGESTED_QUERIES = [
  '❤️ CPR step-by-step instructions',
  '🩸 Am I eligible to donate blood?',
  '🩹 First aid for severe bleeding',
  '🔥 How to treat burns safely',
  '🩸 Blood group compatibility chart',
  '📊 Explain CBC & lab report values',
  '🐍 Snake bite first aid emergency'
];

const AiChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isAiReportModalOpen, setIsAiReportModalOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const history = getSavedChatHistory();
    setMessages(history);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Voice Speech Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        }
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported on this browser.');
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      // Remove markdown characters for speech
      const cleanText = text
        .replace(/[#*_`>]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } else {
      alert('Text-to-speech is not supported on this device.');
    }
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    const userMsg: ChatMessage = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    saveChatHistory(newHistory);
    setInputText('');
    setIsTyping(true);

    try {
      const botResponse = await getAiChatResponse(query);
      const updated = [...newHistory, botResponse];
      setMessages(updated);
      saveChatHistory(updated);
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear your conversation history with LifeGuard AI?')) {
      clearChatHistory();
      setMessages(getSavedChatHistory());
    }
  };

  const handleActionClick = (actionType: string) => {
    switch (actionType) {
      case 'call_emergency':
        window.location.href = 'tel:108';
        break;
      case 'sos':
        navigate('/sos');
        break;
      case 'view_blood_requests':
        navigate('/blood');
        break;
      case 'nearby_hospitals':
        navigate('/nearby-hospitals');
        break;
      case 'upload_report':
        setIsAiReportModalOpen(true);
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col text-gray-900 dark:text-gray-100 transition-colors">
      {/* Sticky Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-3.5 sticky top-0 z-20 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-red-500/20 relative">
              <Bot size={22} />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-sm text-gray-900 dark:text-white leading-tight">LifeGuard AI</h1>
                <span className="bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 text-[10px] font-bold px-1.5 py-0.2 rounded-md">24/7 MEDICAL</span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">Emergency & Blood Assistant</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <a
            href="tel:108"
            className="flex items-center gap-1 px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-sm active:scale-95 transition-all"
            title="Emergency 108 Hotline"
          >
            <PhoneCall size={13} />
            <span>108</span>
          </a>
          <button
            onClick={handleClearHistory}
            className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      {/* Medical Safety Disclaimer Strip */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-900/40 px-4 py-1.5 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={13} className="shrink-0 text-amber-600" />
          <span>LifeGuard AI provides instant first-aid advice. For life threats, call 108 immediately.</span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 space-y-4 max-w-2xl mx-auto w-full overflow-y-auto pb-44">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start gap-2.5 max-w-[92%] sm:max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-red-600 text-white'
              }`}>
                {msg.sender === 'user' ? <User size={15} /> : <Bot size={16} />}
              </div>

              {/* Message Content Bubble */}
              <div className="space-y-2">
                <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm transition-all ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                    : msg.triageLevel === 'CRITICAL_EMERGENCY'
                    ? 'bg-red-50 dark:bg-red-950/50 border-2 border-red-500 text-red-950 dark:text-red-100 rounded-tl-none'
                    : 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-900 dark:text-gray-100 rounded-tl-none'
                }`}>
                  {/* Markdown Renderer for Bot */}
                  <div className="whitespace-pre-line space-y-2 prose dark:prose-invert max-w-none text-xs sm:text-sm">
                    {msg.text.split('\n').map((line, i) => {
                      if (line.startsWith('### ')) {
                        return <h3 key={i} className="font-black text-sm text-red-600 dark:text-red-400 mt-1 mb-1">{line.replace('### ', '')}</h3>;
                      }
                      if (line.startsWith('#### ')) {
                        return <h4 key={i} className="font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 mt-2 mb-1">{line.replace('#### ', '')}</h4>;
                      }
                      if (line.startsWith('> ')) {
                        return (
                          <div key={i} className="p-2 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r-lg text-amber-900 dark:text-amber-200 text-xs italic my-1">
                            {line.replace('> ', '')}
                          </div>
                        );
                      }
                      return <p key={i} className="m-0 leading-relaxed">{line}</p>;
                    })}
                  </div>

                  {/* Message Footer */}
                  <div className="flex items-center justify-between pt-2 mt-1 border-t border-black/5 dark:border-white/5 text-[10px] text-gray-400">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'bot' && (
                      <button 
                        onClick={() => speakText(msg.text)}
                        className="hover:text-red-500 dark:hover:text-red-400 flex items-center gap-1 transition-colors"
                        title="Read out loud"
                      >
                        <Volume2 size={13} />
                        <span>Listen</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Interactive Action Buttons */}
                {msg.actionSuggestions && msg.actionSuggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {msg.actionSuggestions.map((act, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleActionClick(act.actionType)}
                        className={`px-3 py-2 rounded-xl text-xs font-black shadow-sm active:scale-95 transition-all flex items-center gap-1.5 ${
                          act.actionType === 'call_emergency' || act.actionType === 'sos'
                            ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
                            : 'bg-white dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-slate-700'
                        }`}
                      >
                        {act.actionType === 'call_emergency' && <PhoneCall size={13} />}
                        {act.actionType === 'sos' && <ShieldAlert size={13} />}
                        {act.actionType === 'view_blood_requests' && <Droplets size={13} className="text-red-500" />}
                        {act.actionType === 'nearby_hospitals' && <Hospital size={13} className="text-blue-500" />}
                        {act.actionType === 'upload_report' && <FileText size={13} className="text-indigo-500" />}
                        <span>{act.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red-600 text-white shrink-0 flex items-center justify-center shadow-sm">
              <Bot size={16} />
            </div>
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 p-4 rounded-3xl rounded-tl-none shadow-sm flex items-center space-x-1.5">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-bounce"></div>
              <span className="text-xs text-gray-400 font-medium ml-2">LifeGuard AI is reviewing medical protocols...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Floating Prompt Suggestions & Bottom Input Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-gray-200 dark:border-slate-800 z-30 pb-safe">
        {/* Suggestion Chips */}
        <div className="px-4 pt-2.5 pb-1 flex space-x-2 overflow-x-auto no-scrollbar max-w-2xl mx-auto">
          {SUGGESTED_QUERIES.map((chip, i) => (
            <button
              key={i}
              onClick={() => handleSend(chip)}
              className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-semibold rounded-full whitespace-nowrap border border-gray-200/80 dark:border-slate-700 transition-all shrink-0 active:scale-95"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar Form */}
        <div className="p-3 max-w-2xl mx-auto">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800/80 border border-gray-300 dark:border-slate-700 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent transition-all"
          >
            {/* Mic Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl transition-all ${
                isListening 
                  ? 'bg-red-600 text-white animate-pulse' 
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-slate-700'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Speak your question'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>

            {/* Text Input */}
            <input 
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? "Listening... Speak now..." : "Ask any emergency, blood, or symptom question..."}
              className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm outline-none px-2 font-medium"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isTyping}
              className="p-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600 text-white rounded-xl shadow-md active:scale-95 transition-all"
              title="Send message"
            >
              <Send size={18} />
            </button>
          </form>
        </div>
      </div>

      {/* AI Medical Report Analyzer Modal */}
      <AiReportModal 
        isOpen={isAiReportModalOpen} 
        onClose={() => setIsAiReportModalOpen(false)} 
      />
    </div>
  );
};

export default AiChatPage;
