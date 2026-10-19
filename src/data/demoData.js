/**
 * demoData.js — ALL simulated data lives here.
 * UI components never import fabricated values from anywhere else.
 * Outlet % = experimental setting, NOT a measured blockage.
 */

// Seeded LCG random — deterministic output on every run
function makeRng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

export const CHAMBER_HEIGHT_CM = 40;
export const OUTLET_SETTINGS   = [100, 75, 50, 25];

// Recession time constant per outlet — smaller opening → slower drain
const TAU = { 100: 18, 75: 28, 50: 44, 25: 80 };

/**
 * generateRecessionCurve — deterministic water-level timeseries.
 * Phase 1: linear fill; Phase 2: exponential decay with tiny noise.
 */
export function generateRecessionCurve({ outletPct=100, peakCm=26, totalSec=160, sampleHz=2, seed=42 }) {
  const rng = makeRng(seed);
  const tau = TAU[outletPct] ?? 30;
  const dt  = 1 / sampleHz;
  const inflowStopSec = Math.floor(totalSec * 0.4);
  const inflowStopT   = inflowStopSec * 1000;
  const fillRate      = peakCm / inflowStopSec;
  const samples = [];
  let level = 0;
  for (let i = 0; i < Math.floor(totalSec * sampleHz); i++) {
    const tSec  = i * dt;
    const pumpOn = tSec < inflowStopSec;
    if (pumpOn) {
      level = Math.min(fillRate * tSec + (rng() - .5) * .4, CHAMBER_HEIGHT_CM);
    } else {
      const e = tSec - inflowStopSec;
      level = Math.max(0, peakCm * Math.exp(-e / tau) + (rng() - .5) * .6);
    }
    samples.push({ t: Math.round(i * dt * 1000), levelCm: +level.toFixed(2), pumpOn });
  }
  return { samples, inflowStopT };
}

export const DEMO_EXPERIMENTS = OUTLET_SETTINGS.map((pct, idx) => {
  const peakCm   = 24 + idx * 1.5;
  const totalSec = 50 + TAU[pct] * 4;
  const { samples, inflowStopT } = generateRecessionCurve({ outletPct:pct, peakCm, totalSec, sampleHz:2, seed:100+idx*17 });
  return {
    id: `EXP-2024-10-${String(idx+1).padStart(2,'0')}`,
    label: `Outlet ${pct}% — Demo`,
    outletPct: pct, peakCm,
    date: new Date(Date.UTC(2024,9,idx+1,9,30)).toISOString(),
    status: 'Complete',
    inflowStopT, samples,
    upperCm: 22, lowerCm: 10,
    chamberHeightCm: CHAMBER_HEIGHT_CM,
  };
});

export function getExperimentByOutlet(pct) {
  return DEMO_EXPERIMENTS.find(e => e.outletPct === pct) ?? DEMO_EXPERIMENTS[0];
}

export const DEMO_ALERTS = [
  { id:'a1', type:'warning', title:'[DEMO] Level above threshold', message:'Simulated water level (26.4 cm) exceeded configured threshold (22 cm). Experimental indicator only.', ts:Date.now()-120000, read:false },
  { id:'a2', type:'info',    title:'[DEMO] Inflow started',        message:'Simulated inflow started for EXP-2024-10-01.', ts:Date.now()-360000, read:false },
  { id:'a3', type:'info',    title:'[DEMO] Possible outlet restriction — experimental indicator', message:'Recession time for 25% outlet is ~4× longer than 100%. Expected experimental result — not real blockage detection.', ts:Date.now()-600000, read:true },
  { id:'a4', type:'info',    title:'[DEMO] Experiment complete',   message:'EXP-2024-10-01 (Outlet 100%) completed.', ts:Date.now()-900000, read:true },
  { id:'a5', type:'warning', title:'[DEMO] Dashboard in DEMO MODE',message:'Hardware not connected. All readings are simulated.', ts:Date.now()-1200000, read:true },
];

export const DEMO_STATUS = {
  esp32:  { state:'disconnected', label:'Not connected' },
  sensor: { state:'demo',          label:'Simulated' },
  wifi:   { state:'disconnected', label:'Not connected' },
  lastReadingAt: null, source:'DEMO',
  sampleCount: DEMO_EXPERIMENTS.reduce((a,e)=>a+e.samples.length, 0),
};
