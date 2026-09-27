export interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  triageLevel?: 'INFO' | 'MODERATE' | 'URGENT' | 'CRITICAL_EMERGENCY';
  actionSuggestions?: Array<{
    label: string;
    actionType: 'call_emergency' | 'view_blood_requests' | 'nearby_hospitals' | 'upload_report' | 'sos';
    payload?: string;
  }>;
}

const CHAT_STORAGE_KEY = 'lifeguard_ai_chat_history';

export const getSavedChatHistory = (): ChatMessage[] => {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }
  return [
    {
      id: 'msg_welcome',
      sender: 'bot',
      text: "Hello! I am **LifeGuard AI**, your 24/7 Medical Emergency & Blood Assistance Assistant. 🩺\n\nI can help you with:\n- 🚨 **Emergency First Aid Instructions** (CPR, heavy bleeding, burns, choking, strokes)\n- 🩸 **Blood Donation Eligibility & Compatibility** (who can give to whom, cooldown periods)\n- 📄 **Understanding Medical Lab Reports & Lab Values**\n- 🏥 **Locating Nearest Emergency Hospitals & 108 Ambulance Dispatch**\n\n*How can I help you right now?*",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      triageLevel: 'INFO'
    }
  ];
};

export const saveChatHistory = (messages: ChatMessage[]) => {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat history', e);
  }
};

export const clearChatHistory = () => {
  try {
    localStorage.removeItem(CHAT_STORAGE_KEY);
  } catch (e) {}
};

/**
 * Intelligent Medical Knowledge Engine
 * Provides immediate, safe, actionable first-aid and blood guidance
 */
