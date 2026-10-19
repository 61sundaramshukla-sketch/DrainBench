import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { DemoBadge } from './DemoBadge.jsx';

const RGB={
  'var(--primary)':'8,127,255','var(--cyan)':'0,217,255',
  'var(--success)':'32,227,162','var(--warning)':'255,174,66','var(--danger)':'255,82,99',
};

export function StatCard({label,value,sub,icon:Icon,iconColor,trend,trendLabel,accent,showDemo=true}) {
  const ac=accent||'var(--primary)';
  const TI=trend==='up'?TrendingUp:trend==='down'?TrendingDown:Minus;
  const tc=trend==='up'?'var(--warning)':trend==='down'?'var(--success)':'var(--text-muted)';
  return (
    <article className="stat-card" style={{borderColor:`rgba(${RGB[ac]||'8,127,255'},.2)`}}>
      <div className="flex items-center justify-between">
        <div className="stat-label">
          {Icon&&<span className="stat-icon" style={{background:`${iconColor||ac}18`}} aria-hidden="true"><Icon size={15} style={{color:iconColor||ac}}/></span>}
          {label}
        </div>
        {showDemo&&<DemoBadge/>}
      </div>
      <div className="stat-value mono" aria-label={`${label}: ${value}`}>{value||'—'}</div>
      {sub&&<div className="stat-sub">{sub}</div>}
      {trend&&(
        <div style={{display:'flex',alignItems:'center',gap:4,fontSize:'.8rem'}} aria-label={`Trend: ${trendLabel||trend}`}>
          <TI size={12} style={{color:tc}} aria-hidden="true"/>
          <span style={{color:tc}}>{trendLabel}</span>
        </div>
      )}
    </article>
  );
}
