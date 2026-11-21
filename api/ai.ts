import { 
  checkRateLimit, 
  validateUploadedDocument, 
  isGeminiConfigured,
  analyzeMedicalReportWithGemini,
  scanPrescriptionWithGemini,
  chatWithGemini,
  generateDoctorSummaryWithGemini 
} from '../server/services/geminiService';

/**
 * Vercel Serverless Function entry point for LifeGuard Gemini AI Endpoints
 * Supports:
 * - POST /api/ai?action=chat or /api/ai/chat
 * - POST /api/ai?action=analyze-report or /api/ai/analyze-report
 * - POST /api/ai?action=scan-prescription or /api/ai/scan-prescription
 * - POST /api/ai?action=medical-summary or /api/ai/medical-summary
 * - GET /api/ai/status or /api/ai?action=status
 */
export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Rate Limiter Check
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown-client';
  const { allowed, remaining } = checkRateLimit(clientIp);
  res.setHeader('X-RateLimit-Remaining', remaining);

  if (!allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait a moment before sending another request.',
      retryAfterSeconds: 60
    });
  }

  const url = req.url || '';
  const action = req.query?.action || (url.includes('/analyze-report') ? 'analyze-report' :
    url.includes('/scan-prescription') ? 'scan-prescription' :
    url.includes('/medical-summary') ? 'medical-summary' :
    url.includes('/chat') ? 'chat' :
    url.includes('/status') ? 'status' : req.body?.action || 'status');

  if (action === 'status' || req.method === 'GET') {
    return res.json({
      status: 'ok',
      configured: isGeminiConfigured(),
      model: 'gemini-3.8-flash',
      serverless: true,
      features: [
        'multimodal-report-scanner',
        'prescription-scanner',
        'multilingual-health-chat',
        'doctor-summary'
      ]
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (action === 'chat') {
      const { message, history, language } = req.body;
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'A valid message string is required.' });
      }

      if (!isGeminiConfigured()) {
        return res.status(503).json({
          error: 'Gemini API key is not configured in server environment. Falling back to offline clinical heuristics.',
          fallbackRequired: true
        });
      }

      const result = await chatWithGemini(
        message,
        Array.isArray(history) ? history : [],
        typeof language === 'string' ? language : 'en'
      );
      return res.json(result);
    }

    if (action === 'analyze-report') {
      const { fileBase64, mimeType, fileName, language } = req.body;
      if (!fileBase64 || !mimeType) {
        return res.status(400).json({ error: 'File data (fileBase64) and mimeType are required.' });
      }

      const validation = validateUploadedDocument(fileBase64, mimeType);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      if (!isGeminiConfigured()) {
        return res.status(503).json({
          error: 'Gemini API key is not configured in server environment. Falling back to offline clinical analyzer.',
          fallbackRequired: true
        });
      }

      const analysis = await analyzeMedicalReportWithGemini(
        fileBase64,
        mimeType,
        fileName || 'Medical_Report.pdf',
        language || 'en'
      );
      return res.json(analysis);
    }

    if (action === 'scan-prescription') {
      const { fileBase64, mimeType, fileName, language } = req.body;
      if (!fileBase64 || !mimeType) {
        return res.status(400).json({ error: 'File data (fileBase64) and mimeType are required.' });
      }

      const validation = validateUploadedDocument(fileBase64, mimeType);
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error });
      }

      if (!isGeminiConfigured()) {
        return res.status(503).json({
          error: 'Gemini API key is not configured in server environment. Falling back to offline prescription parser.',
          fallbackRequired: true
        });
      }

      const prescription = await scanPrescriptionWithGemini(
        fileBase64,
        mimeType,
        fileName || 'Prescription.jpg',
        language || 'en'
      );
      return res.json(prescription);
    }

    if (action === 'medical-summary') {
      const { reportData, language } = req.body;
      if (!reportData) {
        return res.status(400).json({ error: 'reportData string is required.' });
      }

      if (!isGeminiConfigured()) {
        return res.status(503).json({
          error: 'Gemini API key is not configured in server environment. Falling back to offline clinical summary.',
          fallbackRequired: true
        });
      }

      const summary = await generateDoctorSummaryWithGemini(
        reportData,
        language || 'en'
      );
      return res.json(summary);
    }

    return res.status(400).json({ error: `Unknown action: ${action}` });
  } catch (err: any) {
    console.error('Vercel API error:', err);
    return res.status(500).json({
      error: err.message || 'Server error',
      fallbackRequired: true
    });
  }
}
