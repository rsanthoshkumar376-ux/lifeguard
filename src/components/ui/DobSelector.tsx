import React, { useMemo } from 'react';
import { Calendar, CheckCircle2, AlertTriangle } from 'lucide-react';

interface DobSelectorProps {
  value: string; // YYYY-MM-DD
  onChange: (val: string, is18Plus: boolean) => void;
  label?: string;
  required?: boolean;
}

const MONTHS = [
  { val: '01', name: 'Jan' },
  { val: '02', name: 'Feb' },
  { val: '03', name: 'Mar' },
  { val: '04', name: 'Apr' },
  { val: '05', name: 'May' },
  { val: '06', name: 'Jun' },
  { val: '07', name: 'Jul' },
  { val: '08', name: 'Aug' },
  { val: '09', name: 'Sep' },
  { val: '10', name: 'Oct' },
  { val: '11', name: 'Nov' },
  { val: '12', name: 'Dec' }
];

export const DobSelector: React.FC<DobSelectorProps> = ({
  value,
  onChange,
  label = 'Date of Birth (18+ only)',
  required = true
}) => {
  const today = useMemo(() => new Date(), []);
  const maxYear = today.getFullYear() - 18;
  const minYear = today.getFullYear() - 100;

  // Split value into parts
  const [selectedYear, selectedMonth, selectedDay] = useMemo(() => {
    if (!value || !value.includes('-')) return ['', '', ''];
    const parts = value.split('-');
    return [parts[0] || '', parts[1] || '', parts[2] || ''];
  }, [value]);

  // Calculate days in selected month
  const daysInMonth = useMemo(() => {
    const y = parseInt(selectedYear) || 2000;
    const m = parseInt(selectedMonth) || 1;
    return new Date(y, m, 0).getDate();
  }, [selectedYear, selectedMonth]);

  // Calculate Age
  const ageInfo = useMemo(() => {
    if (!selectedYear || !selectedMonth || !selectedDay) {
      return null;
    }
    const y = parseInt(selectedYear);
    const m = parseInt(selectedMonth);
    const d = parseInt(selectedDay);

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

  const handlePartChange = (part: 'day' | 'month' | 'year', val: string) => {
    const newY = part === 'year' ? val : selectedYear;
    const newM = part === 'month' ? val : selectedMonth;
    const newD = part === 'day' ? val : selectedDay;

    if (newY && newM && newD) {
      const formatted = `${newY}-${newM.padStart(2, '0')}-${newD.padStart(2, '0')}`;
      const y = parseInt(newY);
      const m = parseInt(newM);
      const d = parseInt(newD);
      let age = today.getFullYear() - y;
      const monthDiff = (today.getMonth() + 1) - m;
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d)) {
        age--;
      }
      onChange(formatted, age >= 18);
    } else {
      onChange('', false);
    }
  };

  // Generate Year options (only 18+ eligible years)
  const years = useMemo(() => {
    const arr: string[] = [];
    for (let y = maxYear; y >= minYear; y--) {
      arr.push(String(y));
    }
    return arr;
  }, [maxYear, minYear]);

  // Generate Day options
  const days = useMemo(() => {
    const arr: string[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      arr.push(String(d).padStart(2, '0'));
    }
    return arr;
  }, [daysInMonth]);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-bold text-gray-800 flex items-center gap-1.5">
          <Calendar className="w-4 h-4 text-red-600" />
          <span>{label} {required && '*'}</span>
        </label>
        <span className="text-[11px] font-black text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
          🔞 18+ Only
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Day</label>
          <select
            value={selectedDay}
            onChange={e => handlePartChange('day', e.target.value)}
            className="w-full bg-white text-gray-900 font-semibold px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-all"
          >
            <option value="">Day</option>
            {days.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Month</label>
          <select
            value={selectedMonth}
            onChange={e => handlePartChange('month', e.target.value)}
            className="w-full bg-white text-gray-900 font-semibold px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-all"
          >
            <option value="">Month</option>
            {MONTHS.map(m => (
              <option key={m.val} value={m.val}>{m.name} ({m.val})</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase tracking-wider">Year</label>
          <select
            value={selectedYear}
            onChange={e => handlePartChange('year', e.target.value)}
            className="w-full bg-white text-gray-900 font-semibold px-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none text-sm transition-all"
          >
            <option value="">Year</option>
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {ageInfo && (
        <div
          className={`p-2.5 rounded-xl border flex items-center justify-between text-xs transition-all ${
            ageInfo.is18Plus
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold">
            {ageInfo.is18Plus ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600" />
            )}
            <span>Calculated Age: {ageInfo.age} years old</span>
          </div>
          <span className="font-extrabold uppercase text-[10px] tracking-wider px-2 py-0.5 rounded bg-white/80 shadow-xs">
            {ageInfo.is18Plus ? '✅ Verified 18+' : '❌ Under 18'}
          </span>
        </div>
      )}
    </div>
  );
};

export default DobSelector;
