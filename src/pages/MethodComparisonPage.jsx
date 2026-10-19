import { useState, useMemo } from 'react';
import { MethodComparison } from '../components/MethodComparison.jsx';
import { WaterLevelChart } from '../components/WaterLevelChart.jsx';
import { DemoBadge } from '../components/DemoBadge.jsx';
import { DEMO_EXPERIMENTS } from '../data/demoData.js';
import { recessionTime, smoothSamples, thresholdExceeded, rateOfRise, highLevelPersistence } from '../lib/analysis.js';

export function MethodComparisonPage() {
  const [sel, setSel] = useState(0);
  const exp = DEMO_EXPERIMENTS[sel];

  const results = useMemo(() => {
    const sm = smoothSamples(exp.samples);
    return {
      recession: recessionTime(sm, exp.inflowStopT, exp.upperCm, exp.lowerCm, exp.chamberHeightCm),
      thresh:    thresholdExceeded(sm, exp.upperCm),
      rate:      rateOfRise(sm, 10),
      persist:   highLevelPersistence(sm, exp.upperCm, 2),
    };
  }, [exp]);

  return (
    <div className="animate-fade-in" style={{ display:'flex', flexDirection:'column', gap:'var(--s6)' }}>
      <div className="flex items-center gap-3" style={{ flexWrap:'wrap' }}>
        <DemoBadge/>
        <span style={{ color:'var(--text-muted)', fontSize:'.875rem' }}>Comparing methods on pre-generated demo datasets. No method is validated as more accurate.</span>
      </div>

      {/* Selector */}
      <div className="card" style={{ display:'flex', gap:'var(--s3)', flexWrap:'wrap', alignItems:'center' }}>
        <span style={{ fontSize:'.875rem', color:'var(--text-muted)' }}>Dataset:</span>
        {DEMO_EXPERIMENTS.map((e,i) => (
          <button key={e.id} className={`btn btn-sm ${sel===i?'btn-primary':'btn-ghost'}`}
            onClick={()=>setSel(i)} aria-pressed={sel===i}>Outlet {e.outletPct}%</button>
        ))}
      </div>

      {/* Info strip */}
      <div className="card card-glass" style={{ display:'flex', gap:'var(--s8)', flexWrap:'wrap' }}>
        {[['Experiment ID',exp.id],['Outlet Setting',`${exp.outletPct}% open (simulated)`],
          ['Upper Ref',`${exp.upperCm} cm`],['Lower Ref',`${exp.lowerCm} cm`],['Peak Level',`${exp.peakCm?.toFixed(1)} cm`]
        ].map(([l,v])=>(
          <div key={l}>
            <div style={{ fontSize:'.72rem', color:'var(--text-muted)', marginBottom:2 }}>{l}</div>
            <div className="mono" style={{ fontSize:'.9rem' }}>{v}</div>
          </div>
        ))}
      </div>

      <WaterLevelChart samples={exp.samples} inflowStopT={exp.inflowStopT}
        upperCm={exp.upperCm} lowerCm={exp.lowerCm} chamberHeightCm={exp.chamberHeightCm}
        recessionSeconds={results.recession.seconds} title={`[DEMO] ${exp.label}`}/>

      <MethodComparison recessionSeconds={results.recession.seconds} thresholdExceeded={results.thresh}
        thresholdCm={exp.upperCm} rateValue={results.rate} persistenceSec={results.persist} showTable={false}/>

      <div className="card" style={{ background:'rgba(255,174,66,.04)', borderColor:'rgba(255,174,66,.2)' }} role="note">
        <p style={{ fontSize:'.8rem', color:'var(--warning)', lineHeight:1.7 }}>
          ⚠ <strong>DEMO NOTE:</strong> All values are computed from simulated recession curves.
          Outlet % is an experimental setting, not a measured blockage.
          "Possible outlet restriction" is an experimental indicator only — not real blockage detection.
        </p>
      </div>
    </div>
  );
}
