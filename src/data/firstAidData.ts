/**
 * Comprehensive First-Aid & Emergency Guides Data
 * Authoritative medical protocols compliant with AHA, IFRC, and WHO standards.
 * Fully localized in 6 Indian languages: English, Tamil, Hindi, Telugu, Kannada, and Malayalam.
 */

export type SupportedLanguage = 'en' | 'ta' | 'hi' | 'te' | 'kn' | 'ml';

export interface FirstAidStep {
  stepNumber: number;
  title: string;
  instruction: string;
  tip?: string;
  illustrationType: string;
}

export interface LocalizedGuideContent {
  title: string;
  category: string;
  summary: string;
  warningSigns: string[];
  immediateActions: FirstAidStep[];
  thingsToAvoid: string[];
  whenToCallServices: string[];
}

export interface FirstAidGuideDefinition {
  id: string;
  icon: string;
  urgency: 'critical' | 'high' | 'moderate';
  illustrationId: string;
  content: Record<SupportedLanguage, LocalizedGuideContent>;
}

export const FIRST_AID_GUIDES: FirstAidGuideDefinition[] = [
  // 1. Adult CPR and AED Use
  {
    id: 'adult-cpr-aed',
    icon: '🫀',
    urgency: 'critical',
    illustrationId: 'cpr-hands',
    content: {
      en: {
        title: 'Adult CPR & AED Use',
        category: 'Cardiac & Respiratory',
        summary: 'Immediate chest compressions and defibrillation for an unresponsive person not breathing normally.',
        warningSigns: [
          'Person is unresponsive to shouting or shoulder tapping',
          'No breathing or only abnormal gasping (agonal respiration)',
          'No pulse detectable within 10 seconds (for trained responders)',
          'Sudden collapse in public or at home'
        ],
        immediateActions: [
          {
            stepNumber: 1,
            title: 'Verify Scene Safety & Check Responsiveness',
            instruction: 'Ensure the environment is safe. Tap both shoulders firmly and shout: "Are you OK?".',
            tip: 'Check for hazards like moving traffic, exposed wires, or fire first.',
            illustrationType: 'cpr-safety'
          },
          {
            stepNumber: 2,
            title: 'Call 112 / 108 & Request AED',
            instruction: 'Point directly to a bystander: "You, call 108 immediately and bring an AED if available!". Put your phone on speaker.',
            tip: 'Do not leave the victim unless no phone or bystanders exist.',
            illustrationType: 'call-108'
          },
          {
            stepNumber: 3,
            title: 'Hand Placement on Center of Chest',
            instruction: 'Place the heel of one hand in the center of the victim chest (lower half of breastbone). Interlock your other hand on top.',
            tip: 'Keep arms straight and lock your elbows directly over the chest.',
            illustrationType: 'cpr-hands'
          },
          {
            stepNumber: 4,
            title: 'Push Hard & Fast (100–120 BPM)',
            instruction: 'Compress at least 5 to 6 cm (2–2.4 inches) deep. Allow full chest recoil between every push without lifting hands.',
            tip: 'Maintain the metronome rhythm (110 BPM). Count 30 compressions.',
            illustrationType: 'cpr-push'
          },
          {
            stepNumber: 5,
            title: 'Attach & Follow AED Instructions',
            instruction: 'As soon as the AED arrives, turn it ON. Attach sticky pads to bare chest (upper right, lower left side) and follow automated voice prompts.',
            tip: 'Ensure NO ONE touches the patient while the AED is analyzing or delivering a shock.',
            illustrationType: 'aed-pads'
          }
        ],
        thingsToAvoid: [
          'Do NOT interrupt compressions for more than 10 seconds.',
          'Do NOT lean on the chest between compressions—allow complete chest recoil.',
          'Do NOT give slow compressions (less than 100/min decreases blood flow to brain).',
          'Do NOT delay CPR to check for an impossible-to-find faint pulse.'
        ],
        whenToCallServices: [
          'IMMEDIATELY upon discovering an unresponsive victim with no normal breathing.',
          'Call 112 or 108 prior to starting compressions if you are alone.'
        ]
      },
      ta: {
        title: 'பெரியவர்களுக்கான CPR & AED வழிகாட்டி',
        category: 'இதய & மூச்சு அவசரநிலை',
        summary: 'சுயநினைவிழந்த மற்றும் இயல்பாக சுவாசிக்காத நபருக்கு நெஞ்சு அமுக்குதல் மற்றும் அவசர AED சிகிச்சை.',
        warningSigns: [
          'தோளைத் தட்டி சத்தமாக கூப்பிட்டும் எந்த பதிலும் இல்லை',
          'சுவாசம் இல்லை அல்லது விசித்திரமான மூச்சுத் திணறல் (Gasping)',
          'திடீரென தரையில் சரிந்து விழுதல்'
        ],
        immediateActions: [
          {
            stepNumber: 1,
            title: 'பாதுகாப்பை உறுதிசெய்து சுயநினைவை சோதிக்கவும்',
            instruction: 'சுற்றுப்புறம் பாதுகாப்பாக உள்ளதா என பார்த்து, இரு தோள்களையும் தட்டி "உங்களுக்கு நலமா?" என சத்தமாக கேட்கவும்.',
            illustrationType: 'cpr-safety'
          },
          {
            stepNumber: 2,
            title: 'உடனடியாக 108 / 112 அழைக்கவும்',
            instruction: 'அருகிலுள்ள ஒருவரை நோக்கி "108 ஆம்புலன்ஸுக்கு அழையுங்கள்" எனக் கூறி ஸ்பீக்கரில் போடச் சொல்லவும்.',
            illustrationType: 'call-108'
          },
          {
            stepNumber: 3,
            title: 'நெஞ்சின் மையத்தில் கைகளை வைக்கவும்',
            instruction: 'நெஞ்சின் மைய எலும்பின் கீழ் பாதியில் ஒரு கையின் குதிகாலை வைத்து, மற்றொரு கையின் விரல்களை அதன் மேல் கோர்க்கவும்.',
            illustrationType: 'cpr-hands'
          },
          {
            stepNumber: 4,
            title: 'வேகமாகவும் ஆழமாகவும் அமுக்கவும் (110 BPM)',
            instruction: 'நெஞ்சை 5-6 செ.மீ ஆழத்திற்கு நிமிடத்திற்கு 100-120 முறை வேகத்தில் சீராக அமுக்கவும். அமுக்கிய பின் நெஞ்சு இயல்பு நிலைக்கு திரும்ப விடவும்.',
            illustrationType: 'cpr-push'
          },
          {
            stepNumber: 5,
            title: 'AED கருவியை இணைக்கவும்',
            instruction: 'AED கருவி கிடைத்தவுடன் அதை ஆன் செய்து, அதன் ஒலி அறிவிப்புகளுக்கு ஏற்ப பேப்பர்களை நெஞ்சில் ஒட்டி வழிகாட்டலைப் பின்பற்றவும்.',
            illustrationType: 'aed-pads'
          }
        ],
        thingsToAvoid: [
          'அமுக்குதலை 10 வினாடிகளுக்கு மேல் நிறுத்த வேண்டாம்.',
          'நெஞ்சின் மேல் உடம்பின் எடையை அப்படியே சாய்த்து வைக்க வேண்டாம் (Chest Recoil முக்கியம்).',
          'நாடித்துடிப்பைத் தேடி நேரத்தை வீணடிக்க வேண்டாம்.'
        ],
        whenToCallServices: [
          'சுயநினைவு இல்லாததை கவனித்த உடனேயே 108-ஐ அழைக்கவும்.'
        ]
      },
      hi: {
        title: 'वयस्कों के लिए सीपीआर (CPR) और एईडी (AED)',
        category: 'हृदय और श्वसन आपातकाल',
        summary: 'बेहोश और सांस न ले पा रहे व्यक्ति के लिए तुरंत छाती दबाने और सीपीआर की प्रक्रिया।',
        warningSigns: [
          'हिलाने या पुकारने पर कोई प्रतिक्रिया न होना',
          'सांस पूरी तरह बंद होना या केवल असामान्य घबराहट (Gasping)',
          'अचानक गिर पड़ना और अचेत होना'
        ],
        immediateActions: [
          {
            stepNumber: 1,
            title: 'सुरक्षा जांचें और प्रतिक्रिया देखें',
            instruction: 'आसपास की सुरक्षा सुनिश्चित करें। दोनों कंधों को थपथपाएं और जोर से पूछें: "क्या आप ठीक हैं?".',
            illustrationType: 'cpr-safety'
          },
          {
            stepNumber: 2,
            title: 'तुरंत 112 / 108 पर कॉल करें',
            instruction: 'किसी को स्पष्ट निर्देश दें: "तुरंत 108 एम्बुलेंस बुलाओ और AED लाओ!". फोन को लाउडस्पीकर पर रखें।',
            illustrationType: 'call-108'
          },
          {
            stepNumber: 3,
            title: 'छाती के केंद्र में हाथ रखें',
            instruction: 'छाती की हड्डी के निचले आधे हिस्से पर एक हाथ की हथेली रखें, दूसरे हाथ की उंगलियों को उसमें फंसाएं।',
            illustrationType: 'cpr-hands'
          },
          {
            stepNumber: 4,
            title: 'तेजी से और जोर से दबाएं (110 BPM)',
            instruction: 'छाती को 5-6 सेमी गहरा दबाएं। 100-120 प्रति मिनट की गति से लगातार 30 बार दबाएं।',
            illustrationType: 'cpr-push'
          },
          {
            stepNumber: 5,
            title: 'AED का उपयोग करें',
            instruction: 'AED मशीन आने पर ऑन करें और उसकी आवाज के निर्देशों का पालन करते हुए पैड लगाएं।',
            illustrationType: 'aed-pads'
          }
        ],
        thingsToAvoid: [
          '10 सेकंड से अधिक समय के लिए सीपीआर बंद न करें।',
          'दबाव के बाद छाती को पूरी तरह वापस ऊपर आने दें।',
          'नाड़ी ढूंढने में कीमती समय बर्बाद न करें।'
        ],
        whenToCallServices: [
          'बेहोश और सांस न लेने की स्थिति देखते ही तुरंत 108 या 112 पर कॉल करें।'
        ]
      },
      te: {
        title: 'పెద్దల కోసం CPR & AED సహాయం',
        category: 'గుండె & శ్వాస అత్యవసర పరిస్థితి',
        summary: 'స్పృహతప్పిన మరియు శ్వాస ఆడని వ్యక్తికి ప్రాణరక్షక ఛాతీ అదుముడు ప్రక్రియ.',
        warningSigns: [
          'పిలిచినా స్పందించకపోవడం',
          'శ్వాస ఆడకపోవడం లేదా వింతగా శ్వాస తీసుకోవడం',
          'అకస్మాత్తుగా కుప్పకూలిపోవడం'
        ],
        immediateActions: [
          {
            stepNumber: 1,
            title: 'స్పృహను తనిఖీ చేయండి',
            instruction: 'రెండు భుజాలను తట్టి గట్టిగా "మీరు క్షేమంగా ఉన్నారా?" అని అడగండి.',
            illustrationType: 'cpr-safety'
          },
          {
            stepNumber: 2,
            title: 'వెంటనే 108 లేదా 112 కు కాల్ చేయండి',
            instruction: 'ఎవరినైనా 108 అంబులెన్స్ పిలవమని చెప్పి స్పీకర్‌లో పెట్టండి.',
            illustrationType: 'call-108'
          },
          {
            stepNumber: 3,
            title: 'ఛాతీ మధ్యలో చేతులు ఉంచండి',
            instruction: 'ఛాతీ ఎముక మధ్య భాగంలో ఒక అరచేతిని ఉంచి, రెండో చేతి వేళ్లను బంధించండి.',
            illustrationType: 'cpr-hands'
          },
          {
            stepNumber: 4,
            title: 'వేగంగా మరియు బలంగా అదమండి (110 BPM)',
            instruction: '5-6 సెం.మీ లోతుకు నిమిషానికి 100-120 సార్లు వేగంగా ఒత్తండి.',
            illustrationType: 'cpr-push'
          },
          {
            stepNumber: 5,
            title: 'AED సూచనలను అనుసరించండి',
            instruction: 'AED పరికరాన్ని ఆన్ చేసి వాయిస్ గైడెన్స్ ప్రకారం ప్యాడ్స్ అతికించండి.',
            illustrationType: 'aed-pads'
          }
        ],
        thingsToAvoid: [
          '10 సెకన్ల కంటే ఎక్కువ సమయం ఆగవద్దు.',
          'నాడి వెతకడంలో సమయం వృధా చేయవద్దు.'
        ],
        whenToCallServices: [
          'వ్యక్తి స్పృహ కోల్పోయిన వెంటనే 108 కు కాల్ చేయండి.'
        ]
      },
      kn: {
        title: 'ವಯಸ್ಕರ ಸಿಪಿಆರ್ (CPR) ಮತ್ತು ಎಇಡಿ (AED) ಮಾರ್ಗದರ್ಶಿ',
        category: 'ಹೃದಯ ಮತ್ತು ಉಸಿರಾಟದ ತುರ್ತುಸ್ಥಿತಿ',
        summary: 'ಪ್ರಜ್ಞಾಹೀನ ಮತ್ತು ಉಸಿರಾಟ ನಿಂತ ವ್ಯಕ್ತಿಗೆ ಜೀವ ಉಳಿಸುವ ಎದೆ ಒತ್ತಡದ ಪ್ರಕ್ರಿಯೆ.',
        warningSigns: [
          'ಕೂಗಿದರೂ ಭುಜ ತಟ್ಟಿದರೂ ಪ್ರತಿಕ್ರಿಯೆ ಇಲ್ಲದಿರುವುದು',
          'ಉಸಿರಾಟ ನಿಂತಿರುವುದು ಅಥವಾ ವಿಚಿತ್ರ ಉಬ್ಬಸ',
          'ಧಿಡೀರ್ ನೆಲಕ್ಕೆ ಬೀಳುವುದು'
        ],
        immediateActions: [
          {
            stepNumber: 1,
            title: 'ಸುರಕ್ಷತೆ ಮತ್ತು ಪ್ರಜ್ಞೆ ಪರೀಕ್ಷಿಸಿ',
            instruction: 'ಸುತ್ತಮುತ್ತಲಿನ ಸುರಕ್ಷತೆ ಪರಿಶೀಲಿಸಿ, ಭುಜ ತಟ್ಟಿ "ನೀವು ಆರಾಮವಾಗಿದ್ದೀರಾ?" ಎಂದು ಜೋರಾಗಿ ಕೇಳಿ.',
            illustrationType: 'cpr-safety'
          },
          {
            stepNumber: 2,
            title: 'ತಕ್ಷಣ 108 ಅಥವಾ 112 ಗೆ ಕರೆ ಮಾಡಿ',
            instruction: 'ಆಂಬ್ಯುಲೆನ್ಸ್‌ಗೆ 108 ಕರೆ ಮಾಡಿ ಸ್ಪೀಕರ್‌ಗೆ ಹಾಕಿ.',
            illustrationType: 'call-108'
          },
          {
            stepNumber: 3,
            title: 'ಎದೆಯ ಮಧ್ಯಭಾಗದಲ್ಲಿ ಕೈ ಇರಿಸಿ',
            instruction: 'ಎದೆಯ ಮೂಳೆಯ ಕೆಳಭಾಗದ ಮಧ್ಯದಲ್ಲಿ ಒಂದು ಅಂಗೈ ಇಟ್ಟು ಮತ್ತೊಂದು ಕೈಯನ್ನು ಜೋಡಿಸಿ.',
            illustrationType: 'cpr-hands'
          },
          {
            stepNumber: 4,
            title: 'ವೇಗವಾಗಿ ಮತ್ತು ಬಲವಾಗಿ ಒತ್ತಿರಿ (110 BPM)',
            instruction: '5-6 ಸೆಂ.ಮೀ ಆಳಕ್ಕೆ ನಿಮಿಷಕ್ಕೆ 100-120 ಬಾರಿ ವೇಗವಾಗಿ ಒತ್ತಿರಿ.',
            illustrationType: 'cpr-push'
          },
          {
            stepNumber: 5,
            title: 'AED ಬಳಕೆ ಮಾಡಿ',
            instruction: 'AED ಯಂತ್ರ ಬಂದ ತಕ್ಷಣ ಆನ್ ಮಾಡಿ ಅದರ ಧ್ವನಿ ಸೂಚನೆಗಳನ್ನು ಪಾಲಿಸಿ.',
            illustrationType: 'aed-pads'
          }
        ],
        thingsToAvoid: [
          '10 ಸೆಕೆಂಡಿಗಿಂತ ಹೆಚ್ಚು ಸಮಯ ಒತ್ತಡ ನಿಲ್ಲಿಸಬೇಡಿ.',
          'ನಾಡಿಮಿಡಿತ ಹುಡುಕುವಲ್ಲಿ ಸಮಯ ಹಾಳುಮಾಡಬೇಡಿ.'
        ],
        whenToCallServices: [
          'ವ್ಯಕ್ತಿ ಪ್ರಜ್ಞಾಹೀನರಾದ ತಕ್ಷಣ 108 ಕ್ಕೆ ಕರೆ ಮಾಡಿ.'
        ]
      },
      ml: {
        title: 'മുതിർന്നവർക്കുള്ള CPR ഉം AED ഉം',
        category: 'ഹൃദയ-ശ്വാസകോശ അടിയന്തരാവസ്ഥ',
        summary: 'അബോധാവസ്ഥയിലായ വ്യക്തിക്ക് ജീവൻ രക്ഷിക്കുന്നതിനായുള്ള നെഞ്ചിലെ മർദ്ദനം.',
        warningSigns: [
          'വിളിച്ചാൽ പ്രതികരണമില്ലായ്മ',
          'ശ്വാസോച്ഛ്വാസം നിലയ്ക്കുകയോ ബുദ്ധിമുട്ടുകയോ ചെയ്യുക',
          'പെട്ടെന്ന് കുഴഞ്ഞു വീഴുക'
        ],
        immediateActions: [
          {
            stepNumber: 1,
            title: 'പ്രതികരണം പരിശോധിക്കുക',
            instruction: 'തോളിൽ തട്ടി ഉറക്കെ വിളിച്ചു ചോദിക്കുക: "കുഴപ്പമൊന്നുമില്ലല്ലോ?".',
            illustrationType: 'cpr-safety'
          },
          {
            stepNumber: 2,
            title: 'ഉടൻ 108 / 112 ലേക്ക് വിളിക്കുക',
            instruction: 'ആംബുലൻസിനായി 108 ലേക്ക് വിളിച്ച് ഫോൺ സ്പീക്കറിലിടുക.',
            illustrationType: 'call-108'
          },
          {
            stepNumber: 3,
            title: 'നെഞ്ചിന്റെ മധ്യത്തിൽ കൈ വയ്ക്കുക',
            instruction: 'നെഞ്ചെല്ലിന്റെ താഴത്തെ പകുതിയിൽ ഒരു കൈയുടെ ഉൾഭാഗം വച്ച് മറ്റേ കൈ കൊരുക്കുക.',
            illustrationType: 'cpr-hands'
          },
          {
            stepNumber: 4,
            title: 'ശക്തമായും വേഗത്തിലും അമർത്തുക (110 BPM)',
            instruction: '5-6 സെ.മീ ആഴത്തിൽ മിനിറ്റിൽ 100-120 തവണ എന്ന വേഗതയിൽ അമർത്തുക.',
            illustrationType: 'cpr-push'
          },
          {
            stepNumber: 5,
            title: 'AED മെഷീൻ ഉപയോഗിക്കുക',
            instruction: 'AED മെഷീൻ ഓണാക്കി അതിന്റെ ശബ്ദ നിർദ്ദേശങ്ങൾക്കനുസരിച്ച് പാഡുകൾ ഒട്ടിക്കുക.',
            illustrationType: 'aed-pads'
          }
        ],
        thingsToAvoid: [
          '10 സെക്കൻഡിൽ കൂടുതൽ സമയം അമർത്തുന്നത് നിർത്തരുത്.',
          'നാഡിമിടിപ്പ് തിരഞ്ഞു സമയം കളയരുത്.'
        ],
        whenToCallServices: [
          'വ്യക്തി ബോധരഹിതനാണെന്ന് കണ്ടയുടൻ 108 ലേക്ക് വിളിക്കുക.'
        ]
      }
    }
  },

  // 2. Choking
  {
    id: 'choking',
    icon: '🗣️',
    urgency: 'critical',
    illustrationId: 'choking-heimlich',
    content: {
      en: {
        title: 'Choking (Airway Obstruction)',
        category: 'Respiratory',
        summary: 'Emergency relief for severe foreign-body airway obstruction in adults and children.',
        warningSigns: [
          'Universal choking sign: hands clutched around neck',
          'Inability to speak, cry, or breathe',
          'Weak or ineffective cough, high-pitched wheezing',
          'Face turning red, then bluish (cyanosis)'
        ],
        immediateActions: [
          {
            stepNumber: 1,
            title: 'Assess Severity: "Are you choking?"',
            instruction: 'If the person can cough forcefully, encourage them to keep coughing. If they cannot speak or breathe, act immediately.',
            illustrationType: 'choking-assess'
          },
          {
            stepNumber: 2,
            title: 'Give 5 Sharp Back Blows',
            instruction: 'Stand behind the person, lean them forward, and deliver 5 sharp blows between their shoulder blades using the heel of your hand.',
            tip: 'Leaning forward ensures the dislodged object falls out rather than deeper.',
            illustrationType: 'back-blows'
          },
          {
            stepNumber: 3,
            title: 'Perform 5 Abdominal Thrusts (Heimlich Maneuver)',
            instruction: 'Stand behind, place your fist thumbside-in just above their belly button. Grasp your fist with other hand and pull sharply inward and upward.',
            tip: 'Deliver quick, distinct upward thrusts as if trying to lift the person.',
            illustrationType: 'choking-heimlich'
          },
          {
            stepNumber: 4,
            title: 'Alternate 5 Blows & 5 Thrusts',
            instruction: 'Continue alternating 5 back blows and 5 abdominal thrusts until the object is expelled or the person loses consciousness.',
            illustrationType: 'choking-cycle'
          },
          {
            stepNumber: 5,
            title: 'If Unconscious: Start CPR',
            instruction: 'Lower them safely to the floor. Call 108 immediately and begin CPR chest compressions. Look in the mouth before giving breaths only if an object is visible.',
            illustrationType: 'cpr-push'
          }
        ],
        thingsToAvoid: [
          'NEVER perform blind finger sweeps in the mouth (pushes the object deeper).',
          'Do NOT give water to a choking person (can cause aspiration into lungs).',
          'Do NOT perform abdominal thrusts on infants under 1 year (use 5 back blows and 5 chest thrusts instead).'
        ],
        whenToCallServices: [
          'Call 108 immediately if the victim cannot breathe or speak.',
          'Call 108 immediately if the victim becomes unresponsive.'
        ]
      },
      ta: {
        title: 'தொண்டையில் உணவு அடைப்பு (Choking)',
        category: 'சுவாச அவசரநிலை',
        summary: 'உணவு அல்லது பொருள் தொண்டையில் சிக்கி மூச்சுத்திணறல் ஏற்படும் போது உதவும் ஹெம்லிச் முறை.',
        warningSigns: [
          'கழுத்தை கைகளால் பிடித்தபடி மூச்சுத் திணறுதல்',
          'பேசவோ, இருமவோ, சுவாசிக்கவோ முடியாமை',
          'முகம் மற்றும் உதடுகள் நீல நிறமாக மாறுதல்'
        ],
        immediateActions: [
          {
            stepNumber: 1,
            title: 'தொண்டை அடைப்பை உறுதி செய்க',
            instruction: 'நோயாளி இரும முடிந்தால் தொடர்ந்து இருமச் சொல்லவும். பேசவோ சுவாசிக்கவோ முடியாவிட்டால் உடனே உதவவும்.',
            illustrationType: 'choking-assess'
          },
          {
            stepNumber: 2,
            title: 'முதுகில் 5 முறை தட்டவும்',
            instruction: 'பின்னால் நின்று, நபரை சற்று முன்னோக்கி சாய்த்து, இரு தோள்பட்டைகளுக்கு நடுவே உள்ளங்கையின் குதிகாலால் 5 முறை பலமாக தட்டவும்.',
            illustrationType: 'back-blows'
          },
          {
            stepNumber: 3,
            title: '5 முறை வயிற்றை அமுக்கவும் (Heimlich)',
            instruction: 'தொப்புளுக்கு சற்று மேலே ஒரு கையை மடக்கி பிடித்து, மற்றொரு கையால் அதை உள்நோக்கியும் மேல்நோக்கியும் 5 முறை பலமாக இழுக்கவும்.',
            illustrationType: 'choking-heimlich'
          },
          {
            stepNumber: 4,
            title: 'சுழற்சியைத் தொடரவும்',
            instruction: 'பொருள் வெளியேறும் வரை 5 முதுகு தட்டு மற்றும் 5 வயிற்று அமுக்குதலை தொடரவும்.',
            illustrationType: 'choking-cycle'
          }
        ],
        thingsToAvoid: [
          'வாய்க்குள் விரலை விட்டு குருட்டுத்தனமாக துழாவ வேண்டாம்.',
          'தொண்டை அடைத்தவருக்கு தண்ணீர் குடிக்கக் கொடுக்க வேண்டாம்.'
        ],
        whenToCallServices: [
          'சுவாசம் முழுமையாக நின்றுவிட்டால் உடனடியாக 108-க்கு அழைக்கவும்.'
        ]
      },
      hi: {
        title: 'गले में रुकावट / दम घुटना (Choking)',
        category: 'श्वसन आपातकाल',
        summary: 'गले में भोजन या वस्तु फंसने पर हेइमलिच तकनीक से जीवन रक्षा।',
        warningSigns: [
          'दोनों हाथों से गले को पकड़ना (सार्वभौमिक संकेत)',
          'बोलने या सांस लेने में असमर्थ होना',
          'चेहरे और होठों का नीला पड़ना'
        ],
        immediateActions: [
          {
            stepNumber: 1,
            title: 'गंभीरता जांचें',
            instruction: 'यदि व्यक्ति खांस सकता है तो खांसने दें। यदि सांस पूरी तरह बंद है तो तुरंत कार्रवाई करें।',
            illustrationType: 'choking-assess'
          },
          {
            stepNumber: 2,
            title: 'पीठ पर 5 बार थपथपाएं',
            instruction: 'व्यक्ति के पीछे खड़े होकर उसे आगे झुकाएं और दोनों कंधों के बीच हथेली से 5 बार जोर से मारें।',
            illustrationType: 'back-blows'
          },
          {
            stepNumber: 3,
            title: 'पेट पर 5 बार झटका दें (Heimlich Maneuver)',
            instruction: 'नाभि के ठीक ऊपर मुट्ठी रखें और दूसरे हाथ से पकड़कर अंदर और ऊपर की ओर तेजी से 5 बार झटका दें।',
            illustrationType: 'choking-heimlich'
          },
          {
            stepNumber: 4,
            title: 'प्रक्रिया दोहराएं',
            instruction: 'जब तक वस्तु बाहर न निकल जाए, 5 बार पीठ और 5 बार पेट का झटका जारी रखें।',
            illustrationType: 'choking-cycle'
          }
        ],
        thingsToAvoid: [
          'मुंह में उंगली डालकर बिना देखे वस्तु निकालने की कोशिश न करें।',
          'पीड़ित को पानी पीने के लिए न दें।'
        ],
        whenToCallServices: [
          'यदि व्यक्ति सांस न ले पाए या बेहोश हो जाए तो तुरंत 108 पर कॉल करें।'
        ]
      },
      te: {
        title: 'గొంతులో ఆహారం అడ్డుపడటం (Choking)',
        category: 'శ్వాసకోశ అత్యవసర పరిస్థితి',
        summary: 'గొంతులో ఆహారం లేదా వస్తువు ఇరుక్కున్నప్పుడు హెమ్లిచ్ విధానం.',
        warningSigns: ['గొంతు పట్టుకోవడం', 'మాట్లాడలేకపోవడం', 'ముఖం నీలంగా మారడం'],
        immediateActions: [
          { stepNumber: 1, title: 'పరిస్థితిని అంచనా వేయండి', instruction: 'దగ్గగలిగితే దగ్గమని చెప్పండి. శ్వాస పూర్తిగా ఆగిపోతే వెంటనే సహాయపడండి.', illustrationType: 'choking-assess' },
          { stepNumber: 2, title: 'వీపుపై 5 సార్లు కొట్టండి', instruction: 'ముందుకు వంచి భుజాల మధ్య అరచేతితో 5 సార్లు గట్టిగా తట్టండి.', illustrationType: 'back-blows' },
          { stepNumber: 3, title: 'పొట్టపై 5 సార్లు ఒత్తండి', instruction: 'బొడ్డు పైభాగంలో పిడికిలి పెట్టి పైకి, లోపలికి లాగండి.', illustrationType: 'choking-heimlich' }
        ],
        thingsToAvoid: ['గొంతులోకి చేతివేళ్లు పెట్టవద్దు', 'నీరు తాగించవద్దు'],
        whenToCallServices: ['వ్యక్తి స్పృహ కోల్పోతే వెంటనే 108 కు కాల్ చేయండి.']
      },
      kn: {
        title: 'ಗಂಟಲಲ್ಲಿ ಆಹಾರ ಸಿಲುಕುವುದು (Choking)',
        category: 'ಉಸಿರಾಟದ ತುರ್ತುಸ್ಥಿತಿ',
        summary: 'ಗಂಟಲಿನಲ್ಲಿ ಆಹಾರ ಸಿಲುಕಿದಾಗ ಜೀವರಕ್ಷಕ ಹೈಮ್ಲಿಚ್ ವಿಧಾನ.',
        warningSigns: ['ಕುತ್ತಿಗೆ ಹಿಡಿದುಕೊಳ್ಳುವುದು', 'ಮಾತನಾಡಲು ಸಾಧ್ಯವಾಗದಿರುವುದು', 'ಮುಖ ನೀಲಿಗಟ್ಟುವುದು'],
        immediateActions: [
          { stepNumber: 1, title: 'ಪರೀಕ್ಷಿಸಿ', instruction: 'ಕೆಮ್ಮಲು ಸಾಧ್ಯವಾದರೆ ಕೆಮ್ಮಲು ಹೇಳಿ. ಇಲ್ಲವಾದರೆ ತಕ್ಷಣ ಕ್ರಮಕೈಗೊಳ್ಳಿ.', illustrationType: 'choking-assess' },
          { stepNumber: 2, title: 'ಬೆನ್ನಿಗೆ 5 ಬಾರಿ ತಟ್ಟಿ', instruction: 'ಮುಂದಕ್ಕೆ ಬಾಗಿಸಿ ಭುಜಗಳ ನಡುವೆ 5 ಬಾರಿ ಗಟ್ಟಿಯಾಗಿ ತಟ್ಟಿ.', illustrationType: 'back-blows' },
          { stepNumber: 3, title: 'ಹೊಟ್ಟೆಯನ್ನು ಒತ್ತಿ', instruction: 'ಹೊಕ್ಕುಳಿನ ಮೇಲೆ ಮುಷ್ಟಿ ಇಟ್ಟು ಮೇಲಕ್ಕೆ ಮತ್ತು ಒಳಕ್ಕೆ ಒತ್ತಿರಿ.', illustrationType: 'choking-heimlich' }
        ],
        thingsToAvoid: ['ಬಾಯಿಗೆ ಬೆರಳು ಹಾಕಿ ಹುಡುಕಬೇಡಿ', 'ನೀರು ಕುಡಿಸಬೇಡಿ'],
        whenToCallServices: ['ಉಸಿರಾಟ ನಿಂತರೆ ತಕ್ಷಣ 108 ಕರೆ ಮಾಡಿ.']
      },
      ml: {
        title: 'തൊണ്ടയിൽ ഭക്ഷണം കുടുങ്ങൽ (Choking)',
        category: 'ശ്വാസകോശ അടിയന്തരാവസ്ഥ',
        summary: 'തൊണ്ടയിൽ തടസ്സമുണ്ടാകുമ്പോഴുള്ള ജീവൻരക്ഷാ രീതി.',
        warningSigns: ['കഴുത്തിൽ കൈപിടിക്കുക', 'സംസാരിക്കാൻ പറ്റാതാവുക', 'മുഖം നീലിക്കുക'],
        immediateActions: [
          { stepNumber: 1, title: 'സ്ഥിതി വിലയിരുത്തുക', instruction: 'ചുമയ്ക്കാൻ പ്രോത്സാഹിപ്പിക്കുക. പറ്റുന്നില്ലെങ്കിൽ ഉടൻ സഹായിക്കുക.', illustrationType: 'choking-assess' },
          { stepNumber: 2, title: 'പുറത്ത് 5 തവണ തട്ടുക', instruction: 'മുന്നോട്ട് ആഞ്ഞു നിർത്തി തോളുകൾക്കിടയിൽ 5 തവണ തട്ടുക.', illustrationType: 'back-blows' },
          { stepNumber: 3, title: 'വയറ്റിൽ മർദ്ദം നൽകുക', instruction: 'പൊക്കിളിന് മുകളിൽ മുഷ്ടി ചുരുട്ടി മുകളിലേക്കും ഉള്ളിലേക്കും അമർത്തുക.', illustrationType: 'choking-heimlich' }
        ],
        thingsToAvoid: ['വായ്ക്കുള്ളിൽ വിരലിട്ടു തപ്പരുത്', 'വെള്ളം കൊടുക്കരുത്'],
        whenToCallServices: ['ശ്വാസം കിട്ടാതെ വന്നാൽ ഉടൻ 108 ലേക്ക് വിളിക്കുക.']
      }
    }
  },

  // 3. Severe Bleeding
  {
    id: 'severe-bleeding',
    icon: '🩸',
    urgency: 'critical',
    illustrationId: 'direct-pressure',
    content: {
      en: {
        title: 'Severe Bleeding & Hemorrhage',
        category: 'Trauma & Wound',
        summary: 'Arterial or severe venous blood loss requiring rapid hemorrhage control.',
        warningSigns: [
          'Blood spurting or flowing continuously from a wound',
          'Clothing or bandages quickly soaked in blood',
          'Pale, cold, clammy skin; rapid weak pulse',
          'Dizziness, confusion, or loss of consciousness'
        ],
        immediateActions: [
          {
            stepNumber: 1,
            title: 'Apply Firm Direct Pressure',
            instruction: 'Press directly on the wound with both hands using a sterile dressing, clean cloth, or clothing.',
            tip: 'Do not ease pressure to peek at the wound. Maintain continuous force.',
            illustrationType: 'direct-pressure'
          },
          {
            stepNumber: 2,
            title: 'Maintain Pressure & Add Layers',
            instruction: 'If blood seeps through, DO NOT remove the first cloth. Place additional cloths directly on top and press harder.',
            tip: 'Removing the original cloth pulls away nascent blood clots.',
            illustrationType: 'bandage-layer'
          },
          {
            stepNumber: 3,
            title: 'Elevate Limb (if no fracture)',
            instruction: 'Elevate the bleeding arm or leg above the level of the heart while maintaining continuous direct pressure.',
            illustrationType: 'limb-elevate'
          },
          {
            stepNumber: 4,
            title: 'Secure Pressure Bandage',
            instruction: 'Wrap a bandage firmly around the dressing to hold it tight. Check that fingers or toes beyond the wrap do not turn cold or blue.',
            illustrationType: 'pressure-wrap'
          },
          {
            stepNumber: 5,
            title: 'Prevent Shock & Keep Warm',
            instruction: 'Lay the patient flat, elevate their legs 12 inches if no spine injury, and cover them with a blanket.',
            illustrationType: 'shock-prevention'
          }
        ],
        thingsToAvoid: [
          'NEVER remove an impaled knife, glass, or object (stabilize it in place with bulky padding).',
          'Do NOT remove blood-soaked dressings—always add more layers on top.',
          'Do NOT apply a makeshift wire or string tourniquet (can sever nerves and tissue).'
        ],
        whenToCallServices: [
          'Call 108 immediately for spurting blood or bleeding that does not stop after 5 minutes of firm pressure.',
          'Call 108 if the person feels faint, confused, or goes unconscious.'
        ]
      },
      ta: {
        title: 'கடுமையான ரத்தப்போக்கு (Severe Bleeding)',
        category: 'காயம் & அதிர்ச்சி',
        summary: 'உயிர் ஆபத்தான ரத்த இழப்பைத் தடுக்க நேரடி அழுத்தம் கொடுக்கும் முறை.',
        warningSigns: ['ரத்தம் பீறிட்டு அடித்தல்', 'ஆடைகள் ரத்தத்தில் நனைதல்', 'தோல் வெளிறிப்போதல், மயக்கம்'],
        immediateActions: [
          { stepNumber: 1, title: 'நேரடியாக அழுத்திப் பிடிக்கவும்', instruction: 'சுத்தமான துணியால் காயத்தின் மேல் இரு கைகளாலும் பலமாக அழுத்திப் பிடிக்கவும்.', illustrationType: 'direct-pressure' },
          { stepNumber: 2, title: 'துணியை அகற்ற வேண்டாம்', instruction: 'ரத்தம் ஊறினால் அந்த துணியை எடுக்காமல் அதன் மேல் மேலும் ஒரு துணியை வைத்து அழுத்தவும்.', illustrationType: 'bandage-layer' },
          { stepNumber: 3, title: 'உறுப்பை உயர்த்தவும்', instruction: 'எலும்பு முறிவு இல்லாவிட்டால் காயம்பட்ட கையை அல்லது காலை இதய மட்டத்திற்கு மேல் உயர்த்தவும்.', illustrationType: 'limb-elevate' },
          { stepNumber: 4, title: 'அதிர்ச்சியைத் தடுக்கவும்', instruction: 'நோயாளிக்கு குளிராமல் போர்வை போர்த்தி 108 ஆம்புலன்ஸை உடனடியாக அழைக்கவும்.', illustrationType: 'shock-prevention' }
        ],
        thingsToAvoid: ['காயத்தில் குத்தியிருக்கும் கத்தி அல்லது கண்ணாடியை உருவ வேண்டாம்.', 'கம்பிகளால் இறுக்கி கட்ட வேண்டாம்.'],
        whenToCallServices: ['ரத்தம் நிற்காமல் வெளியேறினால் உடனே 108-க்கு அழைக்கவும்.']
      },
      hi: {
        title: 'गंभीर रक्तस्राव (Severe Bleeding)',
        category: 'चोट और घाव',
        summary: 'अत्यधिक खून बहने से रोकने के लिए प्राथमिक उपचार।',
        warningSigns: ['घाव से तेजी से खून बहना या फव्वारा फूटना', 'चक्कर आना या त्वचा पीली पड़ना'],
        immediateActions: [
          { stepNumber: 1, title: 'घाव पर सीधा दबाव बनाएं', instruction: 'साफ कपड़े या पट्टी से घाव पर दोनों हाथों से लगातार जोर से दबाएं।', illustrationType: 'direct-pressure' },
          { stepNumber: 2, title: 'कपड़ा न हटाएं', instruction: 'यदि कपड़ा भीग जाए तो उसे हटाए बिना उसके ऊपर और कपड़ा रखकर दबाएं।', illustrationType: 'bandage-layer' },
          { stepNumber: 3, title: 'अंग को ऊपर उठाएं', instruction: 'यदि हड्डी न टूटी हो तो घायल हाथ या पैर को दिल के स्तर से ऊपर उठाएं।', illustrationType: 'limb-elevate' }
        ],
        thingsToAvoid: ['घाव में धंसी हुई वस्तु (चाकू या कांच) कभी न निकालें।'],
        whenToCallServices: ['खून 5 मिनट में न रुके तो तुरंत 108 पर कॉल करें।']
      },
      te: {
        title: 'తీవ్ర రక్తస్రావం (Severe Bleeding)',
        category: 'గాయాలు & అత్యవసరం',
        summary: 'రక్తస్రావాన్ని అరికట్టే అత్యవసర విధానం.',
        warningSigns: ['రక్తం ఎక్కువగా కారడం', 'స్పృహ కోల్పోవడం'],
        immediateActions: [
          { stepNumber: 1, title: 'గాయంపై గట్టిగా ఒత్తిడి ఉంచండి', instruction: 'శుభ్రమైన గుడ్డతో గాయంపై బలంగా నొక్కండి.', illustrationType: 'direct-pressure' },
          { stepNumber: 2, title: 'గుడ్డను తీయవద్దు', instruction: 'రక్తం కారితే దానిపైనే మరో గుడ్డ పెట్టి నొక్కండి.', illustrationType: 'bandage-layer' }
        ],
        thingsToAvoid: ['గుచ్చుకున్న వస్తువులను బయటకు లాగవద్దు.'],
        whenToCallServices: ['రక్తం ఆగకపోతే వెంటనే 108 కు కాల్ చేయండి.']
      },
      kn: {
        title: 'ತೀವ್ರ ರಕ್ತಸ್ರಾವ (Severe Bleeding)',
        category: 'ಗಾಯ ಮತ್ತು ರಕ್ತಸ್ರಾವ',
        summary: 'ರಕ್ತ ನಷ್ಟ ತಡೆಯಲು ತಕ್ಷಣದ ಕ್ರಮಗಳು.',
        warningSigns: ['ರಕ್ತ ಚಿಮ್ಮುವುದು', 'ತಲೆಸುತ್ತು ಬರುವುದು'],
        immediateActions: [
          { stepNumber: 1, title: 'ನೇರ ಒತ್ತಡ ಹಾಕಿ', instruction: 'ಸ್ವಚ್ಛವಾದ ಬಟ್ಟೆಯಿಂದ ಗಾಯದ ಮೇಲೆ ಬಲವಾಗಿ ಒತ್ತಿ ಹಿಡಿಯಿರಿ.', illustrationType: 'direct-pressure' },
          { stepNumber: 2, title: 'ಬಟ್ಟೆ ತೆಗೆಯಬೇಡಿ', instruction: 'ರಕ್ತ ನೆನೆದರೆ ಅದರ ಮೇಲೆಯೇ ಇನ್ನೊಂದು ಬಟ್ಟೆ ಇಟ್ಟು ಒತ್ತಿರಿ.', illustrationType: 'bandage-layer' }
        ],
        thingsToAvoid: ['ಚುಚ್ಚಿದ ಚಾಕು ಅಥವಾ ಗಾಜನ್ನು ಹೊರತೆಗೆಯಬೇಡಿ.'],
        whenToCallServices: ['ರಕ್ತ ನಿಲ್ಲದಿದ್ದರೆ ತಕ್ಷಣ 108 ಕರೆ ಮಾಡಿ.']
      },
      ml: {
        title: 'കഠിനമായ രക്തസ്രാവം (Severe Bleeding)',
        category: 'മുറിവുകൾ',
        summary: 'രക്തസ്രാവം നിയന്ത്രിക്കാനുള്ള മാർഗ്ഗങ്ങൾ.',
        warningSigns: ['രക്തം ചീറ്റിത്തെറിക്കുക', 'തളർച്ചയും വിളർച്ചയും'],
        immediateActions: [
          { stepNumber: 1, title: 'ശക്തമായി അമർത്തിപ്പിടിക്കുക', instruction: 'വൃത്തിയുള്ള തുണികൊണ്ട് മുറിവിൽ അമർത്തിപ്പിടിക്കുക.', illustrationType: 'direct-pressure' },
          { stepNumber: 2, title: 'തുണി മാറ്റരുത്', instruction: 'രക്തം നനഞ്ഞാൽ അതിന്റെ മുകളിൽ വീണ്ടും തുണി വച്ച് അമർത്തുക.', illustrationType: 'bandage-layer' }
        ],
        thingsToAvoid: ['തറച്ച വസ്തുക്കൾ സ്വയം ഊരിയെടുക്കരുത്.'],
        whenToCallServices: ['രക്തസ്രാവം നിലച്ചില്ലെങ്കിൽ ഉടൻ 108 ലേക്ക് വിളിക്കുക.']
      }
    }
  },

  // 4. Burns
  {
    id: 'burns',
    icon: '🔥',
    urgency: 'high',
    illustrationId: 'burn-cooling',
    content: {
      en: {
        title: 'Burns & Scalds',
        category: 'Thermal & Chemical',
        summary: 'Immediate cooling and protective care for heat, chemical, or electrical burn injuries.',
        warningSigns: [
          'Blistering, charred (black), or waxy white skin',
          'Burns covering face, hands, feet, groin, or major joints',
          'Burns greater than 3 inches in diameter or covering > 10% of body',
          'Chemical exposure or electrical shock burns'
        ],
        immediateActions: [
          {
            stepNumber: 1,
            title: 'Cool with Running Water (10–20 Minutes)',
            instruction: 'Immediately hold the burned skin under cool, gentle running tap water for at least 10 to 20 minutes.',
            tip: 'Cooling reduces skin temperature, stops burn progression, and relieves pain.',
            illustrationType: 'burn-cooling'
          },
          {
            stepNumber: 2,
            title: 'Remove Constrictive Items Gently',
            instruction: 'Quickly and carefully remove rings, bracelets, watches, or loose clothing before rapid swelling sets in.',
            tip: 'Do NOT remove clothing that is melted or stuck to the burn.',
            illustrationType: 'remove-jewelry'
          },
          {
            stepNumber: 3,
            title: 'Cover Loosely with Clean Plastic Film',
            instruction: 'Cover the cooled burn loosely with clean plastic cling wrap or a sterile non-stick cloth.',
            tip: 'Plastic wrap prevents infection and protects exposed nerve endings from air pain.',
            illustrationType: 'cling-wrap'
          },
          {
            stepNumber: 4,
            title: 'Keep Patient Warm',
            instruction: 'Cool only the burned area. Keep the rest of the body warm with a blanket to prevent hypothermia.',
            illustrationType: 'shock-prevention'
          }
        ],
        thingsToAvoid: [
          'NEVER use ice, ice water, or freezing compresses (causes severe tissue frostbite).',
          'NEVER apply butter, oil, toothpaste, flour, or turmeric to burns.',
          'NEVER burst or puncture burn blisters (blisters are natural sterile bandages).',
          'NEVER pull away clothing stuck to the burn wound.'
        ],
        whenToCallServices: [
          'Call 108 immediately for burns on face, hands, or groin.',
          'Call 108 for any chemical or high-voltage electrical burn.',
          'Call 108 if the person has inhaled smoke or has singed facial hair.'
        ]
      },
      ta: {
        title: 'தீக்காயங்கள் & கொதிநீர் காயங்கள் (Burns)',
        category: 'வெப்ப காயங்கள்',
        summary: 'தீக்காயம் ஏற்பட்டவுடன் செய்ய வேண்டிய சரியான குளிர்விப்பு முறைகள்.',
        warningSigns: ['தோல் கறுத்துப்போதல் அல்லது கொப்புளங்கள்', 'முகம், கைகளில் தீக்காயம்', 'ரசாயனம் அல்லது மின்சாரக் காயங்கள்'],
        immediateActions: [
          { stepNumber: 1, title: 'குளிர்ந்த குழாய் நீரில் 10-20 நிமிடம் நனைக்கவும்', instruction: 'காயம்பட்ட இடத்தில் உடனே ஓடும் குழாய் நீரை 10 முதல் 20 நிமிடங்கள் ஊற்றவும்.', illustrationType: 'burn-cooling' },
          { stepNumber: 2, title: 'மோதிரம், வளையல்களை அகற்றவும்', instruction: 'வீக்கம் வருவதற்கு முன் நகைகள் மற்றும் இறுக்கமான ஆடைகளை மெதுவாக அகற்றவும்.', illustrationType: 'remove-jewelry' },
          { stepNumber: 3, title: 'சுத்தமான பிளாஸ்டிக் தாளால் மூடவும்', instruction: 'காயத்தை சுத்தமான பிளாஸ்டிக் ராப்பரால் தளர்வாக மூடவும்.', illustrationType: 'cling-wrap' }
        ],
        thingsToAvoid: ['ஐஸ் கட்டி, டூத் பேஸ்ட், எண்ணெய் அல்லது மஞ்சள் வைக்க வேண்டாம்.', 'கொப்புளங்களை உடைக்க வேண்டாம்.'],
        whenToCallServices: ['முகம், மர்ம உறுப்புகளில் காயம் ஏற்பட்டால் உடனே 108-க்கு அழைக்கவும்.']
      },
      hi: {
        title: 'जलने और झुलसने की चोटें (Burns)',
        category: 'थर्मल और केमिकल',
        summary: 'जलने पर सही प्राथमिक उपचार और ठंडक पहुंचाने के उपाय।',
        warningSigns: ['त्वचा पर फफोले पड़ना', 'चेहरे या हाथों का जलना', 'केमिकल या बिजली का करंट'],
        immediateActions: [
          { stepNumber: 1, title: 'ठंडे पानी में 10-20 मिनट रखें', instruction: 'तुरंत बहते हुए सामान्य पानी से 10 से 20 मिनट तक धोएं।', illustrationType: 'burn-cooling' },
          { stepNumber: 2, title: 'अंगूठी या गहने हटाएं', instruction: 'सूजन आने से पहले अंगूठियां और घड़ियां धीरे से उतार लें।', illustrationType: 'remove-jewelry' },
          { stepNumber: 3, title: 'साफ पॉलीथीन या पट्टी से ढकें', instruction: 'घाव को ढीले कपड़े या साफ प्लास्टिक रैप से ढकें।', illustrationType: 'cling-wrap' }
        ],
        thingsToAvoid: ['बर्फ, टूथपेस्ट, तेल, हल्दी या मक्खन कभी न लगाएं।', 'फफोलों को न फोड़ें।'],
        whenToCallServices: ['चेहरा जलने पर या गंभीर छाले होने पर तुरंत 108 पर कॉल करें।']
      },
      te: {
        title: 'కాలిన గాయాలు (Burns)',
        category: 'అత్యవసర చికిత్స',
        summary: 'కాలిన గాయాలకు సరైన ప్రథమ చికిత్స.',
        warningSigns: ['బొబ్బలు రావడం', 'ముఖం లేదా చేతులు కాలడం'],
        immediateActions: [
          { stepNumber: 1, title: 'చల్లని నీటిలో 15 నిమిషాలు ఉంచండి', instruction: 'కారుతున్న నీటి కింద కాలిన భాగాన్ని ఉంచండి.', illustrationType: 'burn-cooling' },
          { stepNumber: 2, title: 'నగలు తీసివేయండి', instruction: 'వాపు రాకముందే ఉంగరాలు, వాచీలు తీసేయండి.', illustrationType: 'remove-jewelry' }
        ],
        thingsToAvoid: ['మంచు గడ్డలు, పేస్ట్, నూనె రాయవద్దు.', 'బొబ్బలను పగలగొట్టవద్దు.'],
        whenToCallServices: ['తీవ్రంగా కాలితే వెంటనే 108 కు కాల్ చేయండి.']
      },
      kn: {
        title: 'ಸುಟ್ಟ ಗಾಯಗಳು (Burns)',
        category: 'ಸುಟ್ಟ ಗಾಯಗಳು',
        summary: 'ಸುಟ್ಟ ಗಾಯಗಳಿಗೆ ತಕ್ಷಣದ ಶಮನ ಕ್ರಮಗಳು.',
        warningSigns: ['ಗುಳ್ಳೆಗಳು ಏಳುವುದು', 'ಮುಖ ಸುಡುವುದು'],
        immediateActions: [
          { stepNumber: 1, title: 'ತಣ್ಣೀರಿನಲ್ಲಿ 15 ನಿಮಿಷ ತೊಳೆಯಿರಿ', instruction: 'ಹರಿಯುವ ನೀರಿನ ಅಡಿಯಲ್ಲಿ ಗಾಯವನ್ನು ಇರಿಸಿ.', illustrationType: 'burn-cooling' },
          { stepNumber: 2, title: 'ಉಂಗುರ, ಆಭರಣ ತೆಗೆಯಿರಿ', instruction: 'ಊತ ಬರುವ ಮುನ್ನ ತೆಗೆಯಿರಿ.', illustrationType: 'remove-jewelry' }
        ],
        thingsToAvoid: ['ಐಸ್, ಟೂತ್‌ಪೇಸ್ಟ್, ಎಣ್ಣೆ ಹಚ್ಚಬೇಡಿ.'],
        whenToCallServices: ['ಗಂಭೀರ ಸುಟ್ಟ ಗಾಯಗಳಿಗೆ 108 ಕರೆ ಮಾಡಿ.']
      },
      ml: {
        title: 'പൊള്ളലേറ്റ മുറിവുകൾ (Burns)',
        category: 'പൊള്ളൽ',
        summary: 'പൊള്ളലേറ്റാൽ ഉടനടി ചെയ്യേണ്ട കാര്യങ്ങൾ.',
        warningSigns: ['ത്വക്കിൽ കുമിളകൾ വരിക', 'മുഖത്തോ കൈകളിലോ പൊള്ളുക'],
        immediateActions: [
          { stepNumber: 1, title: 'തണുത്ത വെള്ളത്തിൽ കാണിക്കുക', instruction: '10-20 മിനിറ്റ് ശുദ്ധജലത്തിൽ മുറിവ് തണുപ്പിക്കുക.', illustrationType: 'burn-cooling' },
          { stepNumber: 2, title: 'ആഭരണങ്ങൾ മാറ്റുക', instruction: 'നീര് വരുന്നതിനു മുൻപ് മോതിരവും മറ്റും മാറ്റുക.', illustrationType: 'remove-jewelry' }
        ],
        thingsToAvoid: ['ഐസ്, ടൂത്ത്പേസ്റ്റ്, എണ്ണ എന്നിവ പുരട്ടരുത്.'],
        whenToCallServices: ['ഗുരുതര പൊള്ളലേറ്റാൽ ഉടൻ 108 ലേക്ക് വിളിക്കുക.']
      }
    }
  },

  // 5. Seizures
  {
    id: 'seizures',
    icon: '⚡',
    urgency: 'high',
    illustrationId: 'recovery-position',
    content: {
      en: {
        title: 'Seizures & Convulsions',
        category: 'Neurological',
        summary: 'Protection, airway safety, and recovery positioning during an epileptic or convulsive seizure.',
        warningSigns: [
          'Sudden collapse, muscle stiffening, violent rhythmic jerking',
          'Clenched jaw, foaming at the mouth, tongue biting',
          'Eyes rolling back, temporary cessation of breathing',
          'Loss of bowel or bladder control'
        ],
        immediateActions: [
          {
            stepNumber: 1,
            title: 'Clear Hard & Sharp Objects',
            instruction: 'Quickly move furniture, sharp items, and electrical cables away to prevent head or body trauma.',
            tip: 'Do not attempt to move the person unless they are in immediate danger (e.g. middle of road).',
            illustrationType: 'clear-hazards'
          },
          {
            stepNumber: 2,
            title: 'Protect the Head',
            instruction: 'Place a soft, folded jacket, towel, or pillow gently under their head. Loosen tight collar or neckties.',
            illustrationType: 'cushion-head'
          },
          {
            stepNumber: 3,
            title: 'Time the Seizure',
            instruction: 'Look at your watch immediately. Note the exact start time and how long the jerking lasts.',
            tip: 'Seizures lasting longer than 5 minutes require emergency medical intervention.',
            illustrationType: 'time-seizure'
          },
          {
            stepNumber: 4,
            title: 'Turn into Recovery Position Once Jerking Stops',
            instruction: 'Once convulsions cease, roll the person onto their side. Tilt the chin up gently to keep the airway open and allow fluids to drain.',
            illustrationType: 'recovery-position'
          },
          {
            stepNumber: 5,
            title: 'Stay Calm & Reassure',
            instruction: 'Stay with them until they regain full consciousness. They may be confused, exhausted, or have a headache.',
            illustrationType: 'stay-calm'
          }
        ],
        thingsToAvoid: [
          'NEVER put a spoon, keys, cloth, or your fingers into their mouth (can break teeth or choke them).',
          'NEVER restrain or forcefully pin the person down (can cause shoulder dislocations or fractures).',
          'Do NOT give food, water, or medication until they are completely alert.',
          'Do NOT perform CPR unless they do not breathe after the seizure stops.'
        ],
        whenToCallServices: [
          'Call 108 immediately if the seizure lasts MORE than 5 minutes.',
          'Call 108 if a second seizure occurs without regaining consciousness.',
          'Call 108 if the person is pregnant, injured, or has never had a seizure before.'
        ]
      },
      ta: {
        title: 'வலிப்பு / காக்காய் வலிப்பு (Seizures)',
        category: 'நரம்பியல் அவசரநிலை',
        summary: 'வலிப்பு ஏற்படும் போது தலையைப் பாதுகாத்தல் மற்றும் மூச்சுக்குழாய் அடைப்பைத் தடுக்கும் வழிமுறைகள்.',
        warningSigns: ['உடல் விறைத்து துடித்தல்', 'வாயில் நுரை தள்ளுதல்', 'கண்கள் மேல்நோக்கி சொருகுதல்'],
        immediateActions: [
          { stepNumber: 1, title: 'சுற்றியுள்ள ஆபத்தான பொருட்களை அகற்றவும்', instruction: 'அடிபடாமல் இருக்க அருகில் உள்ள கூர்மையான பொருட்களை அப்புறப்படுத்தவும்.', illustrationType: 'clear-hazards' },
          { stepNumber: 2, title: 'தலைக்கு மெத்தை வைக்கவும்', instruction: 'தலைக்கு அடியில் மடித்த துணியையோ தலையணையையோ வைத்து கழுத்து பட்டன்களை தளர்த்தவும்.', illustrationType: 'cushion-head' },
          { stepNumber: 3, title: 'நேரத்தைக் கவனிக்கவும்', instruction: 'வலிப்பு எத்தனை நிமிடங்கள் நீடிக்கிறது என்று கடிகாரத்தைப் பார்க்கவும்.', illustrationType: 'time-seizure' },
          { stepNumber: 4, title: 'ஒருக்களித்து படுக்க வைக்கவும்', instruction: 'வலிப்பு நின்றதும் நபரை ஒரு பக்கமாக சாய்த்து படுக்க வைக்கவும் (Recovery Position).', illustrationType: 'recovery-position' }
        ],
        thingsToAvoid: ['வாயில் இரும்பு சாவி, கரண்டி, விரல்களை திணிக்க வேண்டாம்.', 'கைகளை பிடித்து முடக்க வேண்டாம்.'],
        whenToCallServices: ['வலிப்பு 5 நிமிடங்களுக்கு மேல் நீடித்தால் உடனே 108-ஐ அழைக்கவும்.']
      },
      hi: {
        title: 'मिर्गी के दौरे / ऐंठन (Seizures)',
        category: 'न्यूरोलॉजिकल',
        summary: 'दौरे के समय सिर की सुरक्षा और सांस की नली खुली रखने के उपाय।',
        warningSigns: ['अचानक गिरकर शरीर का कांपना', 'मुंह से झाग आना', 'बेहोशी'],
        immediateActions: [
          { stepNumber: 1, title: 'आसपास की चीजें हटाएं', instruction: 'चोट से बचाने के लिए कठोर और नुकीली चीजें दूर करें।', illustrationType: 'clear-hazards' },
          { stepNumber: 2, title: 'सिर के नीचे तकिया रखें', instruction: 'सिर के नीचे मुड़ा हुआ कपड़ा रखें ताकि सिर पर चोट न लगे।', illustrationType: 'cushion-head' },
          { stepNumber: 3, title: 'करवट दिलाकर लिटाएं', instruction: 'दौरा रुकने पर व्यक्ति को एक करवट पर लिटाएं ताकि लार बाहर निकल सके।', illustrationType: 'recovery-position' }
        ],
        thingsToAvoid: ['मुंह में चम्मच, चाबी या उंगली कभी न डालें।', 'हाथ-पैर पकड़कर रोकने की कोशिश न करें।'],
        whenToCallServices: ['दौरा 5 मिनट से अधिक चले तो तुरंत 108 पर कॉल करें।']
      },
      te: {
        title: 'ఫిట్స్ / మూర్ఛ వ్యాధి (Seizures)',
        category: 'నాడీ సంబంధిత అత్యవసరం',
        summary: 'ఫిట్స్ వచ్చినప్పుడు తీసుకోవాల్సిన జాగ్రత్తలు.',
        warningSigns: ['శరీరం కొట్టుకోవడం', 'నోటి నుండి నురగ రావడం'],
        immediateActions: [
          { stepNumber: 1, title: 'వస్తువులను దూరంగా ఉంచండి', instruction: 'గాయాలు కాకుండా చూసుకోండి.', illustrationType: 'clear-hazards' },
          { stepNumber: 2, title: 'తల కింద గుడ్డ పెట్టండి', instruction: 'తల దెబ్బతినకుండా మెత్తటి గుడ్డ ఉంచండి.', illustrationType: 'cushion-head' },
          { stepNumber: 3, title: 'ఒకవైపుకు తిప్పి పడుకోబెట్టండి', instruction: 'ఫిట్స్ ఆగిన తర్వాత పక్కకు తిప్పండి.', illustrationType: 'recovery-position' }
        ],
        thingsToAvoid: ['నోట్లో తాళాలు, చెంచాలు పెట్టవద్దు.', 'బలవంతంగా పట్టుకోవద్దు.'],
        whenToCallServices: ['5 నిమిషాలకు మించి ఫిట్స్ వస్తే 108 కు కాల్ చేయండి.']
      },
      kn: {
        title: 'ಫಿಟ್ಸ್ / ಮೂರ್ಛೆರೋಗ (Seizures)',
        category: 'ನರಮಂಡಲದ ತುರ್ತುಸ್ಥಿತಿ',
        summary: 'ಫಿಟ್ಸ್ ಬಂದಾಗ ಜೀವ ರಕ್ಷಣೆಯ ಕ್ರಮಗಳು.',
        warningSigns: ['ಕೈಕಾಲು ನಡುಗುವುದು', 'ಬಾಯಲ್ಲಿ ನೊರೆ ಬರುವುದು'],
        immediateActions: [
          { stepNumber: 1, title: 'ಚೂಪಾದ ವಸ್ತುಗಳನ್ನು ದೂರವಿಡಿ', instruction: 'ಗಾಯವಾಗದಂತೆ ರಕ್ಷಿಸಿ.', illustrationType: 'clear-hazards' },
          { stepNumber: 2, title: 'ತಲೆಯ ಕೆಳಗೆ ಬಟ್ಟೆ ಇಡಿ', instruction: 'ತಲೆಗೆ ಪೆಟ್ಟು ಬೀಳದಂತೆ ನೋಡಿಕೊಳ್ಳಿ.', illustrationType: 'cushion-head' },
          { stepNumber: 3, title: 'ಒಂದು ಮಗ್ಗುಲಿಗೆ ಮಲಗಿಸಿ', instruction: 'ಉಸಿರಾಟ ಸರಾಗವಾಗಲು ಪಕ್ಕಕ್ಕೆ ತಿರುಗಿಸಿ ಮಲಗಿಸಿ.', illustrationType: 'recovery-position' }
        ],
        thingsToAvoid: ['ಬಾಯಿಗೆ ಕೀಲಿ ಕೈ, ಚಮಚ ಹಾಕಬೇಡಿ.'],
        whenToCallServices: ['5 ನಿಮಿಷಕ್ಕಿಂತ ಹೆಚ್ಚು ಕಾಲ ಸೆಳೆತ ಮುಂದುವರಿದರೆ 108 ಕರೆ ಮಾಡಿ.']
      },
      ml: {
        title: 'ഫിറ്റ്സ് / അപസ്മാരം (Seizures)',
        category: 'നാഡീവ്യൂഹം',
        summary: 'ഫിറ്റ്സ് ഉണ്ടാകുമ്പോൾ തല സുരക്ഷിതമാക്കലും ശുശ്രൂഷയും.',
        warningSigns: ['ശരീരം വെട്ടിവിറയ്ക്കുക', 'വായിൽ നിന്ന് നുര വരിക'],
        immediateActions: [
          { stepNumber: 1, title: 'വസ്തുക്കൾ മാറ്റുക', instruction: 'പരിക്കേൽക്കാതിരിക്കാൻ മൂർച്ചയുള്ള സാധനങ്ങൾ മാറ്റുക.', illustrationType: 'clear-hazards' },
          { stepNumber: 2, title: 'തലയ്ക്കടിയിൽ തുണി വയ്ക്കുക', instruction: 'തല ഇടിയാതിരിക്കാൻ തലയിണയോ തുണിയോ വയ്ക്കുക.', illustrationType: 'cushion-head' },
          { stepNumber: 3, title: 'ഒരു വശത്തേക്ക് ചരിച്ചു കിടത്തുക', instruction: 'ശ്രവം തൊണ്ടയിൽ കുടുങ്ങാതിരിക്കാൻ ചരിച്ചു കിടത്തുക.', illustrationType: 'recovery-position' }
        ],
        thingsToAvoid: ['വായിൽ താക്കോലോ സ്പൂണോ തിരുകരുത്.'],
        whenToCallServices: ['5 മിനിറ്റിൽ കൂടുതൽ നീണ്ടുനിന്നാൽ ഉടൻ 108 ലേക്ക് വിളിക്കുക.']
      }
    }
  },

  // 6. Snakebites
  {
    id: 'snakebites',
    icon: '🐍',
    urgency: 'critical',
    illustrationId: 'snakebite-bandage',
    content: {
      en: {
        title: 'Venomous Snakebites',
        category: 'Toxicology & Wilderness',
        summary: 'Emergency immobilization and transport protocol for venomous snake envenomation.',
        warningSigns: [
          'Pair of puncture marks, severe swelling and redness',
          'Burning pain spreading up the bitten limb',
          'Drooping eyelids (ptosis), slurred speech, difficulty swallowing',
          'Bleeding from gums or uninjured skin, vomiting'
        ],
        immediateActions: [
          {
            stepNumber: 1,
            title: 'Keep Patient Calm & Completely Still',
            instruction: 'Reassure the victim and keep them completely still. Any muscle movement accelerates venom circulation through the lymphatic system.',
            tip: 'Have the victim sit or lie down comfortably.',
            illustrationType: 'keep-still'
          },
          {
            stepNumber: 2,
            title: 'Keep Bitten Limb at or Below Heart Level',
            instruction: 'Position the bitten arm or leg below the level of the heart to slow systemic venom uptake.',
            illustrationType: 'limb-level'
          },
          {
            stepNumber: 3,
            title: 'Remove Rings & Constrictive Jewelry',
            instruction: 'Quickly remove all rings, bangles, anklets, and tight shoes before severe swelling begins.',
            illustrationType: 'remove-jewelry'
          },
          {
            stepNumber: 4,
            title: 'Apply Broad Pressure Immobilization Bandage',
            instruction: 'Wrap an elastic bandage firmly over the bite site and up the entire limb (firm like for a sprained ankle). Splint the limb to prevent bending joints.',
            tip: 'Do not cut off arterial blood supply—pulses in foot/wrist should remain palpable.',
            illustrationType: 'snakebite-bandage'
          },
          {
            stepNumber: 5,
            title: 'Transport Immediately to Hospital with Anti-Venom',
            instruction: 'Call 108 or arrange immediate transport. Carry the victim on a stretcher if possible; do not let them walk.',
            tip: 'Anti-snake venom (ASV) is the ONLY definitive treatment for envenomation.',
            illustrationType: 'transport-hospital'
          }
        ],
        thingsToAvoid: [
          'NEVER cut, incise, or make cross-cuts on the bite marks.',
          'NEVER attempt to suck out venom with mouth or suction cups.',
          'NEVER apply a tight arterial tourniquet (causes tissue necrosis and gangrene).',
          'NEVER apply ice, herbal pastes, electrical shocks, or kerosene.',
          'Do NOT try to catch or kill the snake (avoids second bite risk; take a photo from safe distance only if possible).'
        ],
        whenToCallServices: [
          'Call 108 immediately for ANY suspected snakebite in India.',
          'Every snakebite should be evaluated at a hospital equipped with Anti-Snake Venom (ASV).'
        ]
      },
      ta: {
        title: 'பாம்புக் கடி முதலுதவி (Snakebites)',
        category: 'நச்சு அவசரநிலை',
        summary: 'பாம்பு கடித்தவருக்கு விஷம் பரவாமல் தடுத்து மருத்துவமனைக்கு கொண்டு சேர்க்கும் வழிகாட்டி.',
        warningSigns: ['பல் தடம், தாங்க முடியாத வலி மற்றும் வீக்கம்', 'கண் இமைகள் சோர்ந்து விழுதல்', 'மூச்சுத்திணறல், வாயில் ரத்தம் கசிதல்'],
        immediateActions: [
          { stepNumber: 1, title: 'அமைதியாக அசையாமல் இருக்க வைக்கவும்', instruction: 'பாதிக்கப்பட்டவரை முற்றிலும் அசையாமல் படுக்க வைக்கவும். அசைந்தால் ரத்தத்தில் விஷம் வேகமாகப் பரவும்.', illustrationType: 'keep-still' },
          { stepNumber: 2, title: 'கடித்த இடத்தை இதயத்திற்கு கீழ் வைக்கவும்', instruction: 'கடித்த கை அல்லது காலை இதய மட்டத்திற்கு கீழே வைக்கவும்.', illustrationType: 'limb-level' },
          { stepNumber: 3, title: 'நகைகளை உடனே கழற்றவும்', instruction: 'மோதிரம், கொலுசு, வளையல்களை வீக்கம் வருவதற்கு முன் கழற்றவும்.', illustrationType: 'remove-jewelry' },
          { stepNumber: 4, title: 'கட்டுக் போட்டு அசையாமல் வைக்கவும்', instruction: 'கடித்த இடத்தின் மேல் துணியால் சுளுக்கிற்கு கட்டுவது போல உறுதியாக கட்டுப்போட்டு மரக்கட்டை வைத்து அசையாமல் கட்டவும்.', illustrationType: 'snakebite-bandage' },
          { stepNumber: 5, title: 'உடனே 108 மூலம் மருத்துவமனைக்கு கொண்டு செல்லவும்', instruction: 'பாம்புக்கடிக்கு ASV மாற்று மருந்து உள்ள அரசு மருத்துவமனைக்கு உடனே கொண்டு செல்லவும்.', illustrationType: 'transport-hospital' }
        ],
        thingsToAvoid: ['காயத்தை பிளேடால் கீற வேண்டாம்.', 'வாயால் விஷத்தை உறிஞ்ச வேண்டாம்.', 'கயிற்றால் மிகவும் இறுக்கமாக ரத்த ஓட்டம் நிற்கும் படி கட்ட வேண்டாம்.'],
        whenToCallServices: ['பாம்பு கடித்த உடனேயே 108 ஆம்புலன்ஸுக்கு அழைக்கவும்.']
      },
      hi: {
        title: 'सांप के काटने पर प्राथमिक उपचार (Snakebite)',
        category: 'जहर और आपातकाल',
        summary: 'सांप काटने पर जहर को फैलने से रोकने और अस्पताल पहुंचाने की सही प्रक्रिया।',
        warningSigns: ['काटने के दो निशान, तेज दर्द और सूजन', 'पलकें भारी होना, बोलने में कठिनाई', 'उल्टी या सांस लेने में परेशानी'],
        immediateActions: [
          { stepNumber: 1, title: 'मरीज को शांत और स्थिर रखें', instruction: 'मरीज को बिल्कुल हिलने-डुलने न दें। हिलने से जहर तेजी से फैलता है।', illustrationType: 'keep-still' },
          { stepNumber: 2, title: 'अंग को दिल के स्तर से नीचे रखें', instruction: 'काटे गए हाथ या पैर को दिल के स्तर से नीचे रखें।', illustrationType: 'limb-level' },
          { stepNumber: 3, title: 'गहने और जूते उतारें', instruction: 'सूजन आने से पहले अंगूठी और जूते उतार दें।', illustrationType: 'remove-jewelry' },
          { stepNumber: 4, title: 'दबाव पट्टी बांधें और स्थिर करें', instruction: 'काटे गए हिस्से पर चौड़ी पट्टी बांधें और लकड़ी का सहारा देकर स्थिर करें।', illustrationType: 'snakebite-bandage' },
          { stepNumber: 5, title: 'तुरंत अस्पताल ले जाएं', instruction: 'मरीज को पैदल न चलने दें। 108 एम्बुलेंस से तुरंत एंटी-वेनम वाले अस्पताल ले जाएं।', illustrationType: 'transport-hospital' }
        ],
        thingsToAvoid: ['घाव पर चीरा या ब्लेड कभी न लगाएं।', 'मुंह से जहर चूसने की कोशिश न करें।', 'तार या रस्सी से खून का दौरा रोकने वाला कड़ा बंधन न लगाएं।'],
        whenToCallServices: ['सांप काटने के तुरंत बाद 108 पर कॉल करें।']
      },
      te: {
        title: 'పాము కాటు ప్రథమ చికిత్స (Snakebites)',
        category: 'విషపూరిత అత్యవసరం',
        summary: 'పాము కాటుకు గురైనప్పుడు తీసుకోవాల్సిన జాగ్రత్తలు.',
        warningSigns: ['కాటు గుర్తులు, తీవ్రమైన నొప్పి', 'కనురెప్పలు వాలడం', 'శ్వాస అందకపోవడం'],
        immediateActions: [
          { stepNumber: 1, title: 'కదలకుండా ఉంచండి', instruction: 'బాధితుడిని కదలకుండా పడుకోబెట్టండి.', illustrationType: 'keep-still' },
          { stepNumber: 2, title: 'గుండె స్థాయి కంటే క్రింద ఉంచండి', instruction: 'కాటు వేసిన భాగాన్ని కిందకు ఉంచండి.', illustrationType: 'limb-level' },
          { stepNumber: 3, title: 'కట్టు కట్టండి', instruction: 'గుడ్డతో గట్టిగా కట్టి ఆసుపత్రికి తరలించండి.', illustrationType: 'snakebite-bandage' }
        ],
        thingsToAvoid: ['బ్లేడుతో కోయవద్దు.', 'నోటితో విషాన్ని పీల్చవద్దు.'],
        whenToCallServices: ['పాము కుట్టిన వెంటనే 108 కు కాల్ చేయండి.']
      },
      kn: {
        title: 'ಹಾವು ಕಡಿತಕ್ಕೆ ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ (Snakebites)',
        category: 'ವಿಷಕಾರಿ ತುರ್ತುಸ್ಥಿತಿ',
        summary: 'ಹಾವು ಕಡಿದಾಗ ವಿಷ ಹರಡದಂತೆ ತಡೆಯುವ ವಿಧಾನ.',
        warningSigns: ['ಕಡಿತದ ಗುರುತು, ವಿಪರೀತ ನೋವು', 'ಕಣ್ಣುಗಳು ತೂಕವಾಗುವುದು'],
        immediateActions: [
          { stepNumber: 1, title: 'ಚಲಿಸದಂತೆ ಮಲಗಿಸಿ', instruction: 'ವ್ಯಕ್ತಿಯನ್ನು ಅಲುಗಾಡದಂತೆ ಶಾಂತವಾಗಿ ಮಲಗಿಸಿ.', illustrationType: 'keep-still' },
          { stepNumber: 2, title: 'ಹೃದಯ ಮಟ್ಟಕ್ಕಿಂತ ಕೆಳಗಿಡಿ', instruction: 'ಕಚ್ಚಿದ ಜಾಗವನ್ನು ಕೆಳಮಟ್ಟದಲ್ಲಿಡಿ.', illustrationType: 'limb-level' },
          { stepNumber: 3, title: 'ಆಸ್ಪತ್ರೆಗೆ ಕರೆದೊಯ್ಯಿರಿ', instruction: '108 ಕರೆ ಮಾಡಿ ಆಂಟಿ-ವೆನಮ್ ಇರುವ ಆಸ್ಪತ್ರೆಗೆ ಕೊಂಡೊಯ್ಯಿರಿ.', illustrationType: 'transport-hospital' }
        ],
        thingsToAvoid: ['ಬ್ಲೇಡ್‌ನಿಂದ ಕೊಯ್ಯಬೇಡಿ.', 'ಬಾಯಿಂದ ವಿಷ ಹೀರುವ ಪ್ರಯತ್ನ ಮಾಡಬೇಡಿ.'],
        whenToCallServices: ['ಹಾವು ಕಡಿದ ತಕ್ಷಣ 108 ಕರೆ ಮಾಡಿ.']
      },
      ml: {
        title: 'പാമ്പ് കടിയേറ്റാൽ (Snakebites)',
        category: 'വിഷബാധ',
        summary: 'പാമ്പ് കടിയേറ്റാൽ ഉടനടി ചെയ്യേണ്ടതും ഒഴിവാക്കേണ്ടതുമായ കാര്യങ്ങൾ.',
        warningSigns: ['കടിയേറ്റ പാടുകൾ, കഠിനമായ വേദന', 'കൺപോളകൾ അടഞ്ഞുപോവുക'],
        immediateActions: [
          { stepNumber: 1, title: 'അനങ്ങാതെ കിടത്തുക', instruction: 'രോഗിയെ ഭയപ്പെടാതെ അനങ്ങാതെ കിടത്തുക.', illustrationType: 'keep-still' },
          { stepNumber: 2, title: 'ഹൃദയ നിലയ്ക്ക് താഴെ വയ്ക്കുക', instruction: 'കടിയേറ്റ ഭാഗം ഹൃദയത്തിന് താഴെയായി നിർത്തുക.', illustrationType: 'limb-level' },
          { stepNumber: 3, title: 'ഉടൻ ആശുപത്രിയിലെത്തിക്കുക', instruction: '108 വിളിച്ച് ആന്റി വെനം ഉള്ള ആശുപത്രിയിലേക്ക് കൊണ്ടുപോകുക.', illustrationType: 'transport-hospital' }
        ],
        thingsToAvoid: ['മുറിവുണ്ടാക്കുകയോ വായ വച്ച് വിഷം വലിച്ചെടുക്കുകയോ ചെയ്യരുത്.'],
        whenToCallServices: ['പാമ്പ് കടിയേറ്റ ഉടൻ 108 ലേക്ക് വിളിക്കുക.']
      }
    }
  },

  // 7. Fractures
  {
    id: 'fractures',
    icon: '🦴',
    urgency: 'high',
    illustrationId: 'fracture-splint',
    content: {
      en: {
        title: 'Fractures & Broken Bones',
        category: 'Musculoskeletal & Trauma',
        summary: 'Stabilization, splinting, and immobilization for suspected bone fractures.',
        warningSigns: [
          'Audible snap, pop, or cracking sound at time of injury',
          'Visible deformity, limb bent in unnatural angle, or bone piercing skin (open fracture)',
          'Intense localized pain worsening with any touch or movement',
          'Rapid swelling, bruising, and inability to bear weight'
        ],
        immediateActions: [
          {
            stepNumber: 1,
            title: 'Control Any External Bleeding',
            instruction: 'If bone pierces the skin, apply sterile pressure around the wound edges without pushing the bone back in.',
            illustrationType: 'direct-pressure'
          },
          {
            stepNumber: 2,
            title: 'Immobilize the Injured Area in Found Position',
            instruction: 'Do not attempt to straighten or realign the bone. Support the injured limb gently in the exact position it was found.',
            tip: 'Moving broken bone fragments causes severe vessel and nerve lacerations.',
            illustrationType: 'fracture-hold'
          },
          {
            stepNumber: 3,
            title: 'Apply a Rigid Splint',
            instruction: 'Place a rigid support (rolled newspapers, wooden board, or cardboard) along the limb spanning above and below the injured joint.',
            illustrationType: 'fracture-splint'
          },
          {
            stepNumber: 4,
            title: 'Secure Splint with Bandages or Cloth',
            instruction: 'Tie bandages firmly above and below the fracture site. Ensure the ties are not so tight as to cut off blood circulation.',
            tip: 'Check that fingers or toes remain warm and pink.',
            illustrationType: 'splint-tie'
          },
          {
            stepNumber: 5,
            title: 'Apply Cold Pack over a Towel',
            instruction: 'Apply an ice pack wrapped in a cloth to reduce swelling and pain. Never apply bare ice directly to skin.',
            illustrationType: 'ice-pack'
          }
        ],
        thingsToAvoid: [
          'NEVER try to push protruding bone ends back inside the body.',
          'NEVER force, straighten, or manipulate a crooked or deformed limb.',
          'Do NOT allow the victim to walk or bear weight on an injured leg or pelvis.'
        ],
        whenToCallServices: [
          'Call 108 immediately for open fractures (bone protruding through skin).',
          'Call 108 for suspected fractures of the neck, spine, pelvis, or femur (thigh).',
          'Call 108 if the foot or hand becomes cold, numb, or turns blue.'
        ]
      },
      ta: {
        title: 'எலும்பு முறிவு (Fractures)',
        category: 'எலும்பு & தசை காயம்',
        summary: 'எலும்பு உடைந்தால் செய்ய வேண்டிய முதலுதவி மற்றும் அசையாமல் கட்டும் முறை.',
        warningSigns: ['உறுப்பு இயற்கைக்கு மாறான கோணத்தில் வளைந்திருத்தல்', 'எலும்பு தோலை கிழித்து வெளியே தெரிதல்', 'தாங்க முடியாத வலி'],
        immediateActions: [
          { stepNumber: 1, title: 'உறுப்பை நேராக்க முயற்சிக்காதீர்கள்', instruction: 'காயம் எவ்வாறு உள்ளதோ அதே நிலையில் அசையாமல் தாங்கிப் பிடிக்கவும்.', illustrationType: 'fracture-hold' },
          { stepNumber: 2, title: 'மரப்பலகை அல்லது அட்டை வைத்து கட்டவும்', instruction: 'உடைந்த பகுதிக்கு மேலும் கீழும் பலகை அல்லது அட்டை வைத்து துணியால் கட்டவும்.', illustrationType: 'fracture-splint' },
          { stepNumber: 3, title: 'ஐஸ் ஒத்தடம் கொடுக்கவும்', instruction: 'துணியில் சுற்றிய ஐஸ் கட்டியை வீக்கம் குறைய வைக்கவும்.', illustrationType: 'ice-pack' }
        ],
        thingsToAvoid: ['வெளியே நீட்டிக்கொண்டிருக்கும் எலும்பை உள்ளே தள்ள வேண்டாம்.', 'நடக்க வைக்க வேண்டாம்.'],
        whenToCallServices: ['எலும்பு வெளியே தெரிந்தால் அல்லது இடுப்பு, முதுகு எலும்பு உடைந்தால் உடனே 108-க்கு அழைக்கவும்.']
      },
      hi: {
        title: 'हड्डी टूटना / फ्रैक्चर (Fractures)',
        category: 'हड्डी और चोट',
        summary: 'हड्डी टूटने पर बिना हिलाए सहारा देने और पट्टी बांधने की विधि।',
        warningSigns: ['अंग का असामान्य रूप से मुड़ना', 'हड्डी का त्वचा से बाहर निकलना', 'अत्यधिक दर्द और सूजन'],
        immediateActions: [
          { stepNumber: 1, title: 'अंग को सीधा करने की कोशिश न करें', instruction: 'अंग जिस स्थिति में है, उसे उसी तरह स्थिर रखें।', illustrationType: 'fracture-hold' },
          { stepNumber: 2, title: 'लकड़ी या गत्ते का सहारा देकर बांधें (Splinting)', instruction: 'हड्डी के दोनों जोड़ों को कवर करते हुए लकड़ी की पट्टी बांधें।', illustrationType: 'fracture-splint' }
        ],
        thingsToAvoid: ['बाहर निकली हड्डी को अंदर धकेलने की कोशिश कभी न करें।'],
        whenToCallServices: ['खुला फ्रैक्चर होने पर या रीढ़ की हड्डी में चोट लगने पर तुरंत 108 बुलाएं।']
      },
      te: {
        title: 'ఎముకల విరుపు (Fractures)',
        category: 'ఎముకల గాయాలు',
        summary: 'ఎముక విరిగినప్పుడు కదలకుండా కట్టు కట్టే విధానం.',
        warningSigns: ['తీవ్రమైన నొప్పి', 'ఎముక బయటకు కనిపించడం'],
        immediateActions: [
          { stepNumber: 1, title: 'ఎముకను సరిచేయవద్దు', instruction: 'ఉన్న స్థితిలోనే కదలకుండా ఉంచండి.', illustrationType: 'fracture-hold' },
          { stepNumber: 2, title: 'చెక్క బద్ద పెట్టి కట్టండి', instruction: 'కదలకుండా బద్దతో కట్టు కట్టండి.', illustrationType: 'fracture-splint' }
        ],
        thingsToAvoid: ['బయటకు వచ్చిన ఎముకను లోపలికి నెట్టవద్దు.'],
        whenToCallServices: ['తీవ్రమైన విరుపులకు 108 కు కాల్ చేయండి.']
      },
      kn: {
        title: 'ಮೂಳೆ ಮುರಿತ (Fractures)',
        category: 'ಮೂಳೆ ತುರ್ತುಸ್ಥಿತಿ',
        summary: 'ಮೂಳೆ ಮುರಿದಾಗ ಅಲುಗಾಡದಂತೆ ಕಟ್ಟುವ ವಿಧಾನ.',
        warningSigns: ['ಅತಿಯಾದ ನೋವು', 'ಅಂಗ ವಕ್ರವಾಗುವುದು'],
        immediateActions: [
          { stepNumber: 1, title: 'ಮೂಳೆಯನ್ನು ನೇರ ಮಾಡಲು ಹೋಗಬೇಡಿ', instruction: 'ಇದ್ದ ಹಾಗೆಯೇ ಇರಿಸಿ.', illustrationType: 'fracture-hold' },
          { stepNumber: 2, title: 'ಪಟ್ಟೆ ಕಟ್ಟಿ ಆಸ್ಪತ್ರೆಗೆ ಕರೆದೊಯ್ಯಿರಿ', instruction: 'ಕಟ್ಟಿಗೆಯ ತುಂಡು ಇಟ್ಟು ಕಟ್ಟಿ.', illustrationType: 'fracture-splint' }
        ],
        thingsToAvoid: ['ಹೊರಬಂದ ಮೂಳೆಯನ್ನು ಒಳಗೆ ತಳ್ಳಬೇಡಿ.'],
        whenToCallServices: ['ಗಂಭೀರ ಮುರಿತಕ್ಕೆ 108 ಕರೆ ಮಾಡಿ.']
      },
      ml: {
        title: 'അസ്ഥി ഒടിവ് (Fractures)',
        category: 'എല്ല് ഒടിവ്',
        summary: 'അസ്ഥി ഒടിഞ്ഞാൽ അനക്കാതെ വച്ചുകെട്ടാനുള്ള മാർഗ്ഗങ്ങൾ.',
        warningSigns: ['കഠിനമായ വേദനയും നീരും', 'അവയവത്തിന്റെ ഘടന മാറുക'],
        immediateActions: [
          { stepNumber: 1, title: 'നേരെയാക്കാൻ ശ്രമിക്കരുത്', instruction: 'ഏത് അവസ്ഥയിലാണോ ഉള്ളത് അതുപോലെ അനക്കാതെ വയ്ക്കുക.', illustrationType: 'fracture-hold' },
          { stepNumber: 2, title: 'കഷ്ണം വച്ച് കെട്ടുക', instruction: 'മരക്കഷണമോ കാർഡ്ബോർഡോ വച്ച് അനങ്ങാത്തവിധം കെട്ടുക.', illustrationType: 'fracture-splint' }
        ],
        thingsToAvoid: ['പുറത്തു ചാടിയ എല്ല് ഉള്ളിലേക്ക് തള്ളരുത്.'],
        whenToCallServices: ['തുറന്ന ഒടിവുകൾക്ക് ഉടൻ 108 ലേക്ക് വിളിക്കുക.']
      }
    }
  },

  // 8. Fainting
  {
    id: 'fainting',
    icon: '😵',
    urgency: 'moderate',
    illustrationId: 'fainting-elevation',
    content: {
      en: {
        title: 'Fainting (Syncope)',
        category: 'Circulatory & Neurological',
        summary: 'Restoring cerebral blood flow and safe recovery for temporary loss of consciousness.',
        warningSigns: [
          'Sudden dizziness, lightheadedness, or black spots in vision',
          'Pale skin, cool sweat on forehead',
          'Sudden limpness and collapse onto floor',
          'Nausea and blurred vision prior to falling'
        ],
        immediateActions: [
          {
            stepNumber: 1,
            title: 'Catch the Person & Lower Safely',
            instruction: 'Prevent head injury by gently easing the fainting person down flat onto the floor on their back.',
            illustrationType: 'lower-safely'
          },
          {
            stepNumber: 2,
            title: 'Elevate Legs 12 Inches (30 cm)',
            instruction: 'Prop their feet up on a backpack, chair, or cushions above heart level to redirect blood flow back to the brain.',
            tip: 'Do not elevate legs if head, neck, or pelvic trauma is suspected.',
            illustrationType: 'fainting-elevation'
          },
          {
            stepNumber: 3,
            title: 'Loosen Tight Clothing & Provide Fresh Air',
            instruction: 'Unbutton collars, belts, or tight ties. Disperse crowds to ensure adequate fresh airflow.',
            illustrationType: 'loosen-clothing'
          },
          {
            stepNumber: 4,
            title: 'Check Responsiveness & Breathing',
            instruction: 'Most fainting resolves within 20 to 60 seconds. Speak gently to them. If they do not wake up within 1 minute, place in recovery position and call 108.',
            illustrationType: 'check-breathing'
          },
          {
            stepNumber: 5,
            title: 'Rest Before Standing Up',
            instruction: 'Do not allow them to stand up quickly. Have them sit for several minutes and sip water once fully awake.',
            illustrationType: 'sit-slowly'
          }
        ],
        thingsToAvoid: [
          'Do NOT splash ice-cold water onto the face or slap them.',
          'Do NOT give smelling salts, shoes, or onions to smell.',
          'Do NOT force them to sit or stand up immediately (causes second blackout).',
          'Do NOT give liquids or food while they are unconscious.'
        ],
        whenToCallServices: [
          'Call 108 if the person remains unconscious for MORE than 1 minute.',
          'Call 108 if fainting occurred while exercising, with chest pain, or irregular heartbeats.',
          'Call 108 if the person hit their head hard or is pregnant.'
        ]
      },
      ta: {
        title: 'மயக்கம் அடைதல் (Fainting)',
        category: 'ரத்த ஓட்ட அவசரநிலை',
        summary: 'மூளைக்கு ரத்த ஓட்டம் குறையும்போது ஏற்படும் மயக்கத்திற்கான உடனடி முதலுதவி.',
        warningSigns: ['திடீர் தலைசுற்றல், கண்கள் இருண்டு போதல்', 'தோல் வெளுத்து வியர்த்தல்', 'திடீரென சரிந்து விழுதல்'],
        immediateActions: [
          { stepNumber: 1, title: 'தரையில் மல்லாக்க படுக்க வைக்கவும்', instruction: 'நபரை பாதுகாப்பாக தரையில் படுக்க வைக்கவும்.', illustrationType: 'lower-safely' },
          { stepNumber: 2, title: 'கால்களை 1 அடி உயர்த்தவும்', instruction: 'மூளைக்கு ரத்தம் செல்ல கால்களுக்கு அடியில் பை அல்லது தலையணை வைத்து உயர்த்தவும்.', illustrationType: 'fainting-elevation' },
          { stepNumber: 3, title: 'இறுக்கமான ஆடைகளைத் தளர்த்தவும்', instruction: 'கழுத்து பட்டன், பெல்ட்டை தளர்த்தி நல்ல காற்று வரச் செய்யவும்.', illustrationType: 'loosen-clothing' }
        ],
        thingsToAvoid: ['முகத்தில் தண்ணீரை வீசி அடிக்க வேண்டாம்.', 'வெங்காயம், காலணி போன்றவற்றை நுகர வைக்க வேண்டாம்.', 'உடனே எழுந்து நிற்க வைக்க வேண்டாம்.'],
        whenToCallServices: ['1 நிமிடத்திற்கு மேல் மயக்கம் தெளியாவிட்டால் உடனே 108-க்கு அழைக்கவும்.']
      },
      hi: {
        title: 'बेहोशी / चक्कर आना (Fainting)',
        category: 'रक्त प्रवाह और बेहोशी',
        summary: 'मस्तिष्क में रक्त प्रवाह बढ़ाने और होश में लाने के प्राथमिक उपाय।',
        warningSigns: ['अचानक चक्कर आना या आंखों के आगे अंधेरा छाना', 'चेहरा पीला पड़ना और पसीना आना'],
        immediateActions: [
          { stepNumber: 1, title: 'पीठ के बल सीधा लिटाएं', instruction: 'व्यक्ति को तुरंत जमीन पर आराम से लिटाएं।', illustrationType: 'lower-safely' },
          { stepNumber: 2, title: 'पैरों को 12 इंच ऊपर उठाएं', instruction: 'पैरों के नीचे तकिया या बैग रखें ताकि खून दिमाग तक पहुंच सके।', illustrationType: 'fainting-elevation' },
          { stepNumber: 3, title: 'कपड़े ढीले करें और हवा आने दें', instruction: 'कॉलर और बेल्ट ढीले करें और भीड़ हटाएं।', illustrationType: 'loosen-clothing' }
        ],
        thingsToAvoid: ['चेहरे पर पानी न फेंकें और थप्पड़ न मारें।', 'प्याज या जूता न सुंघाएं।', 'तुरंत खड़ा न करें।'],
        whenToCallServices: ['यदि व्यक्ति 1 मिनट से अधिक समय तक बेहोश रहे तो 108 पर कॉल करें।']
      },
      te: {
        title: 'సొమ్మసిల్లి పడిపోవడం (Fainting)',
        category: 'అత్యవసర చికిత్స',
        summary: 'కళ్లు తిరిగి పడిపోయినప్పుడు చేయవలసిన సహాయం.',
        warningSigns: ['కళ్లు తిరగడం', 'చెమటలు పట్టడం'],
        immediateActions: [
          { stepNumber: 1, title: 'వెల్లకిలా పడుకోబెట్టండి', instruction: 'నేలపై సురక్షితంగా పడుకోబెట్టండి.', illustrationType: 'lower-safely' },
          { stepNumber: 2, title: 'కాళ్లను పైకి ఎత్తండి', instruction: 'మెదడుకు రక్తం అందేలా కాళ్ల కింద దిండు పెట్టండి.', illustrationType: 'fainting-elevation' }
        ],
        thingsToAvoid: ['ముఖంపై నీళ్లు చల్లవద్దు', 'ఉల్లిపాయలు వాసన చూపించవద్దు'],
        whenToCallServices: ['1 నిమిషంలో స్పృహ రాకపోతే 108 కు కాల్ చేయండి.']
      },
      kn: {
        title: 'ಪ್ರಜ್ಞೆ ತಪ್ಪುವುದು / ತಲೆಸುತ್ತು (Fainting)',
        category: 'ರಕ್ತ ಪರಿಚಲನೆಯ ತುರ್ತುಸ್ಥಿತಿ',
        summary: 'ಪ್ರಜ್ಞೆ ತಪ್ಪಿ ಬಿದ್ದಾಗ ತಕ್ಷಣದ ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ.',
        warningSigns: ['ತಲೆಸುತ್ತು ಬರುವುದು', 'ಬೆವರುವುದು'],
        immediateActions: [
          { stepNumber: 1, title: 'ನೆಲದ ಮೇಲೆ ಮಲಗಿಸಿ', instruction: 'ಬೆನ್ನಿನ ಮೇಲೆ ಆರಾಮವಾಗಿ ಮಲಗಿಸಿ.', illustrationType: 'lower-safely' },
          { stepNumber: 2, title: 'ಕಾಲುಗಳನ್ನು ಮೇಲೆತ್ತಿ', instruction: 'ಕಾಲುಗಳ ಕೆಳಗೆ ದಿಂಬು ಇರಿಸಿ.', illustrationType: 'fainting-elevation' }
        ],
        thingsToAvoid: ['ಮುಖಕ್ಕೆ ನೀರು ಎರಚಬೇಡಿ', 'ಈರುಳ್ಳಿ ವಾಸನೆ ತೋರಿಸಬೇಡಿ.'],
        whenToCallServices: ['1 ನಿಮಿಷವಾದರೂ ಎಚ್ಚರವಾಗದಿದ್ದರೆ 108 ಕರೆ ಮಾಡಿ.']
      },
      ml: {
        title: 'തലകറങ്ങി വീഴൽ (Fainting)',
        category: 'ബോധക്ഷയം',
        summary: 'തലകറങ്ങി വീഴുമ്പോൾ ചെയ്യേണ്ട അടിയന്തര കാര്യങ്ങൾ.',
        warningSigns: ['തലകറക്കം, കണ്ണിൽ ഇരുട്ടു കയറുക', 'വിയർപ്പും തളർച്ചയും'],
        immediateActions: [
          { stepNumber: 1, title: 'മലർത്തി കിടത്തുക', instruction: 'സുരക്ഷിതമായി നിലത്തു കിടത്തുക.', illustrationType: 'lower-safely' },
          { stepNumber: 2, title: 'കാലുകൾ ഉയർത്തി വയ്ക്കുക', instruction: 'തലച്ചോറിലേക്ക് രക്തയോട്ടം കൂട്ടാൻ കാലുകൾ ഉയർത്തി വയ്ക്കുക.', illustrationType: 'fainting-elevation' }
        ],
        thingsToAvoid: ['മുഖത്തേക്ക് വെള്ളം തളിക്കുകയോ ഉള്ളി മണപ്പിക്കുകയോ ചെയ്യരുത്.'],
        whenToCallServices: ['1 മിനിറ്റിൽ കൂടുതൽ ബോധമില്ലെങ്കിൽ ഉടൻ 108 ലേക്ക് വിളിക്കുക.']
      }
    }
  },

  // 9. Road Accident Injuries
  {
    id: 'road-accidents',
    icon: '🚗',
    urgency: 'critical',
    illustrationId: 'road-safety',
    content: {
      en: {
        title: 'Road Accident Injuries & Scene Safety',
        category: 'Multi-Trauma & Triage',
        summary: 'Rapid roadside scene protection, cervical spine stabilization, and emergency triage.',
        warningSigns: [
          'High-speed vehicular crash or pedestrian impact',
          'Victim trapped inside vehicle or thrown onto roadway',
          'Suspected neck or back injury (numbness, neck pain, paralysis)',
          'Severe bleeding, airway blockage, or unconsciousness'
        ],
        immediateActions: [
          {
            stepNumber: 1,
            title: 'Ensure Scene Safety & Warn Traffic',
            instruction: 'Park safely, turn on hazard lights, and place reflective warning markers or branches 50 meters back to prevent secondary collisions.',
            tip: 'Never become a second casualty. Check for fuel leaks or fires.',
            illustrationType: 'road-safety'
          },
          {
            stepNumber: 2,
            title: 'Call 112 & 108 Immediately',
            instruction: 'Dial 108/112 right away. Report the exact highway/landmark, number of injured victims, and if anyone is trapped.',
            illustrationType: 'call-108'
          },
          {
            stepNumber: 3,
            title: 'Stabilize Head & Cervical Spine (Do NOT Move)',
            instruction: 'Kneel behind the victim head and hold their head gently between your hands in neutral alignment. Do not allow them to twist their neck.',
            tip: 'Assume every motor vehicle accident has a spine injury.',
            illustrationType: 'c-spine'
          },
          {
            stepNumber: 4,
            title: 'Helmet Management Rule',
            instruction: 'DO NOT remove a motorcycle helmet unless the victim airway is blocked or they are not breathing and require CPR.',
            tip: 'Removing a helmet can sever an unstable spinal cord.',
            illustrationType: 'helmet-rule'
          },
          {
            stepNumber: 5,
            title: 'Control Bleeding & Maintain Warmth',
            instruction: 'Apply direct pressure on major bleeds. Cover victims with jackets to prevent shock until emergency rescue teams arrive.',
            illustrationType: 'direct-pressure'
          }
        ],
        thingsToAvoid: [
          'NEVER move a crash victim out of the vehicle unless there is an imminent fire or explosion.',
          'NEVER remove a motorcycle helmet carelessly.',
          'NEVER give water or food to a road accident victim (they may need emergency surgery).',
          'Do NOT twist or bend the neck or spine.'
        ],
        whenToCallServices: [
          'Call 112 and 108 IMMEDIATELY upon witnessing or arriving at any road collision.'
        ]
      },
      ta: {
        title: 'சாலை விபத்து முதலுதவி (Road Accidents)',
        category: 'விபத்து & அதிர்ச்சி',
        summary: 'விபத்து பகுதியில் பாதுகாப்பு, கழுத்து எலும்பு பாதுகாப்பு மற்றும் அவசர மீட்பு முறைகள்.',
        warningSigns: ['கடுமையான வாகன மோதல்', 'கழுத்து வலி, கைகால் மரத்துப்போதல்', 'ரத்தப்போக்கு அல்லது சுயநினைவின்மை'],
        immediateActions: [
          { stepNumber: 1, title: 'விபத்து பகுதியை பாதுகாப்பாக்குங்கள்', instruction: 'பின்னால் வரும் வாகனங்கள் மோதாமல் எச்சரிக்கை பலகையோ சிக்னலோ வைக்கவும்.', illustrationType: 'road-safety' },
          { stepNumber: 2, title: 'உடனே 108 மற்றும் 112-க்கு அழைக்கவும்', instruction: 'விபத்து நடந்த சரியான இடம் மற்றும் பாதிக்கப்பட்டவர்கள் எண்ணிக்கையை தெரிவிக்கவும்.', illustrationType: 'call-108' },
          { stepNumber: 3, title: 'கழுத்தை அசைக்காமல் பிடிக்கவும்', instruction: 'கழுத்து எலும்பு முறிந்திருக்கலாம் என்பதால் தலையை இரு கைகளாலும் அசையாமல் நேராகப் பிடிக்கவும்.', illustrationType: 'c-spine' },
          { stepNumber: 4, title: 'ஹெல்மெட்டை கழற்ற வேண்டாம்', instruction: 'சுவாசம் சரியாக இருக்கும் வரை ஹெல்மெட்டை கழற்றக் கூடாது. கழற்றினால் தண்டுவடம் பாதிக்கப்படலாம்.', illustrationType: 'helmet-rule' },
          { stepNumber: 5, title: 'ரத்தப்போக்கை நிறுத்த அழுத்தம் கொடுக்கவும்', instruction: 'காயங்களில் துணியால் அழுத்திப் பிடித்து ஆம்புலன்ஸ் வரும் வரை காத்திருக்கவும்.', illustrationType: 'direct-pressure' }
        ],
        thingsToAvoid: ['தீ விபத்து ஆபத்து இல்லையென்றால் வாகனத்திலிருந்து ஆளை இழுத்து வெளியேற்ற வேண்டாம்.', 'ஹெல்மெட்டை அஜாக்கிரதையாக கழற்ற வேண்டாம்.', 'தண்ணீர் கொடுக்க வேண்டாம்.'],
        whenToCallServices: ['சாலை விபத்து நடந்த உடனேயே 108 மற்றும் 112 அழைக்கவும்.']
      },
      hi: {
        title: 'सड़क दुर्घटना प्राथमिक उपचार (Road Accidents)',
        category: 'दुर्घटना और ट्रॉमा',
        summary: 'सड़क हादसे में सुरक्षा, गर्दन की रीढ़ की हड्डी की सुरक्षा और आपातकालीन मदद।',
        warningSigns: ['भीषण टक्कर या वाहन से बाहर गिरना', 'गर्दन या रीढ़ में चोट का संदेह', 'बेहोशी या अत्यधिक रक्तस्राव'],
        immediateActions: [
          { stepNumber: 1, title: 'स्थान को सुरक्षित बनाएं', instruction: 'अन्य वाहनों को सचेत करने के लिए खतरे का संकेत लगाएं।', illustrationType: 'road-safety' },
          { stepNumber: 2, title: 'तुरंत 112 और 108 पर कॉल करें', instruction: 'स्थान और घायलों की संख्या की सटीक जानकारी दें।', illustrationType: 'call-108' },
          { stepNumber: 3, title: 'गर्दन और सिर को बिल्कुल न हिलाएं', instruction: 'घायल के सिर को दोनों हाथों से सहारा देकर सीधा रखें ताकि रीढ़ की हड्डी सुरक्षित रहे।', illustrationType: 'c-spine' },
          { stepNumber: 4, title: 'हेलमेट न हटाएं', instruction: 'यदि घायल सांस ले रहा है, तो हेलमेट कभी न निकालें।', illustrationType: 'helmet-rule' },
          { stepNumber: 5, title: 'रक्तस्राव पर दबाव बनाएं', instruction: 'खून बहने वाली जगह पर साफ कपड़े से दबाकर रखें।', illustrationType: 'direct-pressure' }
        ],
        thingsToAvoid: ['आग लगने का खतरा न होने तक घायल को वाहन से जबरन बाहर न खींचें।', 'घायल को पानी न पिलाएं।'],
        whenToCallServices: ['सड़क दुर्घटना देखते ही तुरंत 108 और 112 पर कॉल करें।']
      },
      te: {
        title: 'రోడ్డు ప్రమాదాలు (Road Accidents)',
        category: 'ప్రమాదాలు & అత్యవసరం',
        summary: 'రోడ్డు ప్రమాదంలో ప్రాణాలను కాపాడే చర్యలు.',
        warningSigns: ['తీవ్రమైన రక్తస్రావం', 'మెడ లేదా వెన్నుపూస గాయాలు'],
        immediateActions: [
          { stepNumber: 1, title: 'ట్రాఫిక్‌ను హెచ్చరించండి', instruction: 'మరో ప్రమాదం జరగకుండా హెచ్చరిక బోర్డు పెట్టండి.', illustrationType: 'road-safety' },
          { stepNumber: 2, title: 'వెంటనే 108 కు కాల్ చేయండి', instruction: 'స్థలం మరియు క్షతగాత్రుల వివరాలు చెప్పండి.', illustrationType: 'call-108' },
          { stepNumber: 3, title: 'మెడను కదల్చవద్దు', instruction: 'తల మరియు మెడను నిటారుగా పట్టుకోండి.', illustrationType: 'c-spine' },
          { stepNumber: 4, title: 'హెల్మెట్ తీయవద్దు', instruction: 'శ్వాస ఆడుతుంటే హెల్మెట్ తీయవద్దు.', illustrationType: 'helmet-rule' }
        ],
        thingsToAvoid: ['ప్రమాద బాధితులను లాగవద్దు.', 'నీరు తాగించవద్దు.'],
        whenToCallServices: ['ప్రమాదం జరిగిన వెంటనే 108 కు కాల్ చేయండి.']
      },
      kn: {
        title: 'ರಸ್ತೆ ಅಪಘಾತಗಳು (Road Accidents)',
        category: 'ಅಪಘಾತ ತುರ್ತುಸ್ಥಿತಿ',
        summary: 'ರಸ್ತೆ ಅಪಘಾತವಾದಾಗ ಜೀವ ಉಳಿಸುವ ಕ್ರಮಗಳು.',
        warningSigns: ['ವಿಪರೀತ ರಕ್ತಸ್ರಾವ', 'ಕುತ್ತಿಗೆ ಅಥವಾ ಬೆನ್ನುಮೂಳೆ ಗಾಯ'],
        immediateActions: [
          { stepNumber: 1, title: 'ಸ್ಥಳವನ್ನು ಸುರಕ್ಷಿತಗೊಳಿಸಿ', instruction: 'ಇತರ ವಾಹನಗಳಿಗೆ ಎಚ್ಚರಿಕೆ ನೀಡಿ.', illustrationType: 'road-safety' },
          { stepNumber: 2, title: '108 ಮತ್ತು 112 ಕರೆ ಮಾಡಿ', instruction: 'ಸ್ಥಳದ ಮಾಹಿತಿ ತಿಳಿಸಿ.', illustrationType: 'call-108' },
          { stepNumber: 3, title: 'ಕುತ್ತಿಗೆಯನ್ನು ಅಲುಗಾಡಿಸಬೇಡಿ', instruction: 'ತಲೆಯನ್ನು ಎರಡೂ ಕೈಗಳಿಂದ ನೇರವಾಗಿ ಹಿಡಿಯಿರಿ.', illustrationType: 'c-spine' },
          { stepNumber: 4, title: 'ಹೆಲ್ಮೆಟ್ ತೆಗೆಯಬೇಡಿ', instruction: 'ಉಸಿರಾಟ ಸರಿಯಾಗಿದ್ದರೆ ಹೆಲ್ಮೆಟ್ ತೆಗೆಯಬೇಡಿ.', illustrationType: 'helmet-rule' }
        ],
        thingsToAvoid: ['ಬೆಂಕಿ ಬೀಳುವ ಅಪಾಯವಿಲ್ಲದಿದ್ದರೆ ವ್ಯಕ್ತಿಯನ್ನು ಹೊರಗೆ ಎಳೆಯಬೇಡಿ.'],
        whenToCallServices: ['ಅಪಘಾತವಾದ ತಕ್ಷಣ 108 ಕರೆ ಮಾಡಿ.']
      },
      ml: {
        title: 'റോഡപകടങ്ങൾ (Road Accidents)',
        category: 'അപകടങ്ങൾ',
        summary: 'റോഡപകടങ്ങളിൽ ജീവൻ രക്ഷിക്കാനുള്ള പ്രഥമ ശുശ്രൂഷാ രീതികൾ.',
        warningSigns: ['അമിത രക്തസ്രാവം', 'കഴുത്തിനോ നട്ടെല്ലിനോ പരിക്ക്'],
        immediateActions: [
          { stepNumber: 1, title: 'സ്ഥലം സുരക്ഷിതമാക്കുക', instruction: 'മറ്റു വാഹനങ്ങൾ തട്ടാതിരിക്കാൻ മുന്നറിയിപ്പ് നൽകുക.', illustrationType: 'road-safety' },
          { stepNumber: 2, title: '108 / 112 ലേക്ക് വിളിക്കുക', instruction: 'കൃത്യമായ സ്ഥലവിവരങ്ങൾ കൈമാറുക.', illustrationType: 'call-108' },
          { stepNumber: 3, title: 'കഴുത്ത് അനക്കാതെ വയ്ക്കുക', instruction: 'നട്ടെല്ലിന് ക്ഷതമേൽക്കാതിരിക്കാൻ തല അനക്കാതെ പിടിക്കുക.', illustrationType: 'c-spine' },
          { stepNumber: 4, title: 'ഹെൽമെറ്റ് ഊരരുത്', instruction: 'ശ്വാസമെടുക്കാൻ ബുദ്ധിമുട്ടില്ലെങ്കിൽ ഹെൽമെറ്റ് മാറ്റരുത്.', illustrationType: 'helmet-rule' }
        ],
        thingsToAvoid: ['തീപിടുത്ത ഭീഷണിയില്ലെങ്കിൽ വാഹനത്തിൽ നിന്ന് വലിച്ചിറക്കരുത്.'],
        whenToCallServices: ['അപകടം കണ്ടയുടൻ 108 ലേക്ക് വിളിക്കുക.']
      }
    }
  }
];

export const getLocalizedGuide = (guideId: string, lang: SupportedLanguage): LocalizedGuideContent | null => {
  const guide = FIRST_AID_GUIDES.find(g => g.id === guideId);
  if (!guide) return null;
  return guide.content[lang] || guide.content.en;
};
