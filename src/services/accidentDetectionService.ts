// Smart Accident & Impact Detection Engine using Web DeviceMotionEvent

export type SensitivityLevel = 'low' | 'medium' | 'high';

export interface AccidentSensorConfig {
  sensitivity: SensitivityLevel;
  impactThreshold: number; // m/s^2 (e.g. 28 - 36)
  stillnessThreshold: number; // m/s^2 (e.g. 3.5)
  stillnessWindowMs: number; // ms to check for non-movement (e.g. 1500ms)
  countdownDurationSec: number; // 30 seconds
}

export interface CalibrationData {
  baselineGravity: number;
  noiseMargin: number;
  calibratedAt: string;
}

const CONFIG_KEY = 'lifeguard_accident_sensor_config';
const CALIBRATION_KEY = 'lifeguard_accident_sensor_calibration';

export const DEFAULT_CONFIG: AccidentSensorConfig = {
  sensitivity: 'medium',
  impactThreshold: 28.0, // ~3G force spike
  stillnessThreshold: 3.5,
  stillnessWindowMs: 1500,
  countdownDurationSec: 30
};

export const SENSITIVITY_THRESHOLDS: Record<SensitivityLevel, number> = {
  low: 38.0,     // High-speed severe impact only (~4G)
  medium: 28.0,  // Standard crash/fall threshold (~3G)
  high: 20.0     // Sensitive detection (~2G, e.g. bicycle/elderly fall)
};

type ImpactCallback = (magnitude: number) => void;
const impactListeners = new Set<ImpactCallback>();

let isMonitoring = false;
let audioContext: AudioContext | null = null;
let sirenOscillator: OscillatorNode | null = null;
let sirenGain: GainNode | null = null;
let sirenInterval: any = null;

let potentialImpactTimestamp: number | null = null;
let potentialMagnitude: number = 0;
let stillnessCheckTimeout: any = null;

/**
 * Check if DeviceMotionEvent is supported in the current environment
 */
export const isAccidentDetectionSupported = (): boolean => {
  return typeof window !== 'undefined' && 'DeviceMotionEvent' in window;
};

/**
 * Request device motion permission (required on iOS 13+)
 */
export const requestMotionPermission = async (): Promise<boolean> => {
  if (typeof (DeviceMotionEvent as any)?.requestPermission === 'function') {
    try {
      const response = await (DeviceMotionEvent as any).requestPermission();
      return response === 'granted';
    } catch (e) {
      console.warn('Motion permission request failed', e);
      return false;
    }
  }
  return true; // Non-iOS or older devices grant by default
};

/**
 * Load or save configurable detection thresholds
 */
export const getSensorConfig = (): AccidentSensorConfig => {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? { ...DEFAULT_CONFIG, ...JSON.parse(raw) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
};

export const saveSensorConfig = (config: Partial<AccidentSensorConfig>): AccidentSensorConfig => {
  const current = getSensorConfig();
  const updated = { ...current, ...config };
  if (config.sensitivity) {
    updated.impactThreshold = SENSITIVITY_THRESHOLDS[config.sensitivity];
  }
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(updated));
  } catch (e) {}
  return updated;
};

/**
 * Sensor Calibration: Samples 3 seconds of resting acceleration
 */
export const calibrateSensor = async (): Promise<CalibrationData> => {
  return new Promise((resolve) => {
    const samples: number[] = [];
    const sampleDurationMs = 2500;

    const sampleHandler = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity || event.acceleration;
      if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
        const mag = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
        samples.push(mag);
      }
    };

    window.addEventListener('devicemotion', sampleHandler, true);

    setTimeout(() => {
      window.removeEventListener('devicemotion', sampleHandler, true);
      
      let avg = 9.8;
      let variance = 0.5;
      if (samples.length > 0) {
        avg = samples.reduce((a, b) => a + b, 0) / samples.length;
        const diffs = samples.map(s => Math.abs(s - avg));
        variance = diffs.reduce((a, b) => a + b, 0) / diffs.length;
      }

      const calData: CalibrationData = {
        baselineGravity: Math.round(avg * 100) / 100,
        noiseMargin: Math.round(variance * 100) / 100,
        calibratedAt: new Date().toISOString()
      };

      try {
        localStorage.setItem(CALIBRATION_KEY, JSON.stringify(calData));
      } catch (e) {}

      resolve(calData);
    }, sampleDurationMs);
  });
};

