export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  lang?: string;
  triageLevel?: 'INFO' | 'MODERATE' | 'URGENT' | 'CRITICAL_EMERGENCY';
  actionSuggestions?: Array<{
    label: string;
    actionType: 'call_emergency' | 'view_blood_requests' | 'nearby_hospitals' | 'upload_report' | 'sos';
    payload?: string;
  }>;
}

const CHAT_STORAGE_KEY = 'lifeguard_ai_chat_history';

export const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English', native: 'English', speechCode: 'en-IN' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்', speechCode: 'ta-IN' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी', speechCode: 'hi-IN' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు', speechCode: 'te-IN' },
  { code: 'kn', label: 'Kannada', native: 'ಕನ್ನಡ', speechCode: 'kn-IN' },
  { code: 'ml', label: 'Malayalam', native: 'മലയാളം', speechCode: 'ml-IN' }
];

export const getSavedChatHistory = (langCode: string = 'en'): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}

  const welcomeText = langCode === 'ta' 
    ? "வணக்கம்! நான் **LifeGuard AI** மருத்துவ மற்றும் இரத்த தான உதவியாளர். 🩺\n\nஉங்களுக்கு உடனடி முதலுதவி, அறிகுறிகள் விளக்கம், இரத்த தான தகுதிகள் அல்லது அவசர மருத்துவ உதவி தேவைப்பட்டால் கீழே தட்டச்சு செய்யவும் அல்லது மைக் மூலம் பேசவும்.\n\n*உங்களுக்கு இப்போது என்ன உதவி வேண்டும்?*"
    : langCode === 'hi'
    ? "नमस्ते! मैं **LifeGuard AI** आपातकालीन चिकित्सा एवं रक्तदान सहायक हूँ। 🩺\n\nप्राथमिक उपचार, लक्षणों की पहचान, रक्तदान पात्रता या अस्पताल सहायता के लिए नीचे लिखें या बोलें।\n\n*मैं आपकी क्या सहायता कर सकता हूँ?*"
    : "Hello! I am **LifeGuard AI**, your 24/7 Clinical Emergency & Blood Donor Assistant. 🩺\n\nI can help you with:\n- 🚨 **Emergency First Aid Protocols** (CPR, heart attack, strokes, severe bleeding, burns)\n- 🩸 **Blood Donor Compatibility & Eligibility Guidelines**\n- 📄 **Lab Report & Symptom Diagnosis**\n- 🏥 **Instant 108 Dispatch & Hospital Navigation**\n\n*Type or tap the microphone to speak in any language!*";

  return [
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: welcomeText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      triageLevel: 'INFO',
      lang: langCode
    }
  ];
};

export const saveChatHistory = (messages: ChatMessage[]) => {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {}
};

export const clearChatHistory = () => {
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
  } catch (e) {}
};

/**
 * Detect language from text characters or fallback to user preferred language
 */
function detectScript(text: string, preferred: string): string {
  if (/[\u0B80-\u0BFF]/.test(text)) return 'ta'; // Tamil script
  if (/[\u0900-\u097F]/.test(text)) return 'hi'; // Hindi / Devanagari
  if (/[\u0C00-\u0C7F]/.test(text)) return 'te'; // Telugu
  if (/[\u0D00-\u0D7F]/.test(text)) return 'ml'; // Malayalam
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn'; // Kannada

  // Romanized Tamil check (Tanglish)
  const lower = text.toLowerCase();
  if (
    lower.includes('nenju') || lower.includes('vali') || lower.includes('kaichal') ||
    lower.includes('mayakkam') || lower.includes('theekayam') || lower.includes('ratham') ||
    lower.includes('ennaku') || lower.includes('epdi') || lower.includes('kuthi') ||
    lower.includes('kadi') || lower.includes('valikuthu') || lower.includes('vanakkam')
  ) {
    return 'ta';
  }

  // Romanized Hindi check (Hinglish)
  if (
    lower.includes('dard') || lower.includes('chakkor') || lower.includes('khoon') ||
    lower.includes('jal gaya') || lower.includes('bukhar') || lower.includes('madad') ||
    lower.includes('kya kare') || lower.includes('seene') || lower.includes('hath')
  ) {
    return 'hi';
  }

  return preferred || 'en';
}

/**
 * Intelligent Multilingual Clinical Medical Engine
 */
