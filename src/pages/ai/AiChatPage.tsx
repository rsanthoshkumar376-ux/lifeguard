import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Send, Mic, MicOff, Volume2, VolumeX, Trash2, 
  Bot, User, PhoneCall, AlertTriangle, Phone, 
  Droplets, Hospital, ShieldAlert, FileText, Globe, 
  Radio, X, CheckCircle2, ChevronDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { 
  ChatMessage, getSavedChatHistory, saveChatHistory, 
  clearChatHistory, getAiChatResponse, SUPPORTED_LANGUAGES 
} from '../../services/aiChatService';
import AiReportModal from '../../components/medical/AiReportModal';

const SUGGESTIONS_BY_LANG: Record<string, string[]> = {
  ta: [
    '❤️ CPR எப்படி செய்வது?',
    '🩸 நான் இரத்த தானம் செய்யலாமா?',
    '🩹 அதிக இரத்தப்போக்கு முதலுதவி',
    '🔥 தீக்காயத்திற்கு என்ன முதலுதவி?',
    '🐕 நாய் கடித்தால் என்ன செய்ய வேண்டும்?',
    '🌡️ கடுமையான காய்ச்சல் & டெங்கு',
    '🌀 தலைசுற்றல் / மயக்கம் முதலுதவி'
  ],
  hi: [
    '❤️ सीपीआर (CPR) कैसे करें?',
    '🩸 क्या मैं रक्तदान कर सकता हूँ?',
    '🩹 खून बहना कैसे रोकें?',
    '🔥 जलने पर तुरंत क्या करें?',
    '🐕 कुत्ते के काटने पर प्राथमिक उपचार',
    '🌡️ तेज बुखार और डेंगू',
    '🌀 चक्कर आने पर उपाय'
  ],
  en: [
    '❤️ CPR step-by-step instructions',
    '🩸 Am I eligible to donate blood?',
    '🩹 First aid for severe bleeding',
    '🔥 How to treat burns safely',
    '🩸 Blood group compatibility chart',
    '🐕 Animal bite first aid',
    '🌡️ High fever & dengue guidance'
  ]
};

const AiChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState(SUPPORTED_LANGUAGES[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcriptPreview, setTranscriptPreview] = useState('');
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isVoiceCallMode, setIsVoiceCallMode] = useState(false);
  const [isLangMenuOpen, setIsLangMenuOpen] = useState(false);
  const [isAiReportModalOpen, setIsAiReportModalOpen] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize language from stored or navigator
  useEffect(() => {
    const savedLangCode = localStorage.getItem('i18nextLng')?.split('-')[0] || 'en';
    const matched = SUPPORTED_LANGUAGES.find(l => l.code === savedLangCode) || SUPPORTED_LANGUAGES[0];
    setSelectedLang(matched);
    const history = getSavedChatHistory(matched.code);
    setMessages(history);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Setup / update Speech Recognition with active language
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLang.speechCode; // e.g. 'ta-IN', 'hi-IN', 'en-IN'

      recognition.onstart = () => {
        setIsListening(true);
        setTranscriptPreview('');
      };

      recognition.onresult = (event: any) => {
        let current = '';
        for (let i = 0; i < event.results.length; i++) {
          current += event.results[i][0].transcript;
        }
        setTranscriptPreview(current);
        if (event.results[0].isFinal) {
          setInputText(current);
          handleSend(current, true);
        }
      };

      recognition.onerror = (e: any) => {
        console.warn('Speech recognition error:', e);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [selectedLang]);

  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported on this browser. You can type your question directly in the text box below.');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        setTranscriptPreview('');
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
      }
    }
  };

  const speakText = (text: string, msgId?: string, forceLang?: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (activeSpeakingId === msgId) {
        setActiveSpeakingId(null);
        return;
      }

      const cleanText = text
        .replace(/[#*_`>]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

      const utterance = new SpeechSynthesisUtterance(cleanText);
      const targetSpeechCode = forceLang 
        ? (SUPPORTED_LANGUAGES.find(l => l.code === forceLang)?.speechCode || selectedLang.speechCode)
        : selectedLang.speechCode;

      utterance.lang = targetSpeechCode;
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Find matching language voice
      const voices = window.speechSynthesis.getVoices();
      const langPrefix = targetSpeechCode.split('-')[0];
      const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => {
        if (msgId) setActiveSpeakingId(msgId);
      };
      utterance.onend = () => {
        setActiveSpeakingId(null);
      };
      utterance.onerror = () => {
        setActiveSpeakingId(null);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (textToSend?: string, wasSpoken?: boolean) => {
    const query = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!query || isTyping) return;

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setActiveSpeakingId(null);
    }

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
    setTranscriptPreview('');
    setIsTyping(true);

    try {
      const botResponse = await getAiChatResponse(query, selectedLang.code);
      const updated = [...newHistory, botResponse];
      setMessages(updated);
      saveChatHistory(updated);

      if (isVoiceCallMode || autoSpeak || wasSpoken) {
        speakText(botResponse.text, botResponse.id, botResponse.lang);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Clear all conversation history with LifeGuard AI?')) {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
      clearChatHistory();
      setMessages(getSavedChatHistory(selectedLang.code));
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

  const activeSuggestions = SUGGESTIONS_BY_LANG[selectedLang.code] || SUGGESTIONS_BY_LANG.en;

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-slate-950 text-gray-900 dark:text-gray-100 transition-colors relative">
      {/* Top Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 p-3 sticky top-0 z-20 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigate(-1)} 
            className="p-1.5 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-500 text-white flex items-center justify-center shadow-md shadow-red-500/20 relative">
              <Bot size={22} />
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="font-black text-sm text-gray-900 dark:text-white leading-tight">LifeGuard AI</h1>
                <span className="bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 text-[10px] font-black px-1.5 py-0.2 rounded-md border border-emerald-300 dark:border-emerald-800">
                  ONLINE
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {selectedLang.code === 'ta' ? 'தமிழ் மருத்துவ உதவியாளர்' : selectedLang.code === 'hi' ? 'हिंदी चिकित्सा सहायक' : 'Medical & Blood Assistant'}
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-1 sm:space-x-1.5 relative">
          {/* Language Switcher Pill */}
          <button
            onClick={() => setIsLangMenuOpen(!isLangMenuOpen)}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-800 dark:text-gray-200 rounded-xl text-xs font-bold border border-gray-200 dark:border-slate-700 transition-all"
            title="Change Chat & Voice Language"
          >
            <Globe size={14} className="text-red-500" />
            <span>{selectedLang.native}</span>
            <ChevronDown size={12} />
          </button>

          {/* Language Dropdown Menu */}
          {isLangMenuOpen && (
            <div className="absolute top-11 right-12 z-50 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-2xl shadow-2xl p-1.5 w-44 space-y-1 animate-in fade-in">
              <span className="text-[10px] font-black text-gray-400 dark:text-gray-500 uppercase px-2 py-1 block">
                Select Language:
              </span>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelectedLang(lang);
                    setIsLangMenuOpen(false);
                    if (recognitionRef.current) {
                      recognitionRef.current.lang = lang.speechCode;
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-left transition-colors ${
                    selectedLang.code === lang.code
                      ? 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <span>{lang.native}</span>
                  <span className="text-[10px] text-gray-400 font-normal">{lang.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Start Voice Call Mode */}
          <button
            onClick={() => {
              setIsVoiceCallMode(true);
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-xs font-black shadow-sm active:scale-95 transition-all"
            title="Start Voice Call with LifeGuard AI"
          >
            <Radio size={14} className="animate-pulse" />
            <span className="hidden sm:inline">Voice Call</span>
          </button>

          {/* Auto Speak Toggle */}
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`p-2 rounded-xl border transition-all ${
              autoSpeak 
                ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800' 
                : 'text-gray-400 border-gray-200 dark:border-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800'
            }`}
            title={autoSpeak ? "Auto-speak replies: ON" : "Auto-speak replies: OFF"}
          >
            {autoSpeak ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>

          {/* Clear History */}
          <button
            onClick={handleClearHistory}
            className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
            title="Clear Chat History"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </header>

      {/* Safety Notice Strip */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200/60 dark:border-amber-900/40 px-3.5 py-1 text-[11px] text-amber-800 dark:text-amber-300 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5">
          <AlertTriangle size={13} className="shrink-0 text-amber-600" />
          <span>
            {selectedLang.code === 'ta'
              ? 'உடனடி மருத்துவ ஆலோசனை. உயிருக்கு ஆபத்தான நிலையில் 108-ஐ அழைக்கவும்.'
              : selectedLang.code === 'hi'
              ? 'त्वरित चिकित्सा सलाह। आपातकाल में तुरंत 108 पर कॉल करें।'
              : 'Instant medical guidance. For life threats, dial 108 immediately.'}
          </span>
        </div>
        <a href="tel:108" className="font-black underline text-red-600 ml-2 shrink-0">108</a>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div 
            key={msg.id}
            className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start gap-2.5 max-w-[94%] sm:max-w-[85%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-red-600 text-white'
              }`}>
                {msg.sender === 'user' ? <User size={15} /> : <Bot size={16} />}
              </div>

              {/* Message Bubble */}
              <div className="space-y-2">
                <div className={`p-4 rounded-3xl text-sm leading-relaxed shadow-sm transition-all ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-none font-medium'
                    : msg.triageLevel === 'CRITICAL_EMERGENCY'
                    ? 'bg-red-50 dark:bg-red-950/50 border-2 border-red-500 text-red-950 dark:text-red-100 rounded-tl-none'
                    : 'bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 text-gray-900 dark:text-gray-100 rounded-tl-none'
                }`}>
                  <div className="whitespace-pre-line space-y-1.5 text-xs sm:text-sm">
                    {msg.text.split('\n').map((line, i) => {
                      if (line.startsWith('### ')) {
                        return <h3 key={i} className="font-black text-sm text-red-600 dark:text-red-400 mt-1 mb-1">{line.replace('### ', '')}</h3>;
                      }
                      if (line.startsWith('#### ')) {
                        return <h4 key={i} className="font-bold text-xs uppercase tracking-wider text-gray-700 dark:text-gray-300 mt-2 mb-1">{line.replace('#### ', '')}</h4>;
                      }
                      if (line.startsWith('> ')) {
                        return (
                          <div key={i} className="p-2.5 bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-r-lg text-amber-900 dark:text-amber-200 text-xs italic my-1.5">
                            {line.replace('> ', '')}
                          </div>
                        );
                      }
                      return <p key={i} className="m-0 leading-relaxed">{line}</p>;
                    })}
                  </div>

                  {/* Message Footer */}
                  <div className="flex items-center justify-between pt-2 mt-1.5 border-t border-black/5 dark:border-white/5 text-[10px] text-gray-400">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'bot' && (
                      <button 
                        onClick={() => speakText(msg.text, msg.id, msg.lang)}
                        className={`flex items-center gap-1 font-bold transition-colors ${
                          activeSpeakingId === msg.id 
                            ? 'text-red-600 dark:text-red-400 animate-pulse' 
                            : 'hover:text-red-500 dark:hover:text-red-400'
                        }`}
                        title="Listen to response"
                      >
                        <Volume2 size={13} />
                        <span>
                          {activeSpeakingId === msg.id 
                            ? (selectedLang.code === 'ta' ? 'பேசுகிறது...' : 'Speaking...') 
                            : (selectedLang.code === 'ta' ? 'கேட்க' : 'Listen')}
                        </span>
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
              <span className="text-xs text-gray-400 font-medium ml-2">
                {selectedLang.code === 'ta' 
                  ? 'LifeGuard AI மருத்துவ நெறிமுறைகளை ஆய்வு செய்கிறது...'
                  : selectedLang.code === 'hi'
                  ? 'LifeGuard AI चिकित्सा जांच कर रहा है...'
                  : 'LifeGuard AI is reviewing medical protocols...'}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Live Voice Recording Floating Banner */}
      {isListening && (
        <div className="bg-red-600 text-white px-4 py-2.5 flex items-center justify-between shadow-lg animate-in slide-in-from-bottom-2 shrink-0">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <span className="w-3 h-3 rounded-full bg-white animate-ping shrink-0"></span>
            <span className="text-xs font-bold truncate">
              {transcriptPreview ? `"${transcriptPreview}"` : `${selectedLang.native}-ல் பேசுங்கள்...`}
            </span>
          </div>
          <button
            onClick={() => {
              recognitionRef.current?.stop();
              setIsListening(false);
              if (transcriptPreview.trim()) {
                handleSend(transcriptPreview, true);
              }
            }}
            className="px-3 py-1 bg-white text-red-600 hover:bg-gray-100 rounded-lg text-xs font-black shrink-0 active:scale-95 transition-all ml-2"
          >
            Send
          </button>
        </div>
      )}

      {/* Multilingual Suggestion Chips */}
      <div className="px-3 pt-2 pb-1 flex space-x-2 overflow-x-auto no-scrollbar shrink-0 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800">
        {activeSuggestions.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSend(chip)}
            className="px-3 py-1.5 bg-gray-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 text-xs font-bold rounded-full whitespace-nowrap border border-gray-200/80 dark:border-slate-700 transition-all shrink-0 active:scale-95"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Bottom Input Bar */}
      <div className="p-3 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 shrink-0">
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-red-500 focus-within:border-transparent transition-all shadow-inner"
        >
          {/* Mic Button in Active Language */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl transition-all shrink-0 ${
              isListening 
                ? 'bg-red-600 text-white animate-pulse shadow-md' 
                : 'text-gray-500 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-200 dark:hover:bg-slate-700'
            }`}
            title={`Tap to speak in ${selectedLang.native}`}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>

          {/* Typing Input Box */}
          <input 
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              selectedLang.code === 'ta' 
                ? 'தமிழில் அறிகுறிகள் அல்லது கேள்வியை தட்டச்சு செய்யவும்...' 
                : selectedLang.code === 'hi'
                ? 'हिंदी में लक्षण या सवाल यहाँ लिखें...'
                : 'Type symptoms, first aid, or blood question...'
            }
            className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm outline-none px-2 font-medium"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="p-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-40 disabled:hover:bg-red-600 text-white rounded-xl shadow-md active:scale-95 transition-all shrink-0"
            title="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      {/* FULL-SCREEN INTERACTIVE VOICE CALL MODE */}
      {isVoiceCallMode && (
        <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between p-6 animate-in fade-in">
          {/* Call Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400">
                {selectedLang.native} Voice Call
              </span>
            </div>
            <button
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                recognitionRef.current?.stop();
                setIsVoiceCallMode(false);
              }}
              className="p-2 text-gray-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          {/* Call Body */}
          <div className="flex flex-col items-center justify-center text-center space-y-6 my-auto">
            {/* Animated Pulsing Voice Avatar */}
            <div className="relative">
              <span className="absolute -inset-6 rounded-full bg-red-600/30 animate-ping"></span>
              <span className="absolute -inset-12 rounded-full bg-red-500/20 animate-pulse"></span>
              <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-indigo-600 flex items-center justify-center shadow-2xl relative border-4 border-white/20">
                <Bot size={60} className="text-white" />
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-black">
                {selectedLang.code === 'ta' ? 'டாக்டர் LifeGuard AI' : selectedLang.code === 'hi' ? 'डॉक्टर LifeGuard AI' : 'Dr. LifeGuard AI'}
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {selectedLang.native} • 24/7 Medical Voice Assistant
              </p>
            </div>

            {/* Live Subtitles & Transcript */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-sm w-full min-h-[80px] flex items-center justify-center text-center">
              {isListening ? (
                <div className="space-y-1">
                  <p className="text-xs text-red-400 font-bold animate-pulse">
                    {selectedLang.code === 'ta' ? 'உங்கள் குரலைக் கேட்கிறது...' : 'Listening to your voice...'}
                  </p>
                  <p className="text-sm font-medium">{transcriptPreview || `${selectedLang.native}-ல் பேசவும்...`}</p>
                </div>
              ) : isTyping ? (
                <div className="space-y-1">
                  <p className="text-xs text-indigo-400 font-bold animate-pulse">
                    {selectedLang.code === 'ta' ? 'பதிலை ஆய்வு செய்கிறது...' : 'Thinking & analyzing medical protocol...'}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-300">
                  {selectedLang.code === 'ta'
                    ? 'கீழேயுள்ள மைக்கை அழுத்தி தமிழில் பேசவும். டாக்டர் குரல் மூலம் பதிலளிப்பார்!'
                    : 'Tap the mic below and speak. Dr. LifeGuard will answer aloud!'}
                </p>
              )}
            </div>
          </div>

          {/* Call Controls */}
          <div className="flex items-center justify-center gap-6 pb-6">
            {/* Tap to Speak */}
            <button
              onClick={toggleListening}
              className={`w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-2xl active:scale-95 transition-all ${
                isListening 
                  ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-400' 
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              {isListening ? <MicOff size={28} /> : <Mic size={28} />}
              <span className="text-[10px] font-bold mt-1">{isListening ? 'Stop' : 'Speak'}</span>
            </button>

            {/* End Call */}
            <button
              onClick={() => {
                if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                recognitionRef.current?.stop();
                setIsVoiceCallMode(false);
              }}
              className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl active:scale-95 transition-all"
              title="End Voice Call"
            >
              <Phone size={24} className="rotate-[135deg]" />
            </button>
          </div>
        </div>
      )}

      {/* AI Medical Report Analyzer Modal */}
      <AiReportModal 
        isOpen={isAiReportModalOpen} 
        onClose={() => setIsAiReportModalOpen(false)} 
      />
    </div>
  );
};

export default AiChatPage;
