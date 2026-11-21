import { GoogleGenAI } from '@google/genai';

/**
 * Server-Side Gemini Multimodal AI Service for LifeGuard
 * 
 * Safety Rules:
 * 1. Never provide definitive diagnoses.
 * 2. Never independently prescribe or alter medications.
 * 3. Never claim that a report proves a disease.
 * 4. Recommend urgent medical assessment (108/112) for potentially serious symptoms.
 * 5. Do not delay emergency care to perform AI analysis.
 * 6. Never invent unreadable medicine names.
 */

// Initialize Google GenAI client if API key is present
const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
let genAiClient: GoogleGenAI | null = null;

if (apiKey) {
  try {
    genAiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI client:', err);
  }
}

export function isGeminiConfigured(): boolean {
  return !!apiKey && !!genAiClient;
}

// -------------------------------------------------------------
// RATE LIMITER (In-Memory Sliding Window)
// -------------------------------------------------------------
const requestLog: Map<string, number[]> = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 30; // 30 requests per minute per IP

export function checkRateLimit(clientIp: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const timestamps = requestLog.get(clientIp) || [];
  
  // Filter out timestamps older than window
  const validTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  
  if (validTimestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    requestLog.set(clientIp, validTimestamps);
    return { allowed: false, remaining: 0 };
  }
  
  validTimestamps.push(now);
  requestLog.set(clientIp, validTimestamps);
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - validTimestamps.length };
}

// -------------------------------------------------------------
// DOCUMENT VALIDATION
// -------------------------------------------------------------
export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp'
];

export function validateUploadedDocument(fileBase64: string, mimeType: string): { valid: boolean; error?: string } {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return { valid: false, error: `Unsupported document format (${mimeType}). Please upload PDF, JPEG, PNG, or WEBP.` };
  }

  // Calculate approximate byte size from base64 string
  const stringLength = fileBase64.replace(/^data:[^;]+;base64,/, '').length;
  const sizeInBytes = Math.ceil((stringLength * 3) / 4);

  if (sizeInBytes > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `Document exceeds maximum allowed size of 10MB (${(sizeInBytes / (1024 * 1024)).toFixed(1)}MB).` };
  }

  return { valid: true };
}

// -------------------------------------------------------------
// CLINICAL SAFETY SYSTEM PROMPT
// -------------------------------------------------------------
const CLINICAL_SAFETY_INSTRUCTIONS = `
You are the LifeGuard Clinical AI Healthcare Assistant.
You assist Indian citizens, patients, and caregivers with health education, first aid guidance, medical report interpretation, and doctor appointment preparation.

MANDATORY SAFETY AND ETHICAL GUARDRAILS:
1. NEVER PROVIDE A DEFINITIVE MEDICAL DIAGNOSIS. Frame all findings as "potential clinical considerations" or "educational observations" that require physician verification.
2. NEVER INDEPENDENTLY PRESCRIBE, ADJUST, OR ALTER MEDICATION DOSAGES. Advise patients to consult their licensed prescribing physician before making any pharmaceutical changes.
3. NEVER CLAIM THAT A LAB REPORT PROVES A SPECIFIC DISEASE. Multiple physiological, dietary, and temporary factors can influence lab values.
4. URGENT TRIAGE: For severe red-flag symptoms (e.g., crushing chest pain, sudden unilateral numbness/paralysis, acute breathing distress, anaphylaxis, massive blood loss, unresponsiveness), immediately advise calling 108 (Ambulance) or 112 (National Emergency hotline) or proceeding to the nearest emergency room.
5. DO NOT DELAY EMERGENCY CARE: Clearly state that AI analysis must never delay emergency hospital dispatch or life-saving first-aid measures.
6. PRESCRIPTION SCANNING: Extract only clearly visible medicine names and dosages. If handwriting is illegible, smudged, or ambiguous, you MUST explicitly flag it as uncertain or unreadable (e.g., "[Unclear Handwriting - Verify with Pharmacist]"). NEVER invent or guess unreadable medication names.
7. LANGUAGE: Respond natively in the requested language (English, Tamil, Hindi, Telugu, Kannada, or Malayalam) with clear, compassionate, and culturally sensitive explanations.
`;

