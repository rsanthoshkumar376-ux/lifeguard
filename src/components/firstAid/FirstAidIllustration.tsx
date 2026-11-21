import React from 'react';

interface FirstAidIllustrationProps {
  type: string;
  className?: string;
}

export const FirstAidIllustration: React.FC<FirstAidIllustrationProps> = ({ type, className = 'w-full h-36' }) => {
  switch (type) {
    case 'cpr-hands':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="120" rx="16" fill="#FEE2E2" className="dark:fill-rose-950/40" />
          {/* Torso Outline */}
          <path d="M40 100 C40 40, 70 20, 100 20 C130 20, 160 40, 160 100" stroke="#DC2626" strokeWidth="3" strokeDasharray="4 4" />
          {/* Sternum Center Line */}
          <line x1="100" y1="30" x2="100" y2="85" stroke="#991B1B" strokeWidth="2" />
          {/* Hand Placement Target */}
          <circle cx="100" cy="65" r="18" fill="#EF4444" fillOpacity="0.2" stroke="#DC2626" strokeWidth="2.5" />
          <circle cx="100" cy="65" r="5" fill="#DC2626" />
          {/* Hand Shape Outline */}
          <path d="M85 70 C85 55, 95 50, 100 50 C105 50, 115 55, 115 70 C115 78, 108 82, 100 82 C92 82, 85 78, 85 70 Z" fill="#DC2626" fillOpacity="0.8" />
          <text x="100" y="108" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#991B1B" className="dark:fill-red-300">
            Center of Chest (Lower Half of Breastbone)
          </text>
        </svg>
      );

    case 'cpr-push':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="120" rx="16" fill="#FEF2F2" className="dark:fill-slate-800" />
          {/* Compressing Force Arrows */}
          <path d="M100 20 L100 70 M85 55 L100 70 L115 55" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M80 75 Q100 95 120 75" stroke="#B91C1C" strokeWidth="3" strokeLinecap="round" fill="#FCA5A5" fillOpacity="0.3" />
          <rect x="50" y="85" width="100" height="8" rx="4" fill="#DC2626" fillOpacity="0.3" />
          <text x="100" y="108" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#DC2626">
            Push 5-6 cm Deep • 100-120 BPM
          </text>
        </svg>
      );

    case 'aed-pads':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="120" rx="16" fill="#EFF6FF" className="dark:fill-slate-800" />
          {/* Chest Outline */}
          <path d="M50 110 C50 40, 75 25, 100 25 C125 25, 150 40, 150 110" stroke="#2563EB" strokeWidth="2.5" />
          {/* Upper Right Pad */}
          <rect x="70" y="38" width="22" height="16" rx="4" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.5" />
          <text x="81" y="49" textAnchor="middle" fontSize="7" fontWeight="bold" fill="white">PAD 1</text>
          {/* Lower Left Rib Pad */}
          <rect x="115" y="70" width="24" height="16" rx="4" fill="#3B82F6" stroke="#1D4ED8" strokeWidth="1.5" />
          <text x="127" y="81" textAnchor="middle" fontSize="7" fontWeight="bold" fill="white">PAD 2</text>
          {/* Cable wires */}
          <path d="M81 54 C81 80, 100 95, 100 110" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M127 86 C127 98, 105 102, 100 110" stroke="#93C5FD" strokeWidth="1.5" strokeDasharray="3 3" />
          <text x="100" y="18" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#1D4ED8">
            Upper Right + Lower Left Ribs
          </text>
        </svg>
      );

    case 'choking-heimlich':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="120" rx="16" fill="#FFFBEB" className="dark:fill-slate-800" />
          {/* Body Profile */}
          <path d="M80 15 C85 30, 95 35, 110 35 C115 50, 105 85, 95 110" stroke="#D97706" strokeWidth="2.5" strokeLinecap="round" />
          {/* Rescuer Arms circling from behind */}
          <ellipse cx="98" cy="65" rx="18" ry="12" fill="#F59E0B" fillOpacity="0.25" stroke="#B45309" strokeWidth="2" />
          {/* Upward Inward Arrow */}
          <path d="M98 80 L98 52 M88 62 L98 52 L108 62" stroke="#B45309" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="98" cy="85" r="3" fill="#D97706" />
          <text x="100" y="105" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#B45309">
            Inward & Upward Thrust Above Navel
          </text>
        </svg>
      );

    case 'back-blows':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="120" rx="16" fill="#FFF7ED" className="dark:fill-slate-800" />
          {/* Leaning Forward Torso */}
          <path d="M60 40 Q85 55 120 60 Q145 65 160 85" stroke="#EA580C" strokeWidth="3" strokeLinecap="round" fill="none" />
          {/* Sharp Palm Strike between Shoulder Blades */}
          <path d="M100 15 L88 45 M78 35 L88 45 L98 32" stroke="#C2410C" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="88" cy="48" r="8" fill="#FB923C" fillOpacity="0.4" />
          <text x="100" y="105" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#C2410C">
            5 Sharp Heel-of-Hand Back Blows
          </text>
        </svg>
      );

    case 'direct-pressure':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="120" rx="16" fill="#FEE2E2" className="dark:fill-slate-800" />
          {/* Arm or Limb */}
          <rect x="25" y="48" width="150" height="24" rx="12" fill="#FECACA" stroke="#DC2626" strokeWidth="2" />
          {/* Wound Dressing */}
          <rect x="80" y="42" width="40" height="36" rx="4" fill="white" stroke="#DC2626" strokeWidth="2.5" />
          {/* Firm Pressure Arrows */}
          <path d="M92 18 L92 38 M85 30 L92 38 L99 30" stroke="#991B1B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M108 18 L108 38 M101 30 L108 38 L115 30" stroke="#991B1B" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <text x="100" y="105" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#991B1B">
            Firm Direct Continuous Hand Pressure
          </text>
        </svg>
      );

    case 'burn-cooling':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="120" rx="16" fill="#ECFEFF" className="dark:fill-slate-800" />
          {/* Water Faucet */}
          <path d="M90 15 L110 15 L110 32 L95 32" stroke="#0891B2" strokeWidth="4" strokeLinecap="round" />
          {/* Running Water Streams */}
          <path d="M100 35 L100 65 M95 38 L93 62 M105 38 L107 62" stroke="#06B6D4" strokeWidth="2" strokeDasharray="4 2" />
          {/* Burned Arm / Skin */}
          <path d="M40 75 Q100 68 160 75" stroke="#E11D48" strokeWidth="6" strokeLinecap="round" />
          <text x="100" y="105" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#0E7490">
            Cool Running Tap Water for 10-20 Minutes
          </text>
        </svg>
      );

    case 'recovery-position':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="120" rx="16" fill="#F0FDF4" className="dark:fill-slate-800" />
          {/* Body on Side */}
          <ellipse cx="60" cy="50" rx="12" ry="10" fill="#16A34A" fillOpacity="0.7" />
          {/* Torso & Head tilted back */}
          <path d="M72 52 Q105 50 135 60" stroke="#15803D" strokeWidth="4" strokeLinecap="round" />
          {/* Bent Knee stabilizing body */}
          <path d="M125 58 L145 78 L155 74" stroke="#16A34A" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
          {/* Hand under cheek */}
          <path d="M68 56 L62 68" stroke="#16A34A" strokeWidth="3" strokeLinecap="round" />
          <text x="100" y="105" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#166534">
            Roll onto Side • Bent Knee • Chin Up
          </text>
        </svg>
      );

    case 'snakebite-bandage':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="120" rx="16" fill="#FEFCE8" className="dark:fill-slate-800" />
          {/* Leg or Arm */}
          <rect x="30" y="42" width="140" height="26" rx="13" fill="#FDE047" fillOpacity="0.3" stroke="#CA8A04" strokeWidth="2" />
          {/* Puncture Marks */}
          <circle cx="55" cy="52" r="2" fill="#B91C1C" />
          <circle cx="55" cy="58" r="2" fill="#B91C1C" />
          {/* Pressure Bandage Spirals */}
          <path d="M50 42 L65 68 M68 42 L83 68 M86 42 L101 68 M104 42 L119 68 M122 42 L137 68" stroke="#A16207" strokeWidth="2.5" />
          {/* Splint Bar */}
          <line x1="30" y1="74" x2="170" y2="74" stroke="#713F12" strokeWidth="3" strokeLinecap="round" />
          <text x="100" y="105" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#854D0E">
            Firm Pressure Wrap & Rigid Splint
          </text>
        </svg>
      );

    case 'fracture-splint':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="120" rx="16" fill="#F8FAFC" className="dark:fill-slate-800" />
          {/* Injured Limb */}
          <rect x="35" y="46" width="130" height="20" rx="10" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
          {/* Fracture crack */}
          <path d="M96 46 L102 54 L98 60 L104 66" stroke="#EF4444" strokeWidth="2.5" />
          {/* Rigid Splints Above and Below */}
          <rect x="30" y="34" width="140" height="7" rx="3" fill="#94A3B8" />
          <rect x="30" y="71" width="140" height="7" rx="3" fill="#94A3B8" />
          {/* Cloth Ties */}
          <line x1="50" y1="30" x2="50" y2="82" stroke="#0284C7" strokeWidth="2" strokeDasharray="2 2" />
          <line x1="145" y1="30" x2="145" y2="82" stroke="#0284C7" strokeWidth="2" strokeDasharray="2 2" />
          <text x="100" y="105" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#334155">
            Rigid Board Splint Beyond Joints
          </text>
        </svg>
      );

    case 'fainting-elevation':
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="120" rx="16" fill="#F1F5F9" className="dark:fill-slate-800" />
          {/* Ground Line */}
          <line x1="20" y1="85" x2="180" y2="85" stroke="#94A3B8" strokeWidth="2" />
          {/* Pillow / Bag Elevation */}
          <polygon points="125,85 160,85 155,55 130,65" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.5" />
          {/* Person lying down with feet propped up */}
          <circle cx="45" cy="78" r="8" fill="#475569" />
          <path d="M53 80 L95 80 L145 60" stroke="#475569" strokeWidth="4" strokeLinecap="round" fill="none" />
          {/* Upward Arrow at feet */}
          <path d="M140 45 L140 28 M134 35 L140 28 L146 35" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <text x="100" y="105" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#0369A1">
            Elevate Legs 12 Inches (30 cm)
          </text>
        </svg>
      );

    case 'road-safety':
    default:
      return (
        <svg viewBox="0 0 200 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="120" rx="16" fill="#FEF2F2" className="dark:fill-slate-800" />
          {/* Traffic Hazard Warning Triangle */}
          <polygon points="100,20 145,85 55,85" stroke="#DC2626" strokeWidth="4" fill="#FEE2E2" strokeLinejoin="round" />
          <line x1="100" y1="45" x2="100" y2="65" stroke="#DC2626" strokeWidth="4" strokeLinecap="round" />
          <circle cx="100" cy="75" r="3" fill="#DC2626" />
          <text x="100" y="105" textAnchor="middle" fontSize="9.5" fontWeight="bold" fill="#DC2626">
            Scene Safety • Warning Markers at 50m
          </text>
        </svg>
      );
  }
};