export async function getAiChatResponse(userPrompt: string, preferredLang: string = 'en'): Promise<ChatMessage> {
  await new Promise((res) => setTimeout(res, 600));

  const prompt = userPrompt.toLowerCase().trim();
  const lang = detectScript(userPrompt, preferredLang);
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // ==========================================
  // 1. CHEST PAIN / HEART ATTACK
  // ==========================================
  if (
    prompt.includes('chest pain') || prompt.includes('heart attack') || prompt.includes('cardiac') ||
    prompt.includes('நெஞ்சு வலி') || prompt.includes('மாரடைப்பு') || prompt.includes('nenju vali') ||
    prompt.includes('सीने में दर्द') || prompt.includes('दिल का दौरा') || prompt.includes('seene me dard')
  ) {
    if (lang === 'ta') {
      return {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        lang: 'ta',
        text: `### 🚨 அவசர எச்சரிக்கை: நெஞ்சு வலி / மாரடைப்பு அறிகுறி!\n\nநெஞ்சு வலி உயிருக்கு ஆபத்தானது. உடனடியாக கீழ்க்கண்ட நடவடிக்கைகளை எடுக்கவும்:\n\n1. **உடனடியாக 108 ஆம்புலன்ஸை அழைக்கவும்.**\n2. **நோயாளியை முழுமையாக ஓய்வெடுக்க வைக்கவும்:** படுக்க வைக்காமல், சாய்ந்து அமர வைக்கவும் (முழங்கால்களை மடக்கி அமர வைப்பது இதயத்தின் சுமையைக் குறைக்கும்).\n3. **ஆஸ்பிரின் (Aspirin 300mg):** நோயாளிக்கு அலர்ஜி இல்லை என்றால் மற்றும் சுயநினைவுடன் இருந்தால், 300mg ஆஸ்பிரின் மாத்திரையை மென்று விழுங்கச் சொல்லவும்.\n4. **ஆடைகளை தளர்த்தவும்:** கழுத்து மற்றும் மார்புப் பகுதியில் உள்ள இறுக்கமான ஆடைகளைத் தளர்த்தி நல்ல காற்றோட்டம் தரவும்.\n5. **சுயநினைவு இழந்தால்:** உடனடியாக மார்பின் நடுவில் வினாடிக்கு 2 முறை வீதம் அழுத்தம் (CPR) கொடுக்கத் தொடங்கவும்.\n\n> ⚠️ *தண்ணீரோ உணவோ கொடுக்க வேண்டாம். தாமதிக்காமல் மருத்துவமனை செல்லவும்.*`,
        timestamp: timeStr,
        triageLevel: 'CRITICAL_EMERGENCY',
        actionSuggestions: [
          { label: '📞 108 ஆம்புலன்ஸ் அழைக்க', actionType: 'call_emergency' },
          { label: '🚨 அவசர SOS அனுப்ப', actionType: 'sos' },
          { label: '🏥 அருகிலுள்ள மருத்துவமனை', actionType: 'nearby_hospitals' }
        ]
      };
    }

    if (lang === 'hi') {
      return {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        lang: 'hi',
        text: `### 🚨 आपातकालीन चेतावनी: सीने में दर्द / दिल का दौरा!\n\nसीने में तेज दर्द जानलेवा हो सकता है। तुरंत यह कदम उठाएं:\n\n1. **तुरंत 108 एम्बुलेंस को कॉल करें।**\n2. **मरीज को आराम से बैठाएं:** घुटने मोड़कर आधी बैठी अवस्था में रखें ताकि दिल पर जोर न पड़े।\n3. **एस्पिरिन (Aspirin 300mg):** अगर मरीज होश में है और एलर्जी नहीं है, तो 300mg एस्पिरिन चबाने को दें।\n4. **कपड़े ढीले करें:** गर्दन और छाती के कपड़े तुरंत ढीले करें और ताजी हवा दें।\n5. **बेहोश होने पर:** छाती के बीच में तुरंत 100-120 प्रति मिनट की गति से दबाव (CPR) शुरू करें।`,
        timestamp: timeStr,
        triageLevel: 'CRITICAL_EMERGENCY',
        actionSuggestions: [
          { label: '📞 108 एम्बुलेंस कॉल करें', actionType: 'call_emergency' },
          { label: '🚨 आपातकालीन SOS भेजें', actionType: 'sos' },
          { label: '🏥 निकटतम अस्पताल खोजें', actionType: 'nearby_hospitals' }
        ]
      };
    }

    // English
    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      lang: 'en',
      text: `### 🚨 CRITICAL EMERGENCY: CHEST PAIN / HEART ATTACK PROTOCOL\n\nSevere chest pressure, radiating pain to left arm/jaw, or shortness of breath is a cardiac emergency!\n\n#### Immediate Clinical Protocol:\n1. **Call 108 / 112 Emergency Ambulance right now.**\n2. **Sit the Patient Upright:** Place in a semi-sitting position with knees bent to maximize oxygen delivery.\n3. **Administer Aspirin 300mg:** Have the conscious patient chew one un-coated 300mg aspirin (inhibits clot progression).\n4. **Loosen Restrictive Clothing:** Free neck, chest, and waistline.\n5. **Monitor Breathing & Pulse:** If victim becomes unresponsive and stops breathing, initiate immediate chest compressions (Hands-Only CPR at 100–120 bpm).\n\n> ⚠️ *DO NOT allow patient to walk, drive themselves, or consume solid food.*`,
      timestamp: timeStr,
      triageLevel: 'CRITICAL_EMERGENCY',
      actionSuggestions: [
        { label: '📞 Call 108 Ambulance', actionType: 'call_emergency' },
        { label: '🚨 Trigger Emergency SOS', actionType: 'sos' },
        { label: '🏥 Nearest Emergency Hospital', actionType: 'nearby_hospitals' }
      ]
    };
  }

  // ==========================================
  // 2. CPR / RESUSCITATION
  // ==========================================
  if (
    prompt.includes('cpr') || prompt.includes('resuscitation') ||
    prompt.includes('சிபிஆர்') || prompt.includes('இதய அழுத்தம்') || prompt.includes('சுவாசம் இல்லை') ||
    prompt.includes('सीपीआर') || prompt.includes('सांस नहीं')
  ) {
    if (lang === 'ta') {
      return {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        lang: 'ta',
        text: `### ❤️ CPR செய்வது எப்படி? (உயிர் காக்கும் படிகள்)\n\nநோயாளி சுயநினைவு இழந்து சுவாசிக்கவில்லை என்றால்:\n\n1. **சுயநினைவைச் சரிபார்க்கவும்:** தோள்களைத் தட்டி *"கண்களைத் திறக்க முடிகிறதா?"* என்று சத்தமாகக் கேட்கவும்.\n2. **108-க்கு அழைக்கவும்:** போனை ஸ்பீக்கரில் போட்டுவிட்டு CPR தொடங்கவும்.\n3. **கைகளின் நிலை:** நோயாளியை தரையில் மல்லாக்க படுக்க வைக்கவும். மார்பின் மையப்பகுதியில் (நெஞ்செலும்பின் கீழ் பாதி) உங்கள் உள்ளங்கையை வைக்கவும். மற்றொரு கையால் விரல்களைப் பிணைக்கவும்.\n4. **அழுத்தம் கொடுக்கும் முறை:**\n   - மார்பு **2 அங்குலம் (5 செ.மீ)** ஆழத்திற்கு இறங்கும்படி அழுத்தவும்.\n   - **வேகம்: நிமிடத்திற்கு 100 முதல் 120 அழுத்தங்கள்**.\n   - ஒவ்வொரு அழுத்தத்திற்கும் பிறகு மார்பு இயல்பு நிலைக்கு வர அனுமதிக்கவும்.\n5. மருத்துவர்கள் வரும் வரை அல்லது நோயாளி கண் விழிக்கும் வரை நிறுத்தாமல் அழுத்தவும்!`,
        timestamp: timeStr,
        triageLevel: 'CRITICAL_EMERGENCY',
        actionSuggestions: [
          { label: '📞 108 ஆம்புலன்ஸ் அழைக்க', actionType: 'call_emergency' },
          { label: '🏥 அருகிலுள்ள மருத்துவமனை', actionType: 'nearby_hospitals' }
        ]
      };
    }

    if (lang === 'hi') {
      return {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        lang: 'hi',
        text: `### ❤️ सीपीआर (CPR) कैसे करें? (जीवन रक्षक निर्देश)\n\nयदि व्यक्ति बेहोश है और सांस नहीं ले रहा:\n\n1. **प्रतिक्रिया जांचें:** कंधे थपथपाएं और जोर से पूछें *"क्या आप ठीक हैं?"*\n2. **108 पर कॉल करें** और फोन स्पीकर पर रखें।\n3. **हाथों की स्थिति:** मरीज को फर्श पर सीधा लिटाएं। छाती के ठीक बीच में एक हथेली रखें, दूसरी हथेली से उंगलियां फंसाएं।\n4. **दबाव दें (Chest Compressions):**\n   - छाती को कम से कम **2 इंच गहरा** दबाएं।\n   - **गति: 100 से 120 बार प्रति मिनट**।\n5. एम्बुलेंस आने तक बिना रुके लगातार दबाव देते रहें!`,
        timestamp: timeStr,
        triageLevel: 'CRITICAL_EMERGENCY',
        actionSuggestions: [
          { label: '📞 108 एम्बुलेंस कॉल', actionType: 'call_emergency' },
          { label: '🏥 निकटतम अस्पताल', actionType: 'nearby_hospitals' }
        ]
      };
    }

    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      lang: 'en',
      text: `### ❤️ ADULT HANDS-ONLY CPR (STEP-BY-STEP CLINICAL GUIDE)\n\nIf the victim is unresponsive and not breathing normally:\n\n1. **Confirm Unresponsiveness:** Tap shoulders and shout *"Can you hear me?"*\n2. **Call 108 / 112:** Put phone on speakerphone immediately.\n3. **Hand Placement:** Place heel of your hand on the center of the chest (interlock fingers with other hand, arms straight).\n4. **Compress Deep & Fast:**\n   - Compress chest at least **2 inches (5 cm)** deep.\n   - Rate: **100 to 120 beats per minute**.\n   - Allow full chest recoil between compressions.\n5. **Continue without stopping** until emergency medics take over or an AED arrives.`,
      timestamp: timeStr,
      triageLevel: 'CRITICAL_EMERGENCY',
      actionSuggestions: [
        { label: '📞 Call 108 Ambulance', actionType: 'call_emergency' },
        { label: '🏥 Emergency Hospitals', actionType: 'nearby_hospitals' }
      ]
    };
  }

  // ==========================================
  // 3. BURNS & SCALDS
  // ==========================================
  if (
    prompt.includes('burn') || prompt.includes('fire') || prompt.includes('scald') ||
    prompt.includes('தீக்காயம்') || prompt.includes('சுடுதண்ணீர்') || prompt.includes('theekayam') ||
    prompt.includes('जल गया') || prompt.includes('आग') || prompt.includes('jal gaya')
  ) {
    if (lang === 'ta') {
      return {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        lang: 'ta',
        text: `### 🔥 தீக்காயத்திற்கான சரியான முதலுதவி (உடனடி தீர்வு)\n\n1. **குளிர்ந்த குழாய் நீர்:** தீக்காயம் பட்ட இடத்தை உடனே சாதாரண குளிர்ந்த குழாய் நீரில் **15 முதல் 20 நிமிடங்கள்** தொடர்ந்து காட்டவும்.\n2. **ஐஸ் கட்டிகள் பயன்படுத்தக் கூடாது:** ஐஸ் கட்டிகள் திசுக்களை மேலும் சேதப்படுத்தும்.\n3. **டூத்பேஸ்ட், மஞ்சள், வெண்ணெய், எண்ணெய் பூசக் கூடாது:** இவை வெப்பத்தை உள்ளேயே சிறைவைத்து கொடூரமான தொற்றுநோயை உண்டாக்கும்.\n4. **கொப்புளங்களை உடைக்கக் கூடாது:** கொப்புளங்கள் தோலை பாக்டீரியாவிடமிருந்து பாதுகாக்கும் கவசம்.\n5. **மூடுதல்:** காயத்தை சுத்தமான பிளாஸ்டிக் கவர் அல்லது ஈரமான சுத்தமான துணியால் தளர்வாக மூடவும்.\n\n> ⚠️ *முகம், கைகள், அல்லது உள்ளங்கையை விட பெரிய தீக்காயங்களுக்கு உடனடியாக மருத்துவமனை செல்லவும்.*`,
        timestamp: timeStr,
        triageLevel: 'MODERATE',
        actionSuggestions: [
          { label: '🏥 அருகிலுள்ள தீக்காய பிரிவு மருத்துவமனை', actionType: 'nearby_hospitals' }
        ]
      };
    }

    if (lang === 'hi') {
      return {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        lang: 'hi',
        text: `### 🔥 जलने पर तुरंत प्राथमिक उपचार (सटीक उपाय)\n\n1. **ठंडा बहता पानी:** जले हुए स्थान पर तुरंत 15–20 मिनट तक सामान्य ठंडा पानी डालें।\n2. **बर्फ कभी न लगाएं:** बर्फ लगाने से त्वचा की कोशिकाएं मर जाती हैं।\n3. **टूथपेस्ट, तेल या हल्दी न लगाएं:** यह गर्मी को अंदर रोककर गंभीर इन्फेक्शन पैदा करते हैं।\n4. **फफोलों को न फोड़ें:** फफोले त्वचा को संक्रमण से बचाते हैं।\n5. **ढकें:** साफ सूती कपड़े या पॉलीथिन से ढीला ढकें और तुरंत डॉक्टर को दिखाएं।`,
        timestamp: timeStr,
        triageLevel: 'MODERATE',
        actionSuggestions: [
          { label: '🏥 नजदीकी अस्पताल खोजें', actionType: 'nearby_hospitals' }
        ]
      };
    }

    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      lang: 'en',
      text: `### 🔥 BURNS FIRST AID PROTOCOL (EVIDENCE-BASED)\n\n1. **Cool Water Irrigation:** Immediately run cool, gentle tap water over the burn for at least **15 to 20 minutes**.\n2. **NEVER Apply Ice or Freezing Water:** Triggers tissue ischemia and frostbite.\n3. **DO NOT Apply Toothpaste, Butter, or Oil:** These insulate heat and cause severe bacterial contamination.\n4. **Remove Constrictive Items:** Gently slip off rings, bangles, or tight watches before edema develops.\n5. **DO NOT Pop Blisters:** Intact blister roofs serve as biological sterile dressings.\n6. **Dress Loosely:** Cover with clean plastic food cling wrap or sterile non-stick gauze.\n\n> ⚠️ *Seek emergency care if burn involves face, hands, joints, is >3 inches wide, or white/charred.*`,
      timestamp: timeStr,
      triageLevel: 'MODERATE',
      actionSuggestions: [
        { label: '🏥 Nearby Burn Trauma Hospitals', actionType: 'nearby_hospitals' }
      ]
    };
  }

  // ==========================================
  // 4. SEVERE BLEEDING & WOUNDS
  // ==========================================
  if (
    prompt.includes('bleeding') || prompt.includes('blood loss') || prompt.includes('cut') ||
    prompt.includes('இரத்தப்போக்கு') || prompt.includes('காயம்') || prompt.includes('ratham') ||
    prompt.includes('रक्तस्राव') || prompt.includes('खून बह रहा') || prompt.includes('khoon')
  ) {
    if (lang === 'ta') {
      return {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        lang: 'ta',
        text: `### 🩸 தீவிர இரத்தப்போக்கை நிறுத்தும் முறை (முதலுதவி)\n\n1. **நேரடி அழுத்தம் (Direct Pressure):** சுத்தமான துணி அல்லது துண்டால் காயத்தின் மீது உங்கள் கைகளால் பலமாக அழுத்திப் பிடிக்கவும்.\n2. **துணியை மாற்ற வேண்டாம்:** இரத்தம் ஊறி வெளியே வந்தால், அந்தத் துணியை எடுக்காமல் அதன் மேலேயே கூடுதல் துணியை வைத்து அழுத்தவும்.\n3. **உயர்த்தி வைக்கவும்:** எலும்பு முறிவு இல்லையென்றால், காயம்பட்ட கையை அல்லது காலை இதய மட்டத்திற்கு மேல் உயர்த்தி வைக்கவும்.\n4. **டூர்னிக்கெட் (Tourniquet):** கைகால்களில் இருந்து இரத்தம் பீய்ச்சியடித்தால், காயத்திற்கு 2-3 அங்குலம் மேலே ஒரு துணியால் இறுக்கமாகக் கட்டவும்.\n5. **10 நிமிடங்கள் கடந்தும் இரத்தம் நிற்கவில்லை என்றால்:** உடனடியாக 108 ஆம்புலன்ஸுக்கு அழைக்கவும்!`,
        timestamp: timeStr,
        triageLevel: 'URGENT',
        actionSuggestions: [
          { label: '📞 108 ஆம்புலன்ஸ் அழைக்க', actionType: 'call_emergency' },
          { label: '🏥 அவசர விபத்து பிரிவு', actionType: 'nearby_hospitals' }
        ]
      };
    }

    if (lang === 'hi') {
      return {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        lang: 'hi',
        text: `### 🩸 गंभीर रक्तस्राव रोकने के उपाय (प्राथमिक उपचार)\n\n1. **सीधा दबाव बनाएं:** घाव पर साफ कपड़ा या पट्टी रखकर हाथों से लगातार जोर से दबाएं।\n2. **खून से भीगा कपड़ा न हटाएं:** उसके ऊपर ही और कपड़ा रखकर दबाते रहें।\n3. **अंग ऊंचा उठाएं:** यदि हड्डी टूटी न हो, तो हाथ या पैर को दिल के स्तर से ऊपर रखें।\n4. **10 मिनट बाद भी खून न रुके:** तुरंत 108 पर कॉल करें और अस्पताल पहुंचें।`,
        timestamp: timeStr,
        triageLevel: 'URGENT',
        actionSuggestions: [
          { label: '📞 108 कॉल करें', actionType: 'call_emergency' },
          { label: '🏥 ट्रॉमा सेंटर खोजें', actionType: 'nearby_hospitals' }
        ]
      };
    }

    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      lang: 'en',
      text: `### 🩸 SEVERE ARTERIAL & VENOUS HEMORRHAGE FIRST AID\n\n1. **Direct Firm Pressure:** Apply continuous direct hand pressure over the bleeding site using sterile gauze or a clean towel.\n2. **Maintain Clot Integrity:** DO NOT remove soaked pads; layer additional dressings on top.\n3. **Elevate Above Heart:** If no musculoskeletal fracture is present, keep limb elevated.\n4. **Arterial Tourniquet:** If rapid bright red blood spurts from limbs and pressure fails, apply a windlass tourniquet 2–3 inches proximal to wound.\n5. **Keep Warm:** Prevent hemorrhagic hypothermia and shock with a blanket.\n\n> ⚠️ *Call 108 immediately if bleeding fails to arrest within 10 minutes.*`,
      timestamp: timeStr,
      triageLevel: 'URGENT',
      actionSuggestions: [
        { label: '📞 Call 108 Ambulance', actionType: 'call_emergency' },
        { label: '🏥 Trauma Care Hospitals', actionType: 'nearby_hospitals' }
      ]
    };
  }

  // ==========================================
  // 5. BLOOD DONATION COMPATIBILITY & ELIGIBILITY
  // ==========================================
  if (
    prompt.includes('donate') || prompt.includes('blood group') || prompt.includes('donor') ||
    prompt.includes('இரத்த தானம்') || prompt.includes('இரத்த வகை') || prompt.includes('rathathanam') ||
    prompt.includes('रक्तदान') || prompt.includes('ब्लड ग्रुप')
  ) {
    if (lang === 'ta') {
      return {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        lang: 'ta',
        text: `### 🩸 இரத்த தானம்: தகுதிகள் & இரத்த வகைகள் வழிகாட்டி\n\n**யார் இரத்த தானம் செய்யலாம்?**\n- **வயது:** 18 முதல் 65 வயது வரை.\n- **எடை:** குறைந்தபட்சம் 45 கிலோ.\n- **ஹீமோகுளோபின்:** குறைந்தபட்சம் 12.5 g/dL.\n- **இடைவெளி:** ஆண்கள் 3 மாதத்திற்கு ஒருமுறையும், பெண்கள் 4 மாதத்திற்கு ஒருமுறையும் தானம் செய்யலாம்.\n- **தடைக்காலம்:** மது அருந்தியிருந்தால் 24 மணி நேரம்; பச்சை குத்தியிருந்தால் (Tattoo) 6-12 மாதங்கள் காத்திருக்க வேண்டும்.\n\n**இரத்த வகைகள் யாருக்கு பொருந்தும்?**\n- **O Negative (O-):** உலகளாவிய கொடையாளி (அனைத்து 8 இரத்த வகையினருக்கும் கொடுக்கலாம்!).\n- **O Positive (O+):** O+, A+, B+, AB+ ஆகியோருக்குக் கொடுக்கலாம்.\n- **AB Positive (AB+):** உலகளாவிய ஏற்பாளர் (அனைவரிடமிருந்தும் இரத்தம் பெறலாம்!).\n\n*நேரலை அவசர இரத்தக் கோரிக்கைகளை கீழே பார்க்கலாம்.*`,
        timestamp: timeStr,
        triageLevel: 'INFO',
        actionSuggestions: [
          { label: '🩸 இரத்தக் கோரிக்கைகள் பார்க்க', actionType: 'view_blood_requests' }
        ]
      };
    }

    if (lang === 'hi') {
      return {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        lang: 'hi',
        text: `### 🩸 रक्तदान पात्रता एवं रक्त समूह अनुकूलता\n\n**रक्तदान के मुख्य नियम:**\n- **आयु:** 18 से 65 वर्ष।\n- **वजन:** कम से कम 45 किग्रा।\n- **हीमोग्लोबिन:** 12.5 g/dL या अधिक।\n- **समयावधि:** पुरुष 3 महीने और महिलाएं 4 महीने बाद दोबारा रक्तदान कर सकते हैं।\n\n**रक्त समूह चार्ट:**\n- **O Negative (O-):** यूनिवर्सल डोनर (सभी को रक्त दे सकता है)।\n- **O Positive (O+):** O+, A+, B+, AB+ को दे सकता है।\n- **AB Positive (AB+):** यूनिवर्सल रिसीवर (सभी से रक्त ले सकता है)।`,
        timestamp: timeStr,
        triageLevel: 'INFO',
        actionSuggestions: [
          { label: '🩸 रक्त आवश्यकताएं देखें', actionType: 'view_blood_requests' }
        ]
      };
    }

    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      lang: 'en',
      text: `### 🩸 CLINICAL BLOOD COMPATIBILITY & DONOR ELIGIBILITY\n\n**Donor Eligibility Criteria:**\n- **Age:** 18–65 years.\n- **Weight:** ≥ 45 kg (≥ 50 kg for apheresis platelets).\n- **Hemoglobin:** ≥ 12.5 g/dL.\n- **Interval:** 90 days (males), 120 days (females).\n- **Deferral:** 24h post-alcohol; 6–12 months post-tattoo/piercing.\n\n**Compatibility Rules:**\n- **O-:** Universal Red Blood Cell Donor (can donate to all 8 groups).\n- **O+:** Most needed in India (compatible with O+, A+, B+, AB+).\n- **AB+:** Universal Recipient (can receive red cells from any donor).\n- **AB-:** Can receive from O-, A-, B-, AB-.\n\n*Tap below to see patients waiting for blood donors in your area.*`,
      timestamp: timeStr,
      triageLevel: 'INFO',
      actionSuggestions: [
        { label: '🩸 View Active Blood Requests', actionType: 'view_blood_requests' }
      ]
    };
  }

  // ==========================================
  // 6. HIGH FEVER / DENGUE
  // ==========================================
  if (
    prompt.includes('fever') || prompt.includes('dengue') || prompt.includes('temperature') ||
    prompt.includes('காய்ச்சல்') || prompt.includes('டெங்கு') || prompt.includes('சூடு') || prompt.includes('kaichal') ||
    prompt.includes('बुखार') || prompt.includes('डेंगू') || prompt.includes('bukhar')
  ) {
    if (lang === 'ta') {
      return {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        lang: 'ta',
        text: `### 🌡️ கடுமையான காய்ச்சல் & டெங்கு எச்சரிக்கை மேலாண்மை\n\n1. **பாராசிட்டமால் (Paracetamol 650mg):** காய்ச்சலைக் குறைக்க பாராசிட்டமால் மட்டுமே பாதுகாப்பானது.\n2. **ஆஸ்பிரின் அல்லது இப்யூபுரூஃபன் (Ibuprofen) எடுக்கக் கூடாது:** டெங்கு காய்ச்சல் இருந்தால் இவை கடுமையான உள் இரத்தப்போக்கை உண்டாக்கும்.\n3. **நீர்ச்சத்து (Hydration):** இளநீர், ஓஆர்எஸ் (ORS) கரைசல் மற்றும் கஞ்சி நிறைய குடிக்கவும்.\n4. **ஈரத்துணி ஒத்தடம்:** நெற்றி, கழுத்து மற்றும் கைகளில் சாதாரண நீரில் நனைத்த துணியால் துடைக்கவும்.\n\n> ⚠️ **டெங்கு ஆபத்து அறிகுறிகள்:** கடுமையான வயிற்று வலி, தொடர் வாந்தி, பல் ஈறுகளில் இரத்தம் வருதல் அல்லது கடுமையான சோர்வு இருந்தால் உடனே CBC பிளேட்லெட் பரிசோதனை செய்து மருத்துவமனை செல்லவும்!`,
        timestamp: timeStr,
        triageLevel: 'MODERATE',
        actionSuggestions: [
          { label: '🏥 அருகிலுள்ள மருத்துவமனை', actionType: 'nearby_hospitals' },
          { label: '📄 லேப் ரிப்போர்ட் ஸ்கேன்', actionType: 'upload_report' }
        ]
      };
    }

    if (lang === 'hi') {
      return {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        lang: 'hi',
        text: `### 🌡️ तेज बुखार और डेंगू प्रबंधन\n\n1. **दवा:** केवल पैरासिटामोल (Paracetamol) लें।\n2. **एस्पिरिन या ब्रूफेन कभी न लें:** डेंगू में इनसे आंतरिक रक्तस्राव हो सकता है।\n3. **तरल पदार्थ:** नारियल पानी, ORS और नींबू पानी भरपूर पिएं।\n4. **चेतावनी लक्षण:** पेट में तेज दर्द, लगातार उल्टी या मसूड़ों से खून आने पर तुरंत डॉक्टर को दिखाएं और प्लेटलेट टेस्ट कराएं।`,
        timestamp: timeStr,
        triageLevel: 'MODERATE',
        actionSuggestions: [
          { label: '🏥 नजदीकी अस्पताल', actionType: 'nearby_hospitals' }
        ]
      };
    }

    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      lang: 'en',
      text: `### 🌡️ FEVER & DENGUE TRIAGE PROTOCOL\n\n1. **Antipyretic Therapy:** Use Paracetamol (Acetaminophen) 500–650mg every 6 hours as needed.\n2. **AVOID NSAIDs (Aspirin, Ibuprofen, Diclofenac):** Can precipitate catastrophic bleeding in dengue coagulopathy.\n3. **Aggressive Oral Hydration:** Maintain urine output with ORS, coconut water, and soups.\n4. **Tepid Sponging:** Sponge forehead, armpits, and groin with room-temperature water.\n\n> ⚠️ *RED FLAGS: Persistent vomiting, severe abdominal pain, mucosal bleeding, or platelet drop < 50,000 /µL mandate immediate hospitalization.*`,
      timestamp: timeStr,
      triageLevel: 'MODERATE',
      actionSuggestions: [
        { label: '🏥 Nearest Hospital / Clinic', actionType: 'nearby_hospitals' },
        { label: '📄 Scan Lab Report for Platelets', actionType: 'upload_report' }
      ]
    };
  }

  // ==========================================
  // 7. DIZZINESS / LOW BP / FAINTING
  // ==========================================
  if (
    prompt.includes('dizzy') || prompt.includes('faint') || prompt.includes('low bp') ||
    prompt.includes('மயக்கம்') || prompt.includes('சுற்றல்') || prompt.includes('mayakkam') ||
    prompt.includes('चक्कर') || prompt.includes('बेहोश') || prompt.includes('chakkor')
  ) {
    if (lang === 'ta') {
      return {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        lang: 'ta',
        text: `### 🌀 தலைசுற்றல் / மயக்கத்திற்கான உடனடி முதலுதவி\n\n1. **கால்களை உயர்த்தி படுக்க வைக்கவும்:** நோயாளியை தரையில் மல்லாக்க படுக்க வைத்து, கால்களை 12 அங்குலம் (30 செ.மீ) மேலே தூக்கி வைக்கவும். இதனால் மூளைக்கு உடனடியாக இரத்தம் பாயும்.\n2. **ஆடைகளைத் தளர்த்தவும்:** கழுத்து மற்றும் இடுப்பில் உள்ள ஆடைகளைத் தளர்த்தி நல்ல காற்றோட்டம் தரவும்.\n3. **உப்பு-சர்க்கரை கரைசல்:** மயக்கம் தெளிந்ததும், ஒரு டம்ளர் தண்ணீரில் ஒரு சிட்டிகை உப்பு மற்றும் 2 ஸ்பூன் சர்க்கரை அல்லது குளுக்கோஸ் கலந்து மெதுவாகக் குடிக்க வைக்கவும்.\n4. **திடீரென எழுந்து நிற்கக் கூடாது:** மயக்கம் தெளிந்ததும் உடனே எழாமல், சிறிது நேரம் உட்கார்ந்த பிறகே எழ வேண்டும்.\n\n> ⚠️ *பேச்சு குளறுதல், ஒரு பக்க கை கால் பலவீனம் அல்லது மார்பு வலியுடன் மயக்கம் வந்தால் உடனடியாக 108-ஐ அழைக்கவும்!*`,
        timestamp: timeStr,
        triageLevel: 'MODERATE',
        actionSuggestions: [
          { label: '📞 108 ஆம்புலன்ஸ் அழைக்க', actionType: 'call_emergency' },
          { label: '🏥 அருகிலுள்ள மருத்துவமனை', actionType: 'nearby_hospitals' }
        ]
      };
    }

    if (lang === 'hi') {
      return {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        lang: 'hi',
        text: `### 🌀 चक्कर आने या बेहोशी पर प्राथमिक उपचार\n\n1. **पैर ऊंचे रखें:** मरीज को लिटाकर पैरों को 1 फुट ऊपर उठाएं ताकि दिमाग में रक्त संचार बढ़ सके।\n2. **हवा दें:** कपड़े ढीले करें और ताजी हवा आने दें।\n3. **ओआरएस या नमक-चीनी पानी:** होश में आने पर थोड़ा नमक-चीनी या ग्लूकोज पानी पिलाएं।\n4. **चेतावनी:** अगर सीने में दर्द या बोलने में लड़खड़ाहट हो, तो तुरंत 108 पर कॉल करें।`,
        timestamp: timeStr,
        triageLevel: 'MODERATE',
        actionSuggestions: [
          { label: '📞 108 कॉल करें', actionType: 'call_emergency' }
        ]
      };
    }

    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      lang: 'en',
      text: `### 🌀 SYNCOPE (FAINTING) & HYPOTENSION FIRST AID\n\n1. **Trendelenburg Positioning:** Lie patient supine and elevate lower extremities **12 inches (30 cm)** above heart level to shunt blood to cerebral circulation.\n2. **Loosen Tight Clothing:** Free collar and waistband; ensure adequate airflow.\n3. **Electrolyte & Glucose Repletion:** Once alert, administer oral fluids with salt and sugar (ORS or fruit juice).\n4. **Prevent Orthostatic Relapse:** Allow patient to sit for 5 minutes before attempting to stand.\n\n> ⚠️ *Call 108 if syncope is accompanied by chest pain, palpitations, seizure, or focal neurological deficit.*`,
      timestamp: timeStr,
      triageLevel: 'MODERATE',
      actionSuggestions: [
        { label: '📞 Call 108 Ambulance', actionType: 'call_emergency' },
        { label: '🏥 Find Emergency Care', actionType: 'nearby_hospitals' }
      ]
    };
  }

  // ==========================================
  // 8. DOG BITE / ANIMAL BITE
  // ==========================================
  if (
    prompt.includes('dog bite') || prompt.includes('animal bite') || prompt.includes('rabies') ||
    prompt.includes('நாய் கடி') || prompt.includes('விலங்கு கடி') || prompt.includes('நாய்கடி') ||
    prompt.includes('कुत्ता काट') || prompt.includes('कुत्ते ने काटा')
  ) {
    if (lang === 'ta') {
      return {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        lang: 'ta',
        text: `### 🐕 நாய் அல்லது விலங்கு கடித்தால் செய்ய வேண்டிய அவசர முதலுதவி\n\n1. **15 நிமிடங்கள் சோப்புப் போட்டு கழுவவும்:** காயம் பட்ட இடத்தை உடனே ஓடும் குழாய் நீரில் சோப்புப் போட்டு தொடர்ந்து **15 நிமிடங்கள்** நன்றாகக் கழுவ வேண்டும். இது 90% ரேபீஸ் வைரஸை அழிக்கும்!\n2. **காயத்தை மூடவோ தைக்கவோ கூடாது:** காற்று படும்படி திறந்து வைக்கவும்.\n3. **மஞ்சள், சுண்ணாம்பு, காப்பித்தூள் வைக்கக் கூடாது:** இவை தொற்றை அதிகரிக்கும்.\n4. **அரசு அல்லது தனியார் மருத்துவமனை செல்லவும்:** அடுத்த **24 மணி நேரத்திற்குள்** ஆன்டி-ரேபீஸ் தடுப்பூசி (Anti-Rabies Vaccine - ARV) மற்றும் டிடி (Tetanus) ஊசி போட்டுக் கொள்ள வேண்டும்.\n\n> ⚠️ *ரேபீஸ் நோய் வந்தால் குணப்படுத்த முடியாது, ஆனால் உடனடியாக தடுப்பூசி போடுவதன் மூலம் 100% தடுக்க முடியும்!*`,
        timestamp: timeStr,
        triageLevel: 'URGENT',
        actionSuggestions: [
          { label: '🏥 அருகிலுள்ள மருத்துவமனைக்கு செல்ல', actionType: 'nearby_hospitals' }
        ]
      };
    }

    if (lang === 'hi') {
      return {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        lang: 'hi',
        text: `### 🐕 कुत्ते या जानवर के काटने पर तुरंत क्या करें?\n\n1. **15 मिनट तक साबुन से धोएं:** नल के बहते पानी में साबुन लगाकर घाव को लगातार 15 मिनट धोएं।\n2. **मिर्च या हल्दी न लगाएं:** इससे इन्फेक्शन फैलेगा।\n3. **24 घंटे के अंदर रेबीज का टीका (ARV) लगवाएं:** पास के सरकारी या निजी अस्पताल जाकर एंटी-रेबीज इंजेक्शन जरूर लगवाएं।`,
        timestamp: timeStr,
        triageLevel: 'URGENT',
        actionSuggestions: [
          { label: '🏥 नजदीकी अस्पताल', actionType: 'nearby_hospitals' }
        ]
      };
    }

    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      lang: 'en',
      text: `### 🐕 ANIMAL BITE & RABIES POST-EXPOSURE PROTOCOL\n\n1. **15-Minute Soap & Water Flush:** Thoroughly irrigate wound under running water with detergent soap for a full 15 minutes (inactivates lipid-envelope rabies virus).\n2. **DO NOT Suture or Occlude:** Leave wound open to allow drainage.\n3. **AVOID Chemical Irritants:** No chili powder, lime, or herbal pastes.\n4. **Post-Exposure Prophylaxis (PEP):** Report to an emergency hospital within 24 hours for Anti-Rabies Vaccination (Day 0, 3, 7, 28 regimen) ± Rabies Immunoglobulin (RIG) for Category III wounds + Tetanus booster.`,
      timestamp: timeStr,
      triageLevel: 'URGENT',
      actionSuggestions: [
        { label: '🏥 Nearest Emergency Hospital', actionType: 'nearby_hospitals' }
      ]
    };
  }

  // ==========================================
  // 9. GENERAL / COMPREHENSIVE MULTILINGUAL ADVICE
  // ==========================================
  if (lang === 'ta') {
    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      lang: 'ta',
      text: `உங்கள் கேள்வி: **"${userPrompt}"**\n\nஉங்களுக்கு வழிகாட்ட தேவையான மருத்துவ ஆலோசனைகள்:\n\n- **அறிகுறிகள் தீவிரமாக இருந்தால்:** கடுமையான வலி, மூச்சுத்திணறல் அல்லது மயக்கம் இருந்தால் உடனே **108 ஆம்புலன்ஸை** அழைக்கவும்.\n- **இரத்த உதவி:** நீங்கள் அல்லது உங்கள் உறவினருக்கு அவசர இரத்தத் தேவை இருந்தால், கீழே உள்ள பட்டனை அழுத்தி இரத்தக் கோரிக்கைகளைத் தொடர்புகொள்ளலாம்.\n- **மருத்துவ அறிக்கை (Lab Report):** உங்களிடம் இரத்தப் பரிசோதனை அறிக்கை இருந்தால், அதை ஸ்கேன் செய்து முழு உடல் நிலையை அறியலாம்.\n\n*உங்களுக்கு வேறு என்ன சந்தேகம் அல்லது குறிப்பிட்ட முதலுதவி விவரம் தேவை? தயங்காமல் கேளுங்கள்.*`,
      timestamp: timeStr,
      triageLevel: 'INFO',
      actionSuggestions: [
        { label: '🩸 இரத்தக் கோரிக்கைகள்', actionType: 'view_blood_requests' },
        { label: '🏥 அருகிலுள்ள மருத்துவமனைகள்', actionType: 'nearby_hospitals' },
        { label: '📞 108 அவசர அழைப்பு', actionType: 'call_emergency' }
      ]
    };
  }

  if (lang === 'hi') {
    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      lang: 'hi',
      text: `आपका प्रश्न: **"${userPrompt}"**\n\nचिकित्सा संबंधी मुख्य जानकारी:\n\n- **गंभीर लक्षण:** यदि तेज दर्द, सांस लेने में तकलीफ या बेहोशी है, तो बिना देर किए **108 एम्बुलेंस** को कॉल करें।\n- **रक्तदान एवं रक्त आवश्यकता:** नजदीकी रक्त अनुरोध देखने के लिए नीचे दिए गए बटन का उपयोग करें।\n- **मेडिकल रिपोर्ट:** यदि आपके पास डॉक्टर की रिपोर्ट है, तो हमारे AI स्कैनर से उसकी पूरी जांच कर सकते हैं।\n\n*क्या आप किसी विशेष लक्षण या दवा के बारे में और जानना चाहते हैं?*`,
      timestamp: timeStr,
      triageLevel: 'INFO',
      actionSuggestions: [
        { label: '🩸 रक्त अनुरोध देखें', actionType: 'view_blood_requests' },
        { label: '🏥 नजदीकी अस्पताल', actionType: 'nearby_hospitals' },
        { label: '📞 108 आपातकालीन कॉल', actionType: 'call_emergency' }
      ]
    };
  }

  return {
    id: 'bot_' + Date.now(),
    sender: 'bot',
    lang: 'en',
    text: `Regarding **"${userPrompt}"**:\n\nHere is your clinical guidance:\n\n- **Triage Assessment:** If you are experiencing sudden severe pain, shortness of breath, altered consciousness, or trauma, please seek hands-on medical care immediately.\n- **Emergency Dispatch:** For immediate life-saving care across India, dial **108** (Ambulance) or **112** (National Emergency).\n- **Blood Assistance:** To find compatible blood donors or post an emergency hospital request, use our verified Blood Network below.\n- **Diagnostic Lab Reports:** You can upload your PDF or photo report into our AI Report Analyzer for an organ-by-organ breakdown.\n\n*Feel free to speak or type any specific symptom or query!*`,
    timestamp: timeStr,
    triageLevel: 'INFO',
    actionSuggestions: [
      { label: '🩸 View Blood Requests', actionType: 'view_blood_requests' },
      { label: '🏥 Find Nearest Hospital', actionType: 'nearby_hospitals' },
      { label: '📄 Scan Medical Report', actionType: 'upload_report' }
    ]
  };
}
