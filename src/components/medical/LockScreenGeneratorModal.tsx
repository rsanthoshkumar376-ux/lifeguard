import React, { useRef, useState, useEffect } from 'react';
import { Download, Sparkles, X, ShieldAlert, Check, RefreshCw, Eye, Sliders, Smartphone, HelpCircle } from 'lucide-react';

interface LockScreenGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  bloodGroup?: string;
  allergies?: string[];
  conditions?: string[];
  emergencyInstructions?: string;
  pandemicNote?: string;
  primaryContact?: string;
  qrValue?: string;
}

export const LockScreenGeneratorModal: React.FC<LockScreenGeneratorModalProps> = ({
  isOpen,
  onClose,
  patientName = 'Emergency Patient',
  bloodGroup = 'O+',
  allergies = ['No known medical allergies'],
  conditions = ['No critical chronic conditions'],
  emergencyInstructions = 'If found unconscious, do not move neck. Call emergency services immediately.',
  pandemicNote = '😷 PRECAUTION: Wear mask & gloves before contact. Call 108.',
  primaryContact = '+91 98765 43210',
  qrValue = typeof window !== 'undefined' ? `${window.location.origin}/emergency/view/active` : 'https://lifeguard-azure.vercel.app'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [themeStyle, setThemeStyle] = useState<'amoled' | 'redGradient' | 'navy'>('amoled');
  const [clockSafeOffset, setClockSafeOffset] = useState<number>(0); // 0 to 250px shift down
  const [showGuide, setShowGuide] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      renderWallpaper();
    }
  }, [isOpen, themeStyle, clockSafeOffset, patientName, bloodGroup, allergies, conditions, emergencyInstructions, pandemicNote, primaryContact, qrValue]);

  const renderWallpaper = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Standard phone lock screen resolution: 1080 x 2400 (20:9 ratio)
    const width = 1080;
    const height = 2400;
    canvas.width = width;
    canvas.height = height;

    // 1. Background Fill
    if (themeStyle === 'amoled') {
      ctx.fillStyle = '#05070B';
      ctx.fillRect(0, 0, width, height);

      // Ambient emergency red glow at bottom
      const gradient = ctx.createRadialGradient(width / 2, height - 300, 50, width / 2, height - 300, 700);
      gradient.addColorStop(0, 'rgba(220, 38, 38, 0.25)');
      gradient.addColorStop(1, 'rgba(5, 7, 11, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    } else if (themeStyle === 'redGradient') {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#110507');
      grad.addColorStop(0.5, '#450A0A');
      grad.addColorStop(1, '#991B1B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else {
      const grad = ctx.createLinearGradient(0, 0, 0, height);
      grad.addColorStop(0, '#020617');
      grad.addColorStop(0.6, '#0F172A');
      grad.addColorStop(1, '#1E293B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    }

    // 2. Lock Screen Clock Reserved Space Guide
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = '600 32px sans-serif';
    ctx.fillText('• EMERGENCY MEDICAL ID LOCK SCREEN •', width / 2, 140);

    // 3. Main Emergency Card Box (Shifted by clockSafeOffset)
    const cardX = 60;
    const cardY = 680 + clockSafeOffset;
    const cardW = width - 120;
    const cardH = 1460 - Math.min(clockSafeOffset, 150);
    const radius = 64;

    // Card Background with border
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, radius);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#DC2626';
    ctx.stroke();
    ctx.restore();

    // Red Header Banner on Card
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, 190, [radius, radius, 0, 0]);
    ctx.fillStyle = '#DC2626';
    ctx.fill();
    ctx.restore();

    // Card Banner Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 56px sans-serif';
    ctx.fillText('EMERGENCY MEDICAL ID', width / 2, cardY + 110);

    ctx.font = '700 30px sans-serif';
    ctx.fillStyle = '#FEF2F2';
    ctx.fillText('SCAN QR OR CALL CONTACTS WITHOUT UNLOCKING', width / 2, cardY + 160);

    // 4. Patient Name & Blood Group Badge
    const contentStartY = cardY + 270;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 66px sans-serif';
    ctx.fillText(patientName, width / 2, contentStartY);

    // Blood Badge pill
    const badgeW = 360;
    const badgeH = 110;
    const badgeX = (width - badgeW) / 2;
    const badgeY = contentStartY + 40;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 32);
    ctx.fillStyle = '#DC2626';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FCA5A5';
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 32px sans-serif';
    ctx.fillText('BLOOD GROUP', width / 2, badgeY + 44);
    ctx.font = '900 60px sans-serif';
    ctx.fillText(bloodGroup, width / 2, badgeY + 98);

    // 5. Scannable QR Code Placement
    const qrBoxSize = 520;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = badgeY + 170;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(qrBoxX, qrBoxY, qrBoxSize, qrBoxSize, 40);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#F87171';
    ctx.stroke();
    ctx.restore();

    // Render the QR code image into canvas
    const qrImg = new Image();
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=15&data=${encodeURIComponent(qrValue)}`;
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = qrApiUrl;
    qrImg.onload = () => {
      ctx.drawImage(qrImg, qrBoxX + 25, qrBoxY + 25, qrBoxSize - 50, qrBoxSize - 50);

      // Finish drawing text after QR code loads
      drawLowerDetails(ctx, width, qrBoxY + qrBoxSize + 50);
      setPreviewUrl(canvas.toDataURL('image/png'));
    };
    qrImg.onerror = () => {
      // Fallback placeholder if offline
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('[ SCANNABLE QR CODE ]', width / 2, qrBoxY + qrBoxSize / 2);
      drawLowerDetails(ctx, width, qrBoxY + qrBoxSize + 50);
      setPreviewUrl(canvas.toDataURL('image/png'));
    };
  };

  const drawLowerDetails = (ctx: CanvasRenderingContext2D, width: number, startY: number) => {
    // 6. Allergies & Critical Conditions Banner
    const allergyText = (allergies && allergies.length > 0) ? allergies.slice(0, 2).join(', ') : 'No known drug allergies';
    const noticeBoxW = width - 240;
    const noticeBoxH = 170;
    const noticeBoxX = 120;
    const noticeBoxY = startY;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(noticeBoxX, noticeBoxY, noticeBoxW, noticeBoxH, 28);
    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#F59E0B';
    ctx.stroke();
    ctx.restore();

    ctx.textAlign = 'left';
    ctx.fillStyle = '#FBBF24';
    ctx.font = '900 30px sans-serif';
    ctx.fillText('⚠️ CRITICAL ALLERGIES & ALERTS', noticeBoxX + 32, noticeBoxY + 48);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '700 28px sans-serif';
    ctx.fillText(`Allergies: ${allergyText.substring(0, 42)}`, noticeBoxX + 32, noticeBoxY + 95);

    ctx.fillStyle = '#E2E8F0';
    ctx.font = '600 24px sans-serif';
    ctx.fillText(pandemicNote.substring(0, 52), noticeBoxX + 32, noticeBoxY + 140);

    // 7. Emergency Contacts & National Helpline
    const contactY = noticeBoxY + noticeBoxH + 55;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94A3B8';
    ctx.font = '700 28px sans-serif';
    ctx.fillText('PRIMARY EMERGENCY CONTACT', width / 2, contactY);

    ctx.fillStyle = '#38BDF8';
    ctx.font = '900 50px sans-serif';
    ctx.fillText(`📞 ${primaryContact}`, width / 2, contactY + 60);

    ctx.fillStyle = '#F87171';
    ctx.font = '800 34px sans-serif';
    ctx.fillText('🚑 DIAL 108 (AMBULANCE) • 112 (NATIONAL EMERGENCY)', width / 2, contactY + 120);

    // 8. Footer Brand
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '600 24px sans-serif';
    ctx.fillText('LifeGuard Emergency Medical Network • Zero Unlock Required', width / 2, 2320);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    const link = document.createElement('a');
    link.download = `lifeguard_emergency_lockscreen_${themeStyle}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      setShowGuide(true);
      setTimeout(() => setDownloadSuccess(false), 4000);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          >
            ✕
          </button>

          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <Sparkles size={22} className="text-amber-300" />
            1080×2400 Lock Screen Wallpaper Generator
          </h2>
          <p className="text-xs text-red-100 mt-0.5">
            Guarantees your Medical QR & Blood Group are visible without unlocking your phone
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-gray-800 dark:text-gray-200">
          
          {/* Theme Selector */}
          <div>
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block mb-2">
              Select Wallpaper Theme:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'amoled', name: '🖤 AMOLED Black', desc: 'Battery saver' },
                { id: 'redGradient', name: '🚨 Emergency Red', desc: 'High visibility' },
                { id: 'navy', name: '🛡️ Medical Navy', desc: 'Modern dark' }
              ].map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => setThemeStyle(theme.id as any)}
                  className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                    themeStyle === theme.id
                      ? 'border-red-600 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold ring-2 ring-red-500/20'
                      : 'border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div className="text-xs font-black">{theme.name}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{theme.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Clock Safe Area Offset Adjustment Slider */}
          <div className="bg-gray-50 dark:bg-slate-800/40 p-3.5 rounded-2xl border border-gray-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                <Sliders size={14} className="text-red-500" />
                Clock Safe-Area Adjustment:
              </span>
              <span className="text-red-600 dark:text-red-400 font-mono">
                {clockSafeOffset === 0 ? 'Standard (Top Clock)' : `+${clockSafeOffset}px Down`}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="200"
              step="20"
              value={clockSafeOffset}
              onChange={(e) => setClockSafeOffset(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600"
            />
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              Slide down if your phone has a large centered clock widget to prevent overlapping.
            </p>
          </div>

          {/* Canvas Live Preview Card */}
          <div className="rounded-2xl border border-gray-200 dark:border-slate-800 bg-black/95 p-3 flex flex-col items-center justify-center shadow-inner relative group">
            <canvas
              ref={canvasRef}
              className="w-48 sm:w-56 h-auto rounded-xl shadow-2xl border border-white/20 transition-transform group-hover:scale-[1.02]"
            />
            <div className="mt-2 text-center text-[10px] text-gray-400 font-semibold">
              Preview • Full 1080 × 2400 HD Render
            </div>
          </div>

          {/* Download Action */}
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 active:scale-95 transition-all cursor-pointer"
          >
            {downloadSuccess ? (
              <>
                <Check size={18} />
                Downloaded! Check Gallery
              </>
            ) : (
              <>
                <Download size={18} />
                Download 1080×2400 HD Wallpaper
              </>
            )}
          </button>

          {/* Android Setting Guide Box */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 space-y-1.5">
            <span className="font-bold flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300">
              <Smartphone size={15} /> How to set on Android in 10 seconds:
            </span>
            <ol className="list-decimal list-inside space-y-1 text-[11px] leading-relaxed text-emerald-900 dark:text-emerald-300">
              <li>Tap the download button above to save the image.</li>
              <li>Open your phone's <strong>Gallery / Photos</strong> and tap the downloaded image.</li>
              <li>Tap <strong>More (three dots) $\rightarrow$ Set as Wallpaper $\rightarrow$ Lock Screen only</strong>.</li>
              <li>Now your Emergency QR & Blood Group are visible immediately whenever your screen wakes up!</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockScreenGeneratorModal;