export async function getAiChatResponse(userPrompt: string): Promise<ChatMessage> {
  // Simulate natural AI thinking time
  await new Promise((res) => setTimeout(res, 800));

  const prompt = userPrompt.toLowerCase().trim();
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. CRITICAL LIFE-THREATENING EMERGENCIES (Chest pain, heart attack, unconscious, severe bleeding)
  if (
    prompt.includes('chest pain') ||
    prompt.includes('heart attack') ||
    prompt.includes('cardiac') ||
    prompt.includes('not breathing') ||
    prompt.includes('unconscious') ||
    prompt.includes('collapsed') ||
    prompt.includes('choking') ||
    prompt.includes('stroke') ||
    prompt.includes('paralysis')
  ) {
    if (prompt.includes('choking')) {
      return {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        text: `### 🚨 EMERGENCY FIRST AID: CHOKING (HEIMLICH MANEUVER)\n\n**Action Steps for Conscious Adult/Child (> 1 year):**\n\n1. **Verify Choking:** Ask *"Are you choking?"*. If they cannot speak, cough, or breathe, act immediately!\n2. **Give 5 Back Blows:** Lean victim forward and strike firmly between the shoulder blades with the heel of your hand.\n3. **Give 5 Abdominal Thrusts (Heimlich):**\n   - Stand behind victim, wrap arms around waist.\n   - Make a fist with thumb side just above navel.\n   - Grasp fist with other hand and press inward and upward sharply.\n4. **Repeat 5 blows & 5 thrusts** until object is expelled.\n5. **If Victim Becomes Unresponsive:** Call 108 immediately and begin CPR!\n\n> ⚠️ *Call 108 Ambulance right away if blockage is not cleared immediately.*`,
        timestamp: timeStr,
        triageLevel: 'CRITICAL_EMERGENCY',
        actionSuggestions: [
          { label: '📞 Call 108 Ambulance', actionType: 'call_emergency' },
          { label: '🚨 Activate Emergency SOS', actionType: 'sos' }
        ]
      };
    }

    if (prompt.includes('stroke') || prompt.includes('paralysis') || prompt.includes('face drooping')) {
      return {
        id: 'bot_' + Date.now(),
        sender: 'bot',
        text: `### 🚨 CRITICAL: POSSIBLE STROKE DETECTED (F.A.S.T. TEST)\n\nEvery minute counts in acute stroke. Check the **F.A.S.T.** signs right now:\n\n- **F - Face Drooping:** Ask them to smile. Does one side of the face droop?\n- **A - Arm Weakness:** Ask them to raise both arms. Does one arm drift downward?\n- **S - Speech Difficulty:** Ask them to repeat a simple sentence. Is speech slurred or strange?\n- **T - Time to Call 108:** If you observe ANY of these signs, call **108 Ambulance** immediately!\n\n**What to do while waiting:**\n- Keep person calm and lying down on their side (recovery position) if drowsy.\n- **DO NOT** give them any food, water, or aspirin (stroke may be hemorrhagic).\n- Note the exact time symptoms started—doctors need this for clot-busting therapy.`,
        timestamp: timeStr,
        triageLevel: 'CRITICAL_EMERGENCY',
        actionSuggestions: [
          { label: '📞 Call 108 Ambulance', actionType: 'call_emergency' },
          { label: '🏥 Nearest Stroke Ready Hospitals', actionType: 'nearby_hospitals' }
        ]
      };
    }

    // Default Critical Cardiovascular Emergency
    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      text: `### 🚨 CRITICAL EMERGENCY ALERT\n\n**Symptoms like severe chest pain, shortness of breath, or sudden collapse require IMMEDIATE emergency medical dispatch!**\n\n#### Immediate Actions:\n1. **Call 108 / 112 Emergency Ambulance immediately.**\n2. **Have the person rest:** Sit them upright with knees bent to reduce strain on the heart.\n3. **Loosen tight clothing** around neck and chest.\n4. **Aspirin:** If not allergic and conscious, chewing 300mg of chewable aspirin is recommended in suspected heart attack.\n5. **If victim loses consciousness or stops breathing:** Begin chest compressions (CPR) at 100-120 beats per minute right in the center of the chest.\n\n*Emergency SOS alerts have been prepared below.*`,
      timestamp: timeStr,
      triageLevel: 'CRITICAL_EMERGENCY',
      actionSuggestions: [
        { label: '📞 Call 108 Ambulance', actionType: 'call_emergency' },
        { label: '🚨 Trigger SOS Broadcast', actionType: 'sos' },
        { label: '🏥 Locate Nearest Hospital', actionType: 'nearby_hospitals' }
      ]
    };
  }

  // 2. CPR INSTRUCTIONS
  if (prompt.includes('cpr') || prompt.includes('resuscitation') || prompt.includes('cardiopulmonary')) {
    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      text: `### ❤️ STEP-BY-STEP ADULT CPR GUIDE (HANDS-ONLY)\n\nIf someone collapses and is unresponsive and not breathing normally:\n\n1. **Check Responsiveness:** Tap shoulders firmly and shout *"Are you okay?"*\n2. **Call 108 / 112:** Put on speakerphone while you start.\n3. **Position Hands:** Place the heel of one hand in the center of the chest (lower half of breastbone). Interlock fingers with other hand.\n4. **Compress Deep & Fast:**\n   - Push down at least **2 inches (5 cm)**.\n   - Rate: **100 to 120 compressions per minute** (to the beat of the song *"Stayin' Alive"*).\n   - Allow complete chest recoil between each push.\n5. **Continue without stopping** until medical professionals arrive or an AED is ready.\n\n> ⚠️ *Hands-only CPR is proven to double or triple survival rates! Do not hesitate.*`,
      timestamp: timeStr,
      triageLevel: 'URGENT',
      actionSuggestions: [
        { label: '📞 Call 108 Ambulance', actionType: 'call_emergency' },
        { label: '🏥 Emergency Hospitals', actionType: 'nearby_hospitals' }
      ]
    };
  }

  // 3. BLEEDING & WOUND FIRST AID
  if (prompt.includes('bleeding') || prompt.includes('cut') || prompt.includes('wound') || prompt.includes('hemorrhage')) {
    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      text: `### 🩸 FIRST AID FOR SEVERE BLEEDING\n\n1. **Direct Firm Pressure:** Press a clean cloth, sterile gauze, or your bare hand firmly onto the bleeding wound.\n2. **Do Not Remove Soaked Cloths:** If blood seeps through, add more layers on top and press harder. Removing cloths disrupts clotting.\n3. **Elevate:** If possible and no bone fracture is suspected, elevate the injured limb above heart level.\n4. **Tourniquet for Severe Arterial Bleeding:** If blood is spurting bright red and cannot be stopped on an arm or leg, apply a commercial tourniquet or tight cloth 2-3 inches above the wound.\n5. **Keep Patient Warm:** Cover with a blanket to prevent hypothermia and shock.\n\n> ⚠️ *If bleeding does not stop after 10 minutes of direct pressure or the person feels faint, call 108 immediately.*`,
      timestamp: timeStr,
      triageLevel: 'URGENT',
      actionSuggestions: [
        { label: '📞 Call 108 Ambulance', actionType: 'call_emergency' },
        { label: '🏥 Emergency Trauma Centers', actionType: 'nearby_hospitals' }
      ]
    };
  }

  // 4. BURNS FIRST AID
  if (prompt.includes('burn') || prompt.includes('scalding') || prompt.includes('fire')) {
    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      text: `### 🔥 IMMEDIATE FIRST AID FOR BURNS\n\n1. **Cool with Running Water:** Run cool (NOT ice-cold) tap water over the burn for at least **10 to 20 minutes**.\n2. **Do NOT Use Ice:** Ice can cause tissue damage and frostbite.\n3. **Do NOT Apply Toothpaste, Butter, or Turmeric:** These trap heat and lead to severe bacterial infections.\n4. **Remove Tight Items:** Gently remove rings, watches, or restrictive clothing before swelling begins.\n5. **Cover Loosely:** Cover with clean plastic cling wrap or sterile non-adherent dressing.\n6. **Do NOT Burst Blisters:** Blisters protect against infection.\n\n> ⚠️ *Seek emergency care if burn is larger than the palm of your hand, affects face/hands/groin, or looks charred/white.*`,
      timestamp: timeStr,
      triageLevel: 'MODERATE',
      actionSuggestions: [
        { label: '🏥 Nearby Burns / Hospitals', actionType: 'nearby_hospitals' }
      ]
    };
  }

  // 5. BLOOD DONATION COMPATIBILITY & RULES
  if (
    prompt.includes('blood group') ||
    prompt.includes('compatible') ||
    prompt.includes('compatibility') ||
    prompt.includes('universal') ||
    prompt.includes('o+') ||
    prompt.includes('o-') ||
    prompt.includes('a+') ||
    prompt.includes('b+') ||
    prompt.includes('ab+')
  ) {
    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      text: `### 🩸 BLOOD GROUP COMPATIBILITY GUIDE\n\n- **O Negative (O-):** Universal Red Cell Donor (can donate to all groups: A+, A-, B+, B-, AB+, AB-, O+, O-).\n- **O Positive (O+):** Most in-demand! Can donate to O+, A+, B+, AB+ (all Rh-positive patients).\n- **A Positive (A+):** Can donate to A+, AB+.\n- **A Negative (A-):** Can donate to A+, A-, AB+, AB-.\n- **B Positive (B+):** Can donate to B+, AB+.\n- **B Negative (B-):** Can donate to B+, B-, AB+, AB-.\n- **AB Positive (AB+):** Universal Recipient (can receive blood from all 8 blood groups!).\n- **AB Negative (AB-):** Can receive from all Rh-negative donors (AB-, A-, B-, O-).\n\n*Would you like to view active emergency blood requests in your area?*`,
      timestamp: timeStr,
      triageLevel: 'INFO',
      actionSuggestions: [
        { label: '🩸 View Live Blood Requests', actionType: 'view_blood_requests' }
      ]
    };
  }

  // 6. BLOOD DONOR ELIGIBILITY
  if (
    prompt.includes('eligible') ||
    prompt.includes('eligibility') ||
    prompt.includes('can i donate') ||
    prompt.includes('donate blood') ||
    prompt.includes('age limit') ||
    prompt.includes('weight') ||
    prompt.includes('tattoo') ||
    prompt.includes('alcohol')
  ) {
    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      text: `### 🩸 WHO CAN DONATE BLOOD? (INDIAN DGHS CRITERIA)\n\n**Basic Eligibility Criteria:**\n- **Age:** 18 to 65 years old.\n- **Weight:** Minimum 45 kg (50 kg for apheresis/platelet donations).\n- **Hemoglobin:** Minimum **12.5 g/dL**.\n- **Blood Pressure:** Systolic 100-140 mmHg, Diastolic 60-90 mmHg.\n- **Pulse:** Normal resting pulse between 60 - 100 bpm.\n\n**Waiting / Deferral Periods:**\n- **Previous Whole Blood Donation:** Minimum **90 days (3 months)** for males, **120 days (4 months)** for females.\n- **Alcohol:** Avoid alcohol for at least **24 hours** prior to donation.\n- **Tattoo / Body Piercing:** Wait **6 to 12 months** after getting inked.\n- **Antibiotics / Minor Illness:** Wait **7 to 14 days** after full recovery and completing antibiotics.\n- **Pregnancy & Breastfeeding:** Defer during pregnancy and up to 12 months after delivery.\n\n*Eating a healthy iron-rich meal and drinking 500ml water before donating is strongly recommended!*`,
      timestamp: timeStr,
      triageLevel: 'INFO',
      actionSuggestions: [
        { label: '🩸 Check Open Blood Requests', actionType: 'view_blood_requests' }
      ]
    };
  }

  // 7. LAB REPORT EXPLANATION (Hemoglobin, WBC, Platelets, Sugar, Cholesterols)
  if (
    prompt.includes('report') ||
    prompt.includes('hba1c') ||
    prompt.includes('hemoglobin') ||
    prompt.includes('platelet') ||
    prompt.includes('wbc') ||
    prompt.includes('sugar') ||
    prompt.includes('glucose') ||
    prompt.includes('cholesterol') ||
    prompt.includes('creatinine')
  ) {
    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      text: `### 📊 COMMON MEDICAL LAB VALUES EXPLAINER\n\n- **Hemoglobin (Hb):** Normal is 13.8–17.2 g/dL (men) and 12.1–15.1 g/dL (women). Values below 10 g/dL indicate moderate-to-severe anemia.\n- **Platelets:** Normal count is **150,000 to 450,000 /µL**. Low platelets (< 50,000 /µL) can lead to spontaneous bleeding or dengue complications.\n- **WBC (White Blood Cells):** Normal is **4,000 to 11,000 /µL**. Elevated WBC indicates active infection or acute inflammation.\n- **Fasting Blood Glucose:** Normal: 70–99 mg/dL. Prediabetes: 100–125 mg/dL. Diabetes: ≥ 126 mg/dL.\n- **HbA1c (3-Month Sugar):** Normal: < 5.7%. Prediabetes: 5.7%–6.4%. Diabetes: ≥ 6.5%.\n- **Serum Creatinine:** Normal: 0.7–1.3 mg/dL. Higher values indicate impaired kidney filtration.\n\n💡 *You can upload your PDF or photo report into our AI Report Analyzer for an instant, complete organ-by-organ breakdown!*`,
      timestamp: timeStr,
      triageLevel: 'INFO',
      actionSuggestions: [
        { label: '📄 Upload Report for AI Diagnosis', actionType: 'upload_report' }
      ]
    };
  }

  // 8. SNAKE BITE OR ANIMAL BITE
  if (prompt.includes('snake') || prompt.includes('bite') || prompt.includes('dog bite') || prompt.includes('rabies')) {
    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      text: `### 🐍 FIRST AID FOR SNAKE & ANIMAL BITES\n\n#### Snake Bite Protocol (India):\n1. **Keep the Victim Completely Calm & Still:** Movement accelerates venom circulation in the bloodstream.\n2. **Immobilize the Bitten Limb:** Keep limb at or below heart level using a splint or sling.\n3. **Remove Rings & Tight Clothing:** Swelling will develop rapidly.\n4. **DO NOT SUCK THE VENOM, CUT THE WOUND, OR APPLY A TIGHT TOURNIQUET:** These outdated methods worsen necrosis and limb loss!\n5. **Rush to Nearest Hospital with Anti-Snake Venom (ASV) immediately.**\n\n#### Dog / Animal Bite:\n- Wash the bite immediately under running water with soap for **15 full minutes**.\n- Get anti-rabies vaccination (ARV) and tetanus toxoid without delay.`,
      timestamp: timeStr,
      triageLevel: 'CRITICAL_EMERGENCY',
      actionSuggestions: [
        { label: '📞 Call 108 Ambulance', actionType: 'call_emergency' },
        { label: '🏥 Nearest Emergency Hospital', actionType: 'nearby_hospitals' }
      ]
    };
  }

  // 9. MULTILINGUAL GREETINGS & RESPONSES
  if (prompt.includes('vanakkam') || prompt.includes('tamil') || prompt.includes('வணக்கம்')) {
    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      text: `வணக்கம்! நான் **LifeGuard AI** மருத்துவ உதவியாளர். 🩺\n\nநான் உங்களுக்கு:\n- 🚨 **அவசர முதலுதவி வழிகாட்டுதல்** (CPR, அதிக இரத்தப்போக்கு, தீக்காயம்)\n- 🩸 **இரத்த தானம் தகுதிகள் மற்றும் இரத்த வகைகள்**\n- 📄 **மருத்துவ அறிக்கைகள் விளக்கம் (Lab Reports)**\n- 🏥 **அருகிலுள்ள அவசர மருத்துவமனைகள்**\n\nஉங்களுக்கு என்ன உதவி வேண்டும்? கீழேயுள்ள விருப்பங்களை கிளிக் செய்யவும்.`,
      timestamp: timeStr,
      triageLevel: 'INFO',
      actionSuggestions: [
        { label: '🩸 இரத்த கோரிக்கைகள்', actionType: 'view_blood_requests' },
        { label: '🏥 அருகிலுள்ள மருத்துவமனைகள்', actionType: 'nearby_hospitals' },
        { label: '📞 108 அவசர அழைப்பு', actionType: 'call_emergency' }
      ]
    };
  }

  if (prompt.includes('namaste') || prompt.includes('hindi') || prompt.includes('नमस्ते')) {
    return {
      id: 'bot_' + Date.now(),
      sender: 'bot',
      text: `नमस्ते! मैं **LifeGuard AI** आपातकालीन चिकित्सा सहायक हूँ। 🩺\n\nमैं आपकी निम्नलिखित सहायता कर सकता हूँ:\n- 🚨 **तत्काल प्राथमिक उपचार निर्देश** (CPR, गंभीर रक्तस्राव, जलना)\n- 🩸 **रक्तदान पात्रता और रक्त समूह अनुकूलता**\n- 📄 **मेडिकल लैब रिपोर्ट समझना**\n- 🏥 **निकटतम अस्पताल और 108 एम्बुलेंस सहायता**\n\nआपको अभी क्या जानकारी चाहिए?`,
      timestamp: timeStr,
      triageLevel: 'INFO',
      actionSuggestions: [
        { label: '🩸 रक्त अनुरोध देखें', actionType: 'view_blood_requests' },
        { label: '🏥 निकटतम अस्पताल', actionType: 'nearby_hospitals' },
        { label: '📞 108 एम्बुलेंस कॉल', actionType: 'call_emergency' }
      ]
    };
  }

  // 10. GENERAL HEALTH OR FALLBACK COMPREHENSIVE AI RESPONSE
  return {
    id: 'bot_' + Date.now(),
    sender: 'bot',
    text: `Thank you for reaching out! Regarding **"${userPrompt}"**:\n\nAs your medical assistant, here are the key considerations:\n\n- **Medical Evaluation:** If you or anyone with you is experiencing acute symptoms (severe pain, dizziness, breathing difficulty, or trauma), please seek hands-on medical care immediately.\n- **Emergency Dispatch:** For acute emergencies in India, dial **108** (Emergency Ambulance) or **112** (National Emergency).\n- **Blood Assistance:** If this relates to blood requirement or donor eligibility, you can access live blood requirements or use our compatibility checker.\n- **Lab Reports:** If you have a doctor's report, our AI report analyzer can scan and summarize all affected body systems for you.\n\n*What specific symptom or question would you like me to elaborate on?*`,
    timestamp: timeStr,
    triageLevel: 'INFO',
    actionSuggestions: [
      { label: '🩸 View Blood Requests', actionType: 'view_blood_requests' },
      { label: '🏥 Find Nearest Hospital', actionType: 'nearby_hospitals' },
      { label: '📄 Analyze Medical Report', actionType: 'upload_report' }
    ]
  };
}
