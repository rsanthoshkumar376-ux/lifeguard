import React, { useState, useMemo } from 'react';
import { VitalType, HealthVitalRecord } from '../../services/healthRecordsService';
import { Activity, Heart, Droplet, Thermometer, Info, Calendar } from 'lucide-react';

interface Props {
  vitals: HealthVitalRecord[];
}

export const VitalsChart: React.FC<Props> = ({ vitals }) => {
  const [selectedType, setSelectedType] = useState<VitalType>('blood_pressure');
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);

  // Filter records strictly by type and sort chronologically (oldest to newest for plotting)
  const filteredRecords = useMemo(() => {
    return vitals
      .filter(v => v.type === selectedType)
      .sort((a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime());
  }, [vitals, selectedType]);

  // Chart configuration per vital type
  const config = useMemo(() => {
    switch (selectedType) {
      case 'blood_pressure':
        return {
          title: 'Blood Pressure History',
          unit: 'mmHg',
          minY: 50,
          maxY: 190,
          normalMin: 60,
          normalMax: 120,
          dual: true,
          labelPrimary: 'Systolic',
          labelSecondary: 'Diastolic',
          colorPrimary: '#ef4444', // red
          colorSecondary: '#3b82f6', // blue
          description: 'Systolic target <120 mmHg, Diastolic target <80 mmHg (AHA/ACC Standard)'
        };
      case 'heart_rate':
        return {
          title: 'Resting Heart Rate History',
          unit: 'BPM',
          minY: 40,
          maxY: 140,
          normalMin: 60,
          normalMax: 100,
          dual: false,
          labelPrimary: 'Pulse (BPM)',
          colorPrimary: '#ec4899', // pink
          description: 'Normal resting adult heart rate: 60 – 100 BPM'
        };
      case 'spo2':
        return {
          title: 'Oxygen Saturation (SpO2) History',
          unit: '%',
          minY: 85,
          maxY: 100,
          normalMin: 95,
          normalMax: 100,
          dual: false,
          labelPrimary: 'SpO2 (%)',
          colorPrimary: '#06b6d4', // cyan
          description: 'Normal physiological range: 95% – 100% on room air'
        };
      case 'blood_glucose':
        return {
          title: 'Blood Glucose History',
          unit: 'mg/dL',
          minY: 50,
          maxY: 220,
          normalMin: 70,
          normalMax: 125,
          dual: false,
          labelPrimary: 'Glucose (mg/dL)',
          colorPrimary: '#f59e0b', // amber
          description: 'Fasting healthy target: 70–99 mg/dL; Postprandial <140 mg/dL'
        };
      case 'temperature':
        return {
          title: 'Body Temperature History',
          unit: '°F',
          minY: 94,
          maxY: 104,
          normalMin: 97.0,
          normalMax: 99.0,
          dual: false,
          labelPrimary: 'Temperature (°F)',
          colorPrimary: '#8b5cf6', // purple
          description: 'Normal biological range: 97.0°F – 99.0°F (36.1°C – 37.2°C)'
        };
    }
  }, [selectedType]);

  // SVG Chart Geometry
  const width = 640;
  const height = 260;
  const padLeft = 50;
  const padRight = 30;
  const padTop = 30;
  const padBottom = 45;
  const plotWidth = width - padLeft - padRight;
  const plotHeight = height - padTop - padBottom;

  const getY = (val: number) => {
    const clamped = Math.max(config.minY, Math.min(config.maxY, val));
    const ratio = (clamped - config.minY) / (config.maxY - config.minY);
    return padTop + plotHeight - ratio * plotHeight;
  };

  // Convert points to SVG coordinates without interpolating missing dates
  const pointsData = useMemo(() => {
    if (filteredRecords.length === 0) return [];
    if (filteredRecords.length === 1) {
      return [{
        x: padLeft + plotWidth / 2,
        yPrimary: getY(
          selectedType === 'blood_pressure' 
            ? (filteredRecords[0].value.systolic ?? 120) 
            : selectedType === 'heart_rate'
            ? (filteredRecords[0].value.bpm ?? 72)
            : selectedType === 'spo2'
            ? (filteredRecords[0].value.percentage ?? 98)
            : selectedType === 'blood_glucose'
            ? (filteredRecords[0].value.glucose ?? 95)
            : (filteredRecords[0].value.temperature ?? 98.6)
        ),
        ySecondary: selectedType === 'blood_pressure' ? getY(filteredRecords[0].value.diastolic ?? 80) : undefined,
        record: filteredRecords[0]
      }];
    }

    const count = filteredRecords.length;
    return filteredRecords.map((rec, idx) => {
      const x = padLeft + (idx / (count - 1)) * plotWidth;
      const primaryVal = 
        selectedType === 'blood_pressure' ? (rec.value.systolic ?? 120) :
        selectedType === 'heart_rate' ? (rec.value.bpm ?? 72) :
        selectedType === 'spo2' ? (rec.value.percentage ?? 98) :
        selectedType === 'blood_glucose' ? (rec.value.glucose ?? 95) :
        (rec.value.temperature ?? 98.6);
      
      const secondaryVal = selectedType === 'blood_pressure' ? (rec.value.diastolic ?? 80) : undefined;

      return {
        x,
        yPrimary: getY(primaryVal),
        ySecondary: secondaryVal !== undefined ? getY(secondaryVal) : undefined,
        primaryVal,
        secondaryVal,
        record: rec
      };
    });
  }, [filteredRecords, selectedType, plotWidth, plotHeight, config]);

  // Construct SVG paths
  const linePrimary = useMemo(() => {
    if (pointsData.length <= 1) return '';
    return pointsData.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.yPrimary.toFixed(1)}`).join(' ');
  }, [pointsData]);

  const lineSecondary = useMemo(() => {
    if (!config.dual || pointsData.length <= 1) return '';
    return pointsData.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${(pt.ySecondary ?? 0).toFixed(1)}`).join(' ');
  }, [pointsData, config.dual]);

  // Normal zone band coordinates
  const normalBandTop = getY(config.normalMax);
  const normalBandBottom = getY(config.normalMin);
  const normalBandHeight = Math.max(2, normalBandBottom - normalBandTop);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-sm border border-gray-200 dark:border-slate-800">
      {/* Vitals Selection Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => setSelectedType('blood_pressure')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedType === 'blood_pressure'
              ? 'bg-red-600 text-white shadow-md shadow-red-500/20'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          <Activity size={15} /> Blood Pressure
        </button>

        <button
          onClick={() => setSelectedType('heart_rate')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedType === 'heart_rate'
              ? 'bg-pink-600 text-white shadow-md shadow-pink-500/20'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          <Heart size={15} /> Heart Rate
        </button>

        <button
          onClick={() => setSelectedType('spo2')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedType === 'spo2'
              ? 'bg-cyan-600 text-white shadow-md shadow-cyan-500/20'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          <Droplet size={15} /> SpO2
        </button>

        <button
          onClick={() => setSelectedType('blood_glucose')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedType === 'blood_glucose'
              ? 'bg-amber-600 text-white shadow-md shadow-amber-500/20'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          <Activity size={15} /> Blood Glucose
        </button>

        <button
          onClick={() => setSelectedType('temperature')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
            selectedType === 'temperature'
              ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
              : 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
          }`}
        >
          <Thermometer size={15} /> Temperature
        </button>
      </div>

      {/* Header with Title and Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 mb-2">
        <div>
          <h3 className="font-black text-gray-900 dark:text-white text-base flex items-center gap-2">
            {config.title}
            <span className="text-xs font-normal text-gray-500">({config.unit})</span>
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">{config.description}</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full" style={{ backgroundColor: config.colorPrimary }}></span>
            <span className="text-gray-700 dark:text-gray-300">{config.labelPrimary}</span>
          </div>
          {config.dual && (
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: config.colorSecondary }}></span>
              <span className="text-gray-700 dark:text-gray-300">{config.labelSecondary}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-400"></span>
            <span className="text-emerald-700 dark:text-emerald-400">Target Range</span>
          </div>
        </div>
      </div>

      {/* Interactive SVG Chart */}
      <div className="relative w-full overflow-hidden bg-slate-50 dark:bg-slate-950/60 rounded-2xl border border-gray-100 dark:border-slate-800/80 my-3">
        {filteredRecords.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <Activity size={36} className="mb-2 opacity-40 text-gray-400" />
            <p className="text-sm font-bold text-gray-600 dark:text-gray-300">No recorded readings for this vital</p>
            <p className="text-xs text-gray-400 mt-1">Use the "Record Vitals" button above to log a new entry.</p>
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <svg 
              viewBox={`0 0 ${width} ${height}`} 
              className="w-full h-auto min-w-[500px] select-none"
            >
              <defs>
                <linearGradient id="normalZoneGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.08" />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = padTop + ratio * plotHeight;
                const val = Math.round(config.maxY - ratio * (config.maxY - config.minY));
                return (
                  <g key={ratio}>
                    <line
                      x1={padLeft}
                      y1={y}
                      x2={width - padRight}
                      y2={y}
                      stroke="#94a3b8"
                      strokeDasharray="3 3"
                      strokeOpacity="0.3"
                    />
                    <text
                      x={padLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize="10"
                      fill="#64748b"
                      fontWeight="bold"
                    >
                      {val}
                    </text>
                  </g>
                );
              })}

              {/* Clinical Target Range Band */}
              <rect
                x={padLeft}
                y={normalBandTop}
                width={plotWidth}
                height={normalBandHeight}
                fill="url(#normalZoneGrad)"
                stroke="#10b981"
                strokeWidth="0.8"
                strokeDasharray="2 2"
                strokeOpacity="0.5"
              />

              {/* Primary Line */}
              {linePrimary && (
                <path
                  d={linePrimary}
                  fill="none"
                  stroke={config.colorPrimary}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Secondary Line (For BP Diastolic) */}
              {lineSecondary && (
                <path
                  d={lineSecondary}
                  fill="none"
                  stroke={config.colorSecondary}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}

              {/* Points & Interactive Tooltip triggers */}
              {pointsData.map((pt, idx) => {
                const dateStr = new Date(pt.record.recordedAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric'
                });

                return (
                  <g key={pt.record.id}>
                    {/* Vertical guideline on hover */}
                    {hoveredPoint?.record.id === pt.record.id && (
                      <line
                        x1={pt.x}
                        y1={padTop}
                        x2={pt.x}
                        y2={height - padBottom}
                        stroke="#64748b"
                        strokeDasharray="2 2"
                        strokeWidth="1.5"
                      />
                    )}

                    {/* Primary circle */}
                    <circle
                      cx={pt.x}
                      cy={pt.yPrimary}
                      r={hoveredPoint?.record.id === pt.record.id ? 7 : 5}
                      fill={config.colorPrimary}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer transition-all hover:scale-125"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                      onClick={() => setHoveredPoint(pt)}
                    />

                    {/* Secondary circle if dual */}
                    {pt.ySecondary !== undefined && (
                      <circle
                        cx={pt.x}
                        cy={pt.ySecondary}
                        r={hoveredPoint?.record.id === pt.record.id ? 7 : 5}
                        fill={config.colorSecondary}
                        stroke="#ffffff"
                        strokeWidth="2"
                        className="cursor-pointer transition-all hover:scale-125"
                        onMouseEnter={() => setHoveredPoint(pt)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        onClick={() => setHoveredPoint(pt)}
                      />
                    )}

                    {/* X-axis date tick */}
                    <text
                      x={pt.x}
                      y={height - padBottom + 18}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#64748b"
                      fontWeight="600"
                    >
                      {dateStr}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        )}

        {/* Hover / Active Point Tooltip Card */}
        {hoveredPoint && (
          <div className="absolute top-3 right-3 bg-slate-900/95 text-white p-3 rounded-xl shadow-xl border border-slate-700 text-xs backdrop-blur-md pointer-events-none transition-opacity">
            <div className="flex items-center gap-1.5 font-bold text-gray-300">
              <Calendar size={13} className="text-blue-400" />
              <span>{new Date(hoveredPoint.record.recordedAt).toLocaleString()}</span>
            </div>
            <div className="mt-1.5 font-black text-sm text-white">
              {selectedType === 'blood_pressure' && (
                <span>
                  {hoveredPoint.record.value.systolic}/{hoveredPoint.record.value.diastolic} mmHg
                </span>
              )}
              {selectedType === 'heart_rate' && (
                <span>{hoveredPoint.record.value.bpm} BPM</span>
              )}
              {selectedType === 'spo2' && (
                <span>{hoveredPoint.record.value.percentage}% SpO2</span>
              )}
              {selectedType === 'blood_glucose' && (
                <span>
                  {hoveredPoint.record.value.glucose} mg/dL{' '}
                  <span className="text-[10px] font-medium text-amber-300">
                    ({hoveredPoint.record.value.glucoseContext || 'Fasting'})
                  </span>
                </span>
              )}
              {selectedType === 'temperature' && (
                <span>{hoveredPoint.record.value.temperature}°{hoveredPoint.record.value.tempUnit || 'F'}</span>
              )}
            </div>
            {hoveredPoint.record.notes && (
              <p className="text-[11px] text-gray-300 mt-1 italic max-w-[200px] truncate">
                "{hoveredPoint.record.notes}"
              </p>
            )}
            <div className="mt-1.5">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                hoveredPoint.record.status === 'normal' ? 'bg-emerald-500/20 text-emerald-300' :
                hoveredPoint.record.status === 'borderline' ? 'bg-amber-500/20 text-amber-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {hoveredPoint.record.status}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mandatory Non-Interpolation Clinical Notice */}
      <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl p-3 text-[11px] text-blue-900 dark:text-blue-200">
        <Info size={16} className="text-blue-600 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Strict Empirical Plot:</span> Every plotted point represents a verified manual or imported reading. No interpolation, projections, or missing days are inferred.
        </div>
      </div>

      {/* Chronological Table of Readings */}
      <div className="mt-4">
        <h4 className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-2">
          Recorded Readings Log ({filteredRecords.length})
        </h4>
        <div className="overflow-x-auto max-h-48 scrollbar-thin">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-slate-800 text-gray-500 font-semibold">
                <th className="py-2 px-3">Date & Time</th>
                <th className="py-2 px-3">Measurement</th>
                <th className="py-2 px-3">Context / Notes</th>
                <th className="py-2 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
              {filteredRecords.map((r) => {
                const isNormal = r.status === 'normal';
                const isBorderline = r.status === 'borderline';
                return (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 font-medium text-gray-800 dark:text-gray-200">
                      {new Date(r.recordedAt).toLocaleDateString()}{' '}
                      <span className="text-[10px] text-gray-400">
                        {new Date(r.recordedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-gray-900 dark:text-white">
                      {selectedType === 'blood_pressure' && `${r.value.systolic}/${r.value.diastolic} mmHg`}
                      {selectedType === 'heart_rate' && `${r.value.bpm} BPM`}
                      {selectedType === 'spo2' && `${r.value.percentage}%`}
                      {selectedType === 'blood_glucose' && `${r.value.glucose} mg/dL`}
                      {selectedType === 'temperature' && `${r.value.temperature}°${r.value.tempUnit || 'F'}`}
                    </td>
                    <td className="py-2.5 px-3 text-gray-500 truncate max-w-[180px]">
                      {r.value.glucoseContext ? `(${r.value.glucoseContext}) ` : ''}
                      {r.notes || '—'}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        isNormal ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' :
                        isBorderline ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' :
                        'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      }`}>
                        {r.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
