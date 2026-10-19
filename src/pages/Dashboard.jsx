import { useMemo, useState } from 'react';
import { Droplets, Zap, Settings2, Timer, LayoutGrid, List } from 'lucide-react';
import { StatCard } from '../components/StatCard.jsx';
import { WaterLevelChart } from '../components/WaterLevelChart.jsx';
import { ExperimentControls } from '../components/ExperimentControls.jsx';
import { MethodComparison } from '../components/MethodComparison.jsx';
import { AlertsPanel } from '../components/AlertsPanel.jsx';
import { ExperimentHistory } from '../components/ExperimentHistory.jsx';
import { SystemStatus } from '../components/SystemStatus.jsx';
import { useExperiment } from '../hooks/useExperiment.js';
import { dataSource } from '../services/dataSource.js';
import { DEMO_ALERTS } from '../data/demoData.js';
import { formatLevel, formatDuration } from '../lib/format.js';
import { smoothSamples, currentLevel, thresholdExceeded, rateOfRise, highLevelPersistence } from '../lib/analysis.js';

export function Dashboard() {
  const exp = useExperiment();
  const [showTable, setShowTable] = useState(false);
  const status = dataSource.getStatus();
  const history = dataSource.getExperiments();

  const metrics = useMemo(() => {
    const sm = smoothSamples(exp.samples, exp.smoothingMethod, exp.smoothingWindow);
    const lvl = currentLevel(sm);
    return {
      level: lvl,
      levelPct: lvl != null ? Math.round((lvl / exp.chamberHeightCm) * 100) : null,
      inflowOn: exp.phase === 'filling',
      thresh: thresholdExceeded(sm, exp.upperCm),
      rate: rateOfRise(sm, 10),
      persist: highLevelPersistence(sm, exp.upperCm, 2),
    };
  }, [exp.samples, exp.phase, exp.upperCm, exp.chamberHeightCm, exp.smoothingMethod, exp.smoothingWindow]);

  return (
    <div className="animate-fade-in">
      {/* ── Stat Cards ── */}
      <section style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))', gap:'var(--s5)', marginBottom:'var(--s6)' }} aria-label="Key metrics">
        <StatCard label="Water Level" icon={Droplets} iconColor="var(--cyan)" accent="var(--cyan)"
          value={metrics.level != null ? formatLevel(metrics.level) : '—'}
          sub={metrics.levelPct != null ? `${metrics.levelPct}% of ${exp.chamberHeightCm} cm chamber` : 'No data yet'}
          trend={exp.phase==='filling'?'up':exp.phase==='recording_recession'?'down':'neutral'}
          trendLabel={exp.phase==='filling'?'Rising':exp.phase==='recording_recession'?'Falling':'Stable'}/>

        <StatCard label="Inflow Status" icon={Zap} iconColor={metrics.inflowOn?'var(--success)':'var(--text-muted)'} accent={metrics.inflowOn?'var(--success)':'var(--primary)'}
          value={exp.phase==='idle'?'Idle':metrics.inflowOn?'ON (Simulated)':'Inflow stopped'}
          sub={exp.phase==='idle'?'Start an experiment to begin':`Phase: ${exp.phase.replace(/_/g,' ')}`}/>

        <StatCard label="Outlet Opening" icon={Settings2} iconColor="var(--warning)" accent="var(--warning)"
          value={`${exp.outletPct}%`} sub="Experimental setting — not a measured value"/>

        <StatCard label="Recession Time" icon={Timer} iconColor="var(--primary)" accent="var(--primary)"
          value={exp.recessionResult.seconds != null ? formatDuration(exp.recessionResult.seconds) : '—'}
          sub={exp.recessionResult.seconds != null
            ? `Upper → Lower (${exp.upperCm} → ${exp.lowerCm} cm)`
            : exp.recessionResult.reason ?? 'Waiting for experiment'}/>
      </section>

      {/* ── Chart ── */}
      <section style={{ marginBottom:'var(--s6)' }} aria-label="Water level chart">
        <WaterLevelChart samples={exp.samples} inflowStopT={exp.inflowStopT}
          upperCm={exp.upperCm} lowerCm={exp.lowerCm} chamberHeightCm={exp.chamberHeightCm}
          recessionSeconds={exp.recessionResult.seconds}/>
      </section>

      {/* ── Controls ── */}
      <section style={{ marginBottom:'var(--s6)' }} aria-label="Experiment controls">
        <ExperimentControls experimentId={exp.experimentId} outletPct={exp.outletPct}
          upperCm={exp.upperCm} lowerCm={exp.lowerCm} chamberHeightCm={exp.chamberHeightCm}
          phase={exp.phase} stepIndex={exp.stepIndex} validationErrors={exp.validationErrors}
          onStart={exp.startExperiment} onStopInflow={exp.stopInflow} onReset={exp.resetExperiment} onFieldChange={exp.setField}/>
      </section>

      {/* ── Method Comparison ── */}
      <section style={{ marginBottom:'var(--s6)' }} aria-label="Method comparison">
        <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:'var(--s2)' }}>
          <button className="btn btn-ghost btn-sm" onClick={()=>setShowTable(t=>!t)} aria-pressed={showTable}>
            {showTable ? <><LayoutGrid size={13} aria-hidden="true"/> Cards</> : <><List size={13} aria-hidden="true"/> Table</>}
          </button>
        </div>
        <MethodComparison recessionSeconds={exp.recessionResult.seconds} thresholdExceeded={metrics.thresh}
          thresholdCm={exp.upperCm} rateValue={metrics.rate} persistenceSec={metrics.persist} showTable={showTable}/>
      </section>

      {/* ── Alerts + Status ── */}
      <section style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'var(--s5)', marginBottom:'var(--s6)' }} aria-label="Alerts and system status">
        <AlertsPanel alerts={DEMO_ALERTS} maxVisible={4}/>
        <SystemStatus status={status}/>
      </section>

      {/* ── History ── */}
      <section aria-label="Experiment history">
        <ExperimentHistory experiments={history}/>
      </section>
    </div>
  );
}
