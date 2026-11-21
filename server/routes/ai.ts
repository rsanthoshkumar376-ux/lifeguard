import { Router, Request, Response } from 'express';
import { 
  checkRateLimit, 
  validateUploadedDocument, 
  isGeminiConfigured,
  analyzeMedicalReportWithGemini,
  scanPrescriptionWithGemini,
  chatWithGemini,
  generateDoctorSummaryWithGemini 
} from '../services/geminiService';

export const aiRouter = Router();

// Middleware: Check rate limits per client IP
aiRouter.use((req: Request, res: Response, next) => {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown-client';
  const { allowed, remaining } = checkRateLimit(clientIp);
  
  res.setHeader('X-RateLimit-Remaining', remaining);
  if (!allowed) {
    return res.status(429).json({
      error: 'Rate limit exceeded. Please wait a moment before sending another request.',
      retryAfterSeconds: 60
    });
  }
  next();
});

// GET /api/ai/status - Health and config check
aiRouter.get('/status', (req: Request, res: Response) => {
  return res.json({
    status: 'ok',
    configured: isGeminiConfigured(),
    model: 'gemini-3.8-flash',
    features: [
      'multimodal-report-scanner',
      'prescription-scanner',
      'multilingual-health-chat',
      'doctor-summary'
    ]
  });
});

// POST /api/ai/chat - AI Health Chat
aiRouter.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, history, language } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A valid message string is required.' });
    }

    if (!isGeminiConfigured()) {
      return res.status(503).json({
        error: 'Gemini API is not configured on the server. Falling back to offline clinical heuristics.',
        fallbackRequired: true
      });
    }

    const result = await chatWithGemini(
      message,
      Array.isArray(history) ? history : [],
      typeof language === 'string' ? language : 'en'
    );

    return res.json(result);
  } catch (err: any) {
    console.error('AI Chat Route Error:', err);
    return res.status(500).json({
      error: err.message || 'Internal AI chat error',
      fallbackRequired: true
    });
  }
});

// POST /api/ai/analyze-report - Multimodal Lab Report Scanner
aiRouter.post('/analyze-report', async (req: Request, res: Response) => {
  try {
    const { fileBase64, mimeType, fileName, language } = req.body;

    if (!fileBase64 || !mimeType) {
      return res.status(400).json({ error: 'File data (fileBase64) and mimeType are required.' });
    }

    // Validate size and format
    const validation = validateUploadedDocument(fileBase64, mimeType);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    if (!isGeminiConfigured()) {
      return res.status(503).json({
        error: 'Gemini API is not configured on the server. Falling back to offline clinical analyzer.',
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
  } catch (err: any) {
    console.error('AI Report Scanner Route Error:', err);
    return res.status(500).json({
      error: err.message || 'Internal AI report scanner error',
      fallbackRequired: true
    });
  }
});

// POST /api/ai/scan-prescription - Multimodal Prescription Scanner
aiRouter.post('/scan-prescription', async (req: Request, res: Response) => {
  try {
    const { fileBase64, mimeType, fileName, language } = req.body;

    if (!fileBase64 || !mimeType) {
      return res.status(400).json({ error: 'File data (fileBase64) and mimeType are required.' });
    }

    // Validate size and format
    const validation = validateUploadedDocument(fileBase64, mimeType);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    if (!isGeminiConfigured()) {
      return res.status(503).json({
        error: 'Gemini API is not configured on the server. Falling back to offline prescription parser.',
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
  } catch (err: any) {
    console.error('AI Prescription Scanner Route Error:', err);
    return res.status(500).json({
      error: err.message || 'Internal AI prescription scanner error',
      fallbackRequired: true
    });
  }
});

// POST /api/ai/medical-summary - Doctor Consultation Summary
aiRouter.post('/medical-summary', async (req: Request, res: Response) => {
  try {
    const { reportData, language } = req.body;

    if (!reportData) {
      return res.status(400).json({ error: 'reportData string is required.' });
    }

    if (!isGeminiConfigured()) {
      return res.status(503).json({
        error: 'Gemini API is not configured on the server. Falling back to offline clinical summary.',
        fallbackRequired: true
      });
    }

    const summary = await generateDoctorSummaryWithGemini(
      reportData,
      language || 'en'
    );

    return res.json(summary);
  } catch (err: any) {
    console.error('AI Medical Summary Route Error:', err);
    return res.status(500).json({
      error: err.message || 'Internal AI medical summary error',
      fallbackRequired: true
    });
  }
});
