import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Award, 
  Droplet, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Heart, 
  ShieldCheck, 
  Sparkles, 
  Printer, 
  Plus, 
  MapPin, 
  Activity, 
  ChevronRight,
  Info,
  ExternalLink
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getDonationHistory, 
  calculateDonorAchievements, 
  VerifiedDonationRecord, 
  DonorBadge,
  generateCertificateData,
  logDonationSafely,
  DonationCertificateData
} from '../../services/donorAchievementService';
import { 
  calculateDonationEligibility, 
  DonationType, 
  EligibilityResult,
  getRareBloodInfo,
  isRareBloodGroup 
} from '../../services/donorEligibilityService';
import { DonationCertificateModal } from '../../components/blood/DonationCertificateModal';
import { BloodGroup } from '../../services/bloodCompatibilityService';

const DonorImpactPage: React.FC = () => {
  const navigate = useNavigate();

  // Donor State
  const [bloodGroup, setBloodGroup] = useState<BloodGroup>('O+');
  const [donorAge, setDonorAge] = useState<number>(29);
  const [donorGender, setDonorGender] = useState<'male' | 'female'>('male');
  const [selectedDonationType, setSelectedDonationType] = useState<DonationType>('Whole Blood');

  // History & Badges
  const [history, setHistory] = useState<VerifiedDonationRecord[]>([]);
  const [badges, setBadges] = useState<DonorBadge[]>([]);
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);

  // Certificate Modal State
  const [selectedCertificate, setSelectedCertificate] = useState<DonationCertificateData | null>(null);

  // Quick Log Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [logHospital, setLogHospital] = useState('Apollo Speciality Hospital');
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logType, setLogType] = useState<DonationType>('Whole Blood');
  const [logError, setLogError] = useState('');
  const [logSuccess, setLogSuccess] = useState('');

  useEffect(() => {
    // Load donor profile settings
    try {
      const raw = localStorage.getItem('lifeguard_donor_profile_settings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.bloodGroup) setBloodGroup(parsed.bloodGroup);
        if (parsed.gender) setDonorGender(parsed.gender);
        if (parsed.age) setDonorAge(parsed.age);
      }
    } catch {}

    loadData();
  }, [selectedDonationType, donorGender]);

  const loadData = () => {
    const list = getDonationHistory();
    setHistory(list);

    const computedBadges = calculateDonorAchievements(bloodGroup);
    setBadges(computedBadges);

    const lastDateIso = list[0]?.donationDate || '2023-10-12';
    const elig = calculateDonationEligibility({
      lastDonationDateIso: lastDateIso,
      donationType: selectedDonationType,
      gender: donorGender
    });
    setEligibility(elig);
  };

  const handleOpenCertificate = (donation: VerifiedDonationRecord) => {
    const cert = generateCertificateData(donation, 'Honorable Voluntary Donor');
    setSelectedCertificate(cert);
  };

  const handleLogNewDonation = (e: React.FormEvent) => {
    e.preventDefault();
    setLogError('');
    setLogSuccess('');

    const res = logDonationSafely({
      donationDate: new Date(logDate).toISOString(),
      donationType: logType,
      hospitalOrBloodBank: logHospital,
      city: 'Chennai',
      bloodGroup,
      gender: donorGender,
      units: 1,
      notes: 'Logged by voluntary donor upon hospital completion.'
    });

    if (!res.success) {
      setLogError(res.error || 'Failed to record donation.');
      return;
    }

    setLogSuccess('Voluntary donation verified & recorded! New certificate issued.');
    loadData();
    setTimeout(() => {
      setShowLogModal(false);
      setLogSuccess('');
    }, 1500);
  };

  const rareInfo = getRareBloodInfo(bloodGroup);
  const totalVerifiedDonations = history.filter(h => h.verificationStatus === 'verified').length;
  const estimatedLivesSaved = totalVerifiedDonations * 3;
  const totalVolumeMl = totalVerifiedDonations * 450;

  return (
    <div className="min-h-screen bg-gray-50 pb-28 text-gray-900">
      {/* Header */}
      <div className="bg-white shadow-sm p-4 sticky top-0 z-10 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center">
          <button onClick={() => navigate(-1)} className="mr-3 text-gray-600 hover:text-gray-900">
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-xl font-black text-gray-900 leading-tight">Donor Impact & Achievements</h1>
            <p className="text-xs text-gray-500 font-medium">Verified donation timeline, smart eligibility tracker & honor badges</p>
          </div>
        </div>

        <button
          onClick={() => setShowLogModal(true)}
          className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-md flex items-center gap-1.5 transition-all active:scale-95"
        >
          <Plus size={15} />
          <span className="hidden sm:inline">Log Donation</span>
        </button>
      </div>

      <div className="p-4 max-w-4xl mx-auto space-y-5">
        {/* Top Impact Banner */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
          <div className="absolute right-4 -bottom-6 opacity-10 pointer-events-none">
            <Heart size={200} />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-amber-300" />
              <span className="text-[11px] font-black uppercase tracking-widest text-red-200">
                Voluntary Lifeline Contributor
              </span>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black">Your Lifesaving Impact</h2>
              <p className="text-xs text-red-100 font-medium max-w-md mt-1">
                Every voluntary whole blood donation can be separated into red cells, platelets, and plasma, helping up to 3 patients in emergency trauma and surgery.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="bg-white/15 backdrop-blur-xs p-3.5 rounded-2xl border border-white/20 text-center">
                <span className="text-2xl sm:text-3xl font-black block leading-none">{totalVerifiedDonations}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-200 block mt-1">Verified Donations</span>
              </div>
              <div className="bg-white/15 backdrop-blur-xs p-3.5 rounded-2xl border border-white/20 text-center">
                <span className="text-2xl sm:text-3xl font-black block leading-none">~{estimatedLivesSaved}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-200 block mt-1">Lives Impacted</span>
              </div>
              <div className="bg-white/15 backdrop-blur-xs p-3.5 rounded-2xl border border-white/20 text-center">
                <span className="text-2xl sm:text-3xl font-black block leading-none">{totalVolumeMl}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-200 block mt-1">Total mL Contributed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Rare Blood Group Network Card */}
        {rareInfo.isRare && (
          <div className="bg-purple-50 border border-purple-200 rounded-3xl p-5 shadow-xs flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-600 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-xs">
              ⭐
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-black text-purple-950 text-base">Rare Blood Group Network Member</h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-200 text-purple-900 text-[10px] font-black uppercase">
                  {bloodGroup} • {rareInfo.rarityLevel}
                </span>
              </div>
              <p className="text-xs text-purple-900 font-medium leading-relaxed">
                {rareInfo.frequencyDescription}. {rareInfo.clinicalSignificance} You are on active standby alert for rare emergency requisitions within your preferred notification perimeter.
              </p>
            </div>
          </div>
        )}

        {/* Smart Eligibility Tracker Section */}
        {eligibility && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200/80 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-3">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-red-600" />
                <h3 className="font-black text-gray-900 text-sm uppercase tracking-wide">
                  Smart Donation Eligibility Tracker
                </h3>
              </div>

              {/* Component Type Selector */}
              <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-bold overflow-x-auto no-scrollbar">
                {(['Whole Blood', 'Plateletpheresis (SDP)', 'Plasmapheresis', 'Double Red Blood Cells (2RBC)'] as DonationType[]).map(t => (
                  <button
                    key={t}
                    onClick={() => setSelectedDonationType(t)}
                    className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap ${
                      selectedDonationType === t ? 'bg-red-600 text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {t.split(' ')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Eligibility Progress Meter */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${eligibility.isEligible ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                  <span className="font-black text-gray-900">
                    {eligibility.isEligible ? 'Estimated Physiological Recovery Complete' : `Rest Period: ${eligibility.daysRemaining} Day(s) Remaining`}
                  </span>
                </div>
                <span className="font-bold text-gray-500 text-[11px]">
                  {eligibility.daysElapsed} of {eligibility.requiredIntervalDays} Days Elapsed
                </span>
              </div>

              <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    eligibility.isEligible ? 'bg-emerald-600' : 'bg-amber-500'
                  }`}
                  style={{ width: `${eligibility.progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-gray-500 font-medium pt-0.5">
                <span>Last Donation: {new Date(history[0]?.donationDate || '2023-10-12').toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="font-bold text-gray-800">Next Eligible: {new Date(eligibility.nextEligibleDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Mandatory Medical Screening Notice */}
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-950 flex items-start gap-2.5">
              <AlertTriangle size={17} className="text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-black text-amber-900 block text-[11px] uppercase tracking-wide">
                  Medical Screening Requirement
                </span>
                <p className="text-[11px] leading-relaxed">
                  {eligibility.warningNotice} Unsafe premature donations are blocked to protect donor health and hemoglobin reserves.
                </p>
              </div>
            </div>

            {/* Configurable Policy Description */}
            <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 text-xs text-gray-600 space-y-1">
              <span className="font-bold text-gray-800 block">NBTC & Blood Bank Clinical Protocol:</span>
              <p className="text-[11px] leading-relaxed">{eligibility.policy.description}</p>
              <p className="text-[11px] font-bold text-red-700">💡 Post-donation advice: {eligibility.policy.recoveryAdvice}</p>
            </div>
          </div>
        )}

        {/* Achievement Badges Showcase */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200/80 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <Award size={18} className="text-amber-500" />
              <h3 className="font-black text-gray-900 text-sm uppercase tracking-wide">
                Donor Honors & Milestones
              </h3>
            </div>
            <span className="text-xs font-bold text-gray-500">
              {badges.filter(b => b.isUnlocked).length} of {badges.length} Unlocked
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {badges.map(badge => (
              <div 
                key={badge.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                  badge.isUnlocked 
                    ? 'bg-amber-50/40 border-amber-300 shadow-xs' 
                    : 'bg-gray-50/60 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                    badge.isUnlocked ? 'bg-amber-100 border border-amber-300 shadow-xs' : 'bg-gray-200'
                  }`}>
                    {badge.icon}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 text-xs leading-tight">{badge.title}</h4>
                    <p className="text-[10px] text-gray-500 font-medium mt-1 leading-snug">
                      {badge.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-100/80 mt-2 flex items-center justify-between text-[10px]">
                  <span className={`font-black uppercase tracking-wider ${badge.isUnlocked ? 'text-amber-700' : 'text-gray-400'}`}>
                    {badge.isUnlocked ? '✓ Unlocked' : 'In Progress'}
                  </span>
                  <span className="font-mono text-gray-500">
                    {badge.currentCount}/{badge.targetCount}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Verified Donation Timeline & Certificates */}
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200/80 space-y-4">
          <div className="flex items-center justify-between border-b pb-2">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-red-600" />
              <h3 className="font-black text-gray-900 text-sm uppercase tracking-wide">
                Verified Donation Timeline & Certificates ({history.length})
              </h3>
            </div>
            <button
              onClick={() => setShowLogModal(true)}
              className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1"
            >
              <Plus size={13} /> Log Entry
            </button>
          </div>

          <div className="space-y-3">
            {history.map((item, idx) => (
              <div 
                key={item.id} 
                className="p-4 bg-gray-50 rounded-2xl border border-gray-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-red-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center font-black text-base shrink-0 shadow-xs">
                    {item.bloodGroup}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-black text-gray-900 text-sm">{item.hospitalOrBloodBank}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase flex items-center gap-1">
                        <CheckCircle2 size={10} /> Verified
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5 font-medium">
                      <span>{item.donationType}</span>
                      <span>•</span>
                      <span>{new Date(item.donationDate).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span>•</span>
                      <span className="font-mono text-[11px] text-gray-400">{item.certificateId}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenCertificate(item)}
                  className="w-full sm:w-auto px-4 py-2 bg-white hover:bg-gray-100 border border-gray-300 text-gray-800 text-xs font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
                >
                  <Award size={14} className="text-amber-500" />
                  <span>View Certificate</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log Donation Modal with Safety Guardrail */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div 
            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-red-600 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={20} className="fill-white" />
                <h3 className="font-black text-base">Record Voluntary Donation</h3>
              </div>
              <button onClick={() => setShowLogModal(false)} className="text-white/80 hover:text-white">
                ✕
              </button>
            </div>

            <form onSubmit={handleLogNewDonation} className="p-5 space-y-4 text-gray-900">
              {logError && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-800 rounded-2xl text-xs font-bold leading-relaxed flex items-start gap-2">
                  <AlertTriangle size={16} className="shrink-0 mt-0.5 text-red-600" />
                  <span>{logError}</span>
                </div>
              )}

              {logSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-bold flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                  <span>{logSuccess}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Donation Date *</label>
                <input 
                  type="date"
                  required
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-gray-800 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Donation Type *</label>
                <select
                  value={logType}
                  onChange={(e) => setLogType(e.target.value as DonationType)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-gray-800 focus:bg-white"
                >
                  <option value="Whole Blood">Whole Blood (Min 90-day male / 120-day female rest)</option>
                  <option value="Plateletpheresis (SDP)">Plateletpheresis SDP (Min 7-day rest)</option>
                  <option value="Plasmapheresis">Plasmapheresis (Min 14-day rest)</option>
                  <option value="Double Red Blood Cells (2RBC)">Double Red Blood Cells 2RBC (Min 120-day rest)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Hospital / Licensed Blood Bank *</label>
                <input 
                  type="text"
                  required
                  value={logHospital}
                  onChange={(e) => setLogHospital(e.target.value)}
                  placeholder="e.g. Apollo Speciality Hospital Blood Bank"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-2.5 text-xs font-bold text-gray-800 focus:bg-white"
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100 text-[11px] text-blue-900 leading-relaxed">
                <strong>Donor Safety Guardrail:</strong> LifeGuard verifies physiological recovery intervals before awarding certificates and milestone badges. Premature donations will be blocked to protect your health.
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="flex-1 py-2.5 bg-gray-100 text-gray-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95"
                >
                  Confirm & Verify
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Certificate Modal */}
      {selectedCertificate && (
        <DonationCertificateModal
          isOpen={!!selectedCertificate}
          onClose={() => setSelectedCertificate(null)}
          certificate={selectedCertificate}
        />
      )}
    </div>
  );
};

export default DonorImpactPage;