// -------------------------------------------------------------
// INTERFACES
// -------------------------------------------------------------
export interface ExtractedLabTest {
  testName: string;
  measuredValue: string;
  unit: string;
  referenceRange: string;
  status: 'NORMAL' | 'LOW' | 'HIGH' | 'CRITICAL';
  confidence: 'HIGH' | 'MEDIUM' | 'UNCERTAIN';
  uncertaintyReason?: string;
  whatItMeasures: string;
  clinicalDifferenceExplanation: string;
}

export interface ExtractedPrescriptionMed {
  medicineName: string;
  dosage: string;
  frequency: string;
  duration: string;
  timing: string;
  instructions: string;
  isUncertain: boolean;
  uncertaintyNotes?: string;
}

export interface MedicalReportAnalysisResult {
  reportTitle: string;
  reportDate?: string;
  patientName?: string;
  detectedBloodGroup?: string;
  overallRiskLevel: 'NORMAL' | 'MODERATE' | 'URGENT' | 'CRITICAL';
  summaryVerdict: string;
  simpleLanguageExplanation: string;
  tests: ExtractedLabTest[];
  questionsForDoctor: string[];
  lifestyleAndPrecautions: string[];
  disclaimer: string;
  rawConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface PrescriptionScanResult {
  prescribingDoctor?: string;
  clinicOrHospital?: string;
  prescriptionDate?: string;
  medications: ExtractedPrescriptionMed[];
  generalInstructions: string[];
  unclearHandwritingWarnings: string[];
  doctorVerificationAdvised: boolean;
  disclaimer: string;
}

export interface ChatInteractionResult {
  text: string;
  language: string;
  triageLevel: 'INFO' | 'MODERATE' | 'URGENT' | 'CRITICAL_EMERGENCY';
  actionSuggestions: Array<{
    label: string;
    actionType: 'call_emergency' | 'view_blood_requests' | 'nearby_hospitals' | 'upload_report' | 'sos' | 'open_prescription';
    payload?: string;
  }>;
}

// -------------------------------------------------------------
// CORE GEMINI API IMPLEMENTATIONS
// -------------------------------------------------------------

/**
 * Multimodal Medical Report Analysis using Gemini 3.8 Flash
 */
export async function analyzeMedicalReportWithGemini(
  fileBase64: string,
  mimeType: string,
  fileName: string,
  language: string = 'en'
): Promise<MedicalReportAnalysisResult> {
  if (!genAiClient) {
    throw new Error('Gemini API is not configured on the server.');
  }

  const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');

  const prompt = `
Analyze this uploaded clinical laboratory or diagnostic report (${fileName}) for a patient in India.
Provide output in ${language === 'ta' ? 'Tamil (தமிழ்)' : language === 'hi' ? 'Hindi (हिंदी)' : language === 'te' ? 'Telugu (తెలుగు)' : language === 'kn' ? 'Kannada (ಕನ್ನಡ)' : language === 'ml' ? 'Malayalam (മലയാളം)' : 'English'}.

CRITICAL TASKS:
1. Extract every visible laboratory test name, measured value, units, and printed reference range.
2. Categorize status: NORMAL, LOW, HIGH, or CRITICAL.
3. If handwriting is illegible, numbers are smudged, or print quality is degraded, set confidence to "UNCERTAIN" and explain why.
4. Explain medical terminology in simple, friendly layman terms.
5. Detail what each test measures and explain the difference between the patient's result and the normal reference range.
6. Suggest 4-6 specific, informed questions the patient can ask their attending doctor during their consultation.
7. Include practical lifestyle or dietary precautions where appropriate.
8. Enforce all AI safety rules: never provide definitive diagnoses; advise consulting a physician.

Return ONLY a valid JSON object matching this schema without markdown code blocks:
{
  "reportTitle": "string",
  "reportDate": "string",
  "patientName": "string or undefined",
  "detectedBloodGroup": "string or undefined (e.g. O+, B-)",
  "overallRiskLevel": "NORMAL" | "MODERATE" | "URGENT" | "CRITICAL",
  "summaryVerdict": "string (concise 1-2 sentence overview)",
  "simpleLanguageExplanation": "string (multi-paragraph friendly explanation of what this report means)",
  "tests": [
    {
      "testName": "string",
      "measuredValue": "string",
      "unit": "string",
      "referenceRange": "string",
      "status": "NORMAL" | "LOW" | "HIGH" | "CRITICAL",
      "confidence": "HIGH" | "MEDIUM" | "UNCERTAIN",
      "uncertaintyReason": "string or null",
      "whatItMeasures": "string",
      "clinicalDifferenceExplanation": "string"
    }
  ],
  "questionsForDoctor": ["string", "string"],
  "lifestyleAndPrecautions": ["string", "string"],
  "disclaimer": "This analysis is generated by AI for educational purposes only. Never delay emergency hospital care or alter medications without direct physician advice.",
  "rawConfidence": "HIGH" | "MEDIUM" | "LOW"
}
`;

  try {
    const response = await genAiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: CLINICAL_SAFETY_INSTRUCTIONS },
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType
              }
            },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as MedicalReportAnalysisResult;
  } catch (err: any) {
    console.error('Gemini report analysis error:', err);
    throw new Error(err?.message || 'Failed to analyze report with Gemini API');
  }
}