export const getCalibrationData = (): CalibrationData | null => {
  try {
    const raw = localStorage.getItem(CALIBRATION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

/**
 * Handle incoming sensor acceleration frames
 */
const handleDeviceMotion = (event: DeviceMotionEvent) => {
  const acc = event.acceleration; // Pure user acceleration (excluding gravity)
  const accWithG = event.accelerationIncludingGravity;

  let magnitude = 0;
  if (acc && acc.x !== null && acc.y !== null && acc.z !== null) {
    magnitude = Math.sqrt(acc.x * acc.x + acc.y * acc.y + acc.z * acc.z);
  } else if (accWithG && accWithG.x !== null && accWithG.y !== null && accWithG.z !== null) {
    // Fallback: remove standard 9.8m/s^2 gravity bias
    const rawMag = Math.sqrt(accWithG.x * accWithG.x + accWithG.y * accWithG.y + accWithG.z * accWithG.z);
    magnitude = Math.abs(rawMag - 9.8);
  }

  const config = getSensorConfig();

  // Phase 1: High-G impact spike detected
  if (magnitude >= config.impactThreshold) {
    if (!potentialImpactTimestamp) {
      potentialImpactTimestamp = Date.now();
      potentialMagnitude = magnitude;

      // Phase 2: Inactivity Verification Window (Filter out continuous shaking or accidental jogging bumps)
      clearTimeout(stillnessCheckTimeout);
      stillnessCheckTimeout = setTimeout(() => {
        // Impact confirmed! Broadcast to listeners
        triggerImpactDetected(potentialMagnitude);
        potentialImpactTimestamp = null;
      }, config.stillnessWindowMs);
    }
  } else if (potentialImpactTimestamp) {
    // If movement during verification window exceeds 18m/s^2, the phone is still being actively handled
    if (magnitude > 18.0) {
      clearTimeout(stillnessCheckTimeout);
      potentialImpactTimestamp = null;
    }
  }
};

/**
 * Start motion monitoring
 */
export const startAccidentMonitoring = (onImpact: ImpactCallback): boolean => {
  if (!isAccidentDetectionSupported()) return false;

  impactListeners.add(onImpact);

  if (!isMonitoring) {
    window.addEventListener('devicemotion', handleDeviceMotion, true);
    isMonitoring = true;
  }
  return true;
};

/**
 * Stop motion monitoring
 */
export const stopAccidentMonitoring = (onImpact?: ImpactCallback) => {
  if (onImpact) {
    impactListeners.delete(onImpact);
  } else {
    impactListeners.clear();
  }

  if (impactListeners.size === 0 && isMonitoring) {
    window.removeEventListener('devicemotion', handleDeviceMotion, true);
    isMonitoring = false;
    clearTimeout(stillnessCheckTimeout);
    potentialImpactTimestamp = null;
  }
};

export const getMonitoringStatus = (): boolean => isMonitoring;

/**
 * Broadcast impact event to all registered listeners
 */
export const triggerImpactDetected = (magnitude = 32.5) => {
  impactListeners.forEach(listener => {
    try {
      listener(magnitude);
    } catch (e) {
      console.error('Impact listener error', e);
    }
  });
};

/**
 * Web Audio API Emergency Siren Synthesizer (Works 100% offline)
 */
export const playEmergencySiren = () => {
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    stopEmergencySiren();

    sirenOscillator = audioContext.createOscillator();
    sirenGain = audioContext.createGain();

    sirenOscillator.type = 'sawtooth';
    sirenOscillator.frequency.setValueAtTime(700, audioContext.currentTime);

    sirenGain.gain.setValueAtTime(0.4, audioContext.currentTime);

    sirenOscillator.connect(sirenGain);
    sirenGain.connect(audioContext.destination);

    sirenOscillator.start();

    // Modulate pitch between 600Hz and 950Hz like an ambulance siren
    let high = true;
    sirenInterval = setInterval(() => {
      if (!sirenOscillator || !audioContext) return;
      const targetFreq = high ? 950 : 600;
      sirenOscillator.frequency.exponentialRampToValueAtTime(targetFreq, audioContext.currentTime + 0.35);
      high = !high;

      // Pulse device vibration in sync with siren
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([200, 100]);
      }
    }, 450);

  } catch (err) {
    console.warn('Could not initialize emergency siren audio', err);
  }
};

export const stopEmergencySiren = () => {
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  if (sirenOscillator) {
    try {
      sirenOscillator.stop();
      sirenOscillator.disconnect();
    } catch (e) {}
    sirenOscillator = null;
  }
  if (sirenGain) {
    try {
      sirenGain.disconnect();
    } catch (e) {}
    sirenGain = null;
  }
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(0); // stop vibration
  }
};
