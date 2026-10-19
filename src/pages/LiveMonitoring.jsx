import { useState, useEffect, useRef, useMemo } from 'react';
import { WaterLevelChart } from '../components/WaterLevelChart.jsx';
import { StatCard } from '../components/StatCard.jsx';
import { DemoBadge } from '../components/DemoBadge.jsx';
import { Droplets, Activity } from 'lucide-react';
import { getExperimentByOutlet, OUTLET_SETTINGS, CHAMBER_HEIGHT_CM } from '../data/demoData.js';
import { smoothSamples, currentLevel } from '../lib/analysis.js';
import { formatLevel, formatLevelPercent } from '../lib/format.js';

export function LiveMonitoring() {
  const [outlet, setOutlet] = useState(100);
  const [playing, setPlaying] = useState(false);
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);
  const exp = useMemo(() => getExperimentByOutlet(outlet), [outlet]);
  const visible = exp.samples.slice(0, idx);
  const smoothed = useMemo(() => smoothSamples(visible), [visible]);
  const level = currentLevel(smoothed);

  useEffect(() => {
    if (playing) {
      timer.current = setInterval(() => {
        setIdx(i => { if (i >= exp.samples.length) { setPlaying(false); clearInterval(timer.current); return i; } return i + 2; });
      }, 100);
    } else clearInterval(timer.current);
    return () => clearInterval(timer.current);
  }, [playing, exp.samples.length]);

  function changeOutlet(p) { setOutlet(p); setIdx(0); setPlaying(false); }
  function reset() { setIdx(0); setPlaying(false); }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3" style={{ marginBottom:'var(--s5)', flexWrap:'wrap' }}>
        <DemoBadge/>
        <span style={{ color:'var(--text-muted)', fontSize:'.875rem' }}>Simulated live replay — not real sensor data</span>
        <div style={{ marginLeft:'auto', display:'flex', gap:8, flexWrap:'wrap' }}>
          {OUTLET_SETTINGS.map(p=>(
            <button key={p} className={`btn btn-sm ${outlet===p?'btn-primary':'btn-ghost'}`}
              onClick={()=>changeOutlet(p)} aria-pressed={outlet===p}>{p}% outlet</button>
          ))}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'var(--s4)', marginBottom:'var(--s6)' }}>
        <StatCard label="Current Level" icon={Droplets} iconColor="var(--cyan)" accent="var(--cyan)"
          value={level != null ? formatLevel(level) : '—'} sub={level != null ? formatLevelPercent(level, CHAMBER_HEIGHT_CM) : 'No stream'}/>
        <StatCard label="Samples Shown" icon={Activity} iconColor="var(--primary)"
          value={`${visible.length}`} sub={`of ${exp.samples.length} total`}/>
      </div>

      <WaterLevelChart samples={smoothed} inflowStopT={exp.inflowStopT}
        upperCm={exp.upperCm} lowerCm={exp.lowerCm} chamberHeightCm={CHAMBER_HEIGHT_CM}
        title={`[DEMO] Live Replay — Outlet ${outlet}%`}/>

      <div className="flex gap-3" style={{ marginTop:'var(--s4)', flexWrap:'wrap' }}>
        <button className="btn btn-primary" onClick={()=>setPlaying(p=>!p)}
          disabled={idx>=exp.samples.length} aria-label={playing?'Pause replay':'Play demo replay'}>
          {playing ? '⏸ Pause' : '▶ Simulate Play'}
        </button>
        <button className="btn btn-ghost" onClick={reset} aria-label="Reset replay">↺ Reset</button>
      </div>
    </div>
  );
}
