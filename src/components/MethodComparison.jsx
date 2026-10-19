import { useMemo } from 'react';
import { DemoBadge } from './DemoBadge.jsx';
const METHODS=[
  {id:'recession',name:'Recession Time',desc:'Time for level to fall from upper to lower reference after inflow stops. Computed via linear interpolation.',
   ind:({rSec})=>({val:rSec!=null?`${rSec.toFixed(1)} s`:null,label:rSec!=null?(rSec>60?'Possible outlet restriction — experimental indicator':'Normal recession observed'):null,color:rSec!=null?(rSec>60?'var(--warning)':'var(--success)'):'var(--text-muted)'})},
  {id:'threshold',name:'Water-Level Threshold',desc:'Flags when level exceeds a configured threshold. Simple but sensitive to chamber geometry.',
   ind:({thresh,tCm})=>({val:thresh?`> ${tCm} cm`:`≤ ${tCm} cm`,label:thresh?'Threshold exceeded (demo)':'Within threshold',color:thresh?'var(--warning)':'var(--success)'})},
  {id:'rate',name:'Rate of Rise',desc:'Level rise rate during inflow (cm/s). Slower rise may indicate reduced inflow, not necessarily drainage issues.',
   ind:({rate})=>({val:rate!=null?`${rate.toFixed(3)} cm/s`:null,label:rate!=null?'Measured during inflow phase':null,color:'var(--cyan)'})},
  {id:'persist',name:'High-Level Persistence',desc:'Time level stays continuously above threshold. Longer persistence may indicate slower drainage. Demo only.',
   ind:({persist})=>({val:persist!=null?`${persist.toFixed(1)} s`:null,label:persist!=null?(persist>30?'Possible outlet restriction — experimental indicator':'Normal persistence'):null,color:persist!=null?(persist>30?'var(--warning)':'var(--success)'):'var(--text-muted)'})},
];
export function MethodComparison({recessionSeconds,thresholdExceeded,thresholdCm=22,rateValue,persistenceSec,showTable}) {
  const d=useMemo(()=>({rSec:recessionSeconds,thresh:thresholdExceeded,tCm:thresholdCm,rate:rateValue,persist:persistenceSec}),[recessionSeconds,thresholdExceeded,thresholdCm,rateValue,persistenceSec]);
  return (
    <div className="card">
      <div className="flex items-center justify-between" style={{marginBottom:'var(--s4)'}}><h3>Method Comparison</h3><DemoBadge/></div>
      <p style={{fontSize:'.8rem',color:'var(--text-muted)',marginBottom:'var(--s4)'}}>Demo outputs only. No method is validated as more accurate than another.</p>
      {showTable?(
        <div style={{overflowX:'auto'}}>
          <table className="data-table" aria-label="Method comparison results">
            <thead><tr><th>Method</th><th>Demo Value</th><th>Status</th></tr></thead>
            <tbody>{METHODS.map(m=>{const i=m.ind(d);return(<tr key={m.id}><td><div style={{fontWeight:500}}>{m.name}</div><div style={{fontSize:'.72rem',color:'var(--text-muted)'}}>{m.desc}</div></td><td className="mono" style={{color:i.color}}>{i.val??'—'}</td><td style={{color:i.color,fontSize:'.8rem'}}>{i.label??'Waiting for experiment'}</td></tr>);})}</tbody>
          </table>
        </div>
      ):(
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(210px,1fr))',gap:'var(--s3)'}}>
          {METHODS.map(m=>{const i=m.ind(d);return(
            <article key={m.id} className="method-card">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
                <h4 style={{fontSize:'.875rem'}}>{m.name}</h4>
                <span style={{width:10,height:10,borderRadius:'50%',background:i.val!=null?i.color:'var(--border)',flexShrink:0,marginTop:4}} aria-hidden="true"/>
              </div>
              <p style={{fontSize:'.75rem',lineHeight:1.5}}>{m.desc}</p>
              <div>
                <div className="mono" style={{fontSize:'1.2rem',fontWeight:600,color:i.color}} aria-label={`${m.name}: ${i.val||'no data'}`}>{i.val??'—'}</div>
                <div style={{fontSize:'.72rem',color:i.color,opacity:.85,marginTop:2}}>{i.label??'Waiting for experiment'}</div>
              </div>
            </article>
          );})}
        </div>
      )}
    </div>
  );
}
