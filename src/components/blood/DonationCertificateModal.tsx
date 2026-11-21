import React, { useState } from 'react';
import { X, Printer, Share2, CheckCircle2, ShieldCheck, Award, Heart, Droplet } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { DonationCertificateData } from '../../services/donorAchievementService';

interface DonationCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  certificate: DonationCertificateData | null;
}

export const DonationCertificateModal: React.FC<DonationCertificateModalProps> = ({
  isOpen,
  onClose,
  certificate
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !certificate) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    const text = `🎖️ Blood Donation Certificate of Appreciation\nDonor: ${certificate.donorName}\nBlood Group: ${certificate.bloodGroup} (${certificate.donationType})\nHospital: ${certificate.hospitalName}\nDate: ${certificate.donationDate}\nCertificate ID: ${certificate.certificateId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Blood Donation Certificate',
        text,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[94vh] flex flex-col overflow-hidden border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control Bar */}
        <div className="bg-gray-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Award className="text-amber-400" size={20} />
            <span className="font-black text-sm">Verified Donation Certificate</span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Share Certificate"
            >
              <Share2 size={16} />
            </button>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
              title="Print Certificate"
            >
              <Printer size={15} />
              <span>Print / PDF</span>
            </button>
            <button 
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors ml-1"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Certificate Canvas / Render View */}
        <div className="overflow-y-auto p-4 sm:p-6 bg-amber-50/40">
          {copied && (
            <div className="mb-3 bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>Certificate citation copied to clipboard!</span>
            </div>
          )}

          {/* Printable Ornamental Certificate Card */}
          <div className="bg-white border-8 border-double border-amber-600/70 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-xl relative overflow-hidden">
            {/* Subtle Watermark */}
            <div className="absolute inset-0 flex items-center justify-center opacity-4 pointer-events-none">
              <Droplet size={280} className="text-red-600" />
            </div>

            {/* Header Emblems */}
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-4">
              <div className="flex items-center gap-2 text-left">
                <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
                  🩸
                </div>
                <div>
                  <span className="font-black text-gray-900 text-xs uppercase tracking-wider block">LifeGuard Network</span>
                  <span className="text-[10px] text-gray-500 font-medium">Voluntary Transfusion Registry</span>
                </div>
              </div>

              <div className="text-right">
                <span className="text-[10px] font-mono font-bold text-gray-400 block">CERTIFICATE ID</span>
                <span className="font-mono font-black text-xs text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {certificate.certificateId}
                </span>
              </div>
            </div>

            {/* Title */}
            <div className="space-y-1 pt-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-amber-700 block">
                Certificate of Civic Appreciation
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-gray-900 tracking-tight">
                VOLUNTARY BLOOD DONATION
              </h2>
              <p className="text-xs text-gray-500 italic">
                In recognition of selflessly contributing the gift of life to emergency patients
              </p>
            </div>

            {/* Donor Name Presentation */}
            <div className="py-2">
              <span className="text-xs text-gray-500 block">This certification of honor is proudly presented to:</span>
              <h3 className="text-2xl sm:text-3xl font-black text-red-700 tracking-tight mt-1 border-b-2 border-amber-300 inline-block pb-1 px-4">
                {certificate.donorName}
              </h3>
            </div>

            {/* Citation Narrative */}
            <p className="text-xs sm:text-sm text-gray-700 leading-relaxed max-w-lg mx-auto font-medium">
              for generously donating <strong>{certificate.units} unit(s)</strong> of <strong>{certificate.bloodGroup}</strong> ({certificate.donationType}) at <strong>{certificate.hospitalName}</strong>, {certificate.city} on <strong>{certificate.donationDate}</strong>, under full physiological safety guidelines.
            </p>

            {/* Footer Attributes & Digital Signatures */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-amber-200/80 items-end">
              {/* QR Verification */}
              <div className="flex flex-col items-center sm:items-start text-left">
                <div className="p-1.5 bg-white border border-gray-200 rounded-xl shadow-xs">
                  <QRCodeSVG value={certificate.qrVerificationUrl} size={64} level="M" />
                </div>
                <span className="text-[9px] font-mono text-gray-400 mt-1">Scan to Verify Authenticity</span>
              </div>

              {/* Seal */}
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full border-4 border-amber-500 bg-amber-50 flex flex-col items-center justify-center text-amber-800 shadow-sm">
                  <ShieldCheck size={24} className="text-amber-600" />
                  <span className="text-[7px] font-black uppercase tracking-tighter mt-0.5">VERIFIED</span>
                </div>
                <span className="text-[9px] font-bold text-gray-500 mt-1">National Transfusion Standard</span>
              </div>

              {/* Signature */}
              <div className="text-center sm:text-right">
                <div className="font-serif italic text-base text-gray-900 border-b border-gray-300 pb-0.5 inline-block sm:block">
                  {certificate.signatoryName}
                </div>
                <span className="text-[10px] font-bold text-gray-700 block mt-0.5">{certificate.signatoryTitle}</span>
                <span className="text-[9px] text-gray-400 block">{certificate.hospitalName}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
