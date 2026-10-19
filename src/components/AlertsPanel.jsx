import { useState } from 'react';
import { AlertCircle, AlertTriangle, Info, CheckCircle, X } from 'lucide-react';
import { formatTimestamp } from '../lib/format.js';

const ICON={ error:AlertCircle, warning:AlertTriangle, info:Info, success:CheckCircle };
const COLOR={ error:'var(--danger)', warning:'var(--warning)', info:'var(--primary)', success:'var(--success)' };

export function AlertsPanel({alerts=[],maxVisible=5}) {
  const [dismissed,setDismissed]=useState(new Set());
  const visible=alerts.filter(a=>!dismissed.has(a.id)).slice(0,maxVisible);
  return (
    <div className="card">
      <div className="flex items-center justify-between" style={{marginBottom:'var(--s4)'}}>
        <h3>Alerts</h3>
        {alerts.length>0&&<span className="badge badge-demo">{alerts.length} demo alerts</span>}
      </div>
      {visible.length===0?(
        <div style={{textAlign:'center',padding:'var(--s8) 0',color:'var(--text-muted)',fontSize:'.875rem'}}>
          <CheckCircle size={26} style={{marginBottom:8,color:'var(--success)'}} aria-hidden="true"/>
          <div>No active alerts</div>
        </div>
      ):(
        <div style={{display:'flex',flexDirection:'column',gap:'var(--s2)'}}>
          {visible.map(a=>{
            const Icon=ICON[a.type]??Info;
            const color=COLOR[a.type]??'var(--text-muted)';
            return (
              <div key={a.id} className={`alert-item ${a.type}`} role="alert" aria-label={`${a.type}: ${a.title}`}>
                <Icon size={15} style={{color,flexShrink:0,marginTop:2}} aria-hidden="true"/>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontWeight:500,fontSize:'.875rem',color:'var(--text)'}}>{a.title}</div>
                  <div style={{fontSize:'.8rem',color:'var(--text-muted)',marginTop:2}}>{a.message}</div>
                  <div style={{fontSize:'.72rem',color:'var(--text-muted)',marginTop:4,opacity:.7}}>{formatTimestamp(a.ts)}</div>
                </div>
                <button className="btn btn-ghost btn-icon" style={{padding:4,width:22,height:22,flexShrink:0}}
                  onClick={()=>setDismissed(d=>new Set([...d,a.id]))} aria-label={`Dismiss: ${a.title}`}>
                  <X size={12} aria-hidden="true"/>
                </button>
              </div>
            );
          })}
        </div>
      )}
      {dismissed.size>0&&(
        <button className="btn btn-ghost btn-sm" style={{marginTop:'var(--s3)',fontSize:'.75rem'}}
          onClick={()=>setDismissed(new Set())} aria-label="Restore dismissed alerts">
          Restore dismissed ({dismissed.size})
        </button>
      )}
    </div>
  );
}