/**
 * Multimodal Prescription Scanner using Gemini 3.8 Flash
 */
export async function scanPrescriptionWithGemini(
  fileBase64: string,
  mimeType: string,
  fileName: string,
  language: string = 'en'
): Promise<PrescriptionScanResult> {
  if (!genAiClient) {
    throw new Error('Gemini API is not configured on the server.');
  }

  const cleanBase64 = fileBase64.replace(/^data:[^;]+;base64,/, '');

  const prompt = `
Analyze this doctor's prescription slip or medical note (${fileName}).
Language context: ${language}.

CRITICAL CLINICAL PHARMACY SAFETY RULES:
1. Extract medicine names, visible dosages (e.g. 500mg, 1 tablet), frequencies (e.g. 1-0-1, twice daily), and durations (e.g. 5 days, 1 month).
2. If handwriting is illegible, smudged, or ambiguous, you MUST mark isUncertain: true and provide uncertaintyNotes explaining the ambiguity.
3. NEVER INVENT OR GUESS UNREADABLE MEDICINE NAMES. If unreadable, use "[Unclear Handwriting - Pharmacist Clarification Required]".
4. Extract attending physician name and clinic/hospital if visible.
5. Extract general instructions (e.g., take with food, drink plenty of water).

Return ONLY a valid JSON object matching this schema without markdown code blocks:
{
  "prescribingDoctor": "string or undefined",
  "clinicOrHospital": "string or undefined",
  "prescriptionDate": "string or undefined",
  "medications": [
    {
      "medicineName": "string",
      "dosage": "string",
      "frequency": "string",
      "duration": "string",
      "timing": "string (before_meal, with_meal, after_meal, anytime)",
      "instructions": "string",
      "isUncertain": boolean,
      "uncertaintyNotes": "string or null"
    }
  ],
  "generalInstructions": ["string"],
  "unclearHandwritingWarnings": ["string"],
  "doctorVerificationAdvised": true,
  "disclaimer": "AI-extracted prescription details must always be verified with a registered pharmacist before taking any medication."
}
`;

  try {
    const response = await genAiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: CLINICAL_SAFETY_INSTRUCTIONS },
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType
              }
            },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as PrescriptionScanResult;
  } catch (err: any) {
    console.error('Gemini prescription scan error:', err);
    throw new Error(err?.message || 'Failed to scan prescription with Gemini API');
  }
}

