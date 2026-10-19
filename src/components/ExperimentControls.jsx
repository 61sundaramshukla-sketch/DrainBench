import { OUTLET_SETTINGS } from '../data/demoData.js';
const STEPS_LABELS=['Idle','Filling','Inflow stopped','Recording recession','Complete'];
export function ExperimentControls({experimentId,outletPct,upperCm,lowerCm,chamberHeightCm,phase,stepIndex,validationErrors,onStart,onStopInflow,onReset,onFieldChange}) {
  const idle=phase==='idle', filling=phase==='filling', complete=phase==='complete';
  return (
    <div className="card">
      <div className="flex items-center justify-between" style={{marginBottom:'var(--s4)'}}>
        <h3>Experiment Controls</h3>
        <span className="badge badge-demo">DEMO — No real hardware</span>
      </div>
      {/* Stepper */}
      <div className="card" style={{background:'var(--bg-secondary)',padding:'var(--s3)',marginBottom:'var(--s5)'}} role="status" aria-label={`Phase: ${STEPS_LABELS[stepIndex]||'Unknown'}`}>
        <div style={{fontSize:'.72rem',color:'var(--text-muted)',marginBottom:6}}>Experiment phase</div>
        <div style={{display:'flex',alignItems:'center'}} aria-label="Experiment progress">
          {STEPS_LABELS.map((step,i)=>(
            <div key={step} style={{display:'flex',alignItems:'center',flex:1,minWidth:0}}>
              <div className={`step${i===stepIndex?' active':i<stepIndex?' completed':''}`}>
                <span className="step-dot" aria-hidden="true"/>
                <span style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:'.68rem'}}>{step}</span>
              </div>
              {i<STEPS_LABELS.length-1&&<div className="step-line" aria-hidden="true"/>}
            </div>
          ))}
        </div>
      </div>
      {/* Form */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:'var(--s4)',marginBottom:'var(--s5)'}}>
        <div className="form-group">
          <label className="form-label" htmlFor="exp-id">Experiment ID</label>
          <input id="exp-id" className="form-input mono" value={experimentId} onChange={e=>onFieldChange('experimentId',e.target.value)} disabled={!idle}/>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="outlet-sel">Outlet Opening <span style={{fontWeight:400}}>(experimental setting)</span></label>
          <select id="outlet-sel" className="form-select" value={outletPct} onChange={e=>onFieldChange('outletPct',Number(e.target.value))} disabled={!idle}>
            {OUTLET_SETTINGS.map(p=><option key={p} value={p}>{p}% open</option>)}
          </select>
          <small style={{color:'var(--text-muted)',fontSize:'.72rem'}}>Controls simulated flow rate — not a real valve measurement.</small>
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="upper-cm">Upper Reference (cm)</label>
          <input id="upper-cm" type="number" min="1" max={chamberHeightCm-1} step=".5"
            className={`form-input mono${validationErrors.upperCm?' error':''}`}
            value={upperCm} onChange={e=>onFieldChange('upperCm',parseFloat(e.target.value))}
            disabled={!idle} aria-invalid={!!validationErrors.upperCm} aria-describedby="err-upper"/>
          {validationErrors.upperCm&&<span id="err-upper" className="form-error" role="alert">{validationErrors.upperCm}</span>}
        </div>
        <div className="form-group">
          <label className="form-label" htmlFor="lower-cm">Lower Reference (cm)</label>
          <input id="lower-cm" type="number" min="0" max={chamberHeightCm-1} step=".5"
            className={`form-input mono${validationErrors.lowerCm?' error':''}`}
            value={lowerCm} onChange={e=>onFieldChange('lowerCm',parseFloat(e.target.value))}
            disabled={!idle} aria-invalid={!!validationErrors.lowerCm} aria-describedby="err-lower"/>
          {validationErrors.lowerCm&&<span id="err-lower" className="form-error" role="alert">{validationErrors.lowerCm}</span>}
        </div>
      </div>
      <div className="flex gap-3" style={{flexWrap:'wrap'}}>
        <button id="btn-start"       className="btn btn-primary" onClick={onStart}      disabled={!idle}    aria-label="Simulate experiment start">▶ Simulate Start</button>
        <button id="btn-stop-inflow" className="btn btn-cyan"    onClick={onStopInflow} disabled={!filling} aria-label="Simulate inflow stop">⏸ Simulate Stop Inflow</button>
        <button id="btn-reset"       className="btn btn-danger"  onClick={onReset}      disabled={idle}     aria-label="Reset experiment">↺ Reset</button>
        {complete&&<span className="badge badge-success" style={{alignSelf:'center'}} role="status">✓ Complete</span>}
      </div>
    </div>
  );
}
