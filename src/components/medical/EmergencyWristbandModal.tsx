import React, { useRef, useState, useEffect } from 'react';
import { Download, Printer, X, CreditCard, Shield, PhoneCall, Check, Sparkles } from 'lucide-react';

interface EmergencyWristbandModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientName: string;
  bloodGroup: string;
  allergies: string[];
  conditions: string[];
  emergencyInstructions?: string;
  organDonor?: boolean;
  primaryContact: string;
  contactName: string;
  publicUrl: string;
}

export const EmergencyWristbandModal: React.FC<EmergencyWristbandModalProps> = ({
  isOpen,
  onClose,
  patientName = 'Emergency Patient',
  bloodGroup = 'O+',
  allergies = ['No known medical allergies'],
  conditions = ['No critical chronic conditions'],
  emergencyInstructions = 'If found unconscious, do not move neck. Call 108 ambulance immediately.',
  organDonor = true,
  primaryContact = '+919876543210',
  contactName = 'Emergency Family Contact',
  publicUrl = typeof window !== 'undefined' ? `${window.location.origin}/emergency/view/active` : 'https://lifeguard-azure.vercel.app'
}) => {
  const [activeFormat, setActiveFormat] = useState<'wallet' | 'wristband'>('wallet');
  const [downloading, setDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const walletCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const wristbandCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (activeFormat === 'wallet') {
        renderWalletCard();
      } else {
        renderWristband();
      }
    }
  }, [isOpen, activeFormat, patientName, bloodGroup, allergies, conditions, primaryContact, publicUrl]);

  // Render Printable Wallet Card (Standard CR80 Credit Card 1050 x 600 px Front + Back)
  const renderWalletCard = () => {
    const canvas = walletCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1050;
    const height = 660;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, width, height);

    // Front Side (Left half: 0 to 510)
    const cardRadius = 32;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(20, 20, 480, 620, cardRadius);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#DC2626';
    ctx.stroke();
    ctx.restore();

    // Front Header (Red bar)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(20, 20, 480, 110, [cardRadius, cardRadius, 0, 0]);
    ctx.fillStyle = '#DC2626';
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('EMERGENCY MEDICAL ID', 260, 68);
    ctx.font = '700 16px sans-serif';
    ctx.fillStyle = '#FEE2E2';
    ctx.fillText('WALLET CARD • FRONT', 260, 98);

    // Patient Name
    ctx.fillStyle = '#0F172A';
    ctx.font = '900 32px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(patientName, 50, 175);

    // Blood Group Badge
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(50, 200, 160, 60, 16);
    ctx.fillStyle = '#DC2626';
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 34px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(bloodGroup, 130, 244);

    // Organ Donor Badge
    if (organDonor) {
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(230, 200, 230, 60, 16);
      ctx.fillStyle = '#10B981';
      ctx.fill();
      ctx.restore();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 18px sans-serif';
      ctx.fillText('❤️ ORGAN DONOR', 345, 238);
    }

    // QR Code Box (Center Front)
    const qrSize = 240;
    const qrX = (480 - qrSize) / 2 + 20;
    const qrY = 285;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(qrX, qrY, qrSize, qrSize, 20);
    ctx.fillStyle = '#F8FAFC';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#EF4444';
    ctx.stroke();
    ctx.restore();

    // QR Image
    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(publicUrl)}`;
    qrImg.onload = () => {
      ctx.drawImage(qrImg, qrX + 15, qrY + 15, qrSize - 30, qrSize - 30);
    };

    ctx.fillStyle = '#64748B';
    ctx.font = '700 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('SCAN FOR VERIFIED MEDICAL DATA', 260, 560);
    ctx.fillStyle = '#DC2626';
    ctx.font = '800 15px sans-serif';
    ctx.fillText('DIAL 108 AMBULANCE • 112 NATIONAL', 260, 595);

    // Back Side (Right half: 550 to 1030)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(550, 20, 480, 620, cardRadius);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#2563EB';
    ctx.stroke();
    ctx.restore();

    // Back Header (Navy bar)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(550, 20, 480, 110, [cardRadius, cardRadius, 0, 0]);
    ctx.fillStyle = '#1E3A8A';
    ctx.fill();
    ctx.restore();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CLINICAL ALERTS & CONTACTS', 790, 68);
    ctx.font = '700 16px sans-serif';
    ctx.fillStyle = '#DBEAFE';
    ctx.fillText('WALLET CARD • BACK', 790, 98);

    // Back Content: Allergies
    ctx.textAlign = 'left';
    ctx.fillStyle = '#DC2626';
    ctx.font = '900 18px sans-serif';
    ctx.fillText('⚠️ KNOWN ALLERGIES:', 580, 165);
    ctx.fillStyle = '#1E293B';
    ctx.font = '700 16px sans-serif';
    const allergyText = allergies.slice(0, 3).join(', ') || 'None documented';
    ctx.fillText(allergyText.substring(0, 42), 580, 195);

    // Conditions
    ctx.fillStyle = '#2563EB';
    ctx.font = '900 18px sans-serif';
    ctx.fillText('🩺 CRITICAL CONDITIONS:', 580, 245);
    ctx.fillStyle = '#1E293B';
    ctx.font = '700 16px sans-serif';
    const conditionText = conditions.slice(0, 3).join(', ') || 'None documented';
    ctx.fillText(conditionText.substring(0, 42), 580, 275);

    // Emergency Instructions
    ctx.fillStyle = '#D97706';
    ctx.font = '900 18px sans-serif';
    ctx.fillText('📋 RESPONDER INSTRUCTIONS:', 580, 325);
    ctx.fillStyle = '#334155';
    ctx.font = '600 15px sans-serif';
    ctx.fillText(emergencyInstructions.substring(0, 48), 580, 355);

    // Emergency Contacts Box
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(580, 390, 420, 140, 16);
    ctx.fillStyle = '#FEF2F2';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FCA5A5';
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = '#991B1B';
    ctx.font = '800 16px sans-serif';
    ctx.fillText('PRIMARY EMERGENCY CONTACT', 600, 422);

    ctx.fillStyle = '#0F172A';
    ctx.font = '900 22px sans-serif';
    ctx.fillText(contactName, 600, 456);

    ctx.fillStyle = '#DC2626';
    ctx.font = '900 26px sans-serif';
    ctx.fillText(`📞 ${primaryContact}`, 600, 498);

    ctx.fillStyle = '#94A3B8';
    ctx.font = '600 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Fold along center line or cut into two standard cards', 790, 595);
  };

  // Render Printable Wearable Wristband (1400 x 200 px strip)
  const renderWristband = () => {
    const canvas = wristbandCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 1400;
    const height = 220;
    canvas.width = width;
    canvas.height = height;

    // Wristband Strip Background (Medical Red & White)
    ctx.fillStyle = '#DC2626';
    ctx.fillRect(0, 0, width, height);

    // Dashed cut marks on top and bottom
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.strokeRect(4, 4, width - 8, height - 8);
    ctx.setLineDash([]);

    // QR Code 1 (Left end)
    const qrSize = 160;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(30, 30, qrSize, qrSize);

    const qrImg = new Image();
    qrImg.crossOrigin = 'anonymous';
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&margin=8&data=${encodeURIComponent(publicUrl)}`;
    qrImg.onload = () => {
      ctx.drawImage(qrImg, 35, 35, qrSize - 10, qrSize - 10);
      // QR Code 2 (Right end)
      ctx.drawImage(qrImg, width - 195, 35, qrSize - 10, qrSize - 10);
    };

    // Wristband Center Details
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 32px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('EMERGENCY MEDICAL ID • SCAN FOR ALLERGIES', 220, 75);

    ctx.font = '800 28px sans-serif';
    ctx.fillStyle = '#FEF2F2';
    ctx.fillText(`${patientName.toUpperCase()} • BLOOD GROUP: ${bloodGroup}`, 220, 120);

    ctx.font = '700 22px sans-serif';
    ctx.fillStyle = '#FEE2E2';
    ctx.fillText(`📞 ICE CONTACT: ${primaryContact} • DIAL 108 AMBULANCE`, 220, 160);

    // Right QR Box Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(width - 200, 30, qrSize, qrSize);
  };

  const handleDownload = () => {
    const canvas = activeFormat === 'wallet' ? walletCanvasRef.current : wristbandCanvasRef.current;
    if (!canvas) return;

    setDownloading(true);
    const link = document.createElement('a');
    link.download = `lifeguard_${activeFormat}_medical_id.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();

    setTimeout(() => {
      setDownloading(false);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    }, 800);
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          >
            ✕
          </button>

          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            <CreditCard size={24} />
            Printable Wallet Card & Emergency Wristband
          </h2>
          <p className="text-xs text-red-100 mt-0.5">
            Wearable and wallet medical identifiers for instant stranger & first responder scanning
          </p>

          {/* Format Switcher */}
          <div className="flex mt-3 bg-black/25 p-1 rounded-xl gap-1">
            <button
              onClick={() => setActiveFormat('wallet')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFormat === 'wallet' ? 'bg-white text-red-600 shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              🪪 Printable Wallet Card (Front & Back)
            </button>
            <button
              onClick={() => setActiveFormat('wristband')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeFormat === 'wristband' ? 'bg-white text-red-600 shadow' : 'text-white/80 hover:text-white'
              }`}
            >
              🏷️ Wearable Emergency Wristband
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-gray-800 dark:text-gray-200">
          
          {/* Canvas Render Previews */}
          <div className="rounded-2xl border-2 border-dashed border-gray-300 dark:border-slate-700 p-2 sm:p-4 bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center overflow-x-auto shadow-inner">
            {activeFormat === 'wallet' ? (
              <canvas
                ref={walletCanvasRef}
                className="max-w-full h-auto rounded-xl shadow-lg border border-gray-200 dark:border-slate-800"
              />
            ) : (
              <canvas
                ref={wristbandCanvasRef}
                className="max-w-full h-auto rounded-xl shadow-lg border border-gray-200 dark:border-slate-800"
              />
            )}
          </div>

          {/* Explanatory Message */}
          <div className="bg-blue-50 dark:bg-blue-950/40 p-3.5 rounded-2xl border border-blue-200 dark:border-blue-800 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
            <Shield size={18} className="shrink-0 text-blue-600 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-black block uppercase tracking-wider">
                Emergency Identification Notice:
              </span>
              <p className="text-[11px] leading-relaxed text-blue-800 dark:text-blue-300">
                Printed on heavy cardstock or water-resistant wristband material, this allows bystanders or paramedics to scan your Medical QR code in seconds without phone access.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleDownload}
              disabled={downloading}
              className="py-3 px-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-red-500/30 active:scale-95 transition-all cursor-pointer"
            >
              {downloadSuccess ? (
                <>
                  <Check size={16} /> Saved to Downloads!
                </>
              ) : (
                <>
                  <Download size={16} /> Download High-Res PNG
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <Printer size={16} /> Print Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
