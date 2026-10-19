/**
 * analysis.js — Pure functions, no React, fully unit-testable.
 *
 * Sensor conversion note (firmware, NOT used here):
 *   levelCm = chamberHeightCm - ultrasonicDistanceCm - calibrationOffsetCm
 *   where ultrasonicDistanceCm = (echo_pulse_us * 0.0343) / 2
 */

// ── Smoothing ──────────────────────────────────────────────────
export function movingAverage(values, w=3) {
  if (w<=1) return [...values];
  const h=Math.floor(w/2);
  return values.map((_,i)=>{
    const sl=values.slice(Math.max(0,i-h),Math.min(values.length-1,i+h)+1);
    return sl.reduce((s,v)=>s+v,0)/sl.length;
  });
}
export function medianFilter(values, w=3) {
  const h=Math.floor(w/2);
  return values.map((_,i)=>{
    const sl=[...values.slice(Math.max(0,i-h),Math.min(values.length-1,i+h)+1)].sort((a,b)=>a-b);
    return sl[Math.floor(sl.length/2)];
  });
}
export function smoothSamples(samples, method='moving_average', w=3) {
  const levels=samples.map(s=>s.levelCm);
  const smoothed=method==='median'?medianFilter(levels,w):movingAverage(levels,w);
  return samples.map((s,i)=>({...s,levelCm:+smoothed[i].toFixed(2)}));
}

// ── Interpolation helper ───────────────────────────────────────
function lerp(t0,v0,t1,v1,tgt) {
  if (Math.abs(v1-v0)<1e-9) return null;
  return t0+(tgt-v0)/(v1-v0)*(t1-t0);
}

// ── Primary functions ──────────────────────────────────────────
/**
 * recessionTime — time (s) for level to fall from upperCm to lowerCm
 * after inflowStopT. Returns { seconds } or { seconds:null, reason }.
 * Never returns a fake number — every invalid case gets a clear reason.
 */
export function recessionTime(samples, inflowStopT, upperCm, lowerCm, chamberHeightCm=40, noiseTol=0.5) {
  if (upperCm<=lowerCm)       return {seconds:null,reason:'Upper level must be greater than lower level.'};
  if (upperCm<0||upperCm>chamberHeightCm) return {seconds:null,reason:`Upper level must be 0–${chamberHeightCm} cm.`};
  if (lowerCm<0||lowerCm>chamberHeightCm) return {seconds:null,reason:`Lower level must be 0–${chamberHeightCm} cm.`};
  if (!samples||samples.length<4) return {seconds:null,reason:'Insufficient samples (need ≥ 4).'};
  const post=samples.filter(s=>s.t>=inflowStopT);
  if (post.length<4) return {seconds:null,reason:'Waiting for experiment to complete.'};

  // Find upper crossing
  let upperCrossT=null;
  if (post[0].levelCm<=upperCm) upperCrossT=post[0].t;
  else for (let i=1;i<post.length;i++) {
    if (post[i-1].levelCm>upperCm&&post[i].levelCm<=upperCm) {
      upperCrossT=lerp(post[i-1].t,post[i-1].levelCm,post[i].t,post[i].levelCm,upperCm); break;
    }
  }
  if (upperCrossT===null) return {seconds:null,reason:`Level never fell to upper reference (${upperCm} cm).`};

  const postU=post.filter(s=>s.t>=upperCrossT);
  // Non-monotonic check
  let prev=postU[0].levelCm;
  for (let i=1;i<postU.length;i++) {
    if (postU[i].levelCm-prev>noiseTol) return {seconds:null,reason:'Non-monotonic data beyond noise tolerance.'};
    prev=postU[i].levelCm;
  }
  // Find lower crossing
  let lowerCrossT=null;
  for (let i=1;i<postU.length;i++) {
    if (postU[i-1].levelCm>lowerCm&&postU[i].levelCm<=lowerCm) {
      lowerCrossT=lerp(postU[i-1].t,postU[i-1].levelCm,postU[i].t,postU[i].levelCm,lowerCm); break;
    }
  }
  if (lowerCrossT===null) return {seconds:null,reason:`Level has not yet fallen to lower reference (${lowerCm} cm). Waiting…`};
  const seconds=(lowerCrossT-upperCrossT)/1000;
  if (seconds<0) return {seconds:null,reason:'Unexpected negative duration.'};
  return {seconds:+seconds.toFixed(2)};
}

export function thresholdExceeded(samples, thresholdCm) {
  return samples?.some(s=>s.levelCm>=thresholdCm)??false;
}

export function rateOfRise(samples, windowSec=10) {
  const inf=samples?.filter(s=>s.pumpOn)??[];
  if (inf.length<2) return null;
  const last=inf[inf.length-1], cutoff=last.t-windowSec*1000;
  const win=inf.filter(s=>s.t>=cutoff);
  if (win.length<2) return null;
  const dt=(win[win.length-1].t-win[0].t)/1000;
  const dl=win[win.length-1].levelCm-win[0].levelCm;
  return dt<.001?null:+(dl/dt).toFixed(4);
}

export function highLevelPersistence(samples, thresholdCm, minSec=2) {
  if (!samples?.length) return 0;
  let max=0,runStart=null;
  for (let i=0;i<samples.length;i++) {
    const s=samples[i];
    if (s.levelCm>=thresholdCm) { if (runStart===null) runStart=s.t; }
    else if (runStart!==null) {
      const dur=(samples[i-1].t-runStart)/1000;
      if (dur>=minSec&&dur>max) max=dur;
      runStart=null;
    }
  }
  if (runStart!==null) { const dur=(samples[samples.length-1].t-runStart)/1000; if(dur>=minSec&&dur>max) max=dur; }
  return +max.toFixed(2);
}

export function currentLevel(samples) {
  return samples?.length?samples[samples.length-1].levelCm:null;
}