/**
 * Multilingual AI Health Chat using Gemini 3.8 Flash
 */
export async function chatWithGemini(
  userQuery: string,
  history: Array<{ sender: 'user' | 'bot'; text: string }>,
  language: string = 'en'
): Promise<ChatInteractionResult> {
  if (!genAiClient) {
    throw new Error('Gemini API is not configured on the server.');
  }

  const langInstruction = language === 'ta'
    ? 'Respond natively in Tamil (தமிழ்).'
    : language === 'hi'
    ? 'Respond natively in Hindi (हिंदी).'
    : language === 'te'
    ? 'Respond natively in Telugu (తెలుగు).'
    : language === 'kn'
    ? 'Respond natively in Kannada (ಕನ್ನಡ).'
    : language === 'ml'
    ? 'Respond natively in Malayalam (മലയാളം).'
    : 'Respond in clear, accessible English.';

  const formattedHistory = history.slice(-6).map(m => ({
    role: m.sender === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }]
  }));

  const prompt = `
${CLINICAL_SAFETY_INSTRUCTIONS}

USER PREFERRED LANGUAGE: ${langInstruction}
USER QUERY: "${userQuery}"

Provide a structured, helpful, compassionate response.
If the query indicates an acute life-threatening emergency, classify triageLevel as "CRITICAL_EMERGENCY" and prominently emphasize calling 108 / 112 immediately.
If it involves moderate clinical concern, classify as "MODERATE" or "URGENT".
Otherwise classify as "INFO".

Suggest relevant quick actions:
- call_emergency (if severe)
- nearby_hospitals
- upload_report
- sos
- open_prescription

Return ONLY a valid JSON object matching this schema:
{
  "text": "markdown formatted response text with headings, bullet points, and safety advice",
  "language": "${language}",
  "triageLevel": "INFO" | "MODERATE" | "URGENT" | "CRITICAL_EMERGENCY",
  "actionSuggestions": [
    { "label": "string", "actionType": "call_emergency" | "nearby_hospitals" | "upload_report" | "sos" | "open_prescription" }
  ]
}
`;

  try {
    const response = await genAiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        ...formattedHistory,
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned) as ChatInteractionResult;
  } catch (err: any) {
    console.error('Gemini chat error:', err);
    throw new Error(err?.message || 'Failed to generate chat response with Gemini API');
  }
}

/**
 * Synthesize Uploaded Reports into a Doctor Consultation Summary
 */
export async function generateDoctorSummaryWithGemini(
  reportData: string,
  language: string = 'en'
): Promise<{ summaryHtml: string; summaryMarkdown: string; keyBulletPoints: string[] }> {
  if (!genAiClient) {
    throw new Error('Gemini API is not configured on the server.');
  }

  const prompt = `
Synthesize the following diagnostic report findings into an executive Clinical Consultation Summary for an attending physician.
Target Language: ${language}.

Report Findings:
${reportData}

Requirements:
1. Executive Clinical Overview for the Doctor.
2. Highlighted Abnormal Markers with deviation magnitude.
3. Physiological Systems Affected.
4. Potential Questions / Clarifications to Discuss during Consultation.
5. Format in clean Markdown suitable for printing or doctor review.

Return ONLY a valid JSON object matching this schema:
{
  "summaryMarkdown": "string",
  "keyBulletPoints": ["string", "string"],
  "summaryHtml": "string (minimal clean html)"
}
`;

  try {
    const response = await genAiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: CLINICAL_SAFETY_INSTRUCTIONS },
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    const text = response.text || '';
    const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
    return JSON.parse(cleaned);
  } catch (err: any) {
    console.error('Gemini doctor summary error:', err);
    throw new Error(err?.message || 'Failed to generate summary with Gemini API');
  }
}
