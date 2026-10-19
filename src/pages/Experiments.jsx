import { ExperimentControls } from '../components/ExperimentControls.jsx';
import { ExperimentHistory } from '../components/ExperimentHistory.jsx';
import { WaterLevelChart } from '../components/WaterLevelChart.jsx';
import { DemoBadge } from '../components/DemoBadge.jsx';
import { useExperiment } from '../hooks/useExperiment.js';
import { dataSource } from '../services/dataSource.js';

export function Experiments() {
  const exp = useExperiment();
  const history = dataSource.getExperiments();
  return (
    <div className="animate-fade-in" style={{ display:'flex', flexDirection:'column', gap:'var(--s6)' }}>
      <div className="flex items-center gap-3">
        <DemoBadge/>
        <span style={{ color:'var(--text-muted)', fontSize:'.875rem' }}>All experiments are simulated — no real hardware required</span>
      </div>
      <ExperimentControls experimentId={exp.experimentId} outletPct={exp.outletPct}
        upperCm={exp.upperCm} lowerCm={exp.lowerCm} chamberHeightCm={exp.chamberHeightCm}
        phase={exp.phase} stepIndex={exp.stepIndex} validationErrors={exp.validationErrors}
        onStart={exp.startExperiment} onStopInflow={exp.stopInflow} onReset={exp.resetExperiment} onFieldChange={exp.setField}/>
      <WaterLevelChart samples={exp.samples} inflowStopT={exp.inflowStopT}
        upperCm={exp.upperCm} lowerCm={exp.lowerCm} chamberHeightCm={exp.chamberHeightCm}
        recessionSeconds={exp.recessionResult.seconds} title="[DEMO] Experiment Water-Level Curve"/>
      <ExperimentHistory experiments={history}/>
    </div>
  );
}
