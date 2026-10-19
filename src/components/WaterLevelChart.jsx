import { useMemo } from 'react';
import { ResponsiveContainer,LineChart,Line,XAxis,YAxis,CartesianGrid,Tooltip,ReferenceLine,ReferenceArea,Label } from 'recharts';
import { DemoBadge } from './DemoBadge.jsx';
import { EmptyState } from './EmptyState.jsx';
import { Activity } from 'lucide-react';
import { formatTimeAxis } from '../lib/format.js';

function WaterTooltip({active,payload}) {
  if (!active||!payload?.length) return null;
  const d=payload[0].payload;
  return (
    <div style={{background:'var(--bg-secondary)',border:'1px solid var(--border-glow)',borderRadius:'var(--r-md)',padding:'10px 14px',fontSize:'.8rem'}}>
      <div style={{color:'var(--text-muted)'}}>t = {d.tSec} s</div>
      <div className="mono" style={{color:'var(--cyan)',fontWeight:600}}>{d.levelCm} cm</div>
      <div style={{color:d.pumpOn?'var(--success)':'var(--text-muted)',marginTop:2}}>{d.pumpOn?'● Inflow ON':'○ Inflow OFF'}</div>
    </div>
  );
}

export function WaterLevelChart({samples=[],inflowStopT,upperCm=22,lowerCm=10,chamberHeightCm=40,recessionSeconds,title='Water-Level Recession Analysis'}) {
  const chartData=useMemo(()=>{
    if (!samples.length) return [];
    const o=samples[0].t;
    return samples.map(s=>({...s,tSec:formatTimeAxis(s.t,o)}));
  },[samples]);

  const stopSec=inflowStopT&&samples.length?formatTimeAxis(inflowStopT,samples[0].t):null;

  if (!samples.length) return (
    <div className="card" style={{minHeight:300}}>
      <div className="flex items-center justify-between" style={{marginBottom:'var(--s4)'}}><h3>{title}</h3><DemoBadge/></div>
      <EmptyState icon={Activity} title="No experiment data" message="Start an experiment to see the chart."/>
    </div>
  );

  return (
    <div className="card">
      <div className="flex items-center justify-between" style={{marginBottom:'var(--s4)',flexWrap:'wrap',gap:'var(--s3)'}}>
        <h3 style={{fontSize:'1rem'}}>{title}</h3>
        <div className="flex items-center gap-3">
          {recessionSeconds!=null&&<span className="mono" style={{color:'var(--success)',fontSize:'.9rem',fontWeight:600}}>Recession: {recessionSeconds.toFixed(1)} s</span>}
          <DemoBadge/>
        </div>
      </div>
      {/* Legend */}
      <div style={{display:'flex',gap:'var(--s4)',marginBottom:'var(--s3)',fontSize:'.72rem',flexWrap:'wrap',color:'var(--text-muted)'}}>
        {[['var(--primary)','Water level'],['var(--warning)','Inflow stopped'],['var(--success)',`Upper (${upperCm} cm)`],['var(--danger)',`Lower (${lowerCm} cm)`]].map(([c,l])=>(
          <span key={l} style={{display:'flex',alignItems:'center',gap:4}}>
            <span style={{width:14,height:2,background:c,display:'inline-block'}}/>{l}
          </span>
        ))}
      </div>
      <div style={{height:280}}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{top:5,right:24,bottom:20,left:0}}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(8,127,255,.08)"/>
            <XAxis dataKey="tSec" stroke="var(--text-muted)" tick={{fill:'var(--text-muted)',fontSize:11}}
              label={{value:'Time (s)',position:'insideBottom',offset:-12,fill:'var(--text-muted)',fontSize:11}}/>
            <YAxis domain={[0,chamberHeightCm]} stroke="var(--text-muted)" tick={{fill:'var(--text-muted)',fontSize:11}}
              label={{value:'Level (cm)',angle:-90,position:'insideLeft',offset:12,fill:'var(--text-muted)',fontSize:11}}/>
            <Tooltip content={<WaterTooltip/>}/>
            {stopSec!=null&&<ReferenceLine x={stopSec} stroke="var(--warning)" strokeDasharray="6 3" strokeWidth={2}><Label value="Inflow stopped" position="insideTopRight" fill="var(--warning)" fontSize={10}/></ReferenceLine>}
            <ReferenceLine y={upperCm} stroke="var(--success)" strokeDasharray="4 2" strokeWidth={1.5}><Label value={`${upperCm} cm`} position="right" fill="var(--success)" fontSize={10}/></ReferenceLine>
            <ReferenceLine y={lowerCm} stroke="var(--danger)"  strokeDasharray="4 2" strokeWidth={1.5}><Label value={`${lowerCm} cm`} position="right" fill="var(--danger)"  fontSize={10}/></ReferenceLine>
            {stopSec!=null&&recessionSeconds!=null&&<ReferenceArea x1={stopSec} x2={stopSec+recessionSeconds} fill="rgba(0,217,255,.06)" stroke="rgba(0,217,255,.2)" strokeWidth={1}/>}
            <Line type="monotone" dataKey="levelCm" stroke="var(--primary)" strokeWidth={2.5} dot={false}
              activeDot={{r:4,fill:'var(--cyan)',stroke:'none'}}
              style={{filter:'drop-shadow(0 0 5px rgba(0,217,255,.55))'}} isAnimationActive={false}/>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
