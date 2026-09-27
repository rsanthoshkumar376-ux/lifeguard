import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';

interface DobSelectorProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string, is18Plus: boolean) => void;
  label?: string;
  required?: boolean;
}

const MONTHS = [
  { val: '01', name: '01 - Jan' },
  { val: '02', name: '02 - Feb' },
  { val: '03', name: '03 - Mar' },
  { val: '04', name: '04 - Apr' },
  { val: '05', name: '05 - May' },
  { val: '06', name: '06 - Jun' },
  { val: '07', name: '07 - Jul' },
  { val: '08', name: '08 - Aug' },
  { val: '09', name: '09 - Sep' },
  { val: '10', name: '10 - Oct' },
  { val: '11', name: '11 - Nov' },
  { val: '12', name: '12 - Dec' }
];

export const DobSelector: React.FC<DobSelectorProps> = ({
  value,
  onChange,
  label = 'Date of Birth (18+ only)',
  required = true
}) => {
  const today = useMemo(() => new Date(), []);
  const currentYear = today.getFullYear();
  const maxEligibleYear = currentYear - 18;
  const minEligibleYear = currentYear - 95;

  // Local state to ensure user can select day, month, and year independently without reset
  const [selectedDay, setSelectedDay] = useState<string>(() => {
    if (value && value.includes('-')) {
      return value.split('-')[2] || '';
    }
    return '';
  });

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    if (value && value.includes('-')) {
      return value.split('-')[1] || '';
    }
    return '';
  });

  const [selectedYear, setSelectedYear] = useState<string>(() => {
    if (value && value.includes('-')) {
      return value.split('-')[0] || '';
    }
    return '';
  });

  // Sync with incoming value if changed externally
  useEffect(() => {
    if (value && value.includes('-')) {
      const [y, m, d] = value.split('-');
      if (y && y !== selectedYear) setSelectedYear(y);
      if (m && m !== selectedMonth) setSelectedMonth(m);
      if (d && d !== selectedDay) setSelectedDay(d);
    }
  }, [value]);

  // Calculate days in selected month (accounting for leap years)
  const daysInMonth = useMemo(() => {
    const y = parseInt(selectedYear) || 2000;
    const m = parseInt(selectedMonth) || 1;
    return new Date(y, m, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Generate Year options (only 18+ eligible years by default, e.g. 2008 and earlier)
  const years = useMemo(() => {
    const arr: string[] = [];
    for (let y = maxEligibleYear; y >= minEligibleYear; y--) {
      arr.push(String(y));
    }
    return arr;
  }, [maxEligibleYear, minEligibleYear]);

  // Generate Day options (1..28/29/30/31)
  const days = useMemo(() => {
    const arr: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(String(d).padStart(2, '0'));
    }
    return arr;
  }, [daysInMonth]);

  // Calculate Age and 18+ validity
  const ageInfo = useMemo(() => {
    if (!selectedYear || !selectedMonth || !selectedDay) {
      return null;
    }
    const y = parseInt(selectedYear);
    const m = parseInt(selectedMonth);
    const d = parseInt(selectedDay);

    if (isNaN(y) || isNaN(m) || isNaN(d)) return null;

    let age = today.getFullYear() - y;
    const monthDiff = (today.getMonth() + 1) - m;
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) {
      age--;
    }

    return {
      age,
      is18Plus: age >= 18
    };
  }, [selectedYear, selectedMonth, selectedDay, today]);

  // When any part changes, update local state immediately and notify parent
  const handleDayChange = (newD: string) => {
    setSelectedDay(newD);
    emitChange(selectedYear, selectedMonth, newD);
  };

  const handleMonthChange = (newM: string) => {
    setSelectedMonth(newM);
    // If current selected day exceeds days in this new month, clamp it
    const y = parseInt(selectedYear) || 2000;
    const maxDays = new Date(y, parseInt(newM) || 1, 0).getDate();
    let validD = selectedDay;
    if (selectedDay && parseInt(selectedDay) > maxDays) {
      validD = String(maxDays).padStart(2, '0');
      setSelectedDay(validD);
    }
    emitChange(selectedYear, newM, validD);
  };

  const handleYearChange = (newY: string) => {
    setSelectedYear(newY);
    emitChange(newY, selectedMonth, selectedDay);
  };

  const emitChange = (y: string, m: string, d: string) => {
    if (y && m && d) {
      const formatted = `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
      const yearNum = parseInt(y);
      const monthNum = parseInt(m);
      const dayNum = parseInt(d);

      let age = today.getFullYear() - yearNum;
      const monthDiff = (today.getMonth() + 1) - monthNum;
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dayNum)) {
        age--;
      }
      onChange(formatted, age >= 18);
    } else {
      // Pass empty date string until all 3 components are chosen
      onChange('', false);
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-red-600" />
          <span>{label} {required && '*'}</span>
        </label>
        <span className="text-[11px] font-black text-red-600 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 px-2 py-0.5 rounded-full">
          🔞 18+ Only
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {/* DAY SELECTOR */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Day</label>
          <select
            value={selectedDay}
            onChange={e => handleDayChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-semibold px-3 py-3.5 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-all shadow-xs cursor-pointer"
          >
            <option value="" className="bg-white dark:bg-slate-800 text-gray-400">Day</option>
            {days.map(d => (
              <option key={d} value={d} className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* MONTH SELECTOR */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Month</label>
          <select
            value={selectedMonth}
            onChange={e => handleMonthChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-semibold px-2 py-3.5 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-all shadow-xs cursor-pointer"
          >
            <option value="" className="bg-white dark:bg-slate-800 text-gray-400">Month</option>
            {MONTHS.map(m => (
              <option key={m.val} value={m.val} className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
                {m.name}
              </option>
            ))}
          </select>
        </div>

        {/* YEAR SELECTOR */}
        <div>
          <label className="block text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Year</label>
          <select
            value={selectedYear}
            onChange={e => handleYearChange(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 text-gray-900 dark:text-white font-semibold px-3 py-3.5 border border-gray-300 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-all shadow-xs cursor-pointer"
          >
            <option value="" className="bg-white dark:bg-slate-800 text-gray-400">Year</option>
            {years.map(y => (
              <option key={y} value={y} className="bg-white dark:bg-slate-800 text-gray-900 dark:text-white">
                {y}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Age & 18+ Verification Feedback Badge */}
      {ageInfo ? (
        <div
          className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-all animate-in fade-in mt-1.5 ${
            ageInfo.is18Plus
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold">
            {ageInfo.is18Plus ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>Age: {ageInfo.age} years old</span>
          </div>
          <span className={`font-black uppercase text-[10px] tracking-wider px-2 py-0.5 rounded shadow-xs ${
            ageInfo.is18Plus ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}>
            {ageInfo.is18Plus ? 'Verified 18+' : 'Under 18 Restricted'}
          </span>
        </div>
      ) : (
        <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">
          Select your Day, Month, and Year to verify eligibility (must be 18+).
        </p>
      )}
    </div>
  );
};

export default DobSelector;
