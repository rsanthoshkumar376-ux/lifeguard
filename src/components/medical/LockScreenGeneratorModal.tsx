import React, { useRef, useState, useEffect } from 'react';
import { Download, Sparkles, X, ShieldAlert, Check, RefreshCw, Eye } from 'lucide-react';

interface LockScreenGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName?: string;
  bloodGroup?: string;
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
  emergencyInstructions = 'If found unconscious, do not move neck. Call emergency services immediately.',
  pandemicNote = '😷 PRECAUTION: Wear mask & gloves before contact. Patient has chronic asthma.',
  primaryContact = '+91 98765 43210',
  qrValue = typeof window !== 'undefined' ? `${window.location.origin}/emergency/view?token=active` : 'https://lifeguard-azure.vercel.app'
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [themeStyle, setThemeStyle] = useState<'amoled' | 'redGradient' | 'navy'>('amoled');

  useEffect(() => {
    if (isOpen) {
      renderWallpaper();
    }
  }, [isOpen, themeStyle, patientName, bloodGroup, emergencyInstructions, pandemicNote, primaryContact, qrValue]);

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

      // Subtle ambient emergency red glow at bottom
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
    // Most phones place clock between Y=180 and Y=600.
    // We leave this area clean, with a subtle header.
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.font = '600 32px sans-serif';
    ctx.fillText('• EMERGENCY MEDICAL ID LOCK SCREEN •', width / 2, 140);

    // 3. Main Emergency Card Box (Y=720 to Y=2100)
    const cardX = 60;
    const cardY = 680;
    const cardW = width - 120;
    const cardH = 1480;
    const radius = 64;

    // Card Background with border
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, radius);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#DC2626';
    ctx.stroke();
    ctx.restore();

    // Red Header Banner on Card
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, 200, [radius, radius, 0, 0]);
    ctx.fillStyle = '#DC2626';
    ctx.fill();
    ctx.restore();

    // Card Banner Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 58px sans-serif';
    ctx.fillText('EMERGENCY MEDICAL ID', width / 2, cardY + 115);

    ctx.font = '700 32px sans-serif';
    ctx.fillStyle = '#FEF2F2';
    ctx.fillText('SCAN QR OR CALL CONTACTS WITHOUT UNLOCKING', width / 2, cardY + 168);

    // 4. Patient Name & Blood Group Badge
    const contentStartY = cardY + 280;

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 68px sans-serif';
    ctx.fillText(patientName, width / 2, contentStartY);

    // Blood Badge pill
    const badgeW = 380;
    const badgeH = 120;
    const badgeX = (width - badgeW) / 2;
    const badgeY = contentStartY + 45;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 36);
    ctx.fillStyle = '#DC2626';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FCA5A5';
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 36px sans-serif';
    ctx.fillText('BLOOD GROUP', width / 2, badgeY + 48);
    ctx.font = '900 64px sans-serif';
    ctx.fillText(bloodGroup, width / 2, badgeY + 106);

    // 5. Scannable QR Code Placement
    // Draw QR white background box
    const qrBoxSize = 540;
    const qrBoxX = (width - qrBoxSize) / 2;
    const qrBoxY = badgeY + 180;

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
    // We create a temporary SVG image from qrcode
    const qrImg = new Image();
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=480x480&margin=15&data=${encodeURIComponent(qrValue)}`;
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = qrApiUrl;
    qrImg.onload = () => {
      ctx.drawImage(qrImg, qrBoxX + 30, qrBoxY + 30, qrBoxSize - 60, qrBoxSize - 60);

      // Finish drawing text after QR code loads
      drawLowerDetails(ctx, width, qrBoxY + qrBoxSize + 60);
      setPreviewUrl(canvas.toDataURL('image/png'));
    };
    qrImg.onerror = () => {
      // Fallback placeholder if offline
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('[ SCANNABLE QR CODE ]', width / 2, qrBoxY + qrBoxSize / 2);
      drawLowerDetails(ctx, width, qrBoxY + qrBoxSize + 60);
      setPreviewUrl(canvas.toDataURL('image/png'));
    };
  };

  const drawLowerDetails = (ctx: CanvasRenderingContext2D, width: number, startY: number) => {
    // 6. Stranger & Pandemic Precaution Notice Box
    const noticeBoxW = width - 240;
    const noticeBoxH = 190;
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
    ctx.font = '900 32px sans-serif';
    ctx.fillText('⚠️ NOTICE FOR FIRST RESPONDERS', noticeBoxX + 32, noticeBoxY + 50);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 28px sans-serif';
    // Wrap pandemic note
    wrapText(ctx, pandemicNote, noticeBoxX + 32, noticeBoxY + 95, noticeBoxW - 64, 40);

    // 7. Emergency Contacts & National Helpline
    const contactY = noticeBoxY + noticeBoxH + 60;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#94A3B8';
    ctx.font = '700 30px sans-serif';
    ctx.fillText('PRIMARY EMERGENCY CONTACT', width / 2, contactY);

    ctx.fillStyle = '#38BDF8';
    ctx.font = '900 52px sans-serif';
    ctx.fillText(`📞 ${primaryContact}`, width / 2, contactY + 65);

    ctx.fillStyle = '#F87171';
    ctx.font = '800 36px sans-serif';
    ctx.fillText('🚑 DIAL 108 (AMBULANCE) • 112 (NATIONAL EMERGENCY)', width / 2, contactY + 130);

    // 8. Footer Brand
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '600 26px sans-serif';
    ctx.fillText('LifeGuard Emergency Medical Network • Offline & Scannable', width / 2, 2300);
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setDownloading(true);

    const link = document.createElement('a');
    link.download = `LifeGuard_Emergency_LockScreen_${patientName.replace(/\s+/g, '_')}.png`;
    link.href = canvas.toDataURL('image/png');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloading(false);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 5000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={18} className="text-amber-300" />
            <span className="text-[11px] font-black uppercase tracking-widest text-amber-200">
              ZERO-PASSWORD ACCESS
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <span>📱</span> 1-Click HD Lock Screen Wallpaper
          </h2>
          <p className="text-xs text-red-100 mt-1">
            Generates a high-definition wallpaper with your QR Code & Emergency details. Visible to anyone with 0 touches or passwords!
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1 text-gray-800 dark:text-gray-200">
          
          {/* Theme Style Selector */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
              Choose Style Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setThemeStyle('amoled')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                  themeStyle === 'amoled'
                    ? 'border-red-600 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400'
                    : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                🖤 AMOLED Black
              </button>
              <button
                type="button"
                onClick={() => setThemeStyle('redGradient')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                  themeStyle === 'redGradient'
                    ? 'border-red-600 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400'
                    : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                🚨 Emergency Red
              </button>
              <button
                type="button"
                onClick={() => setThemeStyle('navy')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-all cursor-pointer ${
                  themeStyle === 'navy'
                    ? 'border-red-600 bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400'
                    : 'border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'
                }`}
              >
                🛡️ Medical Navy
              </button>
            </div>
          </div>

          {/* Interactive Live Wallpaper Preview */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-slate-700 shadow-xl bg-slate-950 flex flex-col items-center justify-center p-3 max-h-[380px]">
            {previewUrl ? (
              <img 
                src={previewUrl} 
                alt="Emergency Wallpaper Preview" 
                className="max-h-[350px] w-auto rounded-xl object-contain shadow-2xl" 
              />
            ) : (
              <div className="py-20 flex flex-col items-center gap-2 text-slate-400">
                <RefreshCw size={28} className="animate-spin text-red-500" />
                <span className="text-xs font-bold">Rendering HD Emergency Wallpaper...</span>
              </div>
            )}
            <div className="absolute top-5 right-5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] text-white font-bold flex items-center gap-1">
              <Eye size={12} /> Live Preview
            </div>
          </div>

          {/* Hidden Canvas for generation */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Direct Download Action Button */}
          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="w-full py-3.5 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white rounded-2xl font-black text-sm shadow-lg shadow-red-900/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer disabled:opacity-60"
          >
            <Download size={18} />
            <span>Download HD Lock Screen Wallpaper (Free)</span>
          </button>

          {downloadSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <Check size={16} className="text-emerald-600 shrink-0" />
              <span>Wallpaper downloaded! Follow the 2-step setup below to set it.</span>
            </div>
          )}

          {/* Easy 2-Step Phone Setup Guide */}
          <div className="bg-gray-50 dark:bg-slate-800/70 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 space-y-2 text-xs">
            <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <span>📲</span> How to Set in 5 Seconds:
            </h4>
            <ol className="list-decimal list-inside space-y-1 text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
              <li>Open your phone's <strong>Photos / Gallery</strong> app.</li>
              <li>Tap the downloaded wallpaper image.</li>
              <li>Tap the <strong>three dots (⋮)</strong> or <strong>Share</strong> &gt; Select <strong>"Set as Lock screen wallpaper"</strong>.</li>
            </ol>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold pt-1">
              ✅ Done! Your Medical QR, Blood Group ({bloodGroup}), and emergency contacts will be visible to everyone on your locked screen without needing any password.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 bg-gray-50 dark:bg-slate-950 border-t border-gray-100 dark:border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2 bg-gray-200 dark:bg-slate-800 hover:bg-gray-300 text-gray-800 dark:text-gray-200 rounded-xl font-bold text-xs active:scale-95 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

export default LockScreenGeneratorModal;
