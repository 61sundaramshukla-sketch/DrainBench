/**
 * dataSource.js — Single adapter interface.
 * Swap DemoDataSource for LiveDataSource to connect real ESP32.
 *
 * Contract:
 *   getStatus()           → { esp32, sensor, wifi, lastReadingAt, source, sampleCount }
 *   subscribe(onSample)   → unsubscribe fn
 *   getExperiments()
 *   startExperiment(cfg)  → experiment object
 *   stopInflow()
 *   resetExperiment()
 *
 * LiveDataSource stub (implement when hardware is ready):
 *   Connect WebSocket to ESP32 broker
 *   In onmessage: levelCm = chamberH - distanceCm - calibrationOffset
 *   Call onSample({ t: Date.now(), levelCm, pumpOn })
 */
import { DEMO_EXPERIMENTS, DEMO_STATUS, generateRecessionCurve, CHAMBER_HEIGHT_CM } from '../data/demoData.js';

class DemoDataSource {
  constructor() { this._subs=new Set(); }
  getStatus()      { return {...DEMO_STATUS}; }
  getExperiments() { return DEMO_EXPERIMENTS; }
  subscribe(cb)    { this._subs.add(cb); return ()=>this._subs.delete(cb); }
  startExperiment(cfg) {
    const {outletPct,peakCm,upperCm,lowerCm} = cfg;
    const {samples,inflowStopT} = generateRecessionCurve({outletPct,peakCm:peakCm??26,totalSec:120,sampleHz:2,seed:Date.now()});
    return { id:`EXP-${Date.now()}`, label:`[DEMO] Outlet ${outletPct}%`, outletPct, peakCm, upperCm, lowerCm,
      date:new Date().toISOString(), status:'Running', inflowStopT, samples, chamberHeightCm:CHAMBER_HEIGHT_CM };
  }
  stopInflow()       {}
  resetExperiment()  {}
}

export const dataSource = new DemoDataSource();
